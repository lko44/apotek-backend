const prisma = require("../lib/prisma");

exports.getKategori = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.kategori.findMany({
        where: { is_active: true },
        orderBy: { id_kategori: "asc" },
        skip,
        take: limit,
        select: {
          id_kategori: true,
          nama_kategori: true,
          _count: {
            select: { produk: true }
          }
        }
      }),
      prisma.kategori.count({
        where: { is_active: true }
      })
    ]);

    res.json({
      message: "Berhasil ambil kategori",
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({
      error: "Gagal ambil data kategori",
      detail: error.message
    });
  }
};

exports.createKategori = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Cuma Admin yang bisa nambah kategori!" });
    }

    const { nama_kategori } = req.body;

    if (!nama_kategori?.trim()) {
      return res.status(400).json({ message: "Nama kategori gak boleh kosong" });
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
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Kategori sudah ada!" });
    }

    res.status(500).json({ error: "Gagal membuat kategori" });
  }
};

exports.updateKategori = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Cuma Admin yang bisa edit kategori!" });
    }

    const { id } = req.params;
    const { nama_kategori } = req.body;

    if (!nama_kategori?.trim()) {
      return res.status(400).json({ message: "Nama kategori gak boleh kosong" });
    }

    const kategori = await prisma.kategori.update({
      where: { id_kategori: Number(id) },
      data: { nama_kategori: nama_kategori.trim() }
    });

    res.json({
      message: "Kategori berhasil diupdate",
      data: kategori
    });

  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    if (error.code === "P2002") {
      return res.status(400).json({ message: "Nama kategori sudah dipakai" });
    }

    res.status(500).json({ error: "Gagal update kategori" });
  }
};