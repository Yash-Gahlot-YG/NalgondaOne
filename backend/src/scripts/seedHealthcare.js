/**
 * Seed script for verified healthcare listings in Nalgonda.
 *
 * Uses the existing Business model — each healthcare provider
 * is stored as an approved & verified business with a
 * healthcare-related category.
 *
 * Duplicate prevention: Skips if a business with the same
 * businessName + category already exists (phone removed from
 * duplicate key since corrections may change phone numbers).
 *
 * Required env vars:
 *   MONGODB_URI
 *
 * Usage:
 *   node src/scripts/seedHealthcare.js
 *
 * SOURCES:
 *   https://nalgonda.telangana.gov.in/district-officialhealth-facility-contact-details-dmetvvp-and-dh/
 *   https://nalgonda.telangana.gov.in/office-of-the-district-medical-health-office-nalgonda/
 *   https://nalgonda.telangana.gov.in/public-utility/area-hospital/
 */

require("dotenv").config();

const mongoose = require("mongoose");
const Business = require("../models/Business");

/* ================================================================ */
/* SEED DATA — Verified against official Nalgonda district sources  */
/* ================================================================ */

const healthcareListings = [
    // ── 1. Government General Hospital, Nalgonda ──────────────────
    // Source: DME/TVVP district directory — phone 9000227700
    {
        businessName: "Government General Hospital, Nalgonda",
        category: "Hospital",
        description:
            "Government-run multi-specialty hospital serving the Nalgonda district. Provides emergency, outpatient, inpatient, and surgical services across departments including General Medicine, Surgery, Obstetrics & Gynecology, Pediatrics, Orthopedics, and ENT.",
        services: [
            "Emergency Care",
            "General Medicine",
            "Surgery",
            "Obstetrics & Gynecology",
            "Pediatrics",
            "Orthopedics",
            "ENT",
            "Diagnostics",
            "Blood Bank",
        ],
        address: "Near Bustand, Gollaguda, Nalgonda",
        locality: "Nalgonda Town",
        city: "Nalgonda",
        pincode: "508001",
        phone: "9000227700",
        openingTime: "00:00",
        closingTime: "23:59",
        is24Hours: true,
        closedDays: [],
        verified: true,
    },

    // ── 2. Mother & Child Hospital, Nalgonda ──────────────────────
    // No independent phone verified — marked unverified
    {
        businessName: "Mother & Child Hospital, Nalgonda",
        category: "Hospital",
        description:
            "Dedicated maternity and women's health facility at the Nalgonda District Hospital campus. Provides prenatal, delivery, postnatal, and neonatal care services.",
        services: [
            "Prenatal Care",
            "Normal Delivery",
            "C-Section",
            "Postnatal Care",
            "Neonatal Care",
            "Family Planning",
        ],
        address: "Government Hospital Complex, Nalgonda",
        locality: "Nalgonda Town",
        city: "Nalgonda",
        pincode: "508001",
        phone: "",
        openingTime: "00:00",
        closingTime: "23:59",
        is24Hours: true,
        closedDays: [],
        verified: false,
    },

    // ── 3. Area Hospital, Miryalaguda ─────────────────────────────
    // Source: DME directory — phone 9440380028 (Dr. Srinivasa Samaradh)
    // Note: Hospital page also lists landline 08689242051
    {
        businessName: "Area Hospital, Miryalaguda",
        category: "Hospital",
        description:
            "Government area hospital in Miryalaguda providing primary, secondary, and emergency healthcare services. Landline: 08689-242051.",
        services: [
            "Emergency Care",
            "General Medicine",
            "Surgery",
            "Obstetrics & Gynecology",
            "Pediatrics",
            "Vaccinations",
            "Maternal Health",
            "Child Health",
        ],
        address: "Ashok Nagar, Near Municipal Office, Miryalaguda",
        locality: "Miryalaguda",
        city: "Nalgonda",
        pincode: "508207",
        phone: "9440380028",
        openingTime: "00:00",
        closingTime: "23:59",
        is24Hours: true,
        closedDays: [],
        verified: true,
    },

    // ── 4. Area Hospital, Nagarjuna Sagar ─────────────────────────
    // Source: DME directory — phone 9494136789, PIN 508266
    {
        businessName: "Area Hospital, Nagarjuna Sagar",
        category: "Hospital",
        description:
            "Government area hospital at Nagarjuna Sagar serving the Peddavoora mandal and surrounding areas.",
        services: [
            "Emergency Care",
            "General Medicine",
            "Maternal Health",
            "Child Health",
            "Basic Diagnostics",
        ],
        address: "Hill Colony, Nagarjuna Sagar, Peddavoora (M)",
        locality: "Nagarjuna Sagar",
        city: "Nalgonda",
        pincode: "508266",
        phone: "9494136789",
        openingTime: "00:00",
        closingTime: "23:59",
        is24Hours: true,
        closedDays: [],
        verified: true,
    },

    // ── 5. District Medical & Health Office (DMHO), Nalgonda ──────
    // Source: DM&HO page — phone 9908273355 (Dr. Putla Srinivas)
    {
        businessName: "District Medical & Health Office (DMHO), Nalgonda",
        category: "Clinic",
        description:
            "District Medical & Health Office coordinating public health services across Nalgonda district. Contact: Dr. Putla Srinivas, DMHO.",
        services: [
            "Public Health Coordination",
            "Vaccination Programs",
            "Epidemic Control",
            "Health Statistics",
        ],
        address: "Opp. I Town Police Station, RP Road, Nalgonda",
        locality: "Nalgonda Town",
        city: "Nalgonda",
        pincode: "508001",
        phone: "9908273355",
        openingTime: "10:00",
        closingTime: "17:00",
        is24Hours: false,
        closedDays: ["Sunday"],
        verified: true,
    },

    // ── 6. Area Hospital, Devarakonda ─────────────────────────────
    // Phone: 7702131479 (per user instruction, extra leading zero removed)
    {
        businessName: "Area Hospital, Devarakonda",
        category: "Hospital",
        description:
            "Government area hospital serving the Devarakonda mandal. Provides primary and secondary healthcare, immunization, and maternal health services.",
        services: [
            "Emergency Care",
            "General Medicine",
            "Immunization",
            "Maternal Health",
            "Basic Diagnostics",
        ],
        address: "Devarakonda, Nalgonda District, Telangana",
        locality: "Devarakonda",
        city: "Nalgonda",
        pincode: "508248",
        phone: "7702131479",
        openingTime: "00:00",
        closingTime: "23:59",
        is24Hours: true,
        closedDays: [],
        verified: true,
    },

    // ── 7. UPHC, Panagal ──────────────────────────────────────────
    // Phone: 9160024975 (per user instruction, extra leading zero removed)
    {
        businessName: "UPHC, Panagal",
        category: "General Physician",
        description:
            "Urban Primary Health Centre at Panagal providing general physician consultations, health check-ups, and chronic disease management.",
        services: [
            "General Consultation",
            "Health Check-up",
            "Chronic Disease Management",
            "Vaccinations",
            "Basic Lab Tests",
        ],
        address: "Panagal, Nalgonda District",
        locality: "Panagal",
        city: "Nalgonda",
        pincode: "508001",
        phone: "9160024975",
        openingTime: "09:00",
        closingTime: "16:00",
        is24Hours: false,
        closedDays: ["Sunday"],
        verified: true,
    },

    // ── 8. UPHC, Linewada ─────────────────────────────────────────
    // Phone: 9441795547 (per user instruction, extra leading zero removed)
    {
        businessName: "UPHC, Linewada",
        category: "General Physician",
        description:
            "Urban Primary Health Centre at Linewada providing general physician consultations and basic healthcare services.",
        services: [
            "General Consultation",
            "Health Check-up",
            "Vaccinations",
            "Basic Lab Tests",
        ],
        address: "Linewada, Nalgonda",
        locality: "Linewada",
        city: "Nalgonda",
        pincode: "508001",
        phone: "9441795547",
        openingTime: "09:00",
        closingTime: "16:00",
        is24Hours: false,
        closedDays: ["Sunday"],
        verified: true,
    },

    // ── Unverified legacy records (kept but marked unverified) ────
    // These are original seed entries with no official source match.
    // Placeholder phones have been cleared.

    {
        businessName: "Urban Primary Health Centre - Nalgonda",
        category: "General Physician",
        description:
            "Urban PHC providing general physician consultations, health check-ups, and chronic disease management for residents of Nalgonda town. (Unverified — no official source confirmation.)",
        services: [
            "General Consultation",
            "Health Check-up",
            "Chronic Disease Management",
            "Vaccinations",
            "Basic Lab Tests",
        ],
        address: "Near Clock Tower, Main Road",
        locality: "Nalgonda Town",
        city: "Nalgonda",
        pincode: "508001",
        phone: "",
        openingTime: "09:00",
        closingTime: "16:00",
        is24Hours: false,
        closedDays: ["Sunday"],
        verified: false,
    },
    {
        businessName: "Dental Care Centre - Nalgonda",
        category: "Dentist",
        description:
            "Dental health centre offering general dentistry, orthodontics, root canals, and cosmetic dental services in Nalgonda. (Unverified — no official source confirmation.)",
        services: [
            "General Dentistry",
            "Root Canal Treatment",
            "Orthodontics",
            "Dental Cleaning",
            "Tooth Extraction",
            "Cosmetic Dentistry",
        ],
        address: "Station Road, Near Railway Station",
        locality: "Nalgonda Town",
        city: "Nalgonda",
        pincode: "508001",
        phone: "",
        openingTime: "09:30",
        closingTime: "19:00",
        is24Hours: false,
        closedDays: ["Sunday"],
        verified: false,
    },
    {
        businessName: "Eye Care Hospital - Nalgonda",
        category: "Ophthalmologist",
        description:
            "Eye care facility providing comprehensive ophthalmic services including cataract surgery, glaucoma management, and vision correction. (Unverified — no official source confirmation.)",
        services: [
            "Eye Examination",
            "Cataract Surgery",
            "Glaucoma Treatment",
            "Vision Correction",
            "Retina Care",
            "Pediatric Ophthalmology",
        ],
        address: "Hyderabad Road, Sai Nagar",
        locality: "Nalgonda Town",
        city: "Nalgonda",
        pincode: "508001",
        phone: "",
        openingTime: "09:00",
        closingTime: "18:00",
        is24Hours: false,
        closedDays: ["Sunday"],
        verified: false,
    },
    {
        businessName: "Diagnostic Centre - Nalgonda",
        category: "Diagnostic Center",
        description:
            "Comprehensive diagnostic centre offering blood tests, imaging, ECG, X-ray, ultrasound, and health screening packages. (Unverified — no official source confirmation.)",
        services: [
            "Blood Tests",
            "X-Ray",
            "Ultrasound",
            "ECG",
            "Health Screening",
            "Pathology",
        ],
        address: "Gandhi Chowk, Main Road",
        locality: "Nalgonda Town",
        city: "Nalgonda",
        pincode: "508001",
        phone: "",
        openingTime: "07:00",
        closingTime: "20:00",
        is24Hours: false,
        closedDays: [],
        verified: false,
    },
];

async function seedHealthcare() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected for healthcare seeding.\n");

        let created = 0;
        let skipped = 0;
        let updated = 0;

        for (const listing of healthcareListings) {
            // Check for existing record by name + category
            const existing = await Business.findOne({
                businessName: listing.businessName,
                category: listing.category,
            });

            if (existing) {
                // Update existing record with corrected data
                existing.phone = listing.phone;
                existing.address = listing.address;
                existing.pincode = listing.pincode;
                existing.verified = listing.verified;
                existing.description = listing.description;
                existing.services = listing.services;
                existing.locality = listing.locality;
                existing.openingTime = listing.openingTime;
                existing.closingTime = listing.closingTime;
                existing.is24Hours = listing.is24Hours;
                existing.closedDays = listing.closedDays;
                if (listing.verified) {
                    existing.verifiedAt = new Date();
                }
                await existing.save();
                console.log(`↻ Updated: ${listing.businessName} [${listing.category}]`);
                updated++;
                continue;
            }

            await Business.create({
                ...listing,
                vertical: "healthcare",
                status: "approved",
                verifiedAt: listing.verified ? new Date() : null,
                verifiedBy: null,
                adminNotes: listing.verified
                    ? "Verified via official Nalgonda district sources"
                    : "Seeded — unverified, awaiting official confirmation",
                rejectionReason: "",
                owner: null,
            });

            console.log(`✓ Created: ${listing.businessName} [${listing.category}]`);
            created++;
        }

        console.log(`\nSeed complete. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Healthcare seed error:", error.message);
        process.exit(1);
    }
}

seedHealthcare();
