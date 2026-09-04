const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Silakan login terlebih dahulu." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id_user: decoded.id }
        });

        if (!user) return res.status(401).json({ message: "User tidak ditemukan" });


        req.user = { id: user.id_user, role: user.role };
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Sesi Anda telah berakhir, silakan login kembali." });
        }
        return res.status(401).json({ message: "Token tidak valid" });
    }
};

module.exports = authMiddleware; 