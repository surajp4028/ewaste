<?php
/**
 * E-WasteBiz — private configuration.
 * Keep this file secret. It is blocked from web access by api/.htaccess.
 */
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'config.php') { http_response_code(404); exit; }

// ---- Resend (transactional email) ----
// Key reused from the suraj-minimal-portfolio project.
define('RESEND_API_KEY', 're_MUiBSimh_EPYpPbSvLkc5iLDcaAH9BgEE');

// Sender. Must be on a domain verified in Resend (resend.com/domains).
// Until ewastebiz.in is verified, Resend only allows "onboarding@resend.dev"
// and only delivers to the Resend account owner's own email.
define('RESEND_FROM', 'E-WasteBiz Website <website@ewastebiz.in>');

// Default lead notification recipients (can be changed in Admin > Settings).
define('LEAD_NOTIFY_TO', 'info@ewastebiz.in');

// ---- Admin login ----
// Default credentials. Change the password from Admin > Settings after first login.
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD_HASH', '$2y$10$ENmXQ6wSe53gwhIxAQDLP.Yrv7vLmJN0M47gYqrx436j9FY9OQhD2');

define('TIMEZONE', 'Asia/Kolkata');

// ---- MySQL database (Hostinger: hPanel > Databases > MySQL) ----
// Leave DB_NAME empty to store data in /data/*.json files instead.
// On Hostinger the name & user look like "u123456789_ewaste".
define('DB_HOST', 'localhost');
define('DB_NAME', '');
define('DB_USER', '');
define('DB_PASS', '');
