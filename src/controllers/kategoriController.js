const prisma = require("../lib/prisma")

exports.getKategori = async (req,res)=>{

    const data = await prisma.kategori.findMany()

    res.json(data)

}

exports.createKategori = async (req,res)=>{

    const {nama_kategori} = req.body

    const kategori = await prisma.kategori.create({
        data:{
            nama_kategori
        }
    })

    res.json(kategori)

}