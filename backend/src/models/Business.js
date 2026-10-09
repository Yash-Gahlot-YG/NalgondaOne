const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
    {
        businessName: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        services: {
            type: [String],
            default: [],
        },

        logo: {
            type: String,
            default: "",
        },

        coverPhoto: {
            type: String,
            default: "",
        },

        businessPhotos: {
            type: [String],
            default: [],
        },

        address: {
            type: String,
            required: true,
            trim: true,
        },

        locality: {
            type: String,
            required: true,
            trim: true,
        },

        city: {
            type: String,
            default: "Nalgonda",
            trim: true,
        },

        pincode: {
            type: String,
            trim: true,
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                default: [0, 0],
            },
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        whatsapp: {
            type: String,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        website: {
            type: String,
            trim: true,
        },

        openingTime: {
            type: String,
            default: "",
        },

        closingTime: {
            type: String,
            default: "",
        },

        is24Hours: {
            type: Boolean,
            default: false,
        },

        closedDays: {
            type: [String],
            default: [],
        },

        status: {
            type: String,
            enum: ["pending", "approved", "changes_requested", "rejected"],
            default: "pending",
        },

        verified: {
            type: Boolean,
            default: false,
        },

        verifiedAt: {
            type: Date,
            default: null,
        },

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        adminNotes: {
            type: String,
            default: "",
        },

        rejectionReason: {
            type: String,
            default: "",
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

businessSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Business", businessSchema);