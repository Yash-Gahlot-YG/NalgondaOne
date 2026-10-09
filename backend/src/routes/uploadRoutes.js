const express = require("express");
const { uploadBusinessImages } = require("../controllers/uploadController");
const { handleBusinessImagesUpload } = require("../middleware/uploadMiddleware");

const router = express.Router();

// POST /api/uploads/business-images
router.post("/business-images", handleBusinessImagesUpload, uploadBusinessImages);

module.exports = router;
