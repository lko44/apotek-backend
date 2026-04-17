const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        // req.user was populated by authMiddleware
        if (!req.user || req.user.role !== requiredRole) {
            return res.status(403).json({ 
                message: "Akses ditolak: Role tidak sesuai" 
            });
        }
        next();
    };
};

module.exports = roleMiddleware; // Only one export here