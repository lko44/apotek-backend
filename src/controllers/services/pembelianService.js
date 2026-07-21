const prisma = require("../../lib/prisma");

exports.createPembelian = async (data) => {
  const { id_supplier, id_user, no_faktur, tanggal_faktur, status, items } = data;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw { status: 400, message: "Data items pembelian tidak boleh kosong." };
  }

  const produkExists = [];

  for (const item of items) {
    let produk;

    if (item.barcode) {
      produk = await prisma.produk.findFirst({
        where: {
          barcode: item.barcode
        }
      });
    } else if (item.id_produk) {
      produk = await prisma.produk.findUnique({
        where: {
          id_produk: parseInt(item.id_produk)
        }
      });
    } else {
      throw {
        status: 400,
        message: "Setiap item harus memiliki barcode atau id_produk."
      };
    }

    if (!produk) {
      throw {
        status: 404,
        message: item.barcode
          ? `Produk dengan barcode ${item.barcode} tidak ditemukan.`
          : `Produk dengan ID ${item.id_produk} tidak ditemukan.`
      };
    }

    produkExists.push(produk);
  }

  const result = await prisma.$transaction(async (tx) => {

    let totalHarga = 0;
    items.forEach(item => {
      const parsedQty = parseInt(item.qty);
      const parsedHarga = parseFloat(item.harga_beli);
      const parsedHargaJual = parseFloat(item.harga_jual);

      if (isNaN(parsedQty) || parsedQty <= 0) {
        throw {
          status: 400,
          message: `Kuantitas (qty) untuk barcode ${item.barcode} tidak valid.`
        };
      }

      if (isNaN(parsedHarga) || parsedHarga < 0) {
        throw {
          status: 400,
          message: `Harga beli untuk barcode ${item.barcode} tidak valid.`
        };
      }

      if (isNaN(parsedHargaJual) || parsedHargaJual < 0) {
        throw {
          status: 400,
          message: `Harga jual untuk barcode ${item.barcode} tidak valid.`
        };
      }

      totalHarga += parsedQty * parsedHarga;
    });

    const pembelian = await tx.pembelian.create({
      data: {
        supplier: { connect: { id_supplier: parseInt(id_supplier) } },
        user: { connect: { id_user: parseInt(id_user) } },
        no_faktur,
        tanggal_faktur: new Date(tanggal_faktur),
        total: totalHarga,
        status,
        pembeliandetail: {
          create: items.map((item, index) => {
            const produk = produkExists[index];

            return {
              qty: parseInt(item.qty),
              harga_beli: parseFloat(item.harga_beli),
              id_produk: produk.id_produk
            };
          })
        }
      },
      include: { pembeliandetail: true }
    });

    console.log("=== MULAI GENERATE BATCH ===");
    console.log("Jumlah item:", items.length);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const produk = produkExists[i];
      const detail = pembelian.pembeliandetail.find(
        d => d.id_produk === produk.id_produk
      );

      console.log("ITEM:", item);
      console.log("PRODUK:", produk);
      console.log("DETAIL:", detail);

      const expDate = item.expired_date
        ? new Date(item.expired_date)
        : new Date();

      console.log("MAU CREATE BATCH");

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

      console.log("BATCH BERHASIL DIBUAT");

      await tx.logstok.create({
        data: {
          id_produk: produk.id_produk,
          tipe: "MASUK",
          qty: parseInt(item.qty),
          sumber: "PEMBELIAN"
        }
      });

      console.log("LOG STOK BERHASIL");

      // --- PERUBAHAN BARU DISINI ---
      if (parseFloat(item.harga_jual) > 0) {
        await tx.produk.update({
          where: {
            id_produk: produk.id_produk
          },
          data: {
            harga_jual: parseFloat(item.harga_jual)
          }
        });
        console.log("HARGA JUAL PRODUK BERHASIL DIUPDATE");
      }
      // -----------------------------
    }

    return pembelian;
  });

  return result;
};