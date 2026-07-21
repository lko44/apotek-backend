const prisma = require("../lib/prisma");

// GET semua supplier
exports.getSupplier = async (req, res) => {
  try {
    const data = await prisma.supplier.findMany({
      orderBy: { nama_supplier: "asc" }
    });
    res.json(data);
  } catch (error) {
    console.error("GET_SUPPLIER_ERROR:", error);
    res.status(500).json({ error: "Gagal mengambil data supplier" });
  }
};

// GET supplier by id
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID Supplier harus berupa angka!" });
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id_supplier: parseInt(id) }
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier tidak ditemukan" });
    }

    res.json(supplier);
  } catch (error) {
    console.error("GET_SUPPLIER_BY_ID_ERROR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// CREATE supplier
exports.createSupplier = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Akses ditolak! Hanya Admin yang diizinkan."
      });
    }

    const { nama_supplier, email, telepon, alamat } = req.body;

    if (!nama_supplier || !email) {
      return res.status(400).json({
        message: "Nama dan Email wajib diisi!"
      });
    }

    const supplier = await prisma.supplier.create({
      data: {
        nama_supplier,
        email,
        telepon,
        alamat
      }
    });

    return res.status(201).json(supplier);

  } catch (error) {
    console.error(error);

    if (error.code === "P2002") {
      return res.status(400).json({
        message: "Email supplier sudah terdaftar."
      });
    }

    return res.status(500).json({
      message: "Gagal membuat supplier."
    });
  }
};
// UPDATE supplier
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_supplier, email, telepon, alamat } = req.body;

    // Pastikan cek duplikat email juga saat update jika email diubah
    const supplier = await prisma.supplier.update({
      where: { id_supplier: parseInt(id) },
      data: { nama_supplier, email, telepon, alamat }
    });

    res.json({ message: "Update berhasil", data: supplier });
  } catch (error) {
    console.error("UPDATE_SUPPLIER_ERROR:", error);
    res.status(500).json({ error: "Gagal update. Pastikan ID benar dan email tidak duplikat." });
  }
};

// DELETE supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.supplier.delete({
      where: { id_supplier: parseInt(id) }
    });

    res.json({ message: "Supplier berhasil dihapus secara permanen" });
  } catch (error) {
    console.error("DELETE_SUPPLIER_ERROR:", error);
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        message: "Gagal menghapus! Supplier ini sudah memiliki riwayat transaksi/pembelian." 
      });
    }
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};