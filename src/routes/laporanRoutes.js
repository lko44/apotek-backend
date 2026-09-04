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

router.get("/kinerja-kasir", auth, laporanController.getKinerjaKasir);

module.exports = router;