const prisma = require("../lib/prisma");
// FIX: Memperbaiki path import service agar sesuai dengan struktur project
const pembelianService = require("./services/pembelianService");

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
        const {
            limit = 10,
            page = 1,
            search = ""
        } = req.query;

        const take = parseInt(limit);
        const currentPage = parseInt(page);
        const skip = (currentPage - 1) * take;

        const whereClause = search
            ? {
                OR: [
                    {
                        no_faktur: {
                            contains: search
                        }
                    },
                    {
                        supplier: {
                            nama_supplier: {
                                contains: search
                            }
                        }
                    }
                ]
            }
            : {};

        const total = await prisma.pembelian.count({
            where: whereClause
        });

        const totalPages = Math.ceil(total / take);

        const data = await prisma.pembelian.findMany({
            where: whereClause,
            take,
            skip,
            include: {
                supplier: {
                    select: {
                        nama_supplier: true
                    }
                },
                pembeliandetail: {
                    include: {
                        produk: {
                            select: {
                                nama_produk: true,
                                satuan: true
                            }
                        },
                        batchproduk: {
                            select: {
                                id_batch: true,
                                no_batch: true,
                                qty_sisa: true,
                                expired_date: true,
                                created_at: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                tanggal_faktur: "desc"
            }
        });

        const formattedData = data.map(pembelian => {
            const formattedDetail = pembelian.pembeliandetail.map(detail => {
                const batch = detail.batchproduk?.[0] || {};

                return {
                    id_pembelian_detail: detail.id_pembelian_detail,
                    qty: detail.qty,
                    harga_beli: detail.harga_beli,
                    no_batch: batch.no_batch || "-",
                    expired_date: batch.expired_date
                        ? batch.expired_date.toISOString().split("T")[0]
                        : "-",
                    tanggal_penerimaan: batch.created_at
                        ? batch.created_at.toISOString().split("T")[0]
                        : "-",
                    gudang: "Gudang Utama",
                    produk: detail.produk
                };
            });

            return {
                ...pembelian,
                pembeliandetail: formattedDetail
            };
        });

        res.json({
            status: "success",
            page: currentPage,
            limit: take,
            search,
            total,
            totalPages,
            data: formattedData
        });

    } catch (error) {
        console.error("GET_PEMBELIAN_ERROR:", error);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

exports.getPembelianById = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                message: "ID Pembelian harus berupa angka!"
            });
        }

        const pembelian = await prisma.pembelian.findUnique({
            where: {
                id_pembelian: parseInt(id)
            },
            include: {
                supplier: true,
                pembeliandetail: {
                    include: {
                        produk: {
                            include: {
                                satuan: true
                            }
                        },
                        batchproduk: {
                            select: {
                                id_batch: true,
                                no_batch: true,
                                expired_date: true,
                                created_at: true
                            }
                        }
                    }
                }
            }
        });

        if (!pembelian) {
            return res.status(404).json({
                message: "Data pembelian tidak ditemukan"
            });
        }

        const formattedDetail = pembelian.pembeliandetail.map(detail => {
            const batch = detail.batchproduk?.[0] || {};

            return {
                id_pembelian_detail: detail.id_pembelian_detail,
                qty: detail.qty,
                harga_beli: detail.harga_beli,

                // Use the actual no_batch stored in BatchProduk
                no_batch: batch.no_batch || "-",

                expired_date: batch.expired_date
                    ? batch.expired_date.toISOString().split("T")[0]
                    : "-",

                tanggal_penerimaan: batch.created_at
                    ? batch.created_at.toISOString().split("T")[0]
                    : "-",

                gudang: "Gudang Utama",

                produk: detail.produk
            };
        });

        res.json({
            ...pembelian,
            pembeliandetail: formattedDetail
        });

    } catch (error) {
        console.error("GET_BY_ID_ERROR:", error);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

