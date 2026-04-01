const rateLimit = require("express-rate-limit");

// Global limiter (semua request)
exports.globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // max 100 request / IP
    message: {
        message: "Terlalu banyak request, coba lagi nanti."
    }
});

// Khusus auth (lebih ketat)
exports.authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 menit
    max: 10,
    message: {
        message: "Terlalu banyak percobaan login / OTP."
    }
});