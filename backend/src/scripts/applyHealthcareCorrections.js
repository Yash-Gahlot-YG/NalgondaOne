/**
 * Healthcare Data Reconciliation & Safety Migration Script
 *
 * Enforces corrections for NalgondaOne healthcare directory:
 * - Updates verified hospitals (GGH Nalgonda, AH Miryalaguda, AH Devarakonda)
 * - Restores 4 legacy seeded records (UPHC Nalgonda, Dental Care Centre, Eye Care Hospital, Diagnostic Centre)
 * - Proposes/creates 4 separate records (AH Nagarjuna Sagar, DM&HO Nalgonda, UPHC Linewada, UPHC Panagal)
 * - Clears placeholder phone numbers from all unverified listings to prevent fake contacts and disable calling
 * - Enforces zero modification of unrelated service-provider records
 * - Protects against duplicate insertions on repeated executions
 * - Creates an automated backup prior to any production write
 *
 * SAFETY FIRST:
 *   Defaults to DRY-RUN mode. No database records are written without '--apply'.
 *
 * Usage:
 *   node backend/src/scripts/applyHealthcareCorrections.js           (Dry-Run Preview)
 *   node backend/src/scripts/applyHealthcareCorrections.js --apply   (Live Write - requires explicit approval)
 */

const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");

const isApply = process.argv.includes("--apply");

/* ================================================================ */
/* TARGET EXISTING RECORDS (Exact ObjectIds to update/restore)       */
/* ================================================================ */

const existingUpdates = [
    // 1. GGH Nalgonda
    {
        id: "6acdff71fee9cbd8f5414116",
        expectedCategory: "Hospital",
        data: {
            businessName: "Government General Hospital (GGH) - Nalgonda",
            category: "Hospital",
            vertical: "healthcare",
            phone: "9000227700", // Verified official contact: Dr. Aruna Kumari, Superintendent
            whatsapp: "",
            address: "Near RTC Bus Stand, Gollaguda",
            locality: "Gollaguda",
            city: "Nalgonda",
            pincode: "508001",
            verified: true,
            verifiedAt: new Date("2026-10-17T10:08:44.871Z"),
            adminNotes: "Verified via DME/TVVP District Directory (Dr. Aruna Kumari, Medical Superintendent)",
            status: "approved",
        },
    },

    // 2. MCH Nalgonda
    {
        id: "6acdff71fee9cbd8f5414117",
        expectedCategory: "Hospital",
        data: {
            businessName: "Mother & Child Hospital (MCH) - Nalgonda",
            category: "Hospital",
            vertical: "healthcare",
            phone: "", // Blank until MCH-specific direct line is confirmed
            whatsapp: "",
            address: "Near RTC Bus Stand, Gollaguda (GGH Complex)",
            locality: "Gollaguda",
            city: "Nalgonda",
            pincode: "508001",
            verified: false,
            verifiedAt: null,
            adminNotes: "Unverified: Awaiting MCH-specific direct contact number. Operating at GGH complex.",
            status: "approved",
        },
    },

    // 3. Area Hospital Miryalaguda
    {
        id: "6acdff71fee9cbd8f5414118",
        expectedCategory: "Hospital",
        data: {
            businessName: "Area Hospital - Miryalaguda",
            category: "Hospital",
            vertical: "healthcare",
            phone: "9440380028", // Verified primary contact: Dr. Srinivasa Samaradh, Superintendent
            whatsapp: "",
            address: "Ashok Nagar, Near Municipal Office, Miryalaguda, Nalgonda district - 508207",
            locality: "Ashok Nagar",
            city: "Miryalaguda",
            pincode: "508207",
            verified: true,
            verifiedAt: new Date("2026-10-17T10:08:44.871Z"),
            adminNotes: "Verified via DME/TVVP District Directory (Dr. Srinivasa Samaradh, Medical Superintendent). Landline 08689242051 omitted per safety rule.",
            status: "approved",
        },
    },

    // 4. Area Hospital Devarakonda
    {
        id: "6acdff71fee9cbd8f5414119",
        expectedCategory: "Hospital",
        data: {
            businessName: "Area Hospital - Devarakonda",
            category: "Hospital",
            vertical: "healthcare",
            phone: "7702131479", // Exact official format (10-digit mobile): Dr. Ravi Prakash M, Superintendent
            whatsapp: "",
            address: "Near ZPHS (Boys), Main Road, Devarakonda, Nalgonda district",
            locality: "Devarakonda",
            city: "Nalgonda",
            pincode: "508248",
            verified: true,
            verifiedAt: new Date("2026-10-17T10:08:44.871Z"),
            adminNotes: "Verified via DME/TVVP District Directory (Dr. Ravi Prakash M, Medical Superintendent). Duplicate address text removed.",
            status: "approved",
        },
    },

    // 5. Generic UPHC Nalgonda (Restored to original generic identity, kept separate from Linewada/Panagal)
    {
        id: "6acdff71fee9cbd8f541411a",
        expectedCategory: "General Physician",
        data: {
            businessName: "Urban Primary Health Centre - Nalgonda",
            category: "General Physician",
            vertical: "healthcare",
            description: "Urban Primary Health Centre providing general physician consultations, health check-ups, and chronic disease management. (Unverified generic record — kept separate from specific ward UPHCs).",
            phone: "", // Placeholder cleared
            whatsapp: "",
            address: "Near Clock Tower, Main Road",
            locality: "Nalgonda Town",
            city: "Nalgonda",
            pincode: "508001",
            verified: false,
            verifiedAt: null,
            adminNotes: "Seeded generic UPHC Nalgonda — unverified, awaiting official facility confirmation. Separate from UPHC Linewada and UPHC Panagal.",
            status: "approved",
        },
    },

    // 6. Dental Care Centre - Nalgonda (Restored legacy record)
    {
        id: "6acdff71fee9cbd8f541411b",
        expectedCategory: "Dentist",
        data: {
            businessName: "Dental Care Centre - Nalgonda",
            category: "Dentist",
            vertical: "healthcare",
            description: "Dental health centre offering general dentistry, orthodontics, root canals, and cosmetic dental services in Nalgonda. (Unverified — awaiting official confirmation).",
            services: [
                "General Dentistry",
                "Root Canal Treatment",
                "Orthodontics",
                "Dental Cleaning",
                "Tooth Extraction",
                "Cosmetic Dentistry",
            ],
            phone: "", // Placeholder 08682-234500 cleared
            whatsapp: "",
            address: "Station Road, Near Railway Station",
            locality: "Nalgonda Town",
            city: "Nalgonda",
            pincode: "508001",
            openingTime: "09:30",
            closingTime: "19:00",
            is24Hours: false,
            closedDays: ["Sunday"],
            verified: false,
            verifiedAt: null,
            adminNotes: "Legacy seeded record — unverified, awaiting independent verification. Placeholder phone cleared.",
            status: "approved",
        },
    },

    // 7. Eye Care Hospital - Nalgonda (Restored legacy record)
    {
        id: "6acdff71fee9cbd8f541411c",
        expectedCategory: "Ophthalmologist",
        data: {
            businessName: "Eye Care Hospital - Nalgonda",
            category: "Ophthalmologist",
            vertical: "healthcare",
            description: "Eye care facility providing comprehensive ophthalmic services including cataract evaluation, glaucoma management, and vision correction. (Unverified — awaiting official confirmation).",
            services: [
                "Eye Examination",
                "Cataract Surgery Evaluation",
                "Glaucoma Treatment",
                "Vision Correction",
                "Retina Care",
                "Pediatric Ophthalmology",
            ],
            phone: "", // Placeholder 08682-236700 cleared
            whatsapp: "",
            address: "Hyderabad Road, Sai Nagar",
            locality: "Nalgonda Town",
            city: "Nalgonda",
            pincode: "508001",
            openingTime: "09:00",
            closingTime: "18:00",
            is24Hours: false,
            closedDays: ["Sunday"],
            verified: false,
            verifiedAt: null,
            adminNotes: "Legacy seeded record — unverified, awaiting independent verification. Placeholder phone cleared.",
            status: "approved",
        },
    },

    // 8. Diagnostic Centre - Nalgonda (Restored legacy record)
    {
        id: "6acdff71fee9cbd8f541411d",
        expectedCategory: "Diagnostic Center",
        data: {
            businessName: "Diagnostic Centre - Nalgonda",
            category: "Diagnostic Center",
            vertical: "healthcare",
            description: "Diagnostic centre offering blood tests, imaging, ECG, X-ray, ultrasound, and health screening packages. (Unverified — awaiting official confirmation).",
            services: [
                "Blood Tests",
                "X-Ray",
                "Ultrasound",
                "ECG",
                "Health Screening",
                "Pathology",
            ],
            phone: "", // Placeholder 08682-238900 cleared
            whatsapp: "",
            address: "Gandhi Chowk, Main Road",
            locality: "Nalgonda Town",
            city: "Nalgonda",
            pincode: "508001",
            openingTime: "07:00",
            closingTime: "20:00",
            is24Hours: false,
            closedDays: [],
            verified: false,
            verifiedAt: null,
            adminNotes: "Legacy seeded record — unverified, awaiting independent verification. Placeholder phone cleared.",
            status: "approved",
        },
    },
];

/* ================================================================ */
/* PROPOSED NEW RECORDS (To be created as separate documents)       */
/* ================================================================ */

const proposedNewRecords = [
    // 1. Area Hospital Nagarjuna Sagar
    {
        businessName: "Area Hospital, Nagarjuna Sagar",
        category: "Hospital",
        vertical: "healthcare",
        description: "Government hospital under Telangana Vaidya Vidhana Parishad (TVVP) serving Nagarjuna Sagar and Peddavoora mandal. Provides 24/7 emergency casualty, inpatient care, and maternal services.",
        services: [
            "Emergency Care",
            "General Medicine",
            "Inpatient Services",
            "Maternal Health",
            "Basic Diagnostics",
        ],
        address: "Hill Colony, Nagarjuna Sagar, Peddavoora (M), Nalgonda District",
        locality: "Hill Colony",
        city: "Nalgonda",
        pincode: "508266",
        phone: "9494136789", // Medical Superintendent Dr. M. Hari Krishna
        whatsapp: "",
        openingTime: "00:00",
        closingTime: "23:59",
        is24Hours: true,
        closedDays: [],
        verified: true,
        verifiedAt: new Date("2026-10-17T10:08:44.871Z"),
        adminNotes: "Verified via DME/TVVP District Directory (Dr. M. Hari Krishna, Medical Superintendent - msahsagar@gmail.com)",
        status: "approved",
    },

    // 2. DM&HO Nalgonda
    {
        businessName: "District Medical & Health Office (DM&HO), Nalgonda",
        category: "Clinic",
        vertical: "healthcare",
        description: "Official district medical headquarters and public health administration facility for Nalgonda district under the Government of Telangana Health & Family Welfare department.",
        services: [
            "Public Health Services",
            "Immunization Programs",
            "Maternal & Child Health Guidance",
            "Health Certification",
            "Epidemic Control",
        ],
        address: "Opp. I Town Police Station, R.P. Road, Nalgonda",
        locality: "R.P. Road",
        city: "Nalgonda",
        pincode: "508001",
        phone: "9908273355", // Dr. Putla Srinivas, DM&HO
        whatsapp: "",
        openingTime: "10:00",
        closingTime: "17:00",
        is24Hours: false,
        closedDays: ["Sunday"],
        verified: true,
        verifiedAt: new Date("2026-10-17T10:08:44.871Z"),
        adminNotes: "Verified via DM&HO Nalgonda Office Directory (Dr. Putla Srinivas, DM&HO - dmhonlg2002@yahoo.com)",
        status: "approved",
    },

    // 3. UPHC Linewada (Unverified pending physical facility confirmation)
    {
        businessName: "Urban Primary Health Centre - Linewada",
        category: "General Physician",
        vertical: "healthcare",
        description: "Urban Primary Health Centre providing general physician consultations, vaccinations, and basic healthcare services. (Unverified: Physical facility address pending confirmation).",
        services: [
            "General Consultation",
            "Health Check-up",
            "Vaccinations",
            "Basic Lab Tests",
        ],
        address: "Linewada, Nalgonda (Pending official facility address confirmation)",
        locality: "Linewada",
        city: "Nalgonda",
        pincode: "508001",
        phone: "", // Blank per safety rule to disable dialing & avoid displaying unconfirmed contact
        whatsapp: "",
        openingTime: "09:00",
        closingTime: "16:00",
        is24Hours: false,
        closedDays: ["Sunday"],
        verified: false,
        verifiedAt: null,
        adminNotes: "Unverified: Physical facility address pending official confirmation. Directory lists Medical Officer Dr. Ejaz Iqthiar (9441795547) - nalgondalinewada@gmail.com.",
        status: "approved",
    },

    // 4. UPHC Panagal (Unverified pending physical facility confirmation)
    {
        businessName: "Urban Primary Health Centre - Panagal",
        category: "General Physician",
        vertical: "healthcare",
        description: "Urban Primary Health Centre serving Panagal and surrounding neighborhoods. Provides primary medical consultations and health checkups. (Unverified: Physical facility address pending confirmation).",
        services: [
            "General Consultation",
            "Health Check-up",
            "Vaccinations",
            "Basic Lab Tests",
        ],
        address: "Pangal Road, Nalgonda (Pending official facility address confirmation)",
        locality: "Panagal",
        city: "Nalgonda",
        pincode: "508001",
        phone: "", // Blank per safety rule to disable dialing & avoid displaying unconfirmed contact
        whatsapp: "",
        openingTime: "09:00",
        closingTime: "16:00",
        is24Hours: false,
        closedDays: ["Sunday"],
        verified: false,
        verifiedAt: null,
        adminNotes: "Unverified: Physical facility address pending official confirmation. Directory lists Medical Officer Dr. A.K. Surya Shilpa (9160024975) - nalgnalgonpangal@gmail.com.",
        status: "approved",
    },
];

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
        console.log(` HEALTHCARE DATA RECONCILIATION SCRIPT — MODE: ${isApply ? "LIVE APPLY" : "DRY-RUN (Safe Preview)"}`);
        console.log("================================================================================\n");

        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        const totalBusinessesBefore = await db.collection("businesses").countDocuments();
        console.log(`Total businesses currently in database: ${totalBusinessesBefore}\n`);

        const targetObjectIds = existingUpdates.map(u => new mongoose.Types.ObjectId(u.id));

        // 1. Verify that all 8 target IDs exist in the database
        const existingDocs = await db.collection("businesses").find({
            _id: { $in: targetObjectIds }
        }).toArray();

        if (existingDocs.length !== existingUpdates.length) {
            console.error(`ERROR: Expected ${existingUpdates.length} existing documents, but found ${existingDocs.length}.`);
            await mongoose.disconnect();
            process.exit(1);
        }

        const docMap = new Map();
        existingDocs.forEach(d => docMap.set(d._id.toString(), d));

        // 2. Protect unrelated service-provider records
        const unrelatedCount = await db.collection("businesses").countDocuments({
            _id: { $nin: targetObjectIds }
        });
        console.log(`Protected unrelated service records (will NOT be touched): ${unrelatedCount}\n`);

        // If in live mode, trigger automatic backup
        if (isApply) {
            const allBusinesses = await db.collection("businesses").find({}).toArray();
            const backupFile = saveBackup(allBusinesses, "pre-apply-full-backup");
            console.log(`🔒 Automatic pre-apply backup saved to: ${backupFile}\n`);
        }

        console.log("--------------------------------------------------------------------------------");
        console.log(" PART 1: EXISTING RECORDS (8 Documents to Update / Restore)");
        console.log("--------------------------------------------------------------------------------\n");

        for (const update of existingUpdates) {
            const before = docMap.get(update.id);
            const afterData = update.data;

            console.log(`▶ RECORD ID: ${update.id}`);
            console.log(`  BEFORE:`);
            console.log(`    businessName : "${before.businessName}"`);
            console.log(`    category     : "${before.category}"`);
            console.log(`    phone        : "${before.phone}"`);
            console.log(`    address      : "${before.address}"`);
            console.log(`    verified     : ${before.verified}`);
            console.log(`    adminNotes   : "${before.adminNotes || ""}"`);
            console.log(`  AFTER:`);
            console.log(`    businessName : "${afterData.businessName}"`);
            console.log(`    category     : "${afterData.category}"`);
            console.log(`    phone        : "${afterData.phone}" ${afterData.phone === "" ? "[CLEARED / BLANK - CALLING DISABLED]" : "[VERIFIED OFFICIAL]"}`);
            console.log(`    address      : "${afterData.address}"`);
            console.log(`    verified     : ${afterData.verified} ${afterData.verified ? "[BADGE SHOWN]" : "[BADGE HIDDEN]"}`);
            console.log(`    adminNotes   : "${afterData.adminNotes}"`);

            if (isApply) {
                await db.collection("businesses").updateOne(
                    { _id: before._id },
                    {
                        $set: {
                            ...afterData,
                            updatedAt: new Date(),
                        }
                    }
                );
                console.log(`  STATUS: ✅ UPDATED in database.`);
            } else {
                console.log(`  STATUS: 🔍 DRY-RUN PREVIEW (No changes made).`);
            }
            console.log();
        }

        console.log("--------------------------------------------------------------------------------");
        console.log(" PART 2: PROPOSED NEW RECORDS (4 Documents to Create / Idempotently Check)");
        console.log("--------------------------------------------------------------------------------\n");

        let newlyCreated = 0;
        let skippedExisting = 0;

        for (const newRec of proposedNewRecords) {
            // Check for existing business with matching name and category outside legacy IDs
            const existingMatch = await db.collection("businesses").findOne({
                businessName: newRec.businessName,
                category: newRec.category,
                _id: { $nin: targetObjectIds },
            });

            console.log(`▶ PROPOSED NEW RECORD: "${newRec.businessName}" [${newRec.category}]`);

            if (existingMatch) {
                console.log(`  DUPLICATE CHECK: Found existing separate document [${existingMatch._id}].`);
                console.log(`  STATUS: ⚠️ SKIPPING (Duplicate insertion prevented).`);
                skippedExisting++;
            } else {
                console.log(`  DUPLICATE CHECK: No duplicate found. Clean insertion target.`);
                console.log(`  VALUES TO INSERT:`);
                console.log(`    category   : "${newRec.category}"`);
                console.log(`    vertical   : "${newRec.vertical}"`);
                console.log(`    phone      : "${newRec.phone}" ${newRec.phone === "" ? "[BLANK - CALLING DISABLED]" : "[VERIFIED OFFICIAL]"}`);
                console.log(`    address    : "${newRec.address}"`);
                console.log(`    locality   : "${newRec.locality}", city: "${newRec.city}", pincode: "${newRec.pincode}"`);
                console.log(`    verified   : ${newRec.verified} ${newRec.verified ? "[BADGE SHOWN]" : "[BADGE HIDDEN]"}`);
                console.log(`    adminNotes : "${newRec.adminNotes}"`);

                if (isApply) {
                    const insertResult = await db.collection("businesses").insertOne({
                        ...newRec,
                        logo: "",
                        coverPhoto: "",
                        businessPhotos: [],
                        location: { type: "Point", coordinates: [0, 0] },
                        rejectionReason: "",
                        owner: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        __v: 0,
                    });
                    console.log(`  STATUS: ✅ CREATED with new ObjectId: ${insertResult.insertedId}`);
                    newlyCreated++;
                } else {
                    console.log(`  STATUS: 🔍 DRY-RUN PREVIEW (Will be inserted upon approval).`);
                    newlyCreated++;
                }
            }
            console.log();
        }

        const totalBusinessesAfter = await db.collection("businesses").countDocuments();

        console.log("================================================================================");
        console.log(" EXECUTION SUMMARY");
        console.log("================================================================================");
        console.log(`- Mode:                            ${isApply ? "LIVE APPLY" : "DRY-RUN (Safe Preview)"}`);
        console.log(`- Existing records updated:        ${existingUpdates.length}`);
        console.log(`- New records prepared/created:    ${newlyCreated}`);
        console.log(`- Duplicate inserts prevented:     ${skippedExisting}`);
        console.log(`- Protected unrelated businesses:  ${unrelatedCount}`);
        console.log(`- Database records count:          Before: ${totalBusinessesBefore} | After: ${totalBusinessesAfter}`);

        if (!isApply) {
            console.log("\n⚠️  SAFETY NOTICE: DRY-RUN COMPLETED SUCCESSFULLY.");
            console.log("   No records in production were modified or created.");
            console.log("   To execute live changes, run with '--apply' after explicit user approval.");
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
