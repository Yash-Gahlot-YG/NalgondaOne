/**
 * Migration script: Assign explicit 'vertical' field to existing Business documents.
 *
 * Backward-compatible migration:
 * - Documents with healthcare categories are assigned vertical: "healthcare".
 * - Documents with other service categories are assigned vertical: "services".
 *
 * SAFETY FIRST:
 * - Defaults to DRY-RUN mode. No changes will be written unless '--apply' flag is provided.
 * - Does NOT delete, clear, or modify status/verification fields.
 *
 * Usage:
 *   node src/scripts/migrateBusinessVerticals.js            (Dry-run preview)
 *   node src/scripts/migrateBusinessVerticals.js --apply    (Execute updates)
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config();
const mongoose = require("mongoose");
const Business = require("../models/Business");
const { HEALTHCARE_CATEGORIES } = require("../controllers/healthcareController");

const isApply = process.argv.includes("--apply");

async function migrateVerticals() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("Missing MONGODB_URI in environment.");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to MongoDB. Mode: ${isApply ? "LIVE APPLY" : "DRY-RUN (Safe Preview)"}\n`);

        const unmigrated = await Business.find({
            $or: [{ vertical: { $exists: false } }, { vertical: null }, { vertical: "" }],
        });

        console.log(`Found ${unmigrated.length} businesses without explicit vertical field.\n`);

        if (unmigrated.length === 0) {
            console.log("All businesses already have a vertical assigned. Nothing to do.");
            await mongoose.disconnect();
            process.exit(0);
        }

        let servicesCount = 0;
        let healthcareCount = 0;

        for (const biz of unmigrated) {
            const isHealthcare = HEALTHCARE_CATEGORIES.some(
                (c) => c.toLowerCase() === (biz.category || "").trim().toLowerCase()
            );

            const targetVertical = isHealthcare ? "healthcare" : "services";
            if (isHealthcare) healthcareCount++;
            else servicesCount++;

            console.log(
                `[${targetVertical.toUpperCase().padEnd(10)}] "${biz.businessName}" | Category: "${biz.category}" | ID: ${biz._id}`
            );

            if (isApply) {
                await Business.updateOne(
                    { _id: biz._id },
                    { $set: { vertical: targetVertical } }
                );
            }
        }

        console.log(`\nSummary:`);
        console.log(`- Healthcare businesses: ${healthcareCount}`);
        console.log(`- Services businesses:   ${servicesCount}`);
        console.log(`- Total:                 ${unmigrated.length}`);

        if (!isApply) {
            console.log(
                "\n⚠️  DRY-RUN COMPLETE: No database records were modified." +
                "\nTo apply these updates, run: node src/scripts/migrateBusinessVerticals.js --apply"
            );
        } else {
            console.log("\n✅ Migration successfully applied.");
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("Migration error:", err.message);
        process.exit(1);
    }
}

migrateVerticals();
