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
 *     summary: Membuat transaksi penjualan (mendukung split payment)
 *     description: |
 *       Membuat transaksi penjualan. Kasir WAJIB memiliki shift berstatus OPEN,
 *       jika tidak request akan ditolak dengan status 403.
 *       Transaksi otomatis diasosiasikan dengan shift aktif milik user tersebut.
 *       Total seluruh `nominal` pada `metode_bayar` harus sama persis dengan grand total transaksi.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [metode_bayar, items]
 *             properties:
 *               metode_bayar:
 *                 type: array
 *                 description: Daftar pembayaran; bisa lebih dari satu untuk split payment
 *                 items:
 *                   type: object
 *                   required: [jenis, nominal]
 *                   properties:
 *                     jenis: { type: string, enum: [TUNAI, QRIS, TRANSFER], example: TUNAI }
 *                     nominal: { type: number, example: 7500 }
 *                 example:
 *                   - { jenis: TUNAI, nominal: 7500 }
 *                   - { jenis: QRIS, nominal: 11000 }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [qty]
 *                   properties:
 *                     barcode: { type: string, example: "0304091804812009" }
 *                     produk_id: { type: integer, example: 1 }
 *                     qty: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Transaksi berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Transaksi berhasil }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_transaksi: { type: integer, example: 102 }
 *                     no_transaksi: { type: string, example: "TRX-1788444865742" }
 *                     status: { type: string, enum: [SELESAI, DIBATALKAN] }
 *                     total: { type: string, example: "18500" }
 *                     id_shift: { type: integer, example: 8 }
 *                     pembayaran:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_pembayaran: { type: integer, example: 1 }
 *                           id_transaksi: { type: integer, example: 102 }
 *                           jenis: { type: string, enum: [TUNAI, QRIS, TRANSFER] }
 *                           nominal: { type: string, example: "7500" }
 *                     transaksidetail:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Data tidak valid, stok kurang, atau total pembayaran tidak sesuai
 *       403:
 *         description: Kasir belum membuka shift
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_transaksi: { type: integer, example: 102 }
 *                   no_transaksi: { type: string, example: "TRX-1788444865742" }
 *                   tanggal_transaksi: { type: string, format: date-time }
 *                   metode_bayar: { type: string, enum: [TUNAI, QRIS, TRANSFER], description: Kolom legacy, metode pembayaran pertama }
 *                   status: { type: string, enum: [SELESAI, DIBATALKAN] }
 *                   total: { type: string, example: "64500" }
 *                   total_item: { type: integer, example: 3, description: Total qty seluruh item dalam transaksi }
 *                   id_user: { type: integer, example: 1 }
 *                   id_shift: { type: integer, nullable: true, example: 1 }
 *                   user:
 *                     type: object
 *                     properties:
 *                       id_user: { type: integer, example: 1 }
 *                       nama: { type: string, example: Admin Utama }
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