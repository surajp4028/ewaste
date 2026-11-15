<?php
/** Admin API — login, leads management, site content, uploads. */
declare(strict_types=1);
require __DIR__ . '/lib.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

/* ---------------- Auth ---------------- */
if ($action === 'me') {
    json_out(['ok' => true, 'auth' => is_admin(), 'user' => is_admin() ? admin_record()['username'] : null]);
}

if ($action === 'login' && $method === 'POST') {
    start_session();
    if (!rate_limit('login', 8, 900)) json_out(['ok' => false, 'error' => 'Too many attempts. Try again in 15 minutes.'], 429);
    $in = body_json();
    $rec = admin_record();
    $u = (string)($in['username'] ?? '');
    $p = (string)($in['password'] ?? '');
    if (!hash_equals($rec['username'], $u) || !password_verify($p, $rec['hash'])) {
        usleep(400000);
        json_out(['ok' => false, 'error' => 'Invalid username or password'], 401);
    }
    session_regenerate_id(true);
    $_SESSION['admin'] = true;
    $_SESSION['last'] = time();
    json_out(['ok' => true]);
}

if ($action === 'logout') {
    start_session();
    $_SESSION = [];
    session_destroy();
    json_out(['ok' => true]);
}

require_admin();

/* ---------------- Leads ---------------- */
const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost', 'spam'];

if ($action === 'leads') {
    json_out(['ok' => true, 'leads' => leads_all()]);
}

if ($action === 'lead_update' && $method === 'POST') {
    $in = body_json();
    $id = (string)($in['id'] ?? '');
    $res = lead_update($id, function (&$l) use ($in) {
        if (isset($in['status']) && in_array($in['status'], STATUSES, true)) {
            $l['status'] = $in['status'];
            $l['updated_at'] = date('c');
        }
        if (!empty($in['note'])) {
            $l['notes'][] = ['at' => date('c'), 'text' => clean((string)$in['note'], 1000)];
        }
        if (isset($in['value'])) $l['value'] = max(0, (float)$in['value']);
    });
    $res ? json_out(['ok' => true, 'lead' => $res]) : json_out(['ok' => false, 'error' => 'Lead not found'], 404);
}

if ($action === 'lead_delete' && $method === 'POST') {
    $ids = (array)(body_json()['ids'] ?? []);
    $n = leads_delete($ids);
    json_out(['ok' => true, 'deleted' => $n]);
}

if ($action === 'export') {
    $leads = leads_all();
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="ewastebiz-leads-' . date('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF"); // Excel UTF-8 BOM
    fputcsv($out, ['ID', 'Date', 'Name', 'Phone', 'Email', 'Company', 'City', 'Category', 'Quantity', 'Message', 'Status', 'Deal value', 'Source', 'UTM campaign', 'UTM term', 'GCLID', 'Page', 'Notes']);
    $safe = fn($v) => preg_match('/^[=+\-@]/', (string)$v) ? "'" . $v : (string)$v; // CSV injection guard
    foreach ($leads as $l) {
        $notes = implode(' | ', array_map(fn($n) => $n['text'], $l['notes'] ?? []));
        fputcsv($out, array_map($safe, [
            $l['id'], date('Y-m-d H:i', strtotime($l['created_at'])), $l['name'], $l['phone'], $l['email'], $l['company'],
            $l['city'], $l['category'], $l['quantity'], $l['message'], $l['status'], $l['value'] ?? '', $l['source'],
            $l['attr']['utm_campaign'] ?? '', $l['attr']['utm_term'] ?? '', $l['attr']['gclid'] ?? '', $l['page'], $notes,
        ]));
    }
    fclose($out);
    exit;
}

if ($action === 'events') {
    json_out(['ok' => true, 'events' => read_json('events.json', [])]);
}

/* ---------------- Settings / content ---------------- */
if ($action === 'settings') {
    json_out(['ok' => true, 'settings' => site_settings()]);
}

if ($action === 'settings_save' && $method === 'POST') {
    $in = body_json()['settings'] ?? null;
    if (!is_array($in)) json_out(['ok' => false, 'error' => 'Invalid data'], 422);
    $cur = site_settings();

    $str = ['phone' => 40, 'phone_raw' => 20, 'whatsapp' => 20, 'email' => 120, 'email_alt' => 120, 'address' => 300,
        'hours' => 120, 'announcement' => 120, 'whatsapp_message' => 300, 'notify_emails' => 500];
    foreach ($str as $k => $max) if (array_key_exists($k, $in)) $cur[$k] = clean((string)$in[$k], $max);
    if (isset($in['phone_raw'])) $cur['phone_raw'] = preg_replace('/[^\d+]/', '', $cur['phone_raw']);
    if (isset($in['whatsapp'])) $cur['whatsapp'] = preg_replace('/\D/', '', $cur['whatsapp']);
    if (array_key_exists('autoreply_enabled', $in)) $cur['autoreply_enabled'] = (bool)$in['autoreply_enabled'];

    $list = function ($arr, array $fields, int $max = 50) {
        if (!is_array($arr)) return [];
        $out = [];
        foreach (array_slice($arr, 0, $max) as $row) {
            if (!is_array($row)) continue;
            $r = [];
            foreach ($fields as $f => $len) $r[$f] = clean((string)($row[$f] ?? ''), $len);
            $out[] = $r;
        }
        return $out;
    };
    if (isset($in['stats'])) $cur['stats'] = $list($in['stats'], ['value' => 12, 'suffix' => 6, 'label' => 60], 4);
    if (isset($in['faqs'])) $cur['faqs'] = $list($in['faqs'], ['q' => 200, 'a' => 1500]);
    if (isset($in['testimonials'])) $cur['testimonials'] = $list($in['testimonials'], ['name' => 80, 'role' => 80, 'company' => 80, 'text' => 600, 'rating' => 1, 'published' => 3]);
    $ownUpload = fn($p) => preg_match('#^uploads/[a-zA-Z0-9._-]+$#', $p) ? $p : '';
    if (isset($in['clients'])) {
        $cur['clients'] = array_values(array_filter(array_map(function ($c) use ($ownUpload) { $c['logo'] = $ownUpload($c['logo']); return $c; },
            $list($in['clients'], ['name' => 80, 'logo' => 200], 80)), fn($c) => $c['logo'] !== '' || $c['name'] !== ''));
    }
    if (isset($in['partners'])) {
        $cur['partners'] = array_values(array_filter(array_map(function ($c) use ($ownUpload) { $c['logo'] = $ownUpload($c['logo']); return $c; },
            $list($in['partners'], ['name' => 80, 'type' => 60, 'logo' => 200], 60)), fn($c) => $c['logo'] !== '' || $c['name'] !== ''));
    }
    if (isset($in['gallery'])) {
        $cur['gallery'] = array_values(array_filter(array_map(function ($g) use ($ownUpload) { $g['image'] = $ownUpload($g['image']); return $g; },
            $list($in['gallery'], ['image' => 200, 'caption' => 140, 'category' => 40], 200)), fn($g) => $g['image'] !== ''));
    }
    if (isset($in['certificates'])) {
        $cur['certificates'] = array_map(function ($c) {
            // Only allow our own uploads as image sources
            if ($c['image'] !== '' && !preg_match('#^uploads/[a-zA-Z0-9._-]+$#', $c['image'])) $c['image'] = '';
            return $c;
        }, $list($in['certificates'], ['title' => 120, 'desc' => 300, 'tag' => 40, 'image' => 200], 24));
    }
    if (isset($in['analytics']) && is_array($in['analytics'])) {
        $a = [];
        foreach (['ga4', 'gads', 'gads_lead_label', 'gads_call_label', 'meta_pixel'] as $k) {
            $a[$k] = preg_replace('/[^A-Za-z0-9_\-]/', '', clean((string)($in['analytics'][$k] ?? ''), 60));
        }
        $cur['analytics'] = $a;
    }
    write_json('site.json', $cur) ? json_out(['ok' => true, 'settings' => $cur]) : json_out(['ok' => false, 'error' => 'Could not save (check data/ folder permissions)'], 500);
}

if ($action === 'upload' && $method === 'POST') {
    $f = $_FILES['file'] ?? null;
    if (!$f || $f['error'] !== UPLOAD_ERR_OK) json_out(['ok' => false, 'error' => 'Upload failed'], 400);
    if ($f['size'] > 6 * 1024 * 1024) json_out(['ok' => false, 'error' => 'Max file size is 6 MB'], 413);
    $info = @getimagesize($f['tmp_name']);
    $types = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
    if (!$info || !isset($types[$info[2]])) json_out(['ok' => false, 'error' => 'Only JPG, PNG or WEBP images'], 415);
    if (!is_dir(UPLOAD_DIR)) @mkdir(UPLOAD_DIR, 0755, true);
    $name = 'img-' . date('Ymd') . '-' . bin2hex(random_bytes(5)) . '.' . $types[$info[2]];
    if (!move_uploaded_file($f['tmp_name'], UPLOAD_DIR . '/' . $name)) json_out(['ok' => false, 'error' => 'Could not save file'], 500);
    json_out(['ok' => true, 'path' => 'uploads/' . $name]);
}

if ($action === 'password' && $method === 'POST') {
    $in = body_json();
    $rec = admin_record();
    if (!password_verify((string)($in['current'] ?? ''), $rec['hash'])) json_out(['ok' => false, 'error' => 'Current password is wrong'], 401);
    $new = (string)($in['new'] ?? '');
    if (strlen($new) < 10) json_out(['ok' => false, 'error' => 'New password must be at least 10 characters'], 422);
    $user = clean((string)($in['username'] ?? $rec['username']), 40) ?: $rec['username'];
    write_json('admin.json', ['username' => $user, 'hash' => password_hash($new, PASSWORD_DEFAULT)]);
    json_out(['ok' => true]);
}

if ($action === 'test_email' && $method === 'POST') {
    $s = site_settings();
    $to = array_filter(array_map('trim', preg_split('/[,;\s]+/', (string)($s['notify_emails'] ?? LEAD_NOTIFY_TO)) ?: []));
    $r = send_email($to, 'Test email from E-WasteBiz admin', email_shell('Test email', '<p style="font-size:15px">Lead notifications are working. 🎉</p>'));
    json_out($r, $r['ok'] ? 200 : 502);
}

json_out(['ok' => false, 'error' => 'Unknown action'], 404);
