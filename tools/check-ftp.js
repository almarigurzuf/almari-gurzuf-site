import * as ftp from "basic-ftp";
import dotenv from "dotenv";
dotenv.config();

async function check() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });
        
        console.log("=== КОРНЕВАЯ ПАПКА ===");
        const rootList = await client.list();
        for (let item of rootList) {
            console.log(item.name + (item.isDirectory ? "/" : ""));
        }

        console.log("\n=== ПАПКА root public_html ===");
        try {
            await client.cd("public_html");
            const publicList = await client.list();
            for (let item of publicList) {
                console.log(item.name + (item.isDirectory ? "/" : ""));
            }
        } catch (e) {
            console.log("Не удалось зайти в public_html:", e.message);
        }

    } catch(err) {
        console.error(err);
    }
    client.close();
}
check();
