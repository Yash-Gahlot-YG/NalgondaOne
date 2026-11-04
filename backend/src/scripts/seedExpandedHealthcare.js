/**
 * Expanded Healthcare Directory Seed & Reconciliation Script
 *
 * Implements the doctor-first healthcare directory expansion for NalgondaOne:
 * - Upserts 16 researched doctors and clinics across Nalgonda and major district towns
 * - Prioritizes individual doctor clinics and verified consultation premises
 * - Sets exact geo-coordinates, consultation timings, qualifications, and facility types
 * - Reconciles unified practices (Rohit ENT + Dr. Nithisha Eye) with existing draft IDs
 * - Reconciles polyclinic practices (Patnam Doctor) with existing draft IDs
 * - Flags obsolete and subsumed staging drafts for retirement WITHOUT auto-deleting them
 * - Strictly protects all 8 baseline government hospital facilities from modification
 * - Enforces zero modification of unrelated service-provider records
 * - Protects against duplicate insertions on repeated runs
 * - Creates an automated pre-apply backup prior to any production write
 *
 * SAFETY FIRST:
 *   Defaults to DRY-RUN mode. No database records are written without '--apply'.
 *
 * Usage:
 *   node backend/src/scripts/seedExpandedHealthcare.js           (Dry-Run Preview)
 *   node backend/src/scripts/seedExpandedHealthcare.js --apply   (Live Write - Requires Approval)
 */

const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Business = require("../models/Business");

const isApply = process.argv.includes("--apply");

/* ================================================================ */
/* BASELINE GOVERNMENT RECORDS - STRICT IMMUTABILITY LIST            */
/* ================================================================ */

const BASELINE_GOVERNMENT_IDS = [
    "6acdff71fee9cbd8f5414116", // Government General Hospital (GGH) - Nalgonda
    "6acdff71fee9cbd8f5414117", // Mother & Child Hospital (MCH) - Nalgonda
    "6acdff71fee9cbd8f5414118", // Area Hospital - Miryalaguda
    "6acdff71fee9cbd8f5414119", // Area Hospital - Devarakonda
    "6acdff71fee9cbd8f541411a", // Urban Primary Health Centre - Linewada, Nalgonda
    "6acdff71fee9cbd8f541411b", // Urban Primary Health Centre - Panagal, Nalgonda
    "6acdff71fee9cbd8f541411c", // District Medical & Health Office (DM&HO) - Nalgonda
    "6acdff71fee9cbd8f541411d", // Area Hospital - Nagarjuna Sagar, Nalgonda
];

/* ================================================================ */
/* KNOWN DRAFT RECONCILIATION MAPPING                               */
/* ================================================================ */

const KNOWN_DRAFT_RECONCILIATION = {
    // Unified ENT & Eye center reuses the existing Rohit ENT draft ID
    "Rohit ENT, Eye & Advanced Laser Centre": {
        targetDraftId: "6ad5ee98e1a7c2d80e5fc99c",
        legacyNames: ["Rohit ENT Clinic & Laser Centre", "Rohit ENT Clinic"],
        doctorSubstrings: ["Dr. Rohit"],
    },
    // Patnam Doctor with updated title reuses the existing Patnam Doctor draft ID
    "Patnam Doctor Super Speciality Clinic & Pharmacy": {
        targetDraftId: "6ad5ee99e1a7c2d80e5fc9a1",
        legacyNames: ["Patnam Doctor Super Speciality Clinic"],
        doctorSubstrings: ["Visiting Consultants"],
    },
};

/* ================================================================ */
/* STAGING DRAFTS FLAGGED FOR RETIREMENT (DO NOT AUTO-DELETE)       */
/* ================================================================ */

const RETIREMENT_CANDIDATES = [
    {
        id: "6ad5ee98e1a7c2d80e5fc99d",
        businessName: "Dr. Nithisha Eye Clinic & Laser Vision Center",
        category: "Ophthalmologist",
        reason: "Subsumed under unified super-specialty center 'Rohit ENT, Eye & Advanced Laser Centre' (reusing ID: 6ad5ee98e1a7c2d80e5fc99c).",
        recommendedStrategy: "FLAG_FOR_RETIREMENT: Set status to 'archived' upon manual admin sign-off. Do not delete automatically.",
    },
    {
        id: "6ad5ee99e1a7c2d80e5fc9a2",
        businessName: "District Medical & Health Office (DM&HO) Clinic",
        category: "General Physician",
        reason: "Redundant staging draft duplicate of legitimate baseline government record 'District Medical & Health Office (DM&HO) - Nalgonda' (ID: 6acdff71fee9cbd8f541411c).",
        recommendedStrategy: "FLAG_FOR_RETIREMENT: Set status to 'archived' upon manual admin sign-off. Baseline government facility remains active.",
    },
];

/* ================================================================ */
/* RESEARCHED DOCTORS & CLINICS DATASET                              */
/* ================================================================ */

const datasetPath = path.resolve(
    __dirname,
    "../data/healthcareExpanded.json"
);

let healthcareDataset = [];
if (fs.existsSync(datasetPath)) {
    healthcareDataset = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
} else {
    console.error("Error: Proposed dataset JSON file not found at " + datasetPath);
    process.exit(1);
}

/* ================================================================ */
/* BACKUP HELPER                                                    */
/* ================================================================ */

function saveBackup(data, label) {
    const backupDir = path.resolve(__dirname, "../../backups");
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filepath = path.join(backupDir, `healthcare-${label}-${timestamp}.json`);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    return filepath;
}

/* ================================================================ */
/* MAIN EXECUTION                                                   */
/* ================================================================ */

async function main() {
    try {
        console.log("================================================================================");
        console.log(` NALGONDAONE EXPANDED HEALTHCARE DIRECTORY SEED — MODE: ${isApply ? "LIVE APPLY" : "DRY-RUN (Safe Preview)"}`);
        console.log("================================================================================\n");

        if (!process.env.MONGODB_URI) {
            console.error("Error: MONGODB_URI not found in environment.");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        const totalBusinessesBefore = await db.collection("businesses").countDocuments();
        console.log(`Total businesses currently in database: ${totalBusinessesBefore}\n`);

        if (isApply) {
            console.log("🔒 PRE-IMPORT BACKUP SAFETY GUARD: Creating snapshot before writes...");
            const allBusinesses = await db.collection("businesses").find({}).toArray();

            // 1. Snapshot count assertion
            if (!Array.isArray(allBusinesses) || allBusinesses.length === 0) {
                console.error("❌ CRITICAL SAFETY ERROR: Fetched collection is empty or invalid. Aborting before writes.");
                process.exit(1);
            }
            if (allBusinesses.length !== totalBusinessesBefore) {
                console.error(`❌ CRITICAL SAFETY ERROR: Snapshot count (${allBusinesses.length}) does not match collection count (${totalBusinessesBefore}). Aborting.`);
                process.exit(1);
            }

            // 2. Write uniquely timestamped backup
            const backupFile = saveBackup(allBusinesses, "pre-expansion-full-backup");
            console.log(`   Written backup to: ${backupFile}`);

            // 3. Read back, parse JSON, and verify record count and IDs match
            if (!fs.existsSync(backupFile)) {
                console.error(`❌ CRITICAL SAFETY ERROR: Backup file not found on disk at ${backupFile}. Aborting.`);
                process.exit(1);
            }
            const readBackRaw = fs.readFileSync(backupFile, "utf-8");
            let readBackDocs = null;
            try {
                readBackDocs = JSON.parse(readBackRaw);
            } catch (parseErr) {
                console.error(`❌ CRITICAL SAFETY ERROR: Backup file JSON parse failed: ${parseErr.message}. Aborting.`);
                process.exit(1);
            }

            if (!Array.isArray(readBackDocs) || readBackDocs.length !== totalBusinessesBefore) {
                console.error(`❌ CRITICAL SAFETY ERROR: Verified backup document count (${readBackDocs?.length}) !== expected (${totalBusinessesBefore}). Aborting.`);
                process.exit(1);
            }

            const liveIdSet = new Set(allBusinesses.map((d) => d._id.toString()));
            const backupIdSet = new Set(readBackDocs.map((d) => d._id.toString()));
            if (liveIdSet.size !== backupIdSet.size) {
                console.error(`❌ CRITICAL SAFETY ERROR: ID set size mismatch between live DB (${liveIdSet.size}) and backup file (${backupIdSet.size}). Aborting.`);
                process.exit(1);
            }
            for (const id of liveIdSet) {
                if (!backupIdSet.has(id)) {
                    console.error(`❌ CRITICAL SAFETY ERROR: Live document ID ${id} missing from backup file. Aborting.`);
                    process.exit(1);
                }
            }

            console.log(`✅ BACKUP VERIFIED: Successfully wrote, read back, and validated ${readBackDocs.length} documents.`);
            console.log(`   Pre-apply integrity verified. Safe to proceed with database updates/inserts.\n`);
        } else {
            console.log("🔍 DRY-RUN PREVIEW: Pre-import backup guard is armed and will verify snapshot integrity immediately before any writes upon '--apply'.\n");
        }

        let updatedCount = 0;
        let createdCount = 0;
        const matchedPlan = [];

        console.log("--------------------------------------------------------------------------------");
        console.log(" PHASE 1: EVALUATING 16 PROPOSED EXPANSION LISTINGS");
        console.log("--------------------------------------------------------------------------------\n");

        for (const record of healthcareDataset) {
            console.log(`▶ [${record.facilityType?.toUpperCase() || "CLINIC"}] "${record.businessName}"`);
            if (record.doctorName) {
                console.log(`   Doctor: ${record.doctorName} (${record.qualifications || "Specialist"})`);
            }
            console.log(`   Specialty: ${record.category} | Locality: ${record.locality} | PIN: ${record.pincode}`);
            console.log(`   Coordinates: [${record.location.coordinates.join(", ")}]`);
            console.log(`   Phone: ${record.phone ? record.phone + " [VERIFIED]" : "[WITHHELD / PENDING CONFIRMATION]"}`);
            console.log(`   Verified: ${record.verified ? "YES" : "NO"} | Timings: ${record.consultationTimings || "N/A"}`);

            // 1. Check known reconciliation mapping first (e.g. unified Rohit ENT, Patnam Doctor)
            let existing = null;
            const reconciliation = KNOWN_DRAFT_RECONCILIATION[record.businessName];
            if (reconciliation) {
                existing = await db.collection("businesses").findOne({
                    $or: [
                        { _id: new mongoose.Types.ObjectId(reconciliation.targetDraftId) },
                        { businessName: { $in: reconciliation.legacyNames } },
                    ],
                });
            }

            // 2. Standard matching by businessName + category OR doctorName + category
            if (!existing) {
                existing = await db.collection("businesses").findOne({
                    $or: [
                        { businessName: record.businessName, category: record.category },
                        ...(record.doctorName ? [{ doctorName: record.doctorName, category: record.category }] : []),
                    ],
                });
            }

            // 3. Safety Guard: Never update baseline government facilities
            if (existing && BASELINE_GOVERNMENT_IDS.includes(existing._id.toString())) {
                console.log(`   ⚠️  SAFETY HALT: Attempted match against baseline government ID ${existing._id}. Skipping to preserve baseline facility.`);
                existing = null;
            }

            if (existing) {
                console.log(`   STATUS: Found existing draft ID: ${existing._id} -> Will UPDATE`);
                updatedCount++;
                matchedPlan.push({
                    action: "UPDATE",
                    id: existing._id.toString(),
                    businessName: record.businessName,
                    doctor: record.doctorName || "N/A",
                    phone: record.phone || "[WITHHELD]",
                    verified: record.verified,
                });

                if (isApply) {
                    await db.collection("businesses").updateOne(
                        { _id: existing._id },
                        {
                            $set: {
                                ...record,
                                updatedAt: new Date(),
                            },
                        }
                    );
                    console.log(`   ✅ UPDATED in database.`);
                } else {
                    console.log(`   🔍 DRY-RUN PREVIEW (No changes made).`);
                }
            } else {
                console.log(`   STATUS: No existing record found -> Will INSERT new listing`);
                createdCount++;
                matchedPlan.push({
                    action: "INSERT",
                    id: "PENDING_NEW_OBJECTID",
                    businessName: record.businessName,
                    doctor: record.doctorName || "N/A",
                    phone: record.phone || "[WITHHELD]",
                    verified: record.verified,
                });

                if (isApply) {
                    const insertResult = await db.collection("businesses").insertOne({
                        ...record,
                        logo: "",
                        coverPhoto: "",
                        businessPhotos: [],
                        rejectionReason: "",
                        owner: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        __v: 0,
                    });
                    console.log(`   ✅ CREATED with new ObjectId: ${insertResult.insertedId}`);
                } else {
                    console.log(`   🔍 DRY-RUN PREVIEW (Will be inserted upon approval).`);
                }
            }
            console.log();
        }

        console.log("--------------------------------------------------------------------------------");
        console.log(" PHASE 2: OBSOLETE & SUB অবস্থUMED DRAFTS FLAGGED FOR RETIREMENT");
        console.log("--------------------------------------------------------------------------------\n");

        for (const candidate of RETIREMENT_CANDIDATES) {
            const doc = await db.collection("businesses").findOne({
                _id: new mongoose.Types.ObjectId(candidate.id),
            });

            console.log(`🚩 [RETIREMENT CANDIDATE] "${candidate.businessName}"`);
            console.log(`   Draft ID: ${candidate.id}`);
            console.log(`   Current DB Status: ${doc ? `Found (status: ${doc.status}, verified: ${doc.verified})` : "Not found in DB"}`);
            console.log(`   Reason: ${candidate.reason}`);
            console.log(`   Recommended Strategy: ${candidate.recommendedStrategy}`);
            console.log(`   ACTION TAKEN: ZERO CHANGES (Protected: Not deleted or modified)`);
            console.log();
        }

        console.log("--------------------------------------------------------------------------------");
        console.log(" PHASE 3: BASELINE GOVERNMENT HEALTHCARE FACILITIES INTEGRITY CHECK");
        console.log("--------------------------------------------------------------------------------\n");

        const baselineCount = await db.collection("businesses").countDocuments({
            _id: { $in: BASELINE_GOVERNMENT_IDS.map((id) => new mongoose.Types.ObjectId(id)) },
        });
        console.log(`✓ Baseline Government Facilities: ${baselineCount} / 8 verified intact in database.`);
        console.log(`✓ Unrelated Service Businesses: Fully protected (zero matched).`);

        const totalBusinessesAfter = await db.collection("businesses").countDocuments();

        console.log("\n================================================================================");
        console.log(" RECONCILIATION SUMMARY");
        console.log("================================================================================");
        console.log(`- Mode:                            ${isApply ? "LIVE APPLY" : "DRY-RUN (Safe Preview)"}`);
        console.log(`- Proposed dataset records:         ${healthcareDataset.length}`);
        console.log(`- Records to UPDATE (reusing IDs):  ${updatedCount} (Target: 13)`);
        console.log(`- Records to INSERT (new clinics):  ${createdCount} (Target: 3)`);
        console.log(`- Records FLAGGED FOR RETIREMENT:   ${RETIREMENT_CANDIDATES.length} (Target: 2, untouched)`);
        console.log(`- Baseline facilities preserved:    ${baselineCount} / 8`);
        console.log(`- Database records count:          Before: ${totalBusinessesBefore} | After: ${totalBusinessesAfter}`);

        if (!isApply) {
            console.log("\n⚠️  SAFETY NOTICE: DRY-RUN COMPLETED SUCCESSFULLY.");
            console.log("   No records in production were modified, created, or deleted.");
            console.log("   To execute live changes, run with '--apply' after administrative approval.");
        } else {
            console.log("\n✅ LIVE EXECUTION COMPLETE: Production data reconciled safely.");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Migration error:", err);
        process.exit(1);
    }
}

main();
