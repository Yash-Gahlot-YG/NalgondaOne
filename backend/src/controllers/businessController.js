const mongoose = require("mongoose");
const Business = require("../models/Business");
const User = require("../models/User");
const { HEALTHCARE_CATEGORIES } = require("./healthcareController");

/**
 * Returns true if the string is a remote HTTPS/HTTP URL.
 * Rejects local-only URIs (blob:, file://, content://, data:, ph://).
 */
function isRemoteUrl(str) {
    if (!str || typeof str !== "string") return false;
    const trimmed = str.trim();
    if (trimmed.startsWith("blob:")) return false;
    return trimmed.startsWith("https://") || trimmed.startsWith("http://");
}

/**
 * POST /api/businesses
 * Create a new business (associated with authenticated owner if present)
 */
const createBusiness = async (req, res) => {
    try {
        const data = { ...req.body };

        // Determine vertical if not explicitly specified
        if (!data.vertical) {
            const isHealthcare = HEALTHCARE_CATEGORIES.some(
                (c) => c.toLowerCase() === (data.category || "").trim().toLowerCase()
            );
            data.vertical = isHealthcare ? "healthcare" : "services";
        }

        // Sanitize image fields — only store remote (cloud-hosted) URLs.
        // Local preview URIs (blob:, file://, etc.) are stripped so
        // MongoDB never stores broken, device-scoped paths.
        data.logo = isRemoteUrl(data.logo) ? data.logo.trim() : "";
        data.coverPhoto = isRemoteUrl(data.coverPhoto) ? data.coverPhoto.trim() : "";
        data.businessPhotos = Array.isArray(data.businessPhotos)
            ? data.businessPhotos.filter(isRemoteUrl).map((u) => u.trim())
            : [];

        // Associate owner if authenticated
        if (req.user && req.user._id) {
            data.owner = req.user._id;

            // Upgrade user role to business_owner if they are currently "user"
            if (req.user.role === "user") {
                await User.findByIdAndUpdate(req.user._id, { role: "business_owner" });
            }
        }

        const business = await Business.create({
            ...data,
            status: "pending",
            verified: false,
            verifiedAt: null,
            verifiedBy: null,
            adminNotes: "",
            rejectionReason: "",
        });

        res.status(201).json({
            success: true,
            message: "Business submitted for verification",
            data: business,
        });
    } catch (error) {
        console.error("Create business error:", error.message);

        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * GET /api/businesses/my-businesses
 * Returns all businesses owned by the currently authenticated user
 */
const getMyBusinesses = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const businesses = await Business.find({ owner: req.user._id })
            .sort({ createdAt: -1 })
            .select("-__v");

        res.status(200).json({
            success: true,
            count: businesses.length,
            data: businesses,
        });
    } catch (error) {
        console.error("Get my businesses error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch your businesses.",
        });
    }
};

/**
 * GET /api/businesses/my-businesses/:id
 * Returns details of a specific business owned by the currently authenticated user
 */
const getMyBusinessById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid business ID.",
            });
        }

        const business = await Business.findById(id).select("-__v");

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found.",
            });
        }

        // Check ownership
        if (!business.owner || business.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to view this business.",
            });
        }

        res.status(200).json({
            success: true,
            data: business,
        });
    } catch (error) {
        console.error("Get my business by ID error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch business details.",
        });
    }
};

/**
 * PUT /api/businesses/my-businesses/:id
 * Updates a business owned by the authenticated user.
 * Disallows modifying admin-controlled fields (owner, verified, status, adminNotes, etc.).
 * Automatically resets status to 'pending' and verified to false for safe re-verification.
 */
const updateMyBusiness = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid business ID.",
            });
        }

        const business = await Business.findById(id);

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found.",
            });
        }

        // Enforce ownership check using authenticated JWT user ID
        if (!business.owner || business.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to edit this business.",
            });
        }

        const allowedFields = [
            "businessName",
            "category",
            "description",
            "services",
            "logo",
            "coverPhoto",
            "businessPhotos",
            "address",
            "locality",
            "city",
            "pincode",
            "location",
            "phone",
            "whatsapp",
            "email",
            "website",
            "openingTime",
            "closingTime",
            "is24Hours",
            "closedDays",
        ];

        // Apply only permitted editable fields
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                if (field === "logo") {
                    business.logo = isRemoteUrl(req.body.logo) ? req.body.logo.trim() : "";
                } else if (field === "coverPhoto") {
                    business.coverPhoto = isRemoteUrl(req.body.coverPhoto) ? req.body.coverPhoto.trim() : "";
                } else if (field === "businessPhotos") {
                    business.businessPhotos = Array.isArray(req.body.businessPhotos)
                        ? req.body.businessPhotos.filter(isRemoteUrl).map((u) => u.trim())
                        : [];
                } else {
                    business[field] = req.body[field];
                }
            }
        }

        // Safe re-verification workflow:
        // When business information is modified, reset verification status to 'pending'
        // so modified information is not falsely displayed as verified.
        business.status = "pending";
        business.verified = false;
        business.verifiedAt = null;
        business.verifiedBy = null;

        await business.save();

        res.status(200).json({
            success: true,
            message: "Business updated successfully and submitted for re-verification.",
            data: business,
        });
    } catch (error) {
        console.error("Update my business error:", error.message);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update business.",
        });
    }
};

module.exports = {
    createBusiness,
    getMyBusinesses,
    getMyBusinessById,
    updateMyBusiness,
};