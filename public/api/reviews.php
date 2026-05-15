<?php
require_once __DIR__ . '/db.php';
corsHeaders();
initDb();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonOut(['error' => 'Method not allowed'], 405);
}

$rows = getDb()
    ->query("SELECT id, name, nights, rating, text, photos, approved_at
             FROM reviews
             WHERE status = 'approved'
             ORDER BY approved_at DESC
             LIMIT 50")
    ->fetchAll();

foreach ($rows as &$row) {
    $row['photos'] = json_decode($row['photos'] ?: '[]', true);
    $row['rating'] = (int) $row['rating'];
}

jsonOut(['reviews' => $rows]);
