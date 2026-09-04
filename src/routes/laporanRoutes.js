const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const auth = require("../middleware/authMiddleware");

/**
 * @openapi
 * /api/v1/laporan/produk-terlaris:
 *   get:
 *     tags:
 *       - Laporan
 *     summary: Mendapatkan daftar produk terlaris
 *     description: Mengambil daftar produk yang paling banyak terjual berdasarkan total kuantitas penjualan.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data produk terlaris
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/produk-terlaris", auth, laporanController.getProdukTerlaris);

/**
 * @openapi
 * /api/v1/laporan/penjualan:
 *   get:
 *     tags:
 *       - Laporan
 *     summary: Mendapatkan laporan penjualan
 *     description: Menampilkan daftar transaksi penjualan yang berhasil, beserta tanggal, nomor transaksi, jumlah item, total penjualan, dan metode pembayaran.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil laporan penjualan
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/penjualan", auth, laporanController.getLaporanPenjualan);

/**
 * @openapi
 * /api/v1/laporan/tidak-laku:
 *   get:
 *     tags:
 *       - Laporan
 *     summary: Mendapatkan daftar produk yang tidak laku
 *     description: Mengambil daftar produk yang tidak memiliki transaksi penjualan dalam rentang hari tertentu.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hari
 *         required: false
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Jumlah hari ke belakang untuk menentukan produk yang tidak laku.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman.
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar produk tidak laku
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/tidak-laku", auth, laporanController.getProdukTidakLaku);

/**
 * @openapi
 * /api/v1/laporan/kinerja-kasir:
 *   get:
 *     tags:
 *       - Laporan
 *     summary: Mendapatkan data kinerja kasir
 *     description: Menampilkan kinerja setiap kasir berdasarkan shift, jumlah transaksi yang berhasil, dan total omzet.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data kinerja kasir
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil data kinerja kasir
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_user:
 *                         type: integer
 *                         example: 1
 *                       nama_kasir:
 *                         type: string
 *                         example: Admin Utama
 *                       id_shift:
 *                         type: integer
 *                         example: 1
 *                       waktu_buka:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-09-03T14:04:22.519Z"
 *                       waktu_tutup:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2026-09-04T03:39:55.343Z"
 *                       status_shift:
 *                         type: string
 *                         enum:
 *                           - OPEN
 *                           - CLOSED
 *                         example: CLOSED
 *                       jumlah_transaksi:
 *                         type: integer
 *                         example: 10
 *                       total_omzet:
 *                         type: number
 *                         format: double
 *                         example: 645000
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/kinerja-kasir", auth, laporanController.getKinerjaKasir);

/**
 * @openapi
 * /api/v1/laporan/audit-log:
 *   get:
 *     tags:
 *       - Laporan
 *     summary: Mendapatkan audit log
 *     description: Mengambil riwayat aktivitas penting pengguna dengan pagination.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Nomor halaman.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 20
 *         description: Jumlah data per halaman.
 *     responses:
 *       200:
 *         description: Berhasil mengambil audit log
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/audit-log", auth, laporanController.getAuditLog);

module.exports = router;