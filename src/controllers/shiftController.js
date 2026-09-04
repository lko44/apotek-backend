const prisma = require("../lib/prisma")
const { logAksi } = require("../lib/auditLog");

exports.getActiveShift = async (req, res) => {
    try {
        const shift = await prisma.shift.findFirst({
            where: { id_user: req.user.id, status: "OPEN" }
        });

        res.json({
            active: !!shift,
            data: shift || null
        });

    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil status shift.", error: error.message });
    }
};

exports.bukaShift = async (req, res) => {
    try {
        const { modal_awal } = req.body;

        if (modal_awal === undefined || isNaN(modal_awal) || modal_awal < 0) {
            return res.status(400).json({ message: "modal_awal wajib diisi dan harus berupa angka positif." });
        }

        const existing = await prisma.shift.findFirst({
            where: { id_user: req.user.id, status: "OPEN" }
        });

        if (existing) {
            return res.status(400).json({ message: "Anda masih memiliki shift yang sedang berjalan." });
        }

        const shift = await prisma.shift.create({
            data: {
                id_user: req.user.id,
                modal_awal,
                status: "OPEN"
            }
        });

        await logAksi(
            req.user.id,
            "OPEN_SHIFT",
            `Membuka shift dengan modal awal Rp${modal_awal}`
        );

        res.status(201).json({ message: "Shift berhasil dibuka.", data: shift });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.tutupShift = async (req, res) => {
    try {
        const { modal_akhir } = req.body;

        if (modal_akhir === undefined || isNaN(modal_akhir) || modal_akhir < 0) {
            return res.status(400).json({ message: "modal_akhir wajib diisi dan harus berupa angka positif." });
        }

        const shift = await prisma.shift.findFirst({
            where: { id_user: req.user.id, status: "OPEN" }
        });

        if (!shift) {
            return res.status(404).json({ message: "Tidak ada shift aktif yang bisa ditutup." });
        }

        const updated = await prisma.shift.update({
            where: { id_shift: shift.id_shift },
            data: {
                modal_akhir,
                status: "CLOSED",
                waktu_tutup: new Date()
            }
        });

        await logAksi(
            req.user.id,
            "CLOSE_SHIFT",
            `Menutup shift dengan modal akhir Rp${modal_akhir}`
        );

        res.json({ message: "Shift berhasil ditutup.", data: updated });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};