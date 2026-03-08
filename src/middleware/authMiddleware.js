const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Format token salah atau token tidak ditemukan"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "SECRET_KEY");

        if (!decoded.id_user && !decoded.id) {
            return res.status(403).json({
                message: "Token valid tapi tidak berisi identitas user (Payload Invalid)"
            });
        }

        req.user = decoded;
        
        next();
    } catch (err) {
        const message = err.name === "TokenExpiredError" ? "Token sudah kadaluwarsa" : "Token tidak valid";
        return res.status(403).json({ message });
    }
}

module.exports = authMiddleware;