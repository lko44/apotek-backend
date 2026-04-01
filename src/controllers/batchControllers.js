const prisma = require("../lib/prisma")

exports.getBatchHampirExpired = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'STAFF') {
      return res.status(403).json({ message: "Akses ditolak. Bukan area kamu!" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const batas = new Date();
    batas.setDate(today.getDate() + 30);

    const batch = await prisma.batchProduk.findMany({
      where: {
        expired_date: {
          gte: today, 
          lte: batas  
        },
        qty_sisa: {
          gt: 0 
        }
      },
      include: {
        produk: {
          select: {
            nama_produk: true,
            barcode: true,
            satuan: true 
          }
        }
      },
      orderBy: {
        expired_date: "asc" 
      }
    });

    if (batch.length === 0) {
      return res.status(200).json({ 
        message: "Aman, Bos! Gak ada obat yang mau expired dalam 30 hari.",
        data: [] 
      });
    }

    res.json({
      status: "success",
      total: batch.length,
      data: batch
    });

  } catch (error) {
    console.error("BATCH_EXPIRED_ERROR:", error); 
    res.status(500).json({
      error: "Gagal mengambil data batch.",
      message: "Terjadi kesalahan pada server internal." 
    });
  }
};