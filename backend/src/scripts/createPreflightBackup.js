const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");

async function createBackup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        const allBusinesses = await db.collection("businesses").find({}).toArray();
        const healthcareBusinesses = allBusinesses.filter(b =>
            b.vertical === "healthcare" ||
            ["Hospital", "Clinic", "Dentist", "Ophthalmologist", "Diagnostic Center", "General Physician"].includes(b.category)
        );

        const backupDir = path.resolve(__dirname, "../../backups");
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupFileAll = path.join(backupDir, `businesses-all-backup-${timestamp}.json`);
        const backupFileHealthcare = path.join(backupDir, `healthcare-preflight-backup-${timestamp}.json`);
        const latestBackup = path.join(backupDir, "healthcare-preflight-backup-latest.json");

        fs.writeFileSync(backupFileAll, JSON.stringify(allBusinesses, null, 2));
        fs.writeFileSync(backupFileHealthcare, JSON.stringify(healthcareBusinesses, null, 2));
        fs.writeFileSync(latestBackup, JSON.stringify(healthcareBusinesses, null, 2));

        console.log(`✓ Backup successfully created:`);
        console.log(`  - All businesses (${allBusinesses.length} records): ${backupFileAll}`);
        console.log(`  - Healthcare records (${healthcareBusinesses.length} records): ${backupFileHealthcare}`);
        console.log(`  - Latest pointer: ${latestBackup}`);

        await mongoose.disconnect();
    } catch (err) {
        console.error("Backup failed:", err);
        process.exit(1);
    }
}

createBackup();
