const prisma = require("../lib/prisma");
const pembelianService = require("../controllers/services/pembelianService");

exports.createPembelian = async (req, res) => {
    try {
        // 1. Lock: Cuma Admin yang boleh input stok masuk
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: "Akses ditolak! Kamu bukan Admin." });
        }

        const result = await pembelianService.createPembelian(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(err.status || 500).json({
            message: err.message || "Gagal membuat data pembelian"
        });
    }
};

exports.getPembelian = async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;

        const data = await prisma.pembelian.findMany({
            take: parseInt(limit),
            skip: skip,
            include: {
                supplier: {
                    select: { nama_supplier: true } 
                },
                pembelian_detail: {
                    include: {
                        produk: {
                            select: { nama_produk: true, satuan: true }
                        }
                    }
                }
            },
            orderBy: { tanggal_faktur: "desc" }
        });

        res.json({
            status: "success",
            page: parseInt(page),
            data
        });
    } catch (error) {
        console.error("GET_PEMBELIAN_ERROR:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getPembelianById = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ message: "ID Pembelian harus berupa angka!" });
        }

        const pembelian = await prisma.pembelian.findUnique({
            where: { id_pembelian: parseInt(id) },
            include: {
                supplier: true,
                pembelian_detail: {
                    include: { produk: true }
                }
            }
        });

        if (!pembelian) {
            return res.status(404).json({ message: "Data pembelian tidak ditemukan" });
        }

        res.json(pembelian);
    } catch (error) {
        console.error("GET_BY_ID_ERROR:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};