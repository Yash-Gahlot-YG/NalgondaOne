/**
 * Seed script for initial admin accounts.
 *
 * Uses environment variables for credentials — NEVER hardcoded.
 *
 * Required env vars:
 *   SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD
 *   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
 *   MONGODB_URI
 *
 * Usage:
 *   node src/scripts/seedAdmin.js
 */

require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

async function seedAdmins() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected for seeding.");

        const admins = [
            {
                name: process.env.SUPER_ADMIN_NAME || "Super Admin",
                email: process.env.SUPER_ADMIN_EMAIL,
                passwordHash: process.env.SUPER_ADMIN_PASSWORD,
                role: "super_admin",
            },
            {
                name: process.env.ADMIN_NAME || "Admin",
                email: process.env.ADMIN_EMAIL,
                passwordHash: process.env.ADMIN_PASSWORD,
                role: "admin",
            },
        ];

        for (const admin of admins) {
            if (!admin.email || !admin.passwordHash) {
                console.warn(
                    `Skipping ${admin.role}: missing ADMIN_EMAIL or ADMIN_PASSWORD env vars.`
                );
                continue;
            }

            const existing = await User.findOne({ email: admin.email });
            if (existing) {
                // Update existing user — keep _id, sync name/password/role from .env
                existing.name = admin.name;
                existing.passwordHash = admin.passwordHash; // pre-save hook will bcrypt-hash
                existing.role = admin.role;
                await existing.save();
                console.log(
                    `✓ Updated ${admin.role}: ${admin.email}`
                );
            } else {
                const user = new User(admin);
                await user.save();
                console.log(
                    `✓ Created ${admin.role}: ${admin.email}`
                );
            }
        }

        console.log("\nSeed complete.");
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error.message);
        process.exit(1);
    }
}

seedAdmins();
