const express = require("express")
const router = express.Router()
const auth = require("../middleware/authMiddleware")
const transaksiController = require("../controllers/transaksiController")

/**
 * @openapi
 * /api/v1/transaksi:
 *   post:
 *     tags: [Transaksi]
 *     summary: Membuat transaksi penjualan
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - metode_bayar
 *               - items
 *             properties:
 *               metode_bayar:
 *                 type: string
 *                 enum: [CASH, QRIS, TRANSFER]
 *                 example: CASH
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - barcode
 *                     - qty
 *                   properties:
 *                     barcode:
 *                       type: string
 *                       example: 8999990001234
 *                     qty:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Transaksi berhasil dibuat
 *       400:
 *         description: Data transaksi tidak valid
 */
router.post("/", auth, transaksiController.createTransaksi)

/**
 * @openapi
 * /api/v1/transaksi:
 *   get:
 *     tags: [Transaksi]
 *     summary: Mendapatkan semua transaksi
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data transaksi
 */
router.get("/", auth, transaksiController.getAllTransaksi)

/**
 * @openapi
 * /api/v1/transaksi/{id}:
 *   get:
 *     tags: [Transaksi]
 *     summary: Mendapatkan detail transaksi berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Detail transaksi berhasil diambil
 *       404:
 *         description: Transaksi tidak ditemukan
 */
router.get("/:id", auth, transaksiController.getDetailTransaksi)

module.exports = router