const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const {
    getPendingBusinesses,
    getBusinessStats,
    getAllBusinesses,
    getBusinessById,
    approveBusiness,
    requestChanges,
    rejectBusiness,
    deleteBusiness,
} = require("../controllers/adminController");

const router = express.Router();

// All admin routes require authentication + admin/super_admin role
router.use(authenticate);
router.use(authorize("admin", "super_admin"));

// GET /api/admin/businesses/stats
router.get("/businesses/stats", getBusinessStats);

// GET /api/admin/businesses/pending
router.get("/businesses/pending", getPendingBusinesses);

// GET /api/admin/businesses/all
router.get("/businesses/all", getAllBusinesses);

// GET /api/admin/businesses/:id
router.get("/businesses/:id", getBusinessById);

// PATCH /api/admin/businesses/:id/approve
router.patch("/businesses/:id/approve", approveBusiness);

// PATCH /api/admin/businesses/:id/request-changes
router.patch("/businesses/:id/request-changes", requestChanges);

// PATCH /api/admin/businesses/:id/reject
router.patch("/businesses/:id/reject", rejectBusiness);

// DELETE /api/admin/businesses/:id
router.delete("/businesses/:id", deleteBusiness);

module.exports = router;
