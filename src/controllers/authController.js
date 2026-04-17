const prisma = require("../lib/prisma")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// ======================
// LOGIN (USERNAME)
// ======================
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username dan password wajib diisi!"
            });
        }

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({
                message: "Username atau password salah"
            });
        }

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({
                message: "Username atau password salah"
            });
        }

        const token = jwt.sign(
            { id: user.id_user, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// ======================
// RESET PASSWORD BY OWNER
// ======================
exports.resetPasswordByOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                message: "Password baru wajib diisi!"
            });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        const user = await prisma.user.update({
            where: { id_user: parseInt(id) },
            data: { password_hash: hash }
        });

        res.json({
            message: "Password berhasil direset oleh OWNER"
        });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);

        // kalau user gak ketemu
        if (error.code === "P2025") {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        res.status(500).json({
            message: "Internal server error"
        });
    }
};