/**
 * Archival Script for Redundant Healthcare Staging Drafts
 *
 * Safely retires two obsolete staging drafts without deleting them:
 * 1. 6ad5ee98e1a7c2d80e5fc99d (Dr. Nithisha Eye Clinic - subsumed under unified Rohit ENT & Eye Centre)
 * 2. 6ad5ee99e1a7c2d80e5fc9a2 (DM&HO Clinic - duplicate draft of baseline 6acdff71fee9cbd8f541411c)
 *
 * Sets status: 'archived' and active: false.
 * Leaves all baseline government facilities, service providers, and active clinics untouched.
 *
 * Usage:
 *   node backend/src/scripts/archiveRedundantHealthcareDrafts.js
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");

const RETIREMENT_DRAFT_IDS = [
    "6ad5ee98e1a7c2d80e5fc99d", // Dr. Nithisha Eye Clinic & Laser Vision Center
    "6ad5ee99e1a7c2d80e5fc9a2", // District Medical & Health Office (DM&HO) Clinic
];

async function main() {
    try {
        console.log("================================================================================");
        console.log(" NALGONDAONE: ARCHIVE REDUNDANT HEALTHCARE STAGING DRAFTS");
        console.log("================================================================================\n");

        if (!process.env.MONGODB_URI) {
            console.error("Error: MONGODB_URI not found in environment.");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        const objectIds = RETIREMENT_DRAFT_IDS.map(id => new mongoose.Types.ObjectId(id));

        // Preview existing status
        const docs = await db.collection("businesses").find({ _id: { $in: objectIds } }).toArray();
        console.log(`Found ${docs.length} draft records targeted for archival:`);
        for (const doc of docs) {
            console.log(` - [${doc._id}] "${doc.businessName}" (Current Status: ${doc.status})`);
        }

        if (docs.length === 0) {
            console.log("No matching drafts found. Archival already completed.");
            await mongoose.disconnect();
            return;
        }

        const result = await db.collection("businesses").updateMany(
            { _id: { $in: objectIds } },
            {
                $set: {
                    status: "archived",
                    active: false,
                    archivedAt: new Date(),
                    archiveReason: "Staging draft retired post-expansion reconciliation",
                },
            }
        );

        console.log(`\n✅ Archival complete. Total drafts modified: ${result.modifiedCount} (Expected: 2)`);

        await mongoose.disconnect();
    } catch (err) {
        console.error("Archival error:", err);
        process.exit(1);
    }
}

main();
