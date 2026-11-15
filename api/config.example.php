<?php
/**
 * E-WasteBiz — secrets template.
 * Copy this file to api/config.local.php on the server and fill in real values.
 * config.local.php is git-ignored, so deploys never overwrite or expose it.
 */
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'config.example.php') { http_response_code(404); exit; }

// Resend (resend.com/api-keys). Sender must be on a domain verified in Resend.
define('RESEND_API_KEY', 're_xxxxxxxxxxxxxxxxxxxxxxxx');
define('RESEND_FROM', 'E-WasteBiz Website <website@ewastebiz.in>');
define('LEAD_NOTIFY_TO', 'info@ewastebiz.in');

// Admin login. Generate a hash with:
//   php -r 'echo password_hash("YourStrongPassword", PASSWORD_DEFAULT);'
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD_HASH', '');

// MySQL (Hostinger: hPanel > Databases > MySQL). Names usually look like u123456789_ewaste.
// Leave DB_NAME empty to store data in data/*.json files instead.
define('DB_HOST', 'localhost');
define('DB_NAME', '');
define('DB_USER', '');
define('DB_PASS', '');
