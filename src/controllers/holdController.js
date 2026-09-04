const prisma = require("../lib/prisma")
const { logAksi } = require("../lib/auditLog");

exports.createHold = async (req, res) => {
    try {
        const { nama_pelanggan, alasan, cart } = req.body;

        if (!nama_pelanggan) {
            return res.status(400).json({ message: "nama_pelanggan wajib diisi." });
        }
        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: "Keranjang kosong, tidak ada yang bisa di-hold." });
        }

        const hold = await prisma.hold.create({
            data: {
                nama_pelanggan,
                alasan,
                id_user: req.user.id,
                hold_item: {
                    create: cart.map(item => ({
                        id_produk: Number(item.produk_id),
                        qty: item.qty,
                        harga_jual: item.harga_jual
                    }))
                }
            },
            include: {
                hold_item: {
                    include: { produk: { select: { nama_produk: true, barcode: true } } }
                }
            }
        });

        res.status(201).json({ message: "Transaksi berhasil di-hold.", data: hold });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllHold = async (req, res) => {
    try {
        const holds = await prisma.hold.findMany({
            where: { status: "HELD" },
            orderBy: { created_at: "desc" },
            include: {
                user: { select: { id_user: true, nama: true } },
                hold_item: { include: { produk: { select: { nama_produk: true, barcode: true } } } }
            }
        });

        res.json(holds);

    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data hold.", error: error.message });
    }
};

// Mark a hold as recalled and return its cart so the frontend can reload it into the POS
exports.recallHold = async (req, res) => {
    try {
        const { id } = req.params;

        const hold = await prisma.hold.findUnique({
            where: { id_hold: Number(id) },
            include: { hold_item: { include: { produk: true } } }
        });

        if (!hold) return res.status(404).json({ message: "Data hold tidak ditemukan." });
        if (hold.status !== "HELD") {
            return res.status(400).json({ message: `Hold ini sudah berstatus ${hold.status}, tidak bisa di-recall.` });
        }

        const updated = await prisma.hold.update({
            where: { id_hold: Number(id) },
            data: { status: "RECALLED" },
            include: { hold_item: { include: { produk: true } } }
        });

        res.json({ message: "Transaksi berhasil di-recall.", data: updated });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Soft-cancel a hold (kept for history, not physically deleted)
exports.cancelHold = async (req, res) => {
    try {
        const { id } = req.params;

        const hold = await prisma.hold.findUnique({ where: { id_hold: Number(id) } });
        if (!hold) return res.status(404).json({ message: "Data hold tidak ditemukan." });
        if (hold.status !== "HELD") {
            return res.status(400).json({ message: `Hold ini sudah berstatus ${hold.status}.` });
        }

        await prisma.hold.update({
            where: { id_hold: Number(id) },
            data: { status: "CANCELLED" }
        });

        await logAksi(
            req.user.id,
            "CANCEL_HOLD",
            `Membatalkan hold #${id}`
        );

        res.json({ message: "Hold berhasil dibatalkan." });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};