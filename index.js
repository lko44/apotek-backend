const express = require("express")
const prisma = require("./src/lib/prisma")
const authRoutes = require("./src/routes/authRoutes")
const produkRoutes = require("./src/routes/produkRoutes")
const kategoriRoutes = require("./src/routes/kategoriRoutes")
const supplierRoutes = require("./src/routes/supplierRoutes")
const pembelianRoutes = require("./src/routes/pembelianRoutes")
const transaksiRoutes = require("./src/routes/transaksiRoutes")
const batchRoutes = require("./src/routes/batchRoutes")

const app = express()

app.use(express.json())

app.get("/", (req,res)=>{
    res.json({message:"API Apotek Running"})
})

app.use("/auth",authRoutes)
app.use("/produk",produkRoutes)
app.use("/kategori",kategoriRoutes)
app.use("/supplier",supplierRoutes)
app.use("/pembelian",pembelianRoutes)
app.use("/transaksi",transaksiRoutes)
app.use("/batch",batchRoutes)

app.listen(3000, ()=>{
    console.log("Server running on port 3000")
})