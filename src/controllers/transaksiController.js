const prisma = require("../lib/prisma")

exports.createTransaksi = async (req, res) => {

    try {

        const { metode_bayar, id_user, items } = req.body

        const result = await prisma.$transaction(async (tx) => {

            const transaksi = await tx.transaksi.create({
                data: {
                    no_transaksi: "TRX-" + Date.now(),
                    metode_bayar,
                    total: 0,
                    user: { connect: { id_user: parseInt(id_user) } }
                }
            })

            let total = 0

            for (const item of items) {
                const produk = await tx.produk.findUnique({
                    where: { barcode: item.barcode }
                })

                if (!produk) {
                    throw new Error(`Produk dengan barcode ${item.barcode} tidak ditemukan`)
                }

                let sisa = item.qty

                const batches = await tx.batchProduk.findMany({
                    where: {
                        id_produk: produk.id_produk,
                        qty_sisa: { gt: 0 }
                    },
                    orderBy: { expired_date: "asc" }
                })

                const detail = await tx.transaksiDetail.create({
                    data: {
                        id_transaksi: transaksi.id_transaksi,
                        id_produk: produk.id_produk,
                        qty: item.qty,
                        harga_jual: produk.harga_jual,
                        subtotal: 0
                    }
                })

                let subtotalItem = 0

                for (const batch of batches) {
                    if (sisa <= 0) break;
                    const ambil = Math.min(batch.qty_sisa, sisa);

                    await tx.batchProduk.update({
                        where: { id_batch: batch.id_batch },
                        data: {
                            qty_sisa: { decrement: ambil }
                        }
                    });

                    await tx.produk.update({
                        where: { id_produk: produk.id_produk },
                        data: { stok_minimum: { decrement: ambil } }
                    });

                    await tx.transaksiBatch.create({
                        data: { 
                            id_transaksi_detail: detail.id_transaksi_detail,
                            id_batch: batch.id_batch,
                            qty_keluar: ambil
                        }
                    });

                    sisa -= ambil;
                    subtotalItem += ambil * Number(produk.harga_jual);
                }

                if (sisa > 0) throw new Error(`Stok ${produk.nama_produk} tidak cukup`);

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
                })

                total += subtotalItem;
            }
            const transaksiFinal = await tx.transaksi.update({
                where: { id_transaksi: transaksi.id_transaksi },
                data: { total: total },
                include: {
                    transaksi_detail: true
                }
            })

            return transaksiFinal
        })

        res.status(201).json(result)

    } catch (error) {

        res.status(400).json({
            error: "Transaksi gagal",
            message: error.message
        })

    }

}

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