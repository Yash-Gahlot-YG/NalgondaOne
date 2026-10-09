const express = require("express");
const {
    createBusiness,
    getMyBusinesses,
    getMyBusinessById,
    updateMyBusiness,
} = require("../controllers/businessController");
const {
    getApprovedBusinesses,
    getApprovedBusinessById,
} = require("../controllers/publicBusinessController");
const { authenticate, authenticateOptional } = require("../middleware/auth");

console.log("Business routes loaded");
const router = express.Router();

// GET /api/businesses/approved — public listing (approved only)
router.get("/approved", getApprovedBusinesses);

// Protected Business Owner Routes (Must precede /:id parameter route)
// GET /api/businesses/my-businesses — list logged-in user's businesses
router.get("/my-businesses", authenticate, getMyBusinesses);

// GET /api/businesses/my-businesses/:id — get single owned business for owner editing
router.get("/my-businesses/:id", authenticate, getMyBusinessById);

// PUT /api/businesses/my-businesses/:id — update owned business
router.put("/my-businesses/:id", authenticate, updateMyBusiness);
router.patch("/my-businesses/:id", authenticate, updateMyBusiness);

// GET /api/businesses/:id — single approved business by MongoDB ID (public)
router.get("/:id", getApprovedBusinessById);

// POST /api/businesses — submit new business (associates owner if authenticated)
router.post("/", authenticateOptional, createBusiness);

module.exports = router;