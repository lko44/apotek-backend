const prisma = require("../lib/prisma");

exports.getProduk = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = "" } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        // 🛡️ ERROR HANDLER: Cek apakah input pagination valid
        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 10;

        // Bikin filter pencarian yang reusable dan aman
        const whereClause = {
            is_active: true, // 🌟 HANYA TAMPILKAN PRODUK YANG AKTIF
            nama_produk: {
                contains: search
            }
        };

        const data = await prisma.produk.findMany({
            where: whereClause,
            include: {
                kategori: true,
                satuan: true,
                batchproduk: {
                    select: {
                        id_batch: true,
                        no_batch: true,
                        qty_sisa: true,
                        expired_date: true,
                        // 🌟 TAMBAHKAN INI: Ambil no_faktur dari relasi pembelian
                        pembelian: {
                            select: {
                                no_faktur: true
                            }
                        }
                    },
                    where: {
                        qty_sisa: { gt: 0 } // Hanya ambil batch yang masih ada isinya
                    }
                }
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { created_at: "desc" }
        });

        const produkIds = data.map(p => p.id_produk);

        // 🛡️ ERROR HANDLER: Cek jika data kosong, langsung kembalikan response
        if (produkIds.length === 0) {
            return res.json({
                message: "Berhasil ambil produk (Data kosong)",
                page,
                limit,
                total: 0,
                totalPages: 0,
                data: []
            });
        }

        // Hitung stok gabungan hanya untuk produk yang ada di page saat ini
        const stokAgg = await prisma.batchproduk.groupBy({
            by: ["id_produk"],
            where: {
                id_produk: { in: produkIds },
                qty_sisa: { gt: 0 }
            },
            _sum: {
                qty_sisa: true
            }
        });

        const stokMap = new Map(
            stokAgg.map(s => [s.id_produk, s._sum.qty_sisa || 0])
        );

        const enriched = data.map(p => {
            // Mengonversi objek Prisma ke plain object agar aman di-spread
            const plainProduk = JSON.parse(JSON.stringify(p));

            return {
                ...plainProduk,
                stok: stokMap.get(p.id_produk) || 0
            };
        });

        const total = await prisma.produk.count({
            where: whereClause
        });

        res.json({
            message: "Berhasil ambil produk",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: enriched
        });

    } catch (error) {
        res.status(500).json({
            message: "Gagal ambil produk",
            error: error.message
        });
    }
};

exports.getProdukById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "ID tidak ditemukan di parameter" });
        }

        const idAngka = parseInt(id);

        if (isNaN(idAngka)) {
            return res.status(400).json({ error: "ID harus berupa angka" });
        }

        const produk = await prisma.produk.findUnique({
            where: {
                id_produk: idAngka
            },
            include: {
                kategori: true,
                satuan: true,
                batchproduk: {
                    select: {
                        id_batch: true,
                        no_batch: true,
                        qty_sisa: true,
                        expired_date: true,
                        // 🌟 TAMBAHKAN INI: Ambil no_faktur dari relasi pembelian
                        pembelian: {
                            select: {
                                no_faktur: true
                            }
                        }
                    },
                    where: {
                        qty_sisa: { gt: 0 }
                    }
                }
            },
        });

        if (!produk) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }

        // Hitung stok kalkulasi total untuk konsistensi detail
        const plainProduk = JSON.parse(JSON.stringify(produk));
        const totalStok = plainProduk.batchproduk.reduce((sum, batch) => sum + batch.qty_sisa, 0);

        res.json({
            ...plainProduk,
            stok: totalStok
        });

    } catch (error) {
        res.status(500).json({
            error: "Gagal mengambil data produk",
            message: error.message
        });
    }
};

exports.createProduk = async (req, res) => {
    try {
        let {
            nama_produk,
            barcode,
            id_kategori,
            satuan_id,
            stok_minimum,
            harga_jual
        } = req.body;

        if (!nama_produk || !id_kategori || !satuan_id) {
            return res.status(400).json({
                message: "Field wajib belum lengkap (nama_produk, id_kategori, satuan_id)"
            });
        }

        // 🛡️ ERROR HANDLER: Pastikan input relasi dan angka valid (bukan NaN)
        const parsedKategori = parseInt(id_kategori);
        const parsedSatuan = parseInt(satuan_id);
        const parsedHarga = parseFloat(harga_jual);

        if (isNaN(parsedKategori) || isNaN(parsedSatuan)) {
            return res.status(400).json({ message: "ID Kategori dan Satuan ID harus berupa angka" });
        }
        if (harga_jual !== undefined && isNaN(parsedHarga)) {
            return res.status(400).json({ message: "Harga jual harus berupa angka valid" });
        }

        const cleanBarcode = barcode?.trim() || null;

        const data = await prisma.produk.create({
            data: {
                nama_produk,
                barcode: cleanBarcode,
                id_kategori: parsedKategori,
                satuan_id: parsedSatuan,
                stok_minimum: parseInt(stok_minimum || 0),
                harga_jual: parsedHarga || 0,
                updated_at: new Date()
            }
        });

        res.status(201).json({
            message: "Produk berhasil ditambahkan",
            data
        });

    } catch (error) {
        // 🛡️ ERROR HANDLER: Tangkap error spesifik Prisma
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "Gagal tambah produk: Barcode sudah digunakan" });
        }
        if (error.code === 'P2003') {
            return res.status(400).json({ message: "Gagal tambah produk: ID Kategori atau Satuan tidak ditemukan di database" });
        }

        res.status(500).json({
            message: "Gagal tambah produk",
            error: error.message
        });
    }
};

exports.updateProduk = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nama_produk,
            id_kategori,
            satuan_id,
            stok_minimum,
            harga_jual,
            is_active
        } = req.body;

        // 🛡️ ERROR HANDLER: Validasi ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ error: "ID produk tidak valid atau harus berupa angka" });
        }

        const produk = await prisma.produk.update({
            where: { id_produk: parseInt(id) },
            data: {
                nama_produk,
                id_kategori: id_kategori ? parseInt(id_kategori) : undefined,
                satuan_id: satuan_id ? parseInt(satuan_id) : undefined,
                stok_minimum: stok_minimum ? parseInt(stok_minimum) : undefined,
                harga_jual: harga_jual ? parseFloat(harga_jual) : undefined,
                is_active: typeof is_active === "boolean" ? is_active : undefined,
            }
        });

        res.json({ message: "Update sukses", data: produk });
    } catch (error) {
        // 🛡️ ERROR HANDLER: Tangkap error Prisma (Data tidak ditemukan, atau FK error)
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Gagal update: Produk dengan ID tersebut tidak ditemukan." });
        }
        if (error.code === 'P2003') {
            return res.status(400).json({ error: "Gagal update: ID Kategori atau Satuan baru tidak valid." });
        }
        if (error.code === 'P2002') {
            return res.status(409).json({ error: "Gagal update: Barcode bentrok dengan produk lain." });
        }

        res.status(500).json({
            error: "Terjadi kesalahan pada server saat update produk.",
            message: error.message
        });
    }
};

exports.deleteProduk = async (req, res) => {
    // 🛡️ ERROR HANDLER: Menambahkan try-catch block yang sebelumnya hilang
    try {
        const { id } = req.params;

        // 🛡️ ERROR HANDLER: Cek validasi ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ message: "ID produk tidak valid" });
        }

        await prisma.produk.update({
            where: {
                id_produk: parseInt(id)
            },
            data: {
                is_active: false
            }
        });

        res.json({
            message: "Produk dinonaktifkan"
        });

    } catch (error) {
        // 🛡️ ERROR HANDLER: Jika ID tidak ada di database
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Gagal menghapus: Produk tidak ditemukan." });
        }

        res.status(500).json({
            message: "Gagal menonaktifkan produk",
            error: error.message
        });
    }
};

exports.getProdukByBarcode = async (req, res) => {
    // 🛡️ ERROR HANDLER: Menambahkan try-catch block yang sebelumnya hilang
    try {
        const { barcode } = req.params;

        // 🛡️ ERROR HANDLER: Cek apakah barcode kosong
        if (!barcode || barcode.trim() === "") {
            return res.status(400).json({ message: "Parameter barcode wajib diisi" });
        }

        const produk = await prisma.produk.findUnique({
            where: {
                barcode: barcode
            },
            include: {
                kategori: true,
                satuan: true
            }
        });

        if (!produk) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        res.json(produk);

    } catch (error) {
        res.status(500).json({
            message: "Gagal mencari produk berdasarkan barcode",
            error: error.message
        });
    }
};

exports.getStokProduk = async (req, res) => {
    try {
        const { barcode, id } = req.params;

        // 🛡️ ERROR HANDLER: Mencegah input kosongan
        if (!barcode && !id) {
            return res.status(400).json({ message: "Dibutuhkan parameter barcode atau id" });
        }

        // 🛡️ ERROR HANDLER: Pastikan ID bisa di-parse jika ada
        if (id && isNaN(parseInt(id))) {
            return res.status(400).json({ message: "Parameter ID harus berupa angka" });
        }

        let produk = null;

        // 🔥 PRIORITAS: BARCODE
        if (barcode) {
            produk = await prisma.produk.findUnique({
                where: { barcode }
            });
        }

        // 🔥 FALLBACK: ID
        if (!produk && id) {
            produk = await prisma.produk.findUnique({
                where: { id_produk: parseInt(id) }
            });
        }

        // 💀 kalau dua-duanya gak ada
        if (!produk) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        // 🔥 HITUNG STOK
        const stok = await prisma.batchproduk.aggregate({
            where: {
                id_produk: produk.id_produk,
                qty_sisa: { gt: 0 }   // 🔥 penting biar gak ikut batch kosong
            },
            _sum: {
                qty_sisa: true
            }
        });

        res.json({
            message: "Berhasil ambil stok",
            data: {
                id_produk: produk.id_produk,
                nama_produk: produk.nama_produk,
                barcode: produk.barcode,
                harga_jual: produk.harga_jual,
                stok: stok._sum.qty_sisa || 0
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Gagal ambil stok",
            error: error.message
        });
    }
};

exports.getStokMenipis = async (req, res) => {
    try {
        const semuaProduk = await prisma.produk.findMany({
            where: { is_active: true },
            select: { id_produk: true, nama_produk: true, barcode: true, stok_minimum: true }
        });

        // 🛡️ ERROR HANDLER: Cegah crash kalau belum ada produk di DB
        if (semuaProduk.length === 0) {
            return res.json([]);
        }

        const agregatStok = await prisma.batchproduk.groupBy({
            by: ["id_produk"],
            where: {
                qty_sisa: { gt: 0 }
            },
            _sum: {
                qty_sisa: true
            }
        });

        const result = semuaProduk.map(p => {
            const batch = agregatStok.find(s => s.id_produk === p.id_produk);
            const totalStok = batch ? batch._sum.qty_sisa : 0;
            return { ...p, stok: totalStok };
        }).filter(p => p.stok <= p.stok_minimum); // 🛡️ ERROR HANDLER: Biasanya stok menipis itu "kurang dari ATAU SAMA DENGAN" stok minimum

        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: "Gagal cek stok menipis",
            message: error.message
        });
    }
};

exports.searchProduk = async (req, res) => {
    try {
        const { q = "" } = req.query;

        // 🛡️ ERROR HANDLER: Cegah undefined error dengan toString
        const searchQuery = q ? q.toString().trim() : "";

        if (!searchQuery) {
            return res.status(400).json({
                message: "Query pencarian kosong"
            });
        }

        const data = await prisma.produk.findMany({
            where: {
                OR: [
                    {
                        nama_produk: {
                            contains: searchQuery.toLowerCase() // 🛡️ ERROR HANDLER: Amankan toLowerCase
                        }
                    },
                    {
                        barcode: {
                            contains: searchQuery
                        }
                    }
                ]
            },
            include: {
                kategori: true,
                satuan: true,
                batchproduk: {
                    where: {
                        qty_sisa: { gt: 0 }
                    },
                    select: {
                        id_batch: true,
                        no_batch: true,
                        qty_sisa: true,
                        expired_date: true
                    }
                }
            },
            take: 20,
            orderBy: {
                nama_produk: "asc"
            }
        });

        res.json({
            message: "Hasil pencarian produk",
            query: searchQuery,
            total: data.length,
            data
        });

    } catch (error) {
        res.status(500).json({
            message: "Gagal search produk",
            error: error.message
        });
    }
};

exports.getProdukTersedia = async (req, res) => {
    try {
        const data = await prisma.produk.findMany({
            where: {
                is_active: true,
                batchproduk: {
                    some: {
                        qty_sisa: {
                            gt: 0
                        }
                    }
                }
            },
            include: {
                kategori: true,
                satuan: true,
                batchproduk: {
                    where: {
                        qty_sisa: {
                            gt: 0
                        }
                    },
                    select: {
                        id_batch: true,
                        no_batch: true,
                        qty_sisa: true,
                        expired_date: true
                    }
                }
            },
            orderBy: {
                nama_produk: "asc"
            }
        });

        const enriched = data.map(produk => ({
            ...produk,
            stok: produk.batchproduk.reduce(
                (total, batch) => total + batch.qty_sisa,
                0
            )
        }));

        res.json({
            message: "Berhasil mengambil produk yang tersedia",
            total: enriched.length,
            data: enriched
        });

    } catch (error) {
        res.status(500).json({
            message: "Gagal mengambil produk tersedia",
            error: error.message
        });
    }
};