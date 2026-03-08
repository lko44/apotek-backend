const express = require("express")
const router = express.Router()

const kategori = require("../controllers/kategoriController")
const auth = require("../middleware/authMiddleware")

router.get("/",auth,kategori.getKategori)
router.post("/",auth,kategori.createKategori)

module.exports = router