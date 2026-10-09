const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        passwordHash: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["super_admin", "admin", "business_owner", "user"],
            default: "user",
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving (only if modified)
userSchema.pre("save", async function () {
    if (!this.isModified("passwordHash")) return;
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Compare plain password against hash
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Never return passwordHash in JSON
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    return obj;
};

module.exports = mongoose.model("User", userSchema);
