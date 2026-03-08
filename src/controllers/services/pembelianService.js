const prisma = require("../../lib/prisma")

exports.createPembelian = async (data) => {

  const { id_supplier, id_user, no_faktur, tanggal_faktur, status, items } = data

  const barcodes = items.map(i => i.barcode)

  const produkExists = await prisma.produk.findMany({
    where: { barcode: { in: barcodes } }
  })

  if (produkExists.length !== items.length) {

    const foundBarcodes = produkExists.map(p => p.barcode)
    const missing = barcodes.filter(b => !foundBarcodes.includes(b))

    throw {
      status:400,
      message:`Barcode berikut belum terdaftar: ${missing.join(", ")}`
    }

  }

  const result = await prisma.$transaction(async (tx)=>{

    let total = 0
    items.forEach(item => total += item.jumlah * item.harga_beli)

    const pembelian = await tx.pembelian.create({
      data:{
        supplier:{connect:{id_supplier:parseInt(id_supplier)}},
        user:{connect:{id_user:parseInt(id_user)}},
        no_faktur,
        tanggal_faktur:new Date(tanggal_faktur),
        total,
        status,
        pembelian_detail:{
          create:items.map(item=>({
            qty:parseInt(item.jumlah),
            harga_beli:parseFloat(item.harga_beli),
            produk:{connect:{barcode:item.barcode}}
          }))
        }
      },
      include:{pembelian_detail:true}
    })

    for(const item of items){

      const produk = produkExists.find(p=>p.barcode===item.barcode)

      await tx.batchProduk.create({
        data:{
          id_produk:produk.id_produk,
          id_pembelian:pembelian.id_pembelian,
          expired_date:new Date(item.expired_date),
          qty_masuk:parseInt(item.jumlah),
          qty_sisa:parseInt(item.jumlah)
        }
      })

      await tx.logStok.create({
        data:{
          id_produk:produk.id_produk,
          tipe:"MASUK",
          qty:parseInt(item.jumlah),
          sumber:"PEMBELIAN"
        }
      })

    }

    return pembelian

  })

  return result

}