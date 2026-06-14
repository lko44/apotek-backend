const prisma = require("../../lib/prisma");

exports.createPembelian = async (data) => {
  const { id_supplier, id_user, no_faktur, tanggal_faktur, status, items } = data;

  // --- VALIDASI AWAL PAYLOAD ---
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw { status: 400, message: "Data items pembelian tidak boleh kosong." };
  }

  // 1. Ambil semua barcode untuk divalidasi dan bersihkan dari nilai kosong
  const barcodes = items.map(i => i.barcode).filter(Boolean);

  if (barcodes.length !== items.length) {
    throw { status: 400, message: "Ada item yang tidak memiliki barcode valid." };
  }

  const produkExists = await prisma.produk.findMany({
    where: { barcode: { in: barcodes } }
  });

  // Validasi kecocokan data barang di database
  if (produkExists.length !== items.length) {
    const foundBarcodes = produkExists.map(p => p.barcode);
    const missing = barcodes.filter(b => !foundBarcodes.includes(b));

    throw {
      status: 400,
      message: `Barcode berikut belum terdaftar di sistem: ${missing.join(", ")}`
    };
  }

  // 2. Jalankan Database Transaction
  const result = await prisma.$transaction(async (tx) => {

    // Hitung total harga dan validasi kuantitas di memori sebelum insert
    let totalHarga = 0;
    items.forEach(item => {
      const parsedQty = parseInt(item.qty);
      const parsedHarga = parseFloat(item.harga_beli);

      if (isNaN(parsedQty) || parsedQty <= 0) {
        throw { status: 400, message: `Kuantitas (qty) untuk barcode ${item.barcode} tidak valid.` };
      }
      if (isNaN(parsedHarga) || parsedHarga < 0) {
        throw { status: 400, message: `Harga beli untuk barcode ${item.barcode} tidak valid.` };
      }

      totalHarga += parsedQty * parsedHarga;
    });

    // Buat data induk pembelian dan detailnya
    const pembelian = await tx.pembelian.create({
      data: {
        supplier: { connect: { id_supplier: parseInt(id_supplier) } },
        user: { connect: { id_user: parseInt(id_user) } },
        no_faktur,
        tanggal_faktur: new Date(tanggal_faktur),
        total: totalHarga,
        status,
        pembeliandetail: {
          create: items.map(item => {
            const produk = produkExists.find(p => p.barcode === item.barcode);

            // Pengaman double-check agar tidak crash 'Argument produk is missing'
            if (!produk) {
              throw { status: 404, message: `Produk dengan barcode ${item.barcode} mendadak hilang.` };
            }

            return {
              qty: parseInt(item.qty),
              harga_beli: parseFloat(item.harga_beli),
              // Hubungkan menggunakan field relasi id_produk secara eksplisit
              id_produk: produk.id_produk
            };
          })
        }
      },
      include: { pembeliandetail: true }
    });

    // 3. Loop untuk generate Batch Produk Baru dan Log Pergerakan Stok
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const produk = produkExists.find(p => p.barcode === item.barcode);
      const detail = pembelian.pembeliandetail.find(d => d.id_produk === produk.id_produk);

      // Default tanggal kedaluwarsa jika frontend lupa mengirimkannya
      const expDate = item.expired_date ? new Date(item.expired_date) : new Date();

      await tx.batchproduk.create({
        data: {
          id_produk: produk.id_produk,
          id_pembelian: pembelian.id_pembelian,
          id_pembelian_detail: detail.id_pembelian_detail,
          expired_date: expDate,
          qty_masuk: parseInt(item.qty),
          qty_sisa: parseInt(item.qty),
          no_batch: `BATCH-${Date.now()}-${i}`
        }
      });

      await tx.logstok.create({
        data: {
          id_produk: produk.id_produk,
          tipe: "MASUK",
          qty: parseInt(item.qty),
          sumber: "PEMBELIAN"
        }
      });
    }

    return pembelian;
  });

  return result;
};