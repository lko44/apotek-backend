const prisma = require("../lib/prisma");

exports.getKategori = async (req, res) => {
  try {
    const data = await prisma.kategori.findMany({
      orderBy: { nama_kategori: "asc" } 
    });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Gagal ambil data kategori" });
  }
};

exports.createKategori = async (req, res) => {
  try {
    // 1. Cek Role (Harus Admin)
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: "Cuma Admin yang bisa nambah kategori!" });
    }

    const { nama_kategori } = req.body;

    if (!nama_kategori || nama_kategori.trim() === "") {
      return res.status(400).json({ message: "Nama kategori gak boleh kosong" });
    }

    const existingKategori = await prisma.kategori.findFirst({
      where: { 
        nama_kategori: {
          equals: nama_kategori.trim(),
        }
      }
    });

    if (existingKategori) {
      return res.status(400).json({ message: "Kategori ini sudah ada!" });
    }

    const kategori = await prisma.kategori.create({
      data: {
        nama_kategori: nama_kategori.trim()
      }
    });

    res.status(201).json({
      message: "Kategori berhasil dibuat",
      data: kategori
    });

  } catch (error) {
    console.error("CREATE_KATEGORI_ERROR:", error);
    res.status(500).json({ error: "Gagal membuat kategori" });
  }
};