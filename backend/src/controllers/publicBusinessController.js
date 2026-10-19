const mongoose = require("mongoose");
const Business = require("../models/Business");
const { HEALTHCARE_CATEGORIES } = require("./healthcareController");

/**
 * GET /api/businesses/approved
 * Returns only approved & verified businesses for public listing.
 * Supports optional ?category= and ?vertical= (e.g. "services", "healthcare")
 */
const getApprovedBusinesses = async (req, res) => {
    try {
        const { category, vertical } = req.query;
        const filter = { status: "approved", verified: true };

        if (category) {
            filter.category = category;
        }

        if (vertical === "services") {
            // Backward-compatible: matches explicit 'services' vertical or legacy docs without
            // healthcare categories
            filter.$and = [
                { vertical: { $ne: "healthcare" } },
                { category: { $nin: HEALTHCARE_CATEGORIES } },
            ];
        } else if (vertical === "healthcare") {
            // Matches explicit 'healthcare' vertical or documents with healthcare categories
            filter.$or = [
                { vertical: "healthcare" },
                { category: { $in: HEALTHCARE_CATEGORIES } },
            ];
        } else if (vertical) {
            filter.vertical = vertical;
        }

        const businesses = await Business.find(filter)
            .sort({ createdAt: -1 })
            .select("-adminNotes -rejectionReason -verifiedBy -__v");

        res.status(200).json({
            success: true,
            count: businesses.length,
            data: businesses,
        });
    } catch (error) {
        console.error("Get approved businesses error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch businesses.",
        });
    }
};

/**
 * GET /api/businesses/:id
 * Returns a single business by ID — ONLY if approved.
 * Pending/rejected/non-existent businesses return 404.
 * Admin-only fields are stripped for public safety.
 */
const getApprovedBusinessById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                success: false,
                message: "Business not found.",
            });
        }

        const business = await Business.findOne({
            _id: id,
            status: "approved",
        }).select("-adminNotes -rejectionReason -verifiedBy -__v");

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found.",
            });
        }

        res.status(200).json({
            success: true,
            data: business,
        });
    } catch (error) {
        console.error("Get approved business by ID error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch business details.",
        });
    }
};

module.exports = { getApprovedBusinesses, getApprovedBusinessById };

