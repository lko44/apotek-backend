const express = require("express")
const router = express.Router()

const transaksiController = require("../controllers/transaksiController")

/**
 * @openapi
 * /api/v1/transaksi:
 *   post:
 *     tags: [Transaksi]
 *     summary: Membuat transaksi penjualan obat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tanggal:
 *                 type: string
 *                 example: 2026-03-14
 *               total:
 *                 type: number
 *                 example: 15000
 *               metode_bayar:
 *                 type: string
 *                 example: cash
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     produk_id:
 *                       type: integer
 *                       example: 1
 *                     qty:
 *                       type: integer
 *                       example: 2
 *                     harga:
 *                       type: number
 *                       example: 5000
 *     responses:
 *       201:
 *         description: Transaksi berhasil dibuat
 */
router.post("/", transaksiController.createTransaksi)

/**
 * @openapi
 * /api/v1/transaksi:
 *   get:
 *     tags: [Transaksi]
 *     summary: Mendapatkan semua transaksi
 *     responses:
 *       200:
 *         description: Data transaksi berhasil diambil
 */
router.get("/", transaksiController.getAllTransaksi)

/**
 * @openapi
 * /api/v1/transaksi/{id}:
 *   get:
 *     tags: [Transaksi]
 *     summary: Mendapatkan detail transaksi berdasarkan ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Detail transaksi berhasil diambil
 */
router.get("/:id", transaksiController.getDetailTransaksi)

module.exports = router