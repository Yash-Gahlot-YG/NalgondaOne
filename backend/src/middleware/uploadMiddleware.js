const multer = require("multer");

// Use memory storage so we can stream directly to Cloudinary without saving to disk
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only JPG, JPEG, PNG, and WEBP images are allowed.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 10, // Max 10 files per request
  },
});

/**
 * Middleware wrapper to catch multer errors and return clean JSON responses.
 */
const handleBusinessImagesUpload = (req, res, next) => {
  const uploadMiddleware = upload.array("images", 10);

  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File is too large. Maximum allowed size is 10MB per image.",
        });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          success: false,
          message:
            "Too many files or unexpected field name. Expected 'images' with max 10 files.",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Invalid file upload.",
      });
    }
    next();
  });
};

module.exports = {
  handleBusinessImagesUpload,
};
