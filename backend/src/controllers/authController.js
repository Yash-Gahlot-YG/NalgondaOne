const jwt = require("jsonwebtoken");
const User = require("../models/User");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/register
 * Public registration for standard users (role is strictly forced to "user").
 */
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // 1. Basic validation
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Full name is required.",
            });
        }

        if (!email || typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        if (!EMAIL_REGEX.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        if (!password || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Password is required.",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long.",
            });
        }

        // 2. Prevent duplicate email registration
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists.",
            });
        }

        // 3. Create user (Strictly force role to "user" — ignore any role passed in body)
        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone && typeof phone === "string" ? phone.trim() : "",
            passwordHash: password, // Mongoose pre-save hook securely hashes this
            role: "user",
            isActive: true,
        });

        await user.save();

        // 4. Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone || "",
                    role: user.role,
                    createdAt: user.createdAt,
                },
            },
        });
    } catch (error) {
        console.error("Register error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error during registration.",
        });
    }
};

/**
 * POST /api/auth/login
 * Standard login for all user types (user, admin, super_admin, business_owner).
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user by normalized email
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            // Generic message — do not reveal whether email exists
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is deactivated. Contact support.",
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone || "",
                    role: user.role,
                    createdAt: user.createdAt,
                },
            },
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error during login.",
        });
    }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 * Protected by JWT authentication middleware.
 */
const getMe = async (req, res) => {
    try {
        // req.user is set by authenticate middleware (User document with passwordHash excluded)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated.",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    phone: req.user.phone || "",
                    role: req.user.role,
                    createdAt: req.user.createdAt,
                },
            },
        });
    } catch (error) {
        console.error("GetMe error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error fetching user profile.",
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
};
