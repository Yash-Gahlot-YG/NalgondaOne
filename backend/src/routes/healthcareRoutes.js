const express = require("express");
const {
    getHealthcareListings,
} = require("../controllers/healthcareController");

console.log("Healthcare routes loaded");
const router = express.Router();

// GET /api/healthcare & /api/healthcare/listings — public healthcare directory
router.get("/listings", getHealthcareListings);
router.get("/", getHealthcareListings);

module.exports = router;
