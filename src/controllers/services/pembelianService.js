const prisma = require("../../lib/prisma");

exports.createPembelian = async (data) => {
  const {
    id_supplier,
    id_user,
    no_faktur,
    tanggal_faktur,
    status,
    items,
    nilai_ppn,
    jenis_ppn,
    cashback,
    jenis_pembayaran,
    akun_kas,
    no_surat_pesanan,
    catatan
  } = data;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw { status: 400, message: "Data items pembelian tidak boleh kosong." };
  }

  // 1. Validasi & Normalisasi Status Enum
  const validStatusEnum = ["LUNAS", "BELUM_DIBAYAR", "DIKEMBALIKAN"];
  let finalStatus = "LUNAS";
  if (status && validStatusEnum.includes(String(status).toUpperCase())) {
    finalStatus = String(status).toUpperCase();
  }

  // 2. Logika PPN & Cashback
  const validJenisPpn = ["non_ppn", "sudah_termasuk", "tambah_ppn"];
  const jenisPpnFinal = validJenisPpn.includes(jenis_ppn)
    ? jenis_ppn
    : "tambah_ppn";

  const nilaiPpnFinal = Number.isFinite(Number(nilai_ppn))
    ? Number(nilai_ppn)
    : 11;

  const cashbackFinal = Number(cashback) || 0;

  // 3. Pre-fetch Produk
  const produkMap = new Map();

  for (const item of items) {
    let produk;

    if (item.barcode) {
      produk = await prisma.produk.findFirst({
        where: {
          barcode: String(item.barcode)
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

    const key = item.barcode
      ? `bc_${item.barcode}`
      : `id_${item.id_produk}`;

    produkMap.set(key, produk);
  }

  // 4. Eksekusi Transaksi Database
  const result = await prisma.$transaction(async (tx) => {
    let subtotalPembelian = 0;

    const itemsWithSubtotal = items.map((item) => {
      const parsedQty = parseInt(item.qty);
      const parsedHarga = parseFloat(item.harga_beli);
      const parsedHargaJual = parseFloat(item.harga_jual);

      const diskonTipe =
        item.diskon_tipe === "%" || item.diskon_tipe === "Rp"
          ? item.diskon_tipe
          : "%";

      const diskonInput = Number(item.diskon) || 0;

      if (isNaN(parsedQty) || parsedQty <= 0) {
        throw {
          status: 400,
          message: `Kuantitas (qty) untuk item ${item.barcode || item.id_produk} tidak valid.`
        };
      }

      if (isNaN(parsedHarga) || parsedHarga < 0) {
        throw {
          status: 400,
          message: `Harga beli untuk item ${item.barcode || item.id_produk} tidak valid.`
        };
      }

      if (isNaN(parsedHargaJual) || parsedHargaJual < 0) {
        throw {
          status: 400,
          message: `Harga jual untuk item ${item.barcode || item.id_produk} tidak valid.`
        };
      }

      // Hitung Diskon per Unit
      const diskonPerUnit =
        diskonTipe === "%"
          ? parsedHarga * (diskonInput / 100)
          : diskonInput;

      // Harga Setelah Diskon
      const hargaSetelahDiskon = Math.max(parsedHarga - diskonPerUnit, 0);

      // Subtotal Item
      const subtotalItem = hargaSetelahDiskon * parsedQty;

      subtotalPembelian += subtotalItem;

      return {
        ...item,
        parsedQty,
        parsedHarga,
        diskonInput,
        diskonTipe,
        subtotalItem
      };
    });

    // PPN Nominal
    const ppnNominal =
      jenisPpnFinal === "tambah_ppn"
        ? subtotalPembelian * (nilaiPpnFinal / 100)
        : 0;

    // Total Akhir
    const totalAkhir = subtotalPembelian + ppnNominal - cashbackFinal;

    // Build Payload Pembelian Secara Aman
    const pembelianPayload = {
      supplier: {
        connect: {
          id_supplier: parseInt(id_supplier)
        }
      },
      user: {
        connect: {
          id_user: parseInt(id_user)
        }
      },
      no_faktur,
      tanggal_faktur: new Date(tanggal_faktur),
      total: totalAkhir,
      status: finalStatus,
      subtotal: subtotalPembelian,
      nilai_ppn: nilaiPpnFinal,
      jenis_ppn: jenisPpnFinal,
      cashback: cashbackFinal,
      pembeliandetail: {
        create: itemsWithSubtotal.map((item) => {
          const key = item.barcode
            ? `bc_${item.barcode}`
            : `id_${item.id_produk}`;

          const produk = produkMap.get(key);

          const detailObj = {
            qty: item.parsedQty,
            harga_beli: item.parsedHarga,
            diskon: item.diskonInput,
            diskon_tipe: item.diskonTipe,
            subtotal: item.subtotalItem,
            id_produk: produk.id_produk
          };

          return detailObj;
        })
      }
    };

    // Sertakan opsi opsional jika adaisinya
    if (jenis_pembayaran) pembelianPayload.jenis_pembayaran = jenis_pembayaran;
    if (akun_kas) pembelianPayload.akun_kas = akun_kas;
    if (no_surat_pesanan) pembelianPayload.no_surat_pesanan = no_surat_pesanan;
    if (catatan) pembelianPayload.catatan = catatan;

    // Insert data Pembelian + PembelianDetail
    const pembelian = await tx.pembelian.create({
      data: pembelianPayload,
      include: {
        pembeliandetail: true
      }
    });

    // Loop untuk BatchProduk, LogStok, dan Update Harga Jual
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      const key = item.barcode
        ? `bc_${item.barcode}`
        : `id_${item.id_produk}`;

      const produk = produkMap.get(key);

      const detail = pembelian.pembeliandetail.find(
        (d) => d.id_produk === produk.id_produk
      );

      const expDate = item.expired_date
        ? new Date(item.expired_date)
        : new Date();

      // Build Batch Payload Secara Aman
      const batchPayload = {
        id_produk: produk.id_produk,
        id_pembelian: pembelian.id_pembelian,
        expired_date: expDate,
        qty_masuk: parseInt(item.qty),
        qty_sisa: parseInt(item.qty)
      };

      if (detail && detail.id_pembelian_detail) {
        batchPayload.id_pembelian_detail = detail.id_pembelian_detail;
      }
      batchPayload.no_batch = `BATCH-${Date.now()}-${i}`;

      await tx.batchproduk.create({
        data: batchPayload
      });

      // Insert Log Stok
      await tx.logstok.create({
        data: {
          id_produk: produk.id_produk,
          tipe: "MASUK",
          qty: parseInt(item.qty),
          sumber: "PEMBELIAN"
        }
      });

      // Update harga jual produk jika diberikan
      if (parseFloat(item.harga_jual) > 0) {
        await tx.produk.update({
          where: {
            id_produk: produk.id_produk
          },
          data: {
            harga_jual: parseFloat(item.harga_jual)
          }
        });
      }
    }

    return pembelian;
  });

  return result;
};