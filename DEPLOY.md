# E-WasteBiz — Hostinger deploy guide

## 1. Upload
Upload everything in this folder to `public_html/` **except**:
- `ADMIN-LOGIN.txt` (your local password note)
- `DEPLOY.md`
- `.claude/`

The `.htaccess` files block web access to `data/`, `api/config.php` and `api/lib.php`.

## 2. Database (MySQL)
hPanel → Databases → MySQL. Copy the full DB name, user and password
(Hostinger prefixes them, e.g. `u123456789_ewaste`) into `api/config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_ewaste');
define('DB_USER', 'u123456789_ewaste');
define('DB_PASS', 'your-db-password');
```
Tables (`ewb_leads`, `ewb_kv`) are created automatically on the first request.
With `DB_NAME` empty, data is stored in `data/*.json` instead.

## 3. Email (Resend)
The Resend key is already in `api/config.php`. To deliver lead emails to info@ewastebiz.in:
1. resend.com → Domains → Add `ewastebiz.in`
2. Add the DNS records Resend shows (hPanel → Domains → DNS Zone)
3. After it shows **Verified**, open Admin → Settings → **Send test email**

Leads are always saved in the dashboard, even if email fails.

## 4. Admin
`https://ewastebiz.in/admin/` — credentials are in `ADMIN-LOGIN.txt`.
Change the password from Admin → Settings after first login.

## 5. Ads
Admin → Settings → Ads & analytics: add GA4, Google Ads ID + conversion labels and Meta Pixel.
- Lead conversion fires on `thank-you.html`
- Call / WhatsApp clicks fire as separate conversions and are counted on the dashboard
- UTM parameters and gclid are captured on every lead

## Local preview
`php -S localhost:8085` in this folder (or the "ewastebiz" launch config).
