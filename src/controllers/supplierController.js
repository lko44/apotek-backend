const prisma = require("../lib/prisma")

// GET semua supplier
exports.getSupplier = async (req, res) => {
  try {
    const data = await prisma.supplier.findMany({
      orderBy: { nama_supplier: "asc" }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data supplier" });
  }
};

// GET supplier by id
exports.getSupplierById = async (req,res)=>{
  const {id} = req.params

  const supplier = await prisma.supplier.findUnique({
    where:{
      id_supplier: parseInt(id)
    }
  })

  if(!supplier){
    return res.status(404).json({message:"Supplier tidak ditemukan"})
  }

  res.json(supplier)
}

// CREATE supplier
exports.createSupplier = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: "Akses ditolak" });

    const { nama_supplier, email, telepon, alamat } = req.body;

    if (!nama_supplier || !email) {
      return res.status(400).json({ message: "Nama dan Email wajib diisi!" });
    }

    // Cek email duplikat
    const existing = await prisma.supplier.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email supplier sudah terdaftar" });

    const supplier = await prisma.supplier.create({
      data: { nama_supplier, email, telepon, alamat }
    });

    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: "Gagal membuat supplier" });
  }
};

// UPDATE supplier
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_supplier, email, telepon, alamat } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id_supplier: parseInt(id) },
      data: {
        nama_supplier, 
        email, 
        telepon, 
        alamat
      }
    });

    res.json({ message: "Update berhasil", data: supplier });
  } catch (error) {
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
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        message: "Gagal menghapus! Supplier ini sudah memiliki riwayat transaksi." 
      });
    }
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};