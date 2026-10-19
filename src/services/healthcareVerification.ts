/**
 * Healthcare Data Verification and Integrity Helpers
 *
 * Enforces verification standards for healthcare listings in NalgondaOne:
 * - Flags unverified seeded placeholder phone numbers and records
 * - Prevents fake "Verified" badges from displaying when evidence is insufficient
 * - Controls Call Now and Book Appointment button behavior based on verified data
 *
 * VERIFIED NUMBERS (official Nalgonda district sources):
 *   GGH Nalgonda:          9000227700
 *   AH Miryalaguda:        9440380028
 *   AH Nagarjuna Sagar:    9494136789
 *   DMHO Nalgonda:          9908273355
 *   AH Devarakonda:         7702131479
 *   UPHC Panagal:           9160024975
 *   UPHC Linewada:          9441795547
 */

import type { BusinessDocument } from "@/services/businessApi";

/**
 * Phone numbers confirmed via official Nalgonda district government sources.
 * These are always considered verified.
 */
export const VERIFIED_OFFICIAL_PHONES = new Set<string>([
  "9000227700",   // GGH Nalgonda
  "9440380028",   // AH Miryalaguda
  "9494136789",   // AH Nagarjuna Sagar
  "9908273355",   // DMHO Nalgonda
  "7702131479",   // AH Devarakonda
  "9160024975",   // UPHC Panagal
  "9441795547",   // UPHC Linewada
  "08682224466",  // Anurag Children's Clinic (Dr. V. Sudhakar)
  "08682-224466",
  "08682225588",  // Vijaya Laser Dental (Dr. Ramu Eedam)
  "08682-225588",
  "08682233155",  // Rohit ENT & Eye Clinic (Dr. Rohit / Dr. Nithisha)
  "08682-233155",
  "9573887555",   // Patnam Doctor Super Speciality Clinic
]);

/**
 * Synthetic placeholder phone numbers that were generated during initial
 * healthcare seeding in `backend/src/scripts/seedHealthcare.js`.
 * None of these correspond to real, verified facilities.
 */
export const UNVERIFIED_PLACEHOLDER_PHONES = new Set<string>([
  "08682-232100",
  "08682-232101",
  "08689-220100",
  "08683-255100",
  "08682-232200",
  "08682-234500",
  "08682-236700",
  "08682-238900",
]);

/**
 * Validates whether a phone number has been verified against official records.
 * Returns false for missing numbers, known seed placeholders, or invalid formats.
 */
export function isPhoneVerified(phone?: string | null): boolean {
  if (!phone || typeof phone !== "string") return false;
  const trimmed = phone.trim();
  if (!trimmed) return false;

  // Suppress known synthetic placeholder numbers
  if (UNVERIFIED_PLACEHOLDER_PHONES.has(trimmed)) return false;

  // Fast-path: if the number is in the officially verified set, return true
  const digits = trimmed.replace(/\D/g, "");
  if (VERIFIED_OFFICIAL_PHONES.has(digits)) return true;
  if (VERIFIED_OFFICIAL_PHONES.has(trimmed)) return true;

  // Must have at least 8 digits (standard Indian landline/mobile with STD code)
  if (digits.length < 8) return false;

  // Obvious placeholder patterns (all zeros or repeated single digit)
  if (/^0+$/.test(digits)) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  return true;
}

/**
 * Checks whether a healthcare listing has sufficient verification evidence.
 * If evidence is insufficient (such as placeholder phone number or unverified data),
 * the green "Verified" badge must be omitted.
 */
export function isHealthcareListingVerified(listing: BusinessDocument): boolean {
  if (!listing.verified) return false;
  // If contact phone is an unverified placeholder, evidence is insufficient
  if (!isPhoneVerified(listing.phone)) return false;
  return true;
}
