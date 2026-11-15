<?php
/** Receives pickup / quote requests, stores them and emails the team via Resend. */
declare(strict_types=1);
require __DIR__ . '/lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['ok' => false, 'error' => 'Method not allowed'], 405);

$in = body_json();

// Spam traps: honeypot field + too-fast submissions. Pretend success so bots learn nothing.
if (!empty($in['website']) || (isset($in['elapsed']) && (int)$in['elapsed'] < 2)) {
    json_out(['ok' => true]);
}

if (!rate_limit('lead', 6, 600)) {
    json_out(['ok' => false, 'error' => 'Too many requests. Please call us instead.'], 429);
}

$name = clean($in['name'] ?? '', 80);
$phoneRaw = clean($in['phone'] ?? '', 30);
$digits = preg_replace('/\D/', '', $phoneRaw) ?? '';
$email = clean($in['email'] ?? '', 120);

if (mb_strlen($name) < 2) json_out(['ok' => false, 'error' => 'Please enter your name.'], 422);
if (strlen($digits) < 10 || strlen($digits) > 13) json_out(['ok' => false, 'error' => 'Please enter a valid phone number.'], 422);
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) json_out(['ok' => false, 'error' => 'Please enter a valid email.'], 422);

$attrIn = is_array($in['attr'] ?? null) ? $in['attr'] : [];
$attr = [];
foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'landing', 'referrer'] as $k) {
    if (!empty($attrIn[$k])) $attr[$k] = clean((string)$attrIn[$k], 300);
}

$source = 'Direct';
if (!empty($attr['gclid']) || stripos($attr['utm_source'] ?? '', 'google') !== false) $source = 'Google Ads';
elseif (!empty($attr['fbclid']) || preg_match('/facebook|instagram|meta|fb|ig/i', $attr['utm_source'] ?? '')) $source = 'Meta Ads';
elseif (!empty($attr['utm_source'])) $source = ucfirst($attr['utm_source']);
elseif (!empty($attr['referrer']) && $attr['referrer'] !== 'direct' && stripos($attr['referrer'], $_SERVER['HTTP_HOST'] ?? '###') === false) {
    $source = preg_match('/google|bing|yahoo|duckduckgo/i', $attr['referrer']) ? 'Organic Search' : 'Referral';
}

$lead = [
    'id' => date('ymd') . '-' . strtoupper(bin2hex(random_bytes(3))),
    'created_at' => date('c'),
    'name' => $name,
    'phone' => $phoneRaw,
    'email' => $email,
    'company' => clean($in['company'] ?? '', 120),
    'city' => clean($in['city'] ?? '', 60),
    'category' => clean($in['category'] ?? '', 80),
    'quantity' => clean($in['quantity'] ?? '', 80),
    'message' => clean($in['message'] ?? '', 2000),
    'form' => clean($in['form'] ?? '', 30),
    'page' => clean($in['page'] ?? '', 120),
    'source' => $source,
    'attr' => $attr,
    'ip' => client_ip(),
    'ua' => clean($_SERVER['HTTP_USER_AGENT'] ?? '', 200),
    'status' => 'new',
    'notes' => [],
    'email_status' => 'pending',
];

lead_save($lead);

/* ---------------- Notify team ---------------- */
$settings = site_settings();
$toList = array_filter(array_map('trim', preg_split('/[,;\s]+/', (string)($settings['notify_emails'] ?? LEAD_NOTIFY_TO)) ?: []), fn($e) => filter_var($e, FILTER_VALIDATE_EMAIL));
if (!$toList) $toList = [LEAD_NOTIFY_TO];

$rows = [
    'Name' => $lead['name'], 'Phone' => $lead['phone'], 'Email' => $lead['email'], 'Company' => $lead['company'],
    'City' => $lead['city'], 'Category' => $lead['category'], 'Quantity' => $lead['quantity'],
    'Message' => $lead['message'], 'Source' => $lead['source'], 'Campaign' => $attr['utm_campaign'] ?? '',
    'Page' => $lead['page'], 'Lead ID' => $lead['id'],
];
$tr = '';
$txt = '';
foreach ($rows as $k => $v) {
    if ($v === '') continue;
    $tr .= '<tr><td style="padding:8px 0;color:#6b7a72;font-size:13px;width:110px;vertical-align:top">' . h($k) . '</td><td style="padding:8px 0;font-size:15px;font-weight:600">' . nl2br(h($v)) . '</td></tr>';
    $txt .= "$k: $v\n";
}
$tel = preg_replace('/[^\d+]/', '', $lead['phone']);
$wa = strlen($digits) === 10 ? '91' . $digits : $digits;
$inner = '<p style="margin:0 0 14px;font-size:16px">New pickup request from <b>' . h($lead['name']) . '</b>' . ($lead['company'] ? ' (' . h($lead['company']) . ')' : '') . '.</p>'
    . '<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eef2ef">' . $tr . '</table>'
    . '<p style="margin:22px 0 0"><a href="tel:' . h($tel) . '" style="background:#16a34a;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700;display:inline-block">Call ' . h($lead['phone']) . '</a> '
    . '<a href="https://wa.me/' . h($wa) . '" style="background:#25d366;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700;display:inline-block;margin-left:6px">WhatsApp</a></p>';

$subject = 'New lead: ' . $lead['name'] . ($lead['company'] ? ' · ' . $lead['company'] : '') . ' · ' . ($lead['category'] ?: 'E-waste');
$sent = send_email($toList, $subject, email_shell('New website lead', $inner), $txt, $email ?: null);

/* ---------------- Auto-reply to customer ---------------- */
if ($email !== '' && !empty($settings['autoreply_enabled'])) {
    $phone = $settings['phone'] ?? '+91 96439 47123';
    $ar = '<p style="margin:0 0 12px;font-size:16px">Hi ' . h(explode(' ', $lead['name'])[0]) . ',</p>'
        . '<p style="margin:0 0 12px;font-size:15px;line-height:1.6">Thank you for contacting E-WasteBiz Enterprises. We have received your pickup request and our team will call you shortly with a quote.</p>'
        . '<p style="margin:0 0 12px;font-size:15px;line-height:1.6">To speed things up, you can reply to this email or WhatsApp us photos of the items.</p>'
        . '<p style="margin:18px 0 0;font-size:15px">Need it urgently? Call <a href="tel:' . h(preg_replace('/[^\d+]/', '', $phone)) . '" style="color:#16a34a;font-weight:700">' . h($phone) . '</a></p>'
        . '<p style="margin:18px 0 0;font-size:15px">— Team E-WasteBiz</p>';
    send_email([$email], 'We received your pickup request — E-WasteBiz Enterprises', email_shell('Request received · Ref ' . $lead['id'], $ar), '', $settings['email'] ?? LEAD_NOTIFY_TO);
}

lead_update($lead['id'], function (&$l) use ($sent) {
    $l['email_status'] = $sent['ok'] ? 'sent' : 'failed: ' . mb_substr((string)$sent['error'], 0, 160);
});

json_out(['ok' => true, 'id' => $lead['id']]);
