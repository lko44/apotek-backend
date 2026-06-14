const prisma = require("../lib/prisma")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;//destrukturisasi username dan password dari body request

        if (!username || !password) {
            return res.status(400).json({
                message: "Username dan password wajib diisi!"
            });
        }

        const user = await prisma.user.findUnique({
            where: { username }
        });//query ke database untuk mencari user berdasarkan username yang diberikan

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
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id_user: userId },
            select: {
                id_user: true,
                nama: true,
                email: true,
                role: true
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        res.json({
            user: {
                id: user.id_user,
                name: user.nama,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("GET PROFILE ERROR:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id_user: true,
                nama: true,
                email: true,
                // AMBIL FIELD BARU DARI PRISMA
                username: true,
                role: true,
                is_active: true
            }
        });

        res.json({
            users: users.map(user => ({
                id: user.id_user,
                name: user.nama,
                email: user.email,
                // MAP SEBANYAK YANG DIA MINTA
                username: user.username,
                role: user.role,
                isActive: user.is_active // Di-map dari is_active ke isActive (camelCase)
            }))
        });

    } catch (error) {
        console.error("GET ALL USERS ERROR:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};