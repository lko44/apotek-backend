const prisma = require("../lib/prisma")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const generateCode = require("../utils/generateCodes")
const { sendOTPEmail } = require("../utils/mailer")

exports.register = async (req, res) => {
    try {
        const { nama, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email dan password wajib diisi!" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email sudah terdaftar!" });
        }

        const hash = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data: { 
                nama, 
                email, 
                password_hash: hash, 
                role: "KASIR" 
            }
        });

        const { password_hash, ...userTanpaPassword } = user;

        res.status(201).json({
            message: "User berhasil dibuat sebagai KASIR",
            user: userTanpaPassword
        });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ error: "Gagal registrasi, coba lagi nanti." });
    }
};

exports.sendCode = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email wajib diisi!" });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const lastRequest = await prisma.verificationCode.findFirst({
            where: { email },
            orderBy: { created_at: "desc" }
        });

        if (lastRequest) {
            const diff = Date.now() - new Date(lastRequest.created_at);
            if (diff < 60000) {
                return res.status(429).json({
                    message: "Tunggu 1 menit sebelum request kode lagi"
                });
            }
        }

        const code = generateCode();

        await prisma.verificationCode.create({
            data: {
                email,
                code,
                expires_at: new Date(Date.now() + 5 * 60 * 1000),
                user: { connect: { id_user: user.id_user } }
            }
        });

        const isSent = await sendOTPEmail(email, code);

        if (!isSent) {
            return res.status(500).json({ message: "Gagal mengirim OTP" });
        }

        res.json({ message: "Kode verifikasi dikirim" });

    } catch (error) {
        console.error("SEND CODE ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ message: "Email dan kode wajib diisi!" });
        }

        const data = await prisma.verificationCode.findFirst({
            where: { email, code }
        });

        if (!data) {
            return res.status(400).json({ message: "Kode salah" });
        }

        if (new Date() > data.expires_at) {
            return res.status(400).json({ message: "Kode expired" });
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { email },
                data: { is_active: true }
            }),
            prisma.verificationCode.deleteMany({
                where: { email }
            })
        ]);

        res.json({ message: "Email verified" });

    } catch (error) {
        console.error("VERIFY ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email dan password wajib diisi!" });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // 🔥 Jangan kasih tau user ada atau tidak (anti enum attack)
        if (!user) {
            return res.status(401).json({ message: "Email atau password salah" });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: "Email belum diverifikasi" });
        }

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ message: "Email atau password salah" });
        }

        const token = jwt.sign(
            { id: user.id_user, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email wajib diisi!" });
        }

        // 1. Cek apakah user ada
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User dengan email ini tidak ditemukan" });
        }

        // 2. Rate Limiting (Cek jika user baru saja minta kode < 1 menit yang lalu)
        const lastRequest = await prisma.verificationCode.findFirst({
            where: { email },
            orderBy: { created_at: "desc" }
        });

        if (lastRequest) {
            const diff = Date.now() - new Date(lastRequest.created_at);
            if (diff < 60000) {
                return res.status(429).json({ message: "Tunggu 1 menit sebelum request kode lagi" });
            }
        }

        // 3. Generate Kode & Simpan
        const code = generateCode();
        await prisma.verificationCode.create({
            data: {
                email,
                code,
                expires_at: new Date(Date.now() + 10 * 60 * 1000), // Berlaku 10 menit
                user: { connect: { id_user: user.id_user } }
            }
        });

        // 4. Kirim Email
        await sendOTPEmail(email, code);

        res.json({ message: "Kode reset password telah dikirim ke email Anda" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal memproses permintaan reset password" });
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ message: "Email, kode, dan password baru wajib diisi!" });
        }

        // 1. Validasi Kode OTP
        const data = await prisma.verificationCode.findFirst({
            where: { email, code }
        });

        if (!data) {
            return res.status(400).json({ message: "Kode OTP salah" });
        }

        // 2. Cek Expired
        if (new Date() > data.expires_at) {
            return res.status(400).json({ message: "Kode OTP sudah kadaluarsa" });
        }

        // 3. Hash Password Baru
        const hash = await bcrypt.hash(newPassword, 10);

        // 4. Update Password User & Hapus kode OTP agar tidak bisa dipakai lagi
        await prisma.$transaction([
            prisma.user.update({
                where: { email },
                data: { password_hash: hash }
            }),
            prisma.verificationCode.deleteMany({
                where: { email } // Hapus semua kode lama untuk email ini
            })
        ]);

        res.json({ message: "Password berhasil diperbarui. Silakan login kembali." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal mereset password" });
    }
};