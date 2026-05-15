<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'ch010549_reviews');
define('DB_USER', 'ch010549_reviews');
define('DB_PASS', '9562876Qewrty1');
define('DB_CHARSET', 'utf8mb4');

define('UPLOAD_DIR', __DIR__ . '/../uploads/reviews/');
define('UPLOAD_URL', '/uploads/reviews/');

define('ADMIN_PASSWORD', '9562876Qewrty1');
define('NOTIFY_EMAIL', 'almarigurzuf@gmail.com');
define('SITE_ORIGIN', 'https://almari-gurzuf.ru');

function getDb(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}

function initDb(): void {
    getDb()->exec("
        CREATE TABLE IF NOT EXISTS reviews (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            name        VARCHAR(100)  NOT NULL,
            nights      VARCHAR(50)   DEFAULT '',
            rating      TINYINT       NOT NULL,
            text        TEXT          NOT NULL,
            photos      TEXT          NULL,
            status      ENUM('pending','approved','rejected') DEFAULT 'pending',
            token       VARCHAR(64)   DEFAULT NULL,
            created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
            approved_at DATETIME      DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // Миграция: добавить token если таблица уже существует без него
    try {
        getDb()->exec("ALTER TABLE reviews ADD COLUMN token VARCHAR(64) DEFAULT NULL");
    } catch (PDOException $e) {
        // Колонка уже есть — ок
    }
}

function jsonOut(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function corsHeaders(): void {
    header('Access-Control-Allow-Origin: ' . SITE_ORIGIN);
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
}

function notifyNewReview(string $name, int $rating, string $text, string $token): void {
    if (!NOTIFY_EMAIL) return;

    $stars      = str_repeat('★', $rating) . str_repeat('☆', 5 - $rating);
    $approveUrl = SITE_ORIGIN . '/api/review-action.php?token=' . urlencode($token) . '&action=approve';
    $rejectUrl  = SITE_ORIGIN . '/api/review-action.php?token=' . urlencode($token) . '&action=reject';

    $subject = 'Новый отзыв — Альмари Гурзуф';
    $body    = "Новый отзыв ожидает модерации.\r\n\r\n"
             . "Гость: {$name}\r\n"
             . "Оценка: {$stars}\r\n\r\n"
             . "{$text}\r\n\r\n"
             . "ОДОБРИТЬ: {$approveUrl}\r\n\r\n"
             . "ОТКЛОНИТЬ: {$rejectUrl}\r\n\r\n"
             . "Админка: " . SITE_ORIGIN . "/admin/";

    smtpSend(NOTIFY_EMAIL, $subject, $body);
}

function smtpSend(string $to, string $subject, string $body): bool {
    $host = 'smtp.timeweb.ru';
    $user = 'noreply@almari-gurzuf.ru';
    $pass = 'Noreply2025!';
    $from = 'noreply@almari-gurzuf.ru';

    $fp = null;
    foreach ([25, 587, 2525] as $port) {
        $fp = @fsockopen($host, $port, $errno, $errstr, 10);
        if ($fp) break;
    }
    if (!$fp) return false;

    $r = function() use ($fp): string { return fgets($fp, 512) ?: ''; };
    $s = function(string $line) use ($fp): void { fwrite($fp, $line . "\r\n"); };

    $r();
    $s('EHLO almari-gurzuf.ru');
    while (($line = $r()) !== '' && substr($line, 3, 1) === '-') {}

    $s('STARTTLS');
    if (substr($r(), 0, 3) === '220') {
        $ctx = stream_context_create(['ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
        stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        $s('EHLO almari-gurzuf.ru');
        while (($line = $r()) !== '' && substr($line, 3, 1) === '-') {}
    }

    $s('AUTH LOGIN');
    $r();
    $s(base64_encode($user));
    $r();
    $s(base64_encode($pass));
    if (substr($r(), 0, 3) !== '235') { fclose($fp); return false; }

    $s("MAIL FROM:<{$from}>");  $r();
    $s("RCPT TO:<{$to}>");      $r();
    $s('DATA');                  $r();

    $s('From: =?UTF-8?B?' . base64_encode('Альмари Гурзуф') . "?= <{$from}>");
    $s("To: {$to}");
    $s('Subject: =?UTF-8?B?' . base64_encode($subject) . '?=');
    $s('MIME-Version: 1.0');
    $s('Content-Type: text/plain; charset=UTF-8');
    $s('Content-Transfer-Encoding: base64');
    $s('');
    foreach (str_split(base64_encode($body), 76) as $chunk) { $s($chunk); }
    $s('.');
    $r();

    $s('QUIT');
    fclose($fp);
    return true;
}
