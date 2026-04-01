const express = require("express")
const router = express.Router()
const produk = require("../controllers/produkController")
const auth = require("../middleware/authMiddleware")

/**
 * @openapi
 * /api/v1/produk:
 *   get:
 *     tags: [Produk]
 *     summary: Mendapatkan semua produk obat
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data produk berhasil diambil
 */
router.get("/", auth, produk.getProduk)

/**
 * @openapi
 * /api/v1/produk/stok-menipis:
 *   get:
 *     tags: [Produk]
 *     summary: Mendapatkan produk dengan stok menipis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data stok menipis berhasil diambil
 */
router.get("/stok-menipis", auth, produk.getStokMenipis)

/**
 * @openapi
 * /api/v1/produk/barcode/{barcode}:
 *   get:
 *     tags: [Produk]
 *     summary: Mendapatkan produk berdasarkan barcode
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: barcode
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 8999990001234
 *     responses:
 *       200:
 *         description: Produk ditemukan
 */
router.get("/barcode/:barcode", auth, produk.getProdukByBarcode)

/**
 * @openapi
 * /api/v1/produk/{id}:
 *   get:
 *     tags: [Produk]
 *     summary: Mendapatkan produk berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Produk berhasil ditemukan
 */
router.get('/:id', auth, produk.getProdukById)

/**
 * @openapi
 * /api/v1/produk/{barcode}/stok:
 *   get:
 *     tags: [Produk]
 *     summary: Mendapatkan stok produk berdasarkan barcode
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: barcode
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 8999990001234
 *     responses:
 *       200:
 *         description: Stok produk berhasil diambil
 */
router.get("/:barcode/stok", auth, produk.getStokProduk)

/**
 * @openapi
 * /api/v1/produk:
 *   post:
 *     tags: [Produk]
 *     summary: Menambahkan produk obat baru
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_produk:
 *                 type: string
 *                 example: Paracetamol
 *               barcode:
 *                 type: string
 *                 example: 8999990001234
 *               harga:
 *                 type: number
 *                 example: 5000
 *               stok:
 *                 type: integer
 *                 example: 100
 *               kategori_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Produk berhasil ditambahkan
 */
router.post("/", auth, produk.createProduk)

/**
 * @openapi
 * /api/v1/produk/{id}:
 *   put:
 *     tags: [Produk]
 *     summary: Mengupdate produk
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Produk berhasil diperbarui
 */
router.put("/:id", auth, produk.updateProduk)

/**
 * @openapi
 * /api/v1/produk/{id}:
 *   delete:
 *     tags: [Produk]
 *     summary: Menghapus produk
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Produk berhasil dihapus
 */
router.delete("/:id", auth, produk.deleteProduk)

module.exports = router