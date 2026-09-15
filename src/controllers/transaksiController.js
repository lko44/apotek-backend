const prisma = require("../lib/prisma")
const { logAksi } = require("../lib/auditLog");

exports.createTransaksi = async (req, res) => {
    try {
        const { metode_bayar, items } = req.body;
        const id_user = req.user.id;
        const id_shift = req.shift.id_shift; // set by requireActiveShift middleware

        if (!items || items.length === 0) {
            return res.status(400).json({
                message: "Keranjang belanja kosong!"
            });
        }

        // Split payment validation
        if (!Array.isArray(metode_bayar) || metode_bayar.length === 0) {
            return res.status(400).json({
                message: "metode_bayar harus berupa array, contoh: [{ jenis: 'TUNAI', nominal: 50000 }]"
            });
        }

        const validMetode = ["TUNAI", "QRIS", "TRANSFER"];

        for (const p of metode_bayar) {
            if (!p || !validMetode.includes(p.jenis)) {
                return res.status(400).json({
                    message: `Jenis pembayaran '${p?.jenis}' tidak valid.`
                });
            }

            if (
                typeof p.nominal !== "number" ||
                !Number.isFinite(p.nominal) ||
                p.nominal <= 0
            ) {
                return res.status(400).json({
                    message: "Setiap nominal pembayaran harus berupa angka positif."
                });
            }
        }

        const result = await prisma.$transaction(async (tx) => {

            // 1. Create base transaction
            const transaksi = await tx.transaksi.create({
                data: {
                    no_transaksi: "TRX-" + Date.now(),

                    // Legacy column: keep first payment method
                    // only for historical compatibility/information.
                    metode_bayar: metode_bayar[0].jenis,

                    status: "SELESAI",
                    total: 0,
                    id_user: parseInt(id_user),
                    id_shift
                }
            });

            let grandTotal = 0;

            for (const item of items) {

                // 2. Find product by barcode or ID
                const produk = await tx.produk.findFirst({
                    where: item.produk_id
                        ? { id_produk: Number(item.produk_id) }
                        : { barcode: item.barcode }
                });

                if (!produk) {
                    throw new Error(
                        `Produk dengan barcode ${item.barcode} tidak ditemukan`
                    );
                }

                if (!produk.is_active) {
                    throw new Error(
                        `Produk ${produk.nama_produk} sudah tidak aktif`
                    );
                }

                if (
                    !Number.isInteger(item.qty) ||
                    item.qty <= 0
                ) {
                    throw new Error(
                        `Qty produk ${produk.nama_produk} harus berupa bilangan bulat positif`
                    );
                }

                let sisaQtyYangMauDibeli = item.qty;

                // 3. Fetch batches using FEFO
                const batches = await tx.batchproduk.findMany({
                    where: {
                        id_produk: produk.id_produk,
                        qty_sisa: { gt: 0 }
                    },
                    orderBy: {
                        expired_date: "asc"
                    }
                });

                const totalStokTersedia = batches.reduce(
                    (acc, curr) => acc + curr.qty_sisa,
                    0
                );

                if (totalStokTersedia < item.qty) {
                    throw new Error(
                        `Stok ${produk.nama_produk} tidak cukup. Tersisa: ${totalStokTersedia}`
                    );
                }

                // 4. Create transaction detail
                const detail = await tx.transaksidetail.create({
                    data: {
                        id_transaksi: transaksi.id_transaksi,
                        id_produk: produk.id_produk,
                        qty: item.qty,
                        harga_jual: produk.harga_jual,
                        subtotal: 0
                    }
                });

                let subtotalItem = 0;

                // 5. Deduct stock using FEFO
                for (const batch of batches) {
                    if (sisaQtyYangMauDibeli <= 0) {
                        break;
                    }

                    const ambilDariBatchIni = Math.min(
                        batch.qty_sisa,
                        sisaQtyYangMauDibeli
                    );

                    // Deduct batch stock
                    await tx.batchproduk.update({
                        where: {
                            id_batch: batch.id_batch
                        },
                        data: {
                            qty_sisa: {
                                decrement: ambilDariBatchIni
                            }
                        }
                    });

                    // Record exactly which batch was used
                    await tx.transaksibatch.create({
                        data: {
                            id_transaksi_detail: detail.id_transaksi_detail,
                            id_batch: batch.id_batch,
                            qty_keluar: ambilDariBatchIni
                        }
                    });

                    sisaQtyYangMauDibeli -= ambilDariBatchIni;

                    subtotalItem +=
                        ambilDariBatchIni *
                        Number(produk.harga_jual);
                }

                // 6. Update transaction detail subtotal
                await tx.transaksidetail.update({
                    where: {
                        id_transaksi_detail: detail.id_transaksi_detail
                    },
                    data: {
                        subtotal: subtotalItem
                    }
                });

                // 7. Write stock movement log
                await tx.logstok.create({
                    data: {
                        id_produk: produk.id_produk,
                        tipe: "KELUAR",
                        qty: item.qty,
                        sumber: "TRANSAKSI"
                    }
                });

                grandTotal += subtotalItem;
            }

            // 8. Validate split payment total
            const totalBayar = metode_bayar.reduce(
                (sum, p) => sum + p.nominal,
                0
            );

            if (Math.abs(totalBayar - grandTotal) > 0.01) {
                throw new Error(
                    `Total pembayaran (Rp${totalBayar.toLocaleString("id-ID")}) tidak sama dengan total transaksi (Rp${grandTotal.toLocaleString("id-ID")}).`
                );
            }

            // 9. Save payment details
            await tx.pembayaran.createMany({
                data: metode_bayar.map((p) => ({
                    id_transaksi: transaksi.id_transaksi,
                    metode_bayar: p.jenis,
                    nominal: p.nominal
                }))
            });

            // 10. Update final transaction + return payment details
            const transaksiFinal = await tx.transaksi.update({
                where: {
                    id_transaksi: transaksi.id_transaksi
                },
                data: {
                    total: grandTotal
                },
                include: {
                    transaksidetail: {
                        include: {
                            produk: {
                                select: {
                                    id_produk: true,
                                    nama_produk: true,
                                    barcode: true,
                                    harga_jual: true
                                }
                            },
                            transaksibatch: {
                                include: {
                                    batchproduk: {
                                        select: {
                                            id_batch: true,
                                            no_batch: true,
                                            expired_date: true,
                                            qty_sisa: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    pembayaran: true
                }
            });

            return transaksiFinal;
        });

        res.status(201).json({
            message: "Transaksi berhasil",
            data: result
        });

    } catch (error) {
        console.error("CREATE_TRANSAKSI_ERROR:", error);

        res.status(400).json({
            message: error.message
        });
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
                },
                transaksidetail: {
                    select: {
                        qty: true
                    }
                }
            }
        })

        const data = transaksi.map(({ transaksidetail, ...item }) => ({
            ...item,
            total_item: transaksidetail.reduce(
                (total, detail) => total + Number(detail.qty),
                0
            )
        }))

        res.json(data)

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
                transaksidetail: {
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

exports.batalkanTransaksi = async (req, res) => {
    try {
        // Hanya ADMIN yang boleh membatalkan transaksi
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Akses ditolak! Hanya Admin yang dapat membatalkan transaksi."
            });
        }

        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                message: "ID transaksi harus berupa angka."
            });
        }

        const idTransaksi = parseInt(id);

        const transaksi = await prisma.transaksi.findUnique({
            where: {
                id_transaksi: idTransaksi
            },
            include: {
                transaksidetail: {
                    include: {
                        transaksibatch: true
                    }
                }
            }
        });

        if (!transaksi) {
            return res.status(404).json({
                message: "Transaksi tidak ditemukan."
            });
        }

        if (transaksi.status === "DIBATALKAN") {
            return res.status(400).json({
                message: "Transaksi sudah dibatalkan sebelumnya."
            });
        }

        await prisma.$transaction(async (tx) => {

            // 1. Kembalikan stok ke batch yang sebelumnya dipakai
            for (const detail of transaksi.transaksidetail) {

                for (const batch of detail.transaksibatch) {

                    await tx.batchproduk.update({
                        where: {
                            id_batch: batch.id_batch
                        },
                        data: {
                            qty_sisa: {
                                increment: batch.qty_keluar
                            }
                        }
                    });
                }

                // 2. Catat stok kembali sebagai KOREKSI
                await tx.logstok.create({
                    data: {
                        id_produk: detail.id_produk,
                        tipe: "KOREKSI",
                        qty: detail.qty,
                        sumber: "PEMBATALAN_TRANSAKSI"
                    }
                });
            }

            // 3. Tandai transaksi sebagai dibatalkan
            await tx.transaksi.update({
                where: {
                    id_transaksi: idTransaksi
                },
                data: {
                    status: "DIBATALKAN"
                }
            });
        });

        await logAksi(
            req.user.id,
            "CANCEL_TRANSAKSI",
            `Membatalkan transaksi #${idTransaksi}`
        );

        res.json({
            message: "Transaksi berhasil dibatalkan dan stok telah dikembalikan."
        });

    } catch (error) {
        console.error("BATAL_TRANSAKSI_ERROR:", error);

        res.status(500).json({
            message: "Gagal membatalkan transaksi.",
            error: error.message
        });
    }
};