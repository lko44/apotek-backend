const prisma = require("../lib/prisma");

exports.create = async (req, res) => {
    try {
        const { id_shift, tipe, nominal, keterangan, waktu_transaksi } = req.body;

        if (!id_shift || isNaN(parseInt(id_shift))) {
            return res.status(422).json({
                message: "Validasi gagal",
                errors: {
                    id_shift: ["id_shift wajib diisi"]
                }
            });
        }

        const tipeFinal = (tipe || "").toLowerCase();

        if (!["masuk", "keluar"].includes(tipeFinal)) {
            return res.status(422).json({
                message: "Validasi gagal",
                errors: {
                    tipe: ["tipe harus 'masuk' atau 'keluar'"]
                }
            });
        }

        const nominalFinal = Number(nominal);

        if (!nominalFinal || nominalFinal <= 0) {
            return res.status(422).json({
                message: "Validasi gagal",
                errors: {
                    nominal: ["nominal harus lebih dari 0"]
                }
            });
        }

        if (!keterangan || !keterangan.trim()) {
            return res.status(422).json({
                message: "Validasi gagal",
                errors: {
                    keterangan: ["keterangan wajib diisi"]
                }
            });
        }

        const kas = await prisma.kas_kecil.create({
            data: {
                id_shift: parseInt(id_shift),
                id_user: req.user.id,
                tipe: tipeFinal,
                nominal: nominalFinal,
                keterangan: keterangan.trim(),
                waktu_transaksi: waktu_transaksi
                    ? new Date(waktu_transaksi)
                    : new Date()
            },
            include: {
                user: {
                    select: {
                        nama: true
                    }
                }
            }
        });

        res.status(201).json({
            message: "Kas kecil berhasil dicatat",
            data: {
                id: kas.id,
                id_shift: kas.id_shift,
                id_user: kas.id_user,
                nama_kasir: kas.user.nama,
                tipe: kas.tipe,
                nominal: Number(kas.nominal),
                keterangan: kas.keterangan,
                waktu_transaksi: kas.waktu_transaksi,
                created_at: kas.created_at
            }
        });

    } catch (error) {
        if (error.code === "P2003") {
            return res.status(422).json({
                message: "Validasi gagal",
                errors: {
                    id_shift: ["Shift tidak ditemukan"]
                }
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Gagal mencatat kas kecil",
            error: error.message
        });
    }
};

exports.list = async (req, res) => {
    try {
        const { id_shift, tanggal, page = 1, limit = 20 } = req.query;

        const pageNum = Math.max(parseInt(page) || 1, 1);
        const limitNum = Math.max(parseInt(limit) || 20, 1);

        const where = {};

        if (id_shift) {
            where.id_shift = parseInt(id_shift);
        }

        if (tanggal) {
            where.waktu_transaksi = {
                gte: new Date(`${tanggal}T00:00:00.000Z`),
                lte: new Date(`${tanggal}T23:59:59.999Z`)
            };
        }

        const [data, total] = await Promise.all([
            prisma.kas_kecil.findMany({
                where,
                orderBy: {
                    waktu_transaksi: "desc"
                },
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
                include: {
                    user: {
                        select: {
                            nama: true
                        }
                    }
                }
            }),

            prisma.kas_kecil.count({ where })
        ]);

        res.json({
            data: data.map(k => ({
                id: k.id,
                id_shift: k.id_shift,
                nama_kasir: k.user.nama,
                tipe: k.tipe,
                nominal: Number(k.nominal),
                keterangan: k.keterangan,
                waktu_transaksi: k.waktu_transaksi
            })),

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
            message: "Gagal mengambil daftar kas kecil",
            error: error.message
        });
    }
};