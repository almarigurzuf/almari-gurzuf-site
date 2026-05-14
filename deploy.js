import * as ftp from "basic-ftp";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Загружаем переменные из .env файла
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_RETRIES = 3;

async function deployAttempt(host, user, password, remoteDir, localDir, attempt) {
    const client = new ftp.Client();
    client.ftp.timeout = 0;

    try {
        await client.access({
            host: host,
            user: user,
            password: password,
            secure: false,
            pasv: true // Пассивный режим — решает ECONNRESET на большинстве серверов
        });

        console.log(`✅ Подключение успешно (попытка ${attempt}/${MAX_RETRIES})`);

        const localDirPath = path.join(__dirname, localDir);
        console.log(`📂 Загружаем файлы в ${remoteDir}...`);

        await client.ensureDir(remoteDir);
        await client.uploadFromDir(localDirPath);

        console.log("🎉 ДЕПЛОЙ УСПЕШНО ЗАВЕРШЕН! Ваш сайт обновлен в интернете.");
        return true;
    } catch (err) {
        console.error(`❌ Ошибка (попытка ${attempt}/${MAX_RETRIES}):`, err.message);
        return false;
    } finally {
        client.close();
    }
}

async function deploy() {
    const host = process.env.FTP_HOST;
    const user = process.env.FTP_USER;
    const password = process.env.FTP_PASSWORD;
    const remoteDir = process.env.FTP_REMOTE_DIR;

    if (!host) {
        console.error("❌ ОШИБКА: Хост не найден! Добавьте FTP_HOST в .env");
        process.exit(1);
    }

    if (!user) {
        console.error("❌ ОШИБКА: Пользователь не найден! Добавьте FTP_USER в .env");
        process.exit(1);
    }

    if (!password) {
        console.error("❌ ОШИБКА: Пароль не найден! Добавьте FTP_PASSWORD в .env");
        process.exit(1);
    }

    if (!remoteDir) {
        console.error("❌ ОШИБКА: Папка назначения не найдена! Добавьте FTP_REMOTE_DIR в .env");
        process.exit(1);
    }

    console.log("🚀 Начинаем деплой на сервер Timeweb...");

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const success = await deployAttempt(host, user, password, remoteDir, "dist", attempt);
        if (success) process.exit(0);

        if (attempt < MAX_RETRIES) {
            console.log(`⏳ Повторная попытка через 5 секунд...`);
            await new Promise(res => setTimeout(res, 5000));
        }
    }

    console.error(`❌ Деплой не удался после ${MAX_RETRIES} попыток.`);
    process.exit(1);
}

deploy();
