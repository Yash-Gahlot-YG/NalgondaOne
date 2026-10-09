const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

/**
 * Uploads a buffer to Cloudinary using upload_stream.
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Target Cloudinary folder
 * @returns {Promise<string>} - Secure URL of uploaded image
 */
const uploadBufferToCloudinary = (buffer, folder = "nalgondaone/businesses") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Upload multiple business images to Cloudinary.
 * POST /api/uploads/business-images
 */
const uploadBusinessImages = async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message:
          "Cloud image storage is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the backend environment.",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided for upload.",
      });
    }

    // Upload all files in parallel to Cloudinary folder "nalgondaone/businesses"
    const uploadPromises = req.files.map((file) =>
      uploadBufferToCloudinary(file.buffer, "nalgondaone/businesses")
    );

    const urls = await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      data: {
        urls,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload image(s) to cloud storage.",
    });
  }
};

module.exports = {
  uploadBusinessImages,
};
