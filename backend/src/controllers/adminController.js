const mongoose = require("mongoose");
const Business = require("../models/Business");

/**
 * GET /api/admin/businesses/pending
 * Returns all businesses with status "pending"
 */
const getPendingBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find({ status: "pending" })
            .sort({ createdAt: -1 })
            .select("-__v");

        res.status(200).json({
            success: true,
            count: businesses.length,
            data: businesses,
        });
    } catch (error) {
        console.error("Get pending businesses error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pending businesses.",
        });
    }
};

/**
 * GET /api/admin/businesses/stats
 * Returns count of businesses by status
 */
const getBusinessStats = async (req, res) => {
    try {
        const [pending, approved, changesRequested, rejected, total] =
            await Promise.all([
                Business.countDocuments({ status: "pending" }),
                Business.countDocuments({ status: "approved" }),
                Business.countDocuments({ status: "changes_requested" }),
                Business.countDocuments({ status: "rejected" }),
                Business.countDocuments(),
            ]);

        res.status(200).json({
            success: true,
            data: { pending, approved, changesRequested, rejected, total },
        });
    } catch (error) {
        console.error("Get business stats error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch business stats.",
        });
    }
};

/**
 * GET /api/admin/businesses/all
 * Returns all businesses for admin overview
 */
const getAllBusinesses = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && ["pending", "approved", "changes_requested", "rejected"].includes(status)) {
            filter.status = status;
        }

        const businesses = await Business.find(filter)
            .sort({ createdAt: -1 })
            .select("-__v");

        res.status(200).json({
            success: true,
            count: businesses.length,
            data: businesses,
        });
    } catch (error) {
        console.error("Get all businesses error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch businesses.",
        });
    }
};

/**
 * GET /api/admin/businesses/:id
 * Returns full business details for admin review
 */
const getBusinessById = async (req, res) => {
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

        res.status(200).json({
            success: true,
            data: business,
        });
    } catch (error) {
        console.error("Get business by ID error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch business details.",
        });
    }
};

/**
 * PATCH /api/admin/businesses/:id/approve
 * Approves a business — sets status=approved, verified=true
 */
const approveBusiness = async (req, res) => {
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

        business.status = "approved";
        business.verified = true;
        business.verifiedAt = new Date();
        business.verifiedBy = req.user._id;
        business.adminNotes = req.body.adminNotes || "";
        business.rejectionReason = "";

        await business.save();

        res.status(200).json({
            success: true,
            message: "Business approved successfully.",
            data: business,
        });
    } catch (error) {
        console.error("Approve business error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to approve business.",
        });
    }
};

/**
 * PATCH /api/admin/businesses/:id/request-changes
 * Requests changes — sets status=changes_requested
 */
const requestChanges = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid business ID.",
            });
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: "A reason is required when requesting changes.",
            });
        }

        const business = await Business.findById(id);

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found.",
            });
        }

        business.status = "changes_requested";
        business.verified = false;
        business.verifiedAt = null;
        business.verifiedBy = null;
        business.adminNotes = reason.trim();

        await business.save();

        res.status(200).json({
            success: true,
            message: "Changes requested successfully.",
            data: business,
        });
    } catch (error) {
        console.error("Request changes error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to request changes.",
        });
    }
};

/**
 * PATCH /api/admin/businesses/:id/reject
 * Rejects a business — sets status=rejected
 */
const rejectBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid business ID.",
            });
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: "A reason is required when rejecting a business.",
            });
        }

        const business = await Business.findById(id);

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found.",
            });
        }

        business.status = "rejected";
        business.verified = false;
        business.verifiedAt = null;
        business.verifiedBy = null;
        business.rejectionReason = reason.trim();

        await business.save();

        res.status(200).json({
            success: true,
            message: "Business rejected.",
            data: business,
        });
    } catch (error) {
        console.error("Reject business error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to reject business.",
        });
    }
};

/**
 * DELETE /api/admin/businesses/:id
 * Permanently deletes a business (approved, pending, changes_requested, rejected)
 */
const deleteBusiness = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid business ID.",
            });
        }

        const business = await Business.findByIdAndDelete(id);

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Business deleted successfully.",
            data: { id: business._id, businessName: business.businessName },
        });
    } catch (error) {
        console.error("Delete business error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to delete business.",
        });
    }
};

module.exports = {
    getPendingBusinesses,
    getBusinessStats,
    getAllBusinesses,
    getBusinessById,
    approveBusiness,
    requestChanges,
    rejectBusiness,
    deleteBusiness,
};
