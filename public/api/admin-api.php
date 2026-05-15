<?php
require_once __DIR__ . '/db.php';
corsHeaders();
initDb();

session_start();

// --- Аутентификация ---
$action = $_GET['action'] ?? $_POST['action'] ?? '';

if ($action === 'login') {
    $pass = $_POST['password'] ?? '';
    if ($pass === ADMIN_PASSWORD) {
        $_SESSION['admin'] = true;
        jsonOut(['ok' => true]);
    }
    jsonOut(['error' => 'Неверный пароль'], 401);
}

if ($action === 'logout') {
    session_destroy();
    jsonOut(['ok' => true]);
}

if ($action === 'check') {
    jsonOut(['auth' => !empty($_SESSION['admin'])]);
}

// Все остальные действия — только для авторизованных
if (empty($_SESSION['admin'])) {
    jsonOut(['error' => 'Unauthorized'], 401);
}

// --- Получить отзывы ---
if ($action === 'list') {
    $status = $_GET['status'] ?? 'pending';
    if (!in_array($status, ['pending','approved','rejected'])) $status = 'pending';

    $rows = getDb()
        ->query("SELECT * FROM reviews WHERE status = '$status' ORDER BY created_at DESC")
        ->fetchAll();

    foreach ($rows as &$row) {
        $row['photos'] = json_decode($row['photos'] ?: '[]', true);
        $row['rating'] = (int) $row['rating'];
    }
    jsonOut(['reviews' => $rows]);
}

// --- Подсчёт по статусам ---
if ($action === 'counts') {
    $db = getDb();
    $counts = [];
    foreach (['pending','approved','rejected'] as $s) {
        $counts[$s] = (int)$db->query("SELECT COUNT(*) FROM reviews WHERE status='$s'")->fetchColumn();
    }
    jsonOut($counts);
}

// --- Изменить статус ---
if ($action === 'approve' || $action === 'reject') {
    $id     = (int)($_POST['id'] ?? 0);
    $newStatus = $action === 'approve' ? 'approved' : 'rejected';
    $extra  = $action === 'approve' ? ", approved_at = NOW()" : '';

    $stmt = getDb()->prepare("UPDATE reviews SET status = :s $extra WHERE id = :id");
    $stmt->execute([':s' => $newStatus, ':id' => $id]);
    jsonOut(['ok' => true]);
}

// --- Удалить ---
if ($action === 'delete') {
    $id = (int)($_POST['id'] ?? 0);

    // Удалить фото с диска
    $row = getDb()->query("SELECT photos FROM reviews WHERE id = $id")->fetch();
    if ($row) {
        $photos = json_decode($row['photos'] ?: '[]', true);
        foreach ($photos as $url) {
            $file = __DIR__ . '/..' . $url;
            if (file_exists($file)) unlink($file);
        }
    }

    getDb()->prepare("DELETE FROM reviews WHERE id = :id")->execute([':id' => $id]);
    jsonOut(['ok' => true]);
}

jsonOut(['error' => 'Unknown action'], 400);
