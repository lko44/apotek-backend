const express = require("express")
const router = express.Router()
const auth = require("../middleware/authMiddleware")
const { requireActiveShift } = require("../middleware/shiftMiddleware")
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
 *                 enum: [TUNAI, QRIS, TRANSFER]
 *                 example: TUNAI
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
 *                       example: "8999990001234"
 *                     qty:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Transaksi berhasil dibuat
 *       400:
 *         description: Data transaksi tidak valid
 */
router.post("/", auth, requireActiveShift, transaksiController.createTransaksi)

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
 *         description: Berhasil mengambil semua transaksi
 *       500:
 *         description: Gagal mengambil data transaksi
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
 *         description: ID transaksi
 *     responses:
 *       200:
 *         description: Detail transaksi berhasil diambil
 *       404:
 *         description: Transaksi tidak ditemukan
 *       500:
 *         description: Gagal mengambil detail transaksi
 */
router.get("/:id", auth, transaksiController.getDetailTransaksi)

/**
 * @openapi
 * /api/v1/transaksi/{id}/batal:
 *   put:
 *     tags: [Transaksi]
 *     summary: Membatalkan transaksi
 *     description: Membatalkan transaksi, mengembalikan stok ke batch yang digunakan, dan hanya dapat dilakukan oleh Admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 22
 *         description: ID transaksi yang ingin dibatalkan
 *     responses:
 *       200:
 *         description: Transaksi berhasil dibatalkan dan stok dikembalikan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Transaksi berhasil dibatalkan dan stok telah dikembalikan.
 *       400:
 *         description: Transaksi sudah dibatalkan atau ID tidak valid
 *       403:
 *         description: Akses ditolak karena hanya Admin yang dapat membatalkan transaksi
 *       404:
 *         description: Transaksi tidak ditemukan
 *       500:
 *         description: Gagal membatalkan transaksi
 */
router.put("/:id/batal", auth, transaksiController.batalkanTransaksi)

module.exports = router