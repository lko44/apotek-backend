const express = require("express")
const router = express.Router()
const produk = require("../controllers/produkController")
const auth = require("../middleware/authMiddleware")
/**
 * @openapi
 * /api/v1/produk:
 *   get:
 *     tags: [Produk]
 *     summary: Ambil semua produk (pagination + search)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: para
 *     responses:
 *       200:
 *         description: Berhasil ambil produk
 */
router.get("/", auth, produk.getProduk)
/**
 * @openapi
 * /api/v1/produk/search:
 *   get:
 *     tags: [Produk]
 *     summary: Search produk berdasarkan nama / barcode
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           example: para
 *     responses:
 *       200:
 *         description: Hasil pencarian produk
 */
router.get("/search", auth, produk.searchProduk)
/**
 * @openapi
 * /api/v1/produk/barcode/{barcode}:
 *   get:
 *     tags: [Produk]
 *     summary: Ambil produk berdasarkan barcode
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *           example: 8999990001234
 *     responses:
 *       200:
 *         description: Produk ditemukan
 *       404:
 *         description: Produk tidak ditemukan
 */
router.get("/barcode/:barcode", auth, produk.getProdukByBarcode)
/**
 * @openapi
 * /api/v1/produk/stok-menipis:
 *   get:
 *     tags: [Produk]
 *     summary: Ambil produk dengan stok di bawah minimum
 *     responses:
 *       200:
 *         description: Data stok menipis
 */
router.get("/stok-menipis", auth, produk.getStokMenipis)
/**
 * @openapi
 * /api/v1/produk/{id}:
 *   get:
 *     tags: [Produk]
 *     summary: Ambil produk berdasarkan ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Produk ditemukan
 *       404:
 *         description: Produk tidak ditemukan
 */
router.get("/:id", auth, produk.getProdukById)
module.exports = router