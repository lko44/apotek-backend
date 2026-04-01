const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma"); // optional (buat cek user)

async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        // 🔥 cek header
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Token tidak ditemukan / format salah"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Token kosong"
            });
        }

        // 🔥 verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.id) {
            return res.status(401).json({
                message: "Payload token tidak valid"
            });
        }

        // 🔥 OPTIONAL (RECOMMENDED): cek user masih ada di DB
        const user = await prisma.user.findUnique({
            where: { id_user: decoded.id }
        });

        if (!user) {
            return res.status(401).json({
                message: "User tidak ditemukan"
            });
        }

        // 🔥 attach ke request (clean)
        req.user = {
            id: user.id_user,
            role: user.role
        };

        next();

    } catch (err) {
        console.error("AUTH ERROR:", err);

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token expired"
            });
        }

        return res.status(401).json({
            message: "Token tidak valid"
        });
    }
}

module.exports = authMiddleware;