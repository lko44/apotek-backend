const express = require('express');
const router = express.Router();
const pembelianController = require('../controllers/pembelianController');
const auth = require("../middleware/authMiddleware")
console.log("Cek Controller:", pembelianController);

router.post("/", pembelianController.createPembelian)
router.get("/", pembelianController.getPembelian)
router.get("/:id", pembelianController.getPembelianById)

module.exports = router;