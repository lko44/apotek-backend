const express = require("express")

const router = express.Router()

const auth = require("../middleware/authMiddleware")

const holdController = require("../controllers/holdController")

/**
 * @openapi
 * /api/v1/hold:
 *   post:
 *     tags: [Hold]
 *     summary: Menyimpan transaksi ke Hold
 *     description: Menyimpan transaksi sementara ke database agar dapat di-recall kembali.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama_pelanggan
 *               - cart
 *             properties:
 *               nama_pelanggan:
 *                 type: string
 *                 example: "Test Customer"
 *               alasan:
 *                 type: string
 *                 example: "Menunggu pembayaran"
 *               cart:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - produk_id
 *                     - qty
 *                     - harga_jual
 *                   properties:
 *                     produk_id:
 *                       type: integer
 *                       example: 2103
 *                     qty:
 *                       type: integer
 *                       minimum: 1
 *                       example: 1
 *                     harga_jual:
 *                       type: number
 *                       example: 64500
 *     responses:
 *       201:
 *         description: Transaksi berhasil di-hold
 *       400:
 *         description: Data hold tidak valid
 *       401:
 *         description: Tidak terautentikasi
 */
router.post("/", auth, holdController.createHold)

/**
 * @openapi
 * /api/v1/hold:
 *   get:
 *     tags: [Hold]
 *     summary: Mendapatkan seluruh transaksi yang sedang di-hold
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar hold berhasil diambil
 *       500:
 *         description: Gagal mengambil data hold
 */
router.get("/", auth, holdController.getAllHold)

/**
 * @openapi
 * /api/v1/hold/{id}/recall:
 *   patch:
 *     tags: [Hold]
 *     summary: Melakukan recall transaksi hold
 *     description: Mengubah status hold dari HELD menjadi RECALLED dan mengembalikan isi cart.
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
 *         description: Transaksi berhasil di-recall
 *       400:
 *         description: Hold sudah tidak berstatus HELD
 *       404:
 *         description: Data hold tidak ditemukan
 */
router.patch("/:id/recall", auth, holdController.recallHold)

/**
 * @openapi
 * /api/v1/hold/{id}:
 *   delete:
 *     tags: [Hold]
 *     summary: Membatalkan transaksi hold
 *     description: Mengubah status hold menjadi CANCELLED tanpa menghapus data secara fisik.
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
 *         description: Hold berhasil dibatalkan
 *       400:
 *         description: Hold sudah tidak berstatus HELD
 *       404:
 *         description: Data hold tidak ditemukan
 */
router.delete("/:id", auth, holdController.cancelHold)

module.exports = router