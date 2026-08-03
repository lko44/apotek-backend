const express = require("express")
const router = express.Router()
const auth = require("../middleware/authMiddleware")
const transaksiController = require("../controllers/transaksiController")

/**
 * @openapi
 * /api/v1/transaksi/{id}/batal:
 *   put:
 *     tags: [Transaksi]
 *     summary: Membatalkan transaksi
 *     description: Membatalkan transaksi dan mengembalikan stok ke batch yang digunakan. Hanya Admin yang dapat membatalkan transaksi.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
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
 *         description: Transaksi sudah dibatalkan sebelumnya atau data tidak valid
 *       403:
 *         description: Akses ditolak karena hanya Admin yang dapat membatalkan transaksi
 *       404:
 *         description: Transaksi tidak ditemukan
 *       500:
 *         description: Gagal membatalkan transaksi
 */
router.put("/:id/batal", auth, transaksiController.batalkanTransaksi)

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
 */
router.get("/:id", auth, transaksiController.getDetailTransaksi)

module.exports = router