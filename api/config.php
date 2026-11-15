<?php
/**
 * E-WasteBiz — configuration loader (safe to commit: contains NO secrets).
 *
 * Secrets live in api/config.local.php, which is git-ignored and must be
 * created once on the server (copy api/config.example.php and fill it in).
 */
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'config.php') { http_response_code(404); exit; }

if (is_file(__DIR__ . '/config.local.php')) {
    require __DIR__ . '/config.local.php';
}

// Safe defaults for anything not set in config.local.php
defined('RESEND_API_KEY') || define('RESEND_API_KEY', getenv('RESEND_API_KEY') ?: '');
defined('RESEND_FROM') || define('RESEND_FROM', 'E-WasteBiz Website <website@ewastebiz.in>');
defined('LEAD_NOTIFY_TO') || define('LEAD_NOTIFY_TO', 'info@ewastebiz.in');
defined('ADMIN_USERNAME') || define('ADMIN_USERNAME', 'admin');
// No hash = no login possible until config.local.php is created.
defined('ADMIN_PASSWORD_HASH') || define('ADMIN_PASSWORD_HASH', '');
defined('DB_HOST') || define('DB_HOST', 'localhost');
defined('DB_NAME') || define('DB_NAME', '');
defined('DB_USER') || define('DB_USER', '');
defined('DB_PASS') || define('DB_PASS', '');
defined('TIMEZONE') || define('TIMEZONE', 'Asia/Kolkata');
