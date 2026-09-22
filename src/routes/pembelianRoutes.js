const express = require('express');
const router = express.Router();
const pembelianController = require('../controllers/pembelianController');
const auth = require("../middleware/authMiddleware");

/**
 * @openapi
 * /api/v1/pembelian:
 *   post:
 *     tags:
 *       - Pembelian
 *     summary: Membuat data pembelian obat dari supplier
 *     description: Membuat transaksi pembelian obat dari supplier. Endpoint ini hanya dapat digunakan oleh user dengan role ADMIN. Subtotal, PPN, dan total pembelian dihitung secara otomatis oleh sistem.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_supplier
 *               - id_user
 *               - no_faktur
 *               - tanggal_faktur
 *               - items
 *             properties:
 *               id_supplier:
 *                 type: integer
 *                 example: 1
 *                 description: ID supplier
 *               id_user:
 *                 type: integer
 *                 example: 2
 *                 description: ID user yang membuat transaksi
 *               no_faktur:
 *                 type: string
 *                 example: INV-2026-001
 *                 description: Nomor faktur pembelian
 *               tanggal_faktur:
 *                 type: string
 *                 format: date
 *                 example: 2026-09-22
 *                 description: Tanggal faktur pembelian
 *               status:
 *                 type: string
 *                 enum:
 *                   - LUNAS
 *                   - BELUM_DIBAYAR
 *                   - DIKEMBALIKAN
 *                 default: LUNAS
 *                 example: LUNAS
 *                 description: Status pembelian
 *               nilai_ppn:
 *                 type: number
 *                 format: double
 *                 default: 11
 *                 example: 11
 *                 description: Persentase PPN
 *               jenis_ppn:
 *                 type: string
 *                 enum:
 *                   - non_ppn
 *                   - sudah_termasuk
 *                   - tambah_ppn
 *                 default: tambah_ppn
 *                 example: tambah_ppn
 *                 description: Jenis perhitungan PPN
 *               cashback:
 *                 type: number
 *                 format: double
 *                 default: 0
 *                 example: 50000
 *                 description: Nilai cashback yang mengurangi total pembelian
 *               jenis_pembayaran:
 *                 type: string
 *                 nullable: true
 *                 example: TRANSFER
 *                 description: Jenis pembayaran
 *               akun_kas:
 *                 type: string
 *                 nullable: true
 *                 example: BANK BCA
 *                 description: Akun kas atau bank yang digunakan
 *               no_surat_pesanan:
 *                 type: string
 *                 nullable: true
 *                 example: SP-2026-001
 *                 description: Nomor surat pesanan
 *               catatan:
 *                 type: string
 *                 nullable: true
 *                 example: Pembelian stok bulanan
 *                 description: Catatan transaksi
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 description: Daftar produk yang dibeli
 *                 items:
 *                   type: object
 *                   required:
 *                     - qty
 *                     - harga_beli
 *                     - harga_jual
 *                   properties:
 *                     barcode:
 *                       type: string
 *                       nullable: true
 *                       example: "8991234567890"
 *                       description: Barcode produk. Gunakan barcode atau id_produk.
 *                     id_produk:
 *                       type: integer
 *                       nullable: true
 *                       example: 1
 *                       description: ID produk. Gunakan id_produk atau barcode.
 *                     qty:
 *                       type: integer
 *                       minimum: 1
 *                       example: 10
 *                       description: Jumlah produk yang dibeli
 *                     harga_beli:
 *                       type: number
 *                       format: double
 *                       minimum: 0
 *                       example: 15000
 *                       description: Harga beli per unit sebelum diskon
 *                     harga_jual:
 *                       type: number
 *                       format: double
 *                       minimum: 0
 *                       example: 20000
 *                       description: Harga jual produk
 *                     diskon:
 *                       type: number
 *                       format: double
 *                       minimum: 0
 *                       default: 0
 *                       example: 5
 *                       description: Nilai diskon sesuai dengan diskon_tipe
 *                     diskon_tipe:
 *                       type: string
 *                       enum:
 *                         - "%"
 *                         - Rp
 *                       default: "%"
 *                       example: "%"
 *                       description: Tipe diskon, persentase atau nominal Rupiah
 *                     expired_date:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: 2028-09-22
 *                       description: Tanggal kedaluwarsa produk
 *           example:
 *             id_supplier: 1
 *             id_user: 2
 *             no_faktur: INV-2026-001
 *             tanggal_faktur: 2026-09-22
 *             status: LUNAS
 *             nilai_ppn: 11
 *             jenis_ppn: tambah_ppn
 *             cashback: 50000
 *             jenis_pembayaran: TRANSFER
 *             akun_kas: BANK BCA
 *             no_surat_pesanan: SP-2026-001
 *             catatan: Pembelian stok bulanan
 *             items:
 *               - barcode: "8991234567890"
 *                 qty: 10
 *                 harga_beli: 15000
 *                 harga_jual: 20000
 *                 diskon: 5
 *                 diskon_tipe: "%"
 *                 expired_date: 2028-09-22
 *               - id_produk: 2
 *                 qty: 5
 *                 harga_beli: 25000
 *                 harga_jual: 35000
 *                 diskon: 1000
 *                 diskon_tipe: Rp
 *                 expired_date: 2027-12-31
 *     responses:
 *       201:
 *         description: Pembelian berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Data pembelian yang berhasil dibuat
 *       400:
 *         description: Data pembelian tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Data items pembelian tidak boleh kosong.
 *       403:
 *         description: Akses ditolak karena user bukan ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Akses ditolak! Kamu bukan Admin.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gagal membuat data pembelian
 */
router.post("/", auth, pembelianController.createPembelian);

/**
 * @openapi
 * /api/v1/pembelian:
 *   get:
 *     tags:
 *       - Pembelian
 *     summary: Mendapatkan semua data pembelian dengan pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: Halaman data yang ingin diambil
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Jumlah data per halaman
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *           example: 10
 *       - name: search
 *         in: query
 *         required: false
 *         description: Pencarian berdasarkan nomor faktur atau nama supplier
 *         schema:
 *           type: string
 *           default: ""
 *           example: PT Sehat Abadi
 *     responses:
 *       200:
 *         description: Data pembelian berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 search:
 *                   type: string
 *                   example: ""
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_pembelian:
 *                         type: integer
 *                         example: 1
 *                       no_faktur:
 *                         type: string
 *                         example: INV-2026-001
 *                       tanggal_faktur:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-09-22T00:00:00.000Z
 *                       subtotal:
 *                         type: number
 *                         example: 475000
 *                       nilai_ppn:
 *                         type: number
 *                         example: 11
 *                       jenis_ppn:
 *                         type: string
 *                         enum:
 *                           - non_ppn
 *                           - sudah_termasuk
 *                           - tambah_ppn
 *                         example: tambah_ppn
 *                       cashback:
 *                         type: number
 *                         example: 50000
 *                       total:
 *                         type: number
 *                         example: 477250
 *                       status:
 *                         type: string
 *                         enum:
 *                           - LUNAS
 *                           - BELUM_DIBAYAR
 *                           - DIKEMBALIKAN
 *                         example: LUNAS
 *                       jenis_pembayaran:
 *                         type: string
 *                         nullable: true
 *                         example: TRANSFER
 *                       akun_kas:
 *                         type: string
 *                         nullable: true
 *                         example: BANK BCA
 *                       no_surat_pesanan:
 *                         type: string
 *                         nullable: true
 *                         example: SP-2026-001
 *                       catatan:
 *                         type: string
 *                         nullable: true
 *                         example: Pembelian stok bulanan
 *                       supplier:
 *                         type: object
 *                         properties:
 *                           nama_supplier:
 *                             type: string
 *                             example: PT Sehat Abadi
 *                       pembeliandetail:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id_pembelian_detail:
 *                               type: integer
 *                               example: 1
 *                             qty:
 *                               type: integer
 *                               example: 10
 *                             harga_beli:
 *                               type: number
 *                               example: 15000
 *                             no_batch:
 *                               type: string
 *                               example: BATCH-1758523456789-0
 *                             expired_date:
 *                               type: string
 *                               description: YYYY-MM-DD atau "-" jika tidak tersedia
 *                               example: 2028-09-22
 *                             tanggal_penerimaan:
 *                               type: string
 *                               description: YYYY-MM-DD atau "-" jika tidak tersedia
 *                               example: 2026-09-22
 *                             gudang:
 *                               type: string
 *                               example: Gudang Utama
 *                             produk:
 *                               type: object
 *                               properties:
 *                                 nama_produk:
 *                                   type: string
 *                                   example: Paracetamol 500mg
 *                                 satuan:
 *                                   type: string
 *                                   example: Tablet
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get("/", auth, pembelianController.getPembelian);

/**
 * @openapi
 * /api/v1/pembelian/{id}:
 *   get:
 *     tags:
 *       - Pembelian
 *     summary: Mendapatkan detail pembelian berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID pembelian
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Detail pembelian berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_pembelian:
 *                   type: integer
 *                   example: 1
 *                 no_faktur:
 *                   type: string
 *                   example: INV-2026-001
 *                 tanggal_faktur:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-09-22T00:00:00.000Z
 *                 subtotal:
 *                   type: number
 *                   example: 475000
 *                 nilai_ppn:
 *                   type: number
 *                   example: 11
 *                 jenis_ppn:
 *                   type: string
 *                   enum:
 *                     - non_ppn
 *                     - sudah_termasuk
 *                     - tambah_ppn
 *                   example: tambah_ppn
 *                 cashback:
 *                   type: number
 *                   example: 50000
 *                 total:
 *                   type: number
 *                   example: 477250
 *                 status:
 *                   type: string
 *                   enum:
 *                     - LUNAS
 *                     - BELUM_DIBAYAR
 *                     - DIKEMBALIKAN
 *                   example: LUNAS
 *                 jenis_pembayaran:
 *                   type: string
 *                   nullable: true
 *                   example: TRANSFER
 *                 akun_kas:
 *                   type: string
 *                   nullable: true
 *                   example: BANK BCA
 *                 no_surat_pesanan:
 *                   type: string
 *                   nullable: true
 *                   example: SP-2026-001
 *                 catatan:
 *                   type: string
 *                   nullable: true
 *                   example: Pembelian stok bulanan
 *                 supplier:
 *                   type: object
 *                   description: Data supplier
 *                 pembeliandetail:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_pembelian_detail:
 *                         type: integer
 *                         example: 1
 *                       qty:
 *                         type: integer
 *                         example: 10
 *                       harga_beli:
 *                         type: number
 *                         example: 15000
 *                       no_batch:
 *                         type: string
 *                         example: BATCH-1758523456789-0
 *                       expired_date:
 *                         type: string
 *                         description: YYYY-MM-DD atau "-" jika tidak tersedia
 *                         example: 2028-09-22
 *                       tanggal_penerimaan:
 *                         type: string
 *                         description: YYYY-MM-DD atau "-" jika tidak tersedia
 *                         example: 2026-09-22
 *                       gudang:
 *                         type: string
 *                         example: Gudang Utama
 *                       produk:
 *                         type: object
 *                         properties:
 *                           nama_produk:
 *                             type: string
 *                             example: Paracetamol 500mg
 *                           satuan:
 *                             type: string
 *                             example: Tablet
 *       400:
 *         description: ID pembelian tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ID Pembelian harus berupa angka!
 *       404:
 *         description: Data pembelian tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Data pembelian tidak ditemukan
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get("/:id", auth, pembelianController.getPembelianById);

module.exports = router;