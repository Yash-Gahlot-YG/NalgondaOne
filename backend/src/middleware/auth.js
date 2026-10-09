const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Authenticate — verify JWT from Authorization header.
 * Attaches `req.user` with { id, name, email, role }.
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in.",
            });
        }

        const token = authHeader.split(" ")[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            const message =
                jwtError.name === "TokenExpiredError"
                    ? "Session expired. Please log in again."
                    : "Invalid authentication token.";
            return res.status(401).json({ success: false, message });
        }

        const user = await User.findById(decoded.id).select("-passwordHash");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account not found.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is deactivated. Contact support.",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Authentication error.",
        });
    }
};

/**
 * Authorize — restrict to specific roles.
 * Must be used AFTER authenticate middleware.
 *
 * Usage: authorize("admin", "super_admin")
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource.",
            });
        }

        next();
    };
};

/**
 * Optional Authenticate — attaches `req.user` if valid JWT is present,
 * but does not reject requests if token is missing.
 */
const authenticateOptional = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }

        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("-passwordHash");
            if (user && user.isActive) {
                req.user = user;
            }
        } catch {
            // Ignore invalid/expired token in optional mode
        }
        next();
    } catch {
        next();
    }
};

module.exports = { authenticate, authorize, authenticateOptional };
