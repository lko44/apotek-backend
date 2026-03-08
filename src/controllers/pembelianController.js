const prisma = require("../lib/prisma");
const pembelianService = require("../controllers/services/pembelianService");

exports.createPembelian = async (req, res) => {

    try {

        const result = await pembelianService.createPembelian(req.body)

        res.status(201).json(result)

    } catch (err) {

        res.status(err.status || 500).json({
            message: err.message || "Internal Server Error"
        })

    }

}
exports.getPembelian = async (req, res) => {
  try {
    const data = await prisma.pembelian.findMany({
      include: {
        supplier: true,
        pembelian_detail: {
          include: {
            produk: true
          }
        }
      },
      orderBy: {
        tanggal_faktur: "desc"
      }
    })

    res.json(data)
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    })
  }
}
exports.getPembelianById = async (req, res) => {
  try {

    const { id } = req.params

    const pembelian = await prisma.pembelian.findUnique({
      where: {
        id_pembelian: parseInt(id)
      },
      include: {
        supplier: true,
        pembelian_detail: {
          include: {
            produk: true
          }
        }
      }
    })

    if (!pembelian) {
      return res.status(404).json({
        message: "Pembelian tidak ditemukan"
      })
    }

    res.json(pembelian)

  } catch (error) {

    res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    })

  }
}