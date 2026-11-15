<?php
/** Counts call / WhatsApp button clicks per day (shown on the admin dashboard). */
declare(strict_types=1);
require __DIR__ . '/lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['ok' => false], 405);
$in = body_json();
$type = in_array($in['type'] ?? '', ['call', 'whatsapp'], true) ? $in['type'] : null;
if (!$type || !rate_limit('track', 30, 600)) json_out(['ok' => true]);

$attr = is_array($in['attr'] ?? null) ? $in['attr'] : [];
$src = !empty($attr['gclid']) ? 'Google Ads' : (!empty($attr['fbclid']) ? 'Meta Ads' : (!empty($attr['utm_source']) ? clean((string)$attr['utm_source'], 40) : 'Direct'));

update_json('events.json', function (&$ev) use ($type, $src) {
    $d = date('Y-m-d');
    $ev[$d][$type] = ($ev[$d][$type] ?? 0) + 1;
    $ev[$d]['src'][$src] = ($ev[$d]['src'][$src] ?? 0) + 1;
    if (count($ev) > 400) { ksort($ev); $ev = array_slice($ev, -400, null, true); }
});
json_out(['ok' => true]);
