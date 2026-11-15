<?php
/** Public site content (contact info, stats, FAQs, certificates, testimonials, analytics IDs). */
declare(strict_types=1);
require __DIR__ . '/lib.php';

$s = site_settings();
foreach (private_keys() as $k) unset($s[$k]);
header('Cache-Control: public, max-age=60');
header('Content-Type: application/json; charset=utf-8');
echo json_encode($s ?: new stdClass(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
