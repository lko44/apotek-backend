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

exports.getAllShift = async (req, res) => {
    try {
        const { start_date, end_date, id_user, status, page = 1, limit = 20 } = req.query;

        const pageNum = Math.max(parseInt(page) || 1, 1);
        const limitNum = Math.max(parseInt(limit) || 20, 1);

        const where = {};

        if (start_date || end_date) {
            where.waktu_buka = {};

            if (start_date) {
                where.waktu_buka.gte = new Date(`${start_date}T00:00:00.000Z`);
            }

            if (end_date) {
                where.waktu_buka.lte = new Date(`${end_date}T23:59:59.999Z`);
            }
        }

        if (id_user) {
            where.id_user = parseInt(id_user);
        }

        if (status && ["OPEN", "CLOSED"].includes(status)) {
            where.status = status;
        }

        const [shifts, total] = await Promise.all([
            prisma.shift.findMany({
                where,
                include: {
                    user: {
                        select: {
                            nama: true
                        }
                    },
                    transaksi: {
                        where: {
                            status: "SELESAI"
                        },
                        select: {
                            total: true
                        }
                    }
                },
                orderBy: {
                    waktu_buka: "desc"
                },
                skip: (pageNum - 1) * limitNum,
                take: limitNum
            }),

            prisma.shift.count({ where })
        ]);

        const data = shifts.map(({ transaksi, user, ...shift }) => ({
            ...shift,
            nama_kasir: user.nama,
            total_transaksi: transaksi.length,
            total_omzet: transaksi.reduce(
                (sum, transaksi) => sum + Number(transaksi.total),
                0
            )
        }));

        res.json({
            data,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Gagal mengambil daftar shift",
            error: error.message
        });
    }
};


exports.getShiftById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                message: "ID shift tidak valid"
            });
        }

        const shift = await prisma.shift.findUnique({
            where: {
                id_shift: parseInt(id)
            },
            include: {
                user: {
                    select: {
                        nama: true
                    }
                },
                transaksi: {
                    select: {
                        id_transaksi: true,
                        no_transaksi: true,
                        total: true,
                        status: true,
                        tanggal_transaksi: true
                    }
                }
            }
        });

        if (!shift) {
            return res.status(404).json({
                message: "Shift tidak ditemukan"
            });
        }

        const { transaksi, user, ...rest } = shift;

        const selesai = transaksi.filter(
            transaksi => transaksi.status === "SELESAI"
        );

        res.json({
            data: {
                ...rest,
                nama_kasir: user.nama,
                total_transaksi: selesai.length,
                total_omzet: selesai.reduce(
                    (sum, transaksi) => sum + Number(transaksi.total),
                    0
                ),
                transaksi
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Gagal mengambil detail shift",
            error: error.message
        });
    }
};