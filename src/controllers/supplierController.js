const prisma = require("../lib/prisma")

// GET semua supplier
exports.getSupplier = async (req,res)=>{
  const data = await prisma.supplier.findMany()
  res.json(data)
}

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
exports.createSupplier = async (req,res)=>{

  const {nama_supplier,email,telepon,alamat} = req.body

  const supplier = await prisma.supplier.create({
    data:{
      nama_supplier,
      email,
      telepon,
      alamat
    }
  })

  res.json(supplier)
}

// UPDATE supplier
exports.updateSupplier = async (req,res)=>{

  const {id} = req.params

  const supplier = await prisma.supplier.update({
    where:{
      id_supplier: parseInt(id)
    },
    data:req.body
  })

  res.json(supplier)
}

// DELETE supplier
exports.deleteSupplier = async (req,res)=>{

  const {id} = req.params

  await prisma.supplier.delete({
    where:{
      id_supplier: parseInt(id)
    }
  })

  res.json({
    message:"Supplier berhasil dihapus"
  })

}