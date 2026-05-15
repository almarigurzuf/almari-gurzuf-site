<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Модерация отзыва — Альмари Гурзуф</title>
    <meta name="robots" content="noindex, nofollow">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Montserrat:wght@800&display=swap" rel="stylesheet">
    <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Inter',sans-serif;background:linear-gradient(135deg,#f0f4f8,#e8f4fd);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
        .card{background:#fff;border-radius:28px;padding:52px 48px;max-width:480px;width:100%;text-align:center;box-shadow:0 30px 80px rgba(0,48,80,.12)}
        .icon{width:72px;height:72px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:24px}
        .icon.ok{background:linear-gradient(135deg,#0093E9,#80D0C7);color:#fff;box-shadow:0 12px 30px rgba(0,147,233,.3)}
        .icon.err{background:rgba(229,62,62,.1);color:#e53e3e}
        .icon.reject{background:rgba(113,128,150,.1);color:#718096}
        h1{font-family:'Montserrat',sans-serif;font-size:22px;font-weight:800;color:#1a2a3a;margin-bottom:10px}
        p{color:#4a5568;font-size:15px;line-height:1.6;margin-bottom:24px}
        .review-box{background:#f8fbff;border-radius:14px;padding:18px 20px;margin-bottom:24px;text-align:left}
        .review-name{font-weight:700;color:#1a2a3a;margin-bottom:4px}
        .review-stars{color:#ffcc00;font-size:16px;margin-bottom:8px}
        .review-text{font-style:italic;color:#4a5568;font-size:14px;line-height:1.65}
        .btn{display:inline-block;padding:14px 36px;border-radius:14px;background:linear-gradient(135deg,#0093E9,#80D0C7);color:#fff;text-decoration:none;font-family:'Montserrat',sans-serif;font-weight:700;font-size:15px;box-shadow:0 8px 20px rgba(0,147,233,.25);transition:.2s}
        .btn:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(0,147,233,.35)}
    </style>
</head>
<body>
<?php
require_once __DIR__ . '/db.php';
initDb();

$token  = trim($_GET['token'] ?? '');
$action = trim($_GET['action'] ?? '');

// Валидация
if (!$token || !in_array($action, ['approve', 'reject'])) {
    echo '<div class="card"><div class="icon err">⚠️</div><h1>Неверная ссылка</h1><p>Ссылка недействительна или устарела.</p></div>';
    exit;
}

// Найти отзыв по токену
$stmt = getDb()->prepare("SELECT * FROM reviews WHERE token = :token AND status = 'pending' LIMIT 1");
$stmt->execute([':token' => $token]);
$review = $stmt->fetch();

if (!$review) {
    echo '<div class="card"><div class="icon err">✋</div><h1>Уже обработан</h1><p>Этот отзыв уже был одобрен или отклонён ранее.</p>'
       . '<br><a href="' . SITE_ORIGIN . '/admin/" class="btn">Открыть админку</a></div>';
    exit;
}

// Применить действие
if ($action === 'approve') {
    getDb()->prepare("UPDATE reviews SET status='approved', approved_at=NOW(), token=NULL WHERE id=:id")
           ->execute([':id' => $review['id']]);
} else {
    getDb()->prepare("UPDATE reviews SET status='rejected', token=NULL WHERE id=:id")
           ->execute([':id' => $review['id']]);
}

$stars     = str_repeat('★', $review['rating']) . str_repeat('☆', 5 - $review['rating']);
$isApprove = $action === 'approve';
?>
<div class="card">
    <div class="icon <?= $isApprove ? 'ok' : 'reject' ?>">
        <?= $isApprove ? '✓' : '✕' ?>
    </div>
    <h1><?= $isApprove ? 'Отзыв опубликован!' : 'Отзыв отклонён' ?></h1>
    <p><?= $isApprove
        ? 'Отзыв успешно одобрен и теперь виден на сайте.'
        : 'Отзыв отклонён и не будет показан на сайте.' ?>
    </p>

    <div class="review-box">
        <div class="review-name"><?= htmlspecialchars($review['name']) ?></div>
        <div class="review-stars"><?= $stars ?></div>
        <div class="review-text">«<?= htmlspecialchars($review['text']) ?>»</div>
    </div>

    <a href="<?= SITE_ORIGIN ?>/admin/" class="btn">Открыть админку</a>
</div>
</body>
</html>
