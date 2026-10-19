const Business = require("../models/Business");

/* ================================================================ */
/* HEALTHCARE CATEGORIES                                             */
/* Must stay in sync with the frontend filter list.                  */
/* ================================================================ */

const HEALTHCARE_CATEGORIES = [
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Pediatrician",
    "Dentist",
    "Orthopedic",
    "Gynecologist",
    "ENT",
    "Ophthalmologist",
    "Hospital",
    "Clinic",
    "Diagnostic Center",
    "Pharmacy",
];

/**
 * GET /api/healthcare/listings
 *
 * Returns approved & verified healthcare businesses.
 * Supports query params:
 *   - category: filter by specialty (e.g. "Cardiologist")
 *   - search:   text search across businessName, category, description, address, locality
 *
 * Admin-only fields are stripped for public safety.
 */
const getHealthcareListings = async (req, res) => {
    try {
        const { category, search, facilityType, pincode, locality, verified } = req.query;

        const filter = {
            status: "approved",
            $or: [
                { vertical: "healthcare" },
                { category: { $in: HEALTHCARE_CATEGORIES } },
            ],
        };

        // Filter by verification if specifically requested
        if (verified === "true") {
            filter.verified = true;
        }

        // Narrow to a specific specialty if provided
        if (category && category !== "All") {
            const matchedCat = HEALTHCARE_CATEGORIES.find(
                (c) => c.toLowerCase() === category.trim().toLowerCase()
            );
            if (matchedCat) {
                filter.category = matchedCat;
            }
        }

        // Filter by facilityType if provided
        if (facilityType && facilityType !== "all") {
            filter.facilityType = facilityType;
        }

        // Filter by pincode if provided
        if (pincode && pincode !== "All") {
            filter.pincode = pincode.trim();
        }

        // Filter by locality if provided
        if (locality && locality !== "All") {
            filter.locality = new RegExp(`^${locality.trim()}$`, "i");
        }

        // Text search across multiple fields (with regex special chars safely escaped)
        if (search && search.trim()) {
            const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escaped, "i");
            filter.$and = [
                {
                    $or: [
                        { businessName: regex },
                        { doctorName: regex },
                        { qualifications: regex },
                        { category: regex },
                        { description: regex },
                        { address: regex },
                        { locality: regex },
                        { services: regex },
                    ],
                },
            ];
        }

        const listings = await Business.find(filter)
            .sort({ createdAt: -1 })
            .select("-adminNotes -rejectionReason -verifiedBy -__v");

        res.status(200).json({
            success: true,
            count: listings.length,
            data: listings,
        });
    } catch (error) {
        console.error("Get healthcare listings error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch healthcare listings.",
        });
    }
};

module.exports = { getHealthcareListings, HEALTHCARE_CATEGORIES };
