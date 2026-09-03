const prisma = require("../lib/prisma")

exports.requireActiveShift = async (req, res, next) => {
    try {
        const shift = await prisma.shift.findFirst({
            where: {
                id_user: req.user.id,
                status: "OPEN"
            }
        });

        if (!shift) {
            return res.status(403).json({
                message: "Anda belum membuka shift. Silakan buka shift terlebih dahulu sebelum melakukan transaksi."
            });
        }

        req.shift = shift;
        next();

    } catch (error) {
        res.status(500).json({
            message: "Gagal memvalidasi status shift.",
            error: error.message
        });
    }
};