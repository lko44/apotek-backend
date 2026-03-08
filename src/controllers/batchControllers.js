const prisma = require("../lib/prisma")

exports.getBatchHampirExpired = async (req, res) => {
  try {

    const today = new Date()

    const batas = new Date()
    batas.setDate(today.getDate() + 30)

    const batch = await prisma.batchProduk.findMany({
      where: {
        expired_date: {
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
            barcode: true
          }
        }
      },
      orderBy: {
        expired_date: "asc"
      }
    })

    res.json(batch)

  } catch (error) {
    res.status(500).json({
      error: "Gagal mengambil batch hampir expired",
      message: error.message
    })
  }
}