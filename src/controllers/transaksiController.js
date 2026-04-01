const prisma = require("../lib/prisma")

exports.createTransaksi = async (req, res) => {
    try {
        const { metode_bayar, items } = req.body;
        
        const id_user = req.user.id; 

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Keranjang belanja kosong!" });
        }

        const result = await prisma.$transaction(async (tx) => {
            const transaksi = await tx.transaksi.create({
                data: {
                    no_transaksi: "TRX-" + Date.now(),
                    metode_bayar,
                    total: 0,
                    user: { connect: { id_user: parseInt(id_user) } }
                }
            });

            let grandTotal = 0;

            for (const item of items) {
                const produk = await tx.produk.findUnique({
                    where: { barcode: item.barcode }
                });

                if (!produk) throw new Error(`Produk dengan barcode ${item.barcode} tidak ditemukan`);
                if (!produk.is_active) throw new Error(`Produk ${produk.nama_produk} sudah tidak aktif`);

                let sisaQtyYangMauDibeli = item.qty;

                const batches = await tx.batchProduk.findMany({
                    where: {
                        id_produk: produk.id_produk,
                        qty_sisa: { gt: 0 }
                    },
                    orderBy: { expired_date: "asc" }
                });

                const totalStokTersedia = batches.reduce((acc, curr) => acc + curr.qty_sisa, 0);
                if (totalStokTersedia < item.qty) {
                    throw new Error(`Stok ${produk.nama_produk} tidak cukup. Tersisa: ${totalStokTersedia}`);
                }

                const detail = await tx.transaksiDetail.create({
                    data: {
                        id_transaksi: transaksi.id_transaksi,
                        id_produk: produk.id_produk,
                        qty: item.qty,
                        harga_jual: produk.harga_jual,
                        subtotal: 0 
                    }
                });

                let subtotalItem = 0;

                for (const batch of batches) {
                    if (sisaQtyYangMauDibeli <= 0) break;
                    
                    const ambilDariBatchIni = Math.min(batch.qty_sisa, sisaQtyYangMauDibeli);

                    await tx.batchProduk.update({
                        where: { id_batch: batch.id_batch },
                        data: { qty_sisa: { decrement: ambilDariBatchIni } }
                    });

                    await tx.transaksiBatch.create({
                        data: {
                            id_transaksi_detail: detail.id_transaksi_detail,
                            id_batch: batch.id_batch,
                            qty_keluar: ambilDariBatchIni
                        }
                    });

                    sisaQtyYangMauDibeli -= ambilDariBatchIni;
                    subtotalItem += ambilDariBatchIni * Number(produk.harga_jual);
                }

                await tx.transaksiDetail.update({
                    where: { id_transaksi_detail: detail.id_transaksi_detail },
                    data: { subtotal: subtotalItem }
                });

                await tx.logStok.create({
                    data: {
                        id_produk: produk.id_produk,
                        tipe: "KELUAR",
                        qty: item.qty,
                        sumber: "TRANSAKSI"
                    }
                });

                grandTotal += subtotalItem;
            }

            const transaksiFinal = await tx.transaksi.update({
                where: { id_transaksi: transaksi.id_transaksi },
                data: { total: grandTotal },
                include: {
                    transaksi_detail: {
                        include: { produk: { select: { nama_produk: true } } }
                    }
                }
            });

            return transaksiFinal; 
        });

        res.status(201).json({
            message: "Transaksi berhasil",
            data: result
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllTransaksi = async (req, res) => {
    try {
        const transaksi = await prisma.transaksi.findMany({
            orderBy: {
                tanggal_transaksi: "desc"
            },
            include: {
                user: {
                    select: {
                        id_user: true,
                        nama: true
                    }
                }
            }
        })

        res.json(transaksi)

    } catch (error) {
        res.status(500).json({
            error: "Gagal mengambil data transaksi",
            message: error.message
        })
    }
}
exports.getDetailTransaksi = async (req, res) => {
    try {
        const { id } = req.params

        const transaksi = await prisma.transaksi.findUnique({
            where: {
                id_transaksi: Number(id)
            },
            include: {
                user: {
                    select: {
                        id_user: true,
                        nama: true
                    }
                },
                // GANTI INI: dari detail_transaksi menjadi transaksi_detail
                transaksi_detail: {
                    include: {
                        produk: {
                            select: {
                                id_produk: true,
                                nama_produk: true,
                                barcode: true
                            }
                        }
                    }
                }
            }
        })

        if (!transaksi) {
            return res.status(404).json({
                message: "Transaksi tidak ditemukan"
            })
        }

        res.json(transaksi)

    } catch (error) {
        res.status(500).json({
            error: "Gagal mengambil detail transaksi",
            message: error.message
        })
    }
}