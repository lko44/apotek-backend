const prisma = require("../lib/prisma")

exports.getProduk = async (req, res) => {

    const produk = await prisma.produk.findMany({
        include: {
            kategori: true
        }
    })

    res.json(produk)

}
exports.getProdukById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "ID tidak ditemukan di parameter" });
        }

        const idAngka = parseInt(id);

        if (isNaN(idAngka)) {
            return res.status(400).json({ error: "ID harus berupa angka" });
        }

        const produk = await prisma.produk.findUnique({
            where: {
                id_produk: idAngka 
            }
        });

        if (!produk) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }

        res.json(produk);

    } catch (error) {
        res.status(500).json({
            error: "Gagal mengambil data produk",
            message: error.message
        });
    }
};
exports.createProduk = async (req, res) => {
    try {
        const {
            nama_produk,
            barcode,
            id_kategori,
            satuan,
            stok_minimum,
            harga_jual
        } = req.body

        const produk = await prisma.produk.create({
            data: {
                nama_produk,
                barcode,
                id_kategori: parseInt(id_kategori),
                satuan,
                stok_minimum: parseInt(stok_minimum),
                harga_jual: parseFloat(harga_jual)
            }
        })

        res.status(201).json(produk)
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).json({
                error: "Kategori ID tidak ditemukan atau tidak valid."
            })
        }

        console.error(error)
        res.status(500).json({ error: "Terjadi kesalahan pada server." })
    }
}
exports.updateProduk = async (req, res) => {

    const { id } = req.params

    const produk = await prisma.produk.update({
        where: {
            id_produk: parseInt(id)
        },
        data: req.body
    })

    res.json(produk)

}
exports.deleteProduk = async (req, res) => {

    const { id } = req.params

    await prisma.produk.update({
        where: {
            id_produk: parseInt(id)
        },
        data: {
            is_active: false
        }
    })

    res.json({
        message: "Produk dinonaktifkan"
    })

}
exports.getProdukByBarcode = async (req, res) => {

    const { barcode } = req.params

    const produk = await prisma.produk.findUnique({
        where: {
            barcode: barcode
        },
        include: {
            kategori: true
        }
    })

    if (!produk) {
        return res.status(404).json({
            message: "Produk tidak ditemukan"
        })
    }

    res.json(produk)

}
exports.getStokProduk = async (req, res) => {
    try {

        const { barcode } = req.params

        const produk = await prisma.produk.findUnique({
            where: { barcode }
        })

        if (!produk) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            })
        }

        const stok = await prisma.batchProduk.aggregate({
            where: {
                id_produk: produk.id_produk
            },
            _sum: {
                qty_sisa: true
            }
        })

        res.json({
            barcode: produk.barcode,
            nama_produk: produk.nama_produk,
            harga_jual: produk.harga_jual,
            stok: stok._sum.qty_sisa || 0
        })

    } catch (error) {
        res.status(500).json({
            error: "Gagal mengambil stok produk",
            message: error.message
        })
    }
}
exports.getStokMenipis = async (req, res) => {
  try {

    const data = await prisma.batchProduk.groupBy({
      by: ["id_produk"],
      _sum: {
        qty_sisa: true
      }
    })

    const stokMenipis = data.filter(d => d._sum.qty_sisa < 10)

    const produkIds = stokMenipis.map(d => d.id_produk)

    const produk = await prisma.produk.findMany({
      where: {
        id_produk: {
          in: produkIds
        }
      }
    })

    const result = produk.map(p => {
      const stok = stokMenipis.find(s => s.id_produk === p.id_produk)

      return {
        id_produk: p.id_produk,
        nama_produk: p.nama_produk,
        barcode: p.barcode,
        stok: stok._sum.qty_sisa
      }
    })

    res.json(result)

  } catch (error) {
    res.status(500).json({
      error: "Gagal mengambil stok menipis",
      message: error.message
    })
  }
}