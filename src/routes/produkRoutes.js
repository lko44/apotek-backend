const express = require("express")
const router = express.Router()
const produk = require("../controllers/produkController")
const auth = require("../middleware/authMiddleware")

router.get("/", auth, produk.getProduk)
router.get("/stok-menipis", auth, produk.getStokMenipis)

router.get("/barcode/:barcode", auth, produk.getProdukByBarcode)

router.get('/:id', auth, produk.getProdukById);
router.get("/:barcode/stok", auth, produk.getStokProduk) 

router.post("/", auth, produk.createProduk)
router.put("/:id", auth, produk.updateProduk)
router.delete("/:id", auth, produk.deleteProduk)

module.exports = router