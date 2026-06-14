const prisma = require("../lib/prisma");

// 🟢 GET ALL
exports.getAll = async (req, res) => {
    try {
        const data = await prisma.satuan.findMany({
            orderBy: { id: "asc" }
        });

        res.json({
            message: "Berhasil ambil semua satuan",
            data
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal ambil data",
            error: error.message
        });
    }
};

// 🟢 GET BY ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await prisma.satuan.findUnique({
            where: { id: parseInt(id) }
        });

        if (!data) {
            return res.status(404).json({
                message: "Satuan tidak ditemukan"
            });
        }

        res.json({
            message: "Berhasil ambil satuan",
            data
        });
    } catch (error) {
        res.status(500).json({
            message: "Error",
            error: error.message
        });
    }
};

// 🟢 CREATE
exports.create = async (req, res) => {
    try {
        let { kode, nama } = req.body;

        if (!kode || !nama) {
            return res.status(400).json({
                message: "Kode dan nama wajib diisi"
            });
        }

        kode = kode.toUpperCase();

        // 🔒 cek duplicate
        const exist = await prisma.satuan.findUnique({
            where: { kode }
        });

        if (exist) {
            return res.status(400).json({
                message: "Kode sudah ada"
            });
        }

        const data = await prisma.satuan.create({
            data: { kode, nama }
        });

        res.status(201).json({
            message: "Satuan berhasil ditambahkan",
            data
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal tambah satuan",
            error: error.message
        });
    }
    console.log(req.params);
};

// 🟢 UPDATE (NO DELETE 😏)
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        let { kode, nama } = req.body;

        const existing = await prisma.satuan.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Satuan tidak ditemukan"
            });
        }

        // kalau kode diubah → uppercase + cek duplicate
        if (kode) {
            kode = kode.toUpperCase();

            const duplicate = await prisma.satuan.findFirst({
                where: {
                    kode,
                    NOT: { id: parseInt(id) }
                }
            });

            if (duplicate) {
                return res.status(400).json({
                    message: "Kode sudah dipakai"
                });
            }
        }

        const data = await prisma.satuan.update({
            where: { id: parseInt(id) },
            data: {
                kode: kode || existing.kode,
                nama: nama || existing.nama
            }
        });

        res.json({
            message: "Satuan berhasil diupdate",
            data
        });

    } catch (error) {
        res.status(500).json({
            message: "Gagal update satuan",
            error: error.message
        });
    }
};