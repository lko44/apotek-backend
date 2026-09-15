const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const kasKecilController = require("../controllers/kasKecilController");

/**
 * @openapi
 * /api/v1/kas-kecil:
 *   post:
 *     tags: [Kas Kecil]
 *     summary: Catat transaksi kas kecil
 *     description: |
 *       Mencatat pemasukan/pengeluaran kas kecil pada sebuah shift.
 *       Catatan: `id_user` dan `nama_kasir` TIDAK diambil dari body request.
 *       Backend selalu menggunakan user dari JWT dan mengambil nama kasir dari database.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_shift, tipe, nominal, keterangan]
 *             properties:
 *               id_shift: { type: integer, example: 8 }
 *               tipe: { type: string, enum: [masuk, keluar], example: keluar }
 *               nominal: { type: number, example: 15000, description: Harus lebih dari 0 }
 *               keterangan: { type: string, example: Beli kantong plastik }
 *               waktu_transaksi:
 *                 type: string
 *                 format: date-time
 *                 description: Opsional, default waktu sekarang
 *     responses:
 *       201:
 *         description: Kas kecil berhasil dicatat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Kas kecil berhasil dicatat }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 1 }
 *                     id_shift: { type: integer, example: 8 }
 *                     id_user: { type: integer, example: 1 }
 *                     nama_kasir: { type: string, example: Admin Utama }
 *                     tipe: { type: string, enum: [masuk, keluar] }
 *                     nominal: { type: number, example: 15000 }
 *                     keterangan: { type: string, example: Beli kantong plastik }
 *                     waktu_transaksi: { type: string, format: date-time }
 *                     created_at: { type: string, format: date-time }
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validasi gagal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Validasi gagal }
 *                 errors:
 *                   type: object
 *                   example: { nominal: ["nominal harus lebih dari 0"] }
 *       500:
 *         description: Gagal mencatat kas kecil
 */
router.post("/", auth, kasKecilController.create)

/**
 * @openapi
 * /api/v1/kas-kecil:
 *   get:
 *     tags: [Kas Kecil]
 *     summary: Daftar riwayat kas kecil
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_shift
 *         schema: { type: integer, example: 8 }
 *       - in: query
 *         name: tanggal
 *         schema: { type: string, format: date, example: "2026-09-15" }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar kas kecil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer, example: 1 }
 *                       id_shift: { type: integer, example: 8 }
 *                       nama_kasir: { type: string, example: Admin Utama }
 *                       tipe: { type: string, enum: [masuk, keluar] }
 *                       nominal: { type: number, example: 15000 }
 *                       keterangan: { type: string, example: Beli kantong plastik }
 *                       waktu_transaksi: { type: string, format: date-time }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer, example: 1 }
 *                     page: { type: integer, example: 1 }
 *                     limit: { type: integer, example: 20 }
 *                     totalPages: { type: integer, example: 1 }
 *       401:
 *         description: unauthorized
 *       500:
 *         description: Gagal mengambil daftar kas kecil
 */
router.get("/", auth, kasKecilController.list)

module.exports = router;