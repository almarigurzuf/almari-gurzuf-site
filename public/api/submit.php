<?php
require_once __DIR__ . '/db.php';
corsHeaders();
initDb();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonOut(['error' => 'Method not allowed'], 405);
}

$name   = trim($_POST['name']   ?? '');
$nights = trim($_POST['nights'] ?? '');
$rating = (int)($_POST['rating'] ?? 0);
$text   = trim($_POST['text']   ?? '');

// Honeypot — бот заполнил скрытое поле
if (!empty($_POST['website'])) jsonOut(['ok' => true]); // тихо игнорируем

if (!$name || strlen($name) > 100)    jsonOut(['error' => 'Введите имя (до 100 символов).'], 400);
if ($rating < 1 || $rating > 5)       jsonOut(['error' => 'Оценка должна быть от 1 до 5.'], 400);
if (!$text || strlen($text) > 2000)   jsonOut(['error' => 'Введите текст отзыва (до 2000 символов).'], 400);

// Сжимаем и ресайзим фото: max 1200px, JPEG 82% — типичный телефонный снимок с 4MB → ~150-250KB
function processImage($tmp, $dest, $maxDim = 1200, $quality = 82) {
    if (!function_exists('imagecreatefromjpeg')) return false; // GD не установлен

    $mime    = mime_content_type($tmp);
    $loaders = [
        'image/jpeg' => 'imagecreatefromjpeg',
        'image/png'  => 'imagecreatefrompng',
        'image/webp' => 'imagecreatefromwebp',
        'image/gif'  => 'imagecreatefromgif',
    ];
    if (!isset($loaders[$mime])) return false;
    $src = $loaders[$mime]($tmp);
    if (!$src) return false;

    $w = imagesx($src);
    $h = imagesy($src);

    if ($w > $maxDim || $h > $maxDim) {
        $ratio = min($maxDim / $w, $maxDim / $h);
        $nw    = (int) round($w * $ratio);
        $nh    = (int) round($h * $ratio);
        $dst   = imagecreatetruecolor($nw, $nh);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
        imagedestroy($src);
        $src = $dst;
    }

    $ok = imagejpeg($src, $dest, $quality);
    imagedestroy($src);
    return $ok;
}

// Загружаем до 3 фото
$photoUrls = [];
if (!empty($_FILES['photos'])) {
    if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);

    $files = $_FILES['photos'];
    $count = is_array($files['name']) ? count($files['name']) : 1;

    for ($i = 0; $i < min($count, 3); $i++) {
        $tmp   = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
        $size  = is_array($files['size'])     ? $files['size'][$i]     : $files['size'];
        $error = is_array($files['error'])    ? $files['error'][$i]    : $files['error'];

        if ($error !== UPLOAD_ERR_OK) continue;
        if ($size > 5 * 1024 * 1024) continue;

        $mime = mime_content_type($tmp);
        if (!in_array($mime, ['image/jpeg','image/png','image/webp','image/gif'])) continue;

        $filename = uniqid('rv_', true) . '.jpg'; // всегда сохраняем как JPEG
        if (processImage($tmp, UPLOAD_DIR . $filename)) {
            $photoUrls[] = UPLOAD_URL . $filename;
        }
    }
}

$token = bin2hex(random_bytes(32));

$stmt = getDb()->prepare("
    INSERT INTO reviews (name, nights, rating, text, photos, token)
    VALUES (:name, :nights, :rating, :text, :photos, :token)
");
$stmt->execute([
    ':name'   => $name,
    ':nights' => $nights,
    ':rating' => $rating,
    ':text'   => $text,
    ':photos' => json_encode($photoUrls, JSON_UNESCAPED_UNICODE),
    ':token'  => $token,
]);

notifyNewReview($name, $rating, $text, $token);

jsonOut(['ok' => true]);
