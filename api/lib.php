<?php
/**
 * E-WasteBiz — shared helpers (JSON storage, auth, rate limits, Resend email)
 */
declare(strict_types=1);

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'lib.php') { http_response_code(404); exit; }

require_once __DIR__ . '/config.php';

const DATA_DIR = __DIR__ . '/../data';
const UPLOAD_DIR = __DIR__ . '/../uploads';

date_default_timezone_set(defined('TIMEZONE') ? TIMEZONE : 'Asia/Kolkata');

function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function body_json(): array {
    $raw = file_get_contents('php://input') ?: '';
    if (strlen($raw) > 200000) json_out(['ok' => false, 'error' => 'Payload too large'], 413);
    $d = json_decode($raw, true);
    return is_array($d) ? $d : [];
}

function ensure_data_dir(): void {
    if (!is_dir(DATA_DIR)) @mkdir(DATA_DIR, 0755, true);
}

/* =========================================================
   Storage: MySQL when DB_* is configured, JSON files otherwise
   ========================================================= */
function db(): ?PDO {
    static $pdo = false;
    if ($pdo !== false) return $pdo;
    $pdo = null;
    if (!defined('DB_NAME') || DB_NAME === '' || !defined('DB_USER') || DB_USER === '') return null;
    try {
        $pdo = new PDO('mysql:host=' . (defined('DB_HOST') ? DB_HOST : 'localhost') . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, defined('DB_PASS') ? DB_PASS : '', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $pdo->exec("CREATE TABLE IF NOT EXISTS ewb_kv (
            k VARCHAR(64) NOT NULL PRIMARY KEY,
            v LONGTEXT NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        $pdo->exec("CREATE TABLE IF NOT EXISTS ewb_leads (
            id VARCHAR(32) NOT NULL PRIMARY KEY,
            created_at DATETIME NOT NULL,
            name VARCHAR(120) NOT NULL,
            phone VARCHAR(40) NOT NULL,
            email VARCHAR(160) NOT NULL DEFAULT '',
            company VARCHAR(160) NOT NULL DEFAULT '',
            city VARCHAR(80) NOT NULL DEFAULT '',
            category VARCHAR(120) NOT NULL DEFAULT '',
            source VARCHAR(80) NOT NULL DEFAULT '',
            status VARCHAR(20) NOT NULL DEFAULT 'new',
            data LONGTEXT NOT NULL,
            KEY idx_created (created_at),
            KEY idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (Throwable $e) {
        error_log('EWB DB error: ' . $e->getMessage());
        $pdo = null;
    }
    return $pdo;
}

function file_read_json(string $name, $default = []) {
    $f = DATA_DIR . '/' . $name;
    if (!is_file($f)) return $default;
    $c = @file_get_contents($f);
    $d = json_decode((string)$c, true);
    return is_array($d) ? $d : $default;
}

function file_write_json(string $name, $data): bool {
    ensure_data_dir();
    $f = DATA_DIR . '/' . $name;
    $tmp = $f . '.' . bin2hex(random_bytes(4)) . '.tmp';
    $ok = file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
    if ($ok === false) return false;
    return rename($tmp, $f);
}

/** Key-value document (settings, admin login, click events, rate limits). */
function read_json(string $name, $default = []) {
    if ($pdo = db()) {
        $st = $pdo->prepare('SELECT v FROM ewb_kv WHERE k = ?');
        $st->execute([$name]);
        $v = $st->fetchColumn();
        if ($v === false) return file_read_json($name, $default); // seed from bundled file (e.g. data/site.json)
        $d = json_decode((string)$v, true);
        return is_array($d) ? $d : $default;
    }
    return file_read_json($name, $default);
}

function write_json(string $name, $data): bool {
    if ($pdo = db()) {
        $st = $pdo->prepare('INSERT INTO ewb_kv (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)');
        return $st->execute([$name, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
    }
    return file_write_json($name, $data);
}

/** Atomic read-modify-write. */
function update_json(string $name, callable $fn, $default = []) {
    if ($pdo = db()) {
        $pdo->beginTransaction();
        try {
            $pdo->prepare('INSERT IGNORE INTO ewb_kv (k, v) VALUES (?, ?)')->execute([$name, json_encode(file_read_json($name, $default))]);
            $st = $pdo->prepare('SELECT v FROM ewb_kv WHERE k = ? FOR UPDATE');
            $st->execute([$name]);
            $data = json_decode((string)$st->fetchColumn(), true);
            if (!is_array($data)) $data = $default;
            $result = $fn($data);
            $pdo->prepare('UPDATE ewb_kv SET v = ? WHERE k = ?')->execute([json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $name]);
            $pdo->commit();
            return $result;
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
    ensure_data_dir();
    $lock = fopen(DATA_DIR . '/' . $name . '.lock', 'c');
    flock($lock, LOCK_EX);
    $data = file_read_json($name, $default);
    $result = $fn($data);
    file_write_json($name, $data);
    flock($lock, LOCK_UN);
    fclose($lock);
    return $result;
}

/* ---------------- Leads ---------------- */
function leads_all(): array {
    if ($pdo = db()) {
        $rows = $pdo->query('SELECT data FROM ewb_leads ORDER BY created_at DESC LIMIT 20000')->fetchAll(PDO::FETCH_COLUMN);
        return array_values(array_filter(array_map(fn($r) => json_decode((string)$r, true), $rows)));
    }
    return file_read_json('leads.json', []);
}

function lead_save(array $l): void {
    if ($pdo = db()) {
        $st = $pdo->prepare('INSERT INTO ewb_leads (id, created_at, name, phone, email, company, city, category, source, status, data)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE status = VALUES(status), data = VALUES(data)');
        $st->execute([$l['id'], date('Y-m-d H:i:s', strtotime($l['created_at'])), $l['name'], $l['phone'], $l['email'], $l['company'],
            $l['city'], $l['category'], $l['source'], $l['status'], json_encode($l, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
        return;
    }
    update_json('leads.json', function (&$leads) use ($l) {
        foreach ($leads as &$x) { if ($x['id'] === $l['id']) { $x = $l; return; } }
        array_unshift($leads, $l);
    });
}

/** Modify one lead via callback; returns the updated lead or null. */
function lead_update(string $id, callable $fn): ?array {
    if ($pdo = db()) {
        $pdo->beginTransaction();
        $st = $pdo->prepare('SELECT data FROM ewb_leads WHERE id = ? FOR UPDATE');
        $st->execute([$id]);
        $raw = $st->fetchColumn();
        if ($raw === false) { $pdo->rollBack(); return null; }
        $l = json_decode((string)$raw, true);
        $fn($l);
        $pdo->prepare('UPDATE ewb_leads SET status = ?, data = ? WHERE id = ?')->execute([$l['status'], json_encode($l, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $id]);
        $pdo->commit();
        return $l;
    }
    return update_json('leads.json', function (&$leads) use ($id, $fn) {
        foreach ($leads as &$l) { if ($l['id'] === $id) { $fn($l); return $l; } }
        return null;
    });
}

function leads_delete(array $ids): int {
    $ids = array_values(array_filter(array_map('strval', $ids)));
    if (!$ids) return 0;
    if ($pdo = db()) {
        $st = $pdo->prepare('DELETE FROM ewb_leads WHERE id IN (' . implode(',', array_fill(0, count($ids), '?')) . ')');
        $st->execute($ids);
        return $st->rowCount();
    }
    return update_json('leads.json', function (&$leads) use ($ids) {
        $before = count($leads);
        $leads = array_values(array_filter($leads, fn($l) => !in_array($l['id'], $ids, true)));
        return $before - count($leads);
    });
}

function clean(?string $s, int $max = 500): string {
    $s = trim((string)$s);
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    return mb_substr($s, 0, $max);
}

function client_ip(): string {
    // Hostinger may sit behind a proxy / CDN
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $k) {
        if (!empty($_SERVER[$k])) {
            $ip = trim(explode(',', $_SERVER[$k])[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) return $ip;
        }
    }
    return '0.0.0.0';
}

/** Returns true if the caller is within the limit. */
function rate_limit(string $bucket, int $max, int $windowSec): bool {
    $key = $bucket . ':' . hash('sha256', client_ip());
    return update_json('ratelimit.json', function (&$rl) use ($key, $max, $windowSec) {
        $now = time();
        foreach ($rl as $k => $hits) {
            $rl[$k] = array_values(array_filter($hits, fn($t) => $t > $now - 86400));
            if (!$rl[$k]) unset($rl[$k]);
        }
        $hits = array_filter($rl[$key] ?? [], fn($t) => $t > $now - $windowSec);
        if (count($hits) >= $max) return false;
        $hits[] = $now;
        $rl[$key] = array_values($hits);
        return true;
    });
}

/* ---------------- Site settings ---------------- */
function site_settings(): array {
    return read_json('site.json', []);
}

/** Keys that must never be exposed publicly. */
function private_keys(): array {
    return ['notify_emails', 'autoreply_enabled', 'autoreply_subject'];
}

/* ---------------- Admin auth ---------------- */
function start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name('ewb_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function admin_record(): array {
    $a = read_json('admin.json', []);
    return [
        'username' => $a['username'] ?? ADMIN_USERNAME,
        'hash' => $a['hash'] ?? ADMIN_PASSWORD_HASH,
    ];
}

function is_admin(): bool {
    start_session();
    if (empty($_SESSION['admin'])) return false;
    if (($_SESSION['last'] ?? 0) < time() - 60 * 60 * 8) { // 8h idle timeout
        $_SESSION = [];
        return false;
    }
    $_SESSION['last'] = time();
    return true;
}

function require_admin(): void {
    if (!is_admin()) json_out(['ok' => false, 'error' => 'Unauthorized'], 401);
    // Basic CSRF defence: state-changing requests must come from our JS (custom header + SameSite cookie)
    if ($_SERVER['REQUEST_METHOD'] !== 'GET' && ($_SERVER['HTTP_X_EWB'] ?? '') !== '1') {
        json_out(['ok' => false, 'error' => 'Bad request'], 400);
    }
}

/* ---------------- Email (Resend) ---------------- */
function send_email(array $to, string $subject, string $html, string $text = '', ?string $replyTo = null): array {
    if (!defined('RESEND_API_KEY') || RESEND_API_KEY === '' || !function_exists('curl_init')) {
        return ['ok' => false, 'error' => 'Email not configured'];
    }
    $payload = [
        'from' => RESEND_FROM,
        'to' => array_values($to),
        'subject' => $subject,
        'html' => $html,
    ];
    if ($text !== '') $payload['text'] = $text;
    if ($replyTo) $payload['reply_to'] = $replyTo;

    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . RESEND_API_KEY,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
    ]);
    $res = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    if ($res === false) return ['ok' => false, 'error' => $err ?: 'Network error'];
    $d = json_decode((string)$res, true);
    if ($code >= 200 && $code < 300) return ['ok' => true, 'id' => $d['id'] ?? null];
    return ['ok' => false, 'error' => $d['message'] ?? ('HTTP ' . $code)];
}

function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }

function email_shell(string $title, string $inner): string {
    return '<!doctype html><html><body style="margin:0;background:#f3f6f4;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0b1510">'
        . '<table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px"><tr><td align="center">'
        . '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e3ebe6">'
        . '<tr><td style="background:linear-gradient(90deg,#15803d,#16a34a,#1d4ed8);padding:22px 26px;color:#fff">'
        . '<div style="font-size:20px;font-weight:800;letter-spacing:-.02em">e-WasteBiz Enterprises</div>'
        . '<div style="font-size:13px;opacity:.85;margin-top:2px">' . h($title) . '</div></td></tr>'
        . '<tr><td style="padding:24px 26px">' . $inner . '</td></tr>'
        . '<tr><td style="padding:16px 26px;background:#f7faf8;font-size:12px;color:#6b7a72">E-WasteBiz Enterprises · Responsible Electronics Recycling · ewastebiz.in</td></tr>'
        . '</table></td></tr></table></body></html>';
}
