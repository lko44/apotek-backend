const prisma = require("../lib/prisma")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const generateCode = require("../utils/generateCodes")

exports.register = async (req, res) => {
    try {
        const { nama, email, password, role } = req.body;

        const hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                nama: nama,
                email: email,
                password_hash: hash,
                role: role
            }
        });

        res.status(201).json({ message: "User berhasil dibuat", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.sendCode = async (req, res) => {

    const { email } = req.body

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" })
    }

    const lastRequest = await prisma.verificationCode.findFirst({
        where: { email },
        orderBy: { created_at: "desc" }
    })

    if (lastRequest) {
        const diff = Date.now() - new Date(lastRequest.created_at)

        if (diff < 60000) {
            return res.status(429).json({
                message: "Tunggu 1 menit sebelum request kode lagi"
            })
        }
    }

    const code = generateCode()

    await prisma.verificationCode.create({
        data: {
            email,
            code,
            expires_at: new Date(Date.now() + 5 * 60 * 1000),
            user: {
                connect: { id_user: user.id_user }
            }
        }
    })

    res.json({
        message: "Kode verifikasi dibuat",
        code
    })
}

exports.verifyCode = async (req, res) => {

    const { email, code } = req.body

    const data = await prisma.verificationCode.findFirst({
        where: {
            email,
            code
        }
    })

    if (!data) {
        return res.status(400).json({ message: "Kode salah" })
    }

    if (new Date() > data.expires_at) {
        return res.status(400).json({ message: "Kode expired" })
    }

    await prisma.user.update({
        where: { email },
        data: { is_active: true }
    })

    res.json({ message: "Email verified" })
}

exports.login = async (req, res) => {

    const { email, password } = req.body

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" })
    }

    if (!user.is_active) {
        return res.status(403).json({
            message: "Email belum diverifikasi"
        })
    }

    const match = await bcrypt.compare(password, user.password_hash)

    if (!match) {
        return res.status(401).json({ message: "Password salah" })
    }

    const token = jwt.sign(
        { id: user.id_user, role: user.role },
        "SECRET_KEY",
        { expiresIn: "1d" }
    )

    res.json({ token })
}