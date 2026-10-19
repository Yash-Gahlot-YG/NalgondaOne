require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const businessRoutes = require("./routes/businessRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const healthcareRoutes = require("./routes/healthcareRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Security Headers
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// Dynamic CORS configuration
const defaultOrigins = [
    "http://localhost:8081",
    "http://localhost:19006",
    "http://localhost:19000",
    "http://localhost:5173",
    "http://localhost:3000",
];

const envOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
    : [];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (such as mobile apps, curl, server-to-server)
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Middleware — JSON Body Limit (does not affect multipart/form-data uploads)
app.use(express.json({ limit: "1mb" }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 auth attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many authentication attempts. Please try again later.",
        });
    },
});

const businessSubmissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // 15 business submissions per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many business submissions. Please try again later.",
        });
    },
});

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 upload requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many image upload requests. Please try again later.",
        });
    },
});

// Health Check API
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Nalgonda One API is running",
    });
});

// Routes with targeted rate limiting
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth", authRoutes);

app.use("/api/businesses", (req, res, next) => {
    if (req.method === "POST") {
        return businessSubmissionLimiter(req, res, next);
    }
    next();
});
app.use("/api/businesses", businessRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/healthcare", healthcareRoutes);

app.use("/api/uploads", uploadLimiter);
app.use("/api/uploads", uploadRoutes);

// Global Express Error Handler
app.use((err, req, res, next) => {
    console.error("Server error handler caught:", err);

    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "Cross-Origin Request Blocked by CORS policy.",
        });
    }

    const statusCode = err.status || err.statusCode || 500;
    const isProd = process.env.NODE_ENV === "production";

    res.status(statusCode).json({
        success: false,
        message: isProd
            ? "An unexpected error occurred."
            : err.message || "An unexpected error occurred.",
    });
});

// Start Server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Nalgonda One API running on http://localhost:${PORT}`);
    });
};

startServer();