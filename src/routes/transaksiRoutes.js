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
 *     description: Membuat transaksi dengan validasi shift aktif, mendukung single payment maupun split payment, serta otomatis mengurangi stok menggunakan metode FEFO.
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
 *                 type: array
 *                 description: Daftar pembayaran. Total seluruh nominal harus sama dengan total transaksi.
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - jenis
 *                     - nominal
 *                   properties:
 *                     jenis:
 *                       type: string
 *                       enum:
 *                         - TUNAI
 *                         - QRIS
 *                         - TRANSFER
 *                       example: TUNAI
 *                     nominal:
 *                       type: number
 *                       format: double
 *                       example: 50000
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - barcode
 *                     - qty
 *                   properties:
 *                     barcode:
 *                       type: string
 *                       example: "8999999008840"
 *                     produk_id:
 *                       type: integer
 *                       example: 2103
 *                     qty:
 *                       type: integer
 *                       minimum: 1
 *                       example: 1
 *           examples:
 *             singlePayment:
 *               summary: Single payment
 *               value:
 *                 metode_bayar:
 *                   - jenis: TUNAI
 *                     nominal: 64500
 *                 items:
 *                   - barcode: "8999999008840"
 *                     qty: 1
 *             splitPayment:
 *               summary: Split payment
 *               value:
 *                 metode_bayar:
 *                   - jenis: TUNAI
 *                     nominal: 30000
 *                   - jenis: QRIS
 *                     nominal: 34500
 *                 items:
 *                   - barcode: "8999999008840"
 *                     qty: 1
 *     responses:
 *       201:
 *         description: Transaksi berhasil dibuat
 *       400:
 *         description: Data transaksi tidak valid atau total pembayaran tidak sesuai total transaksi
 *       403:
 *         description: Tidak memiliki shift aktif
 *       500:
 *         description: Gagal memproses transaksi
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