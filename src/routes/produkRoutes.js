const express = require("express")
const router = express.Router()
const produk = require("../controllers/produkController")
const auth = require("../middleware/authMiddleware")
/**
 * @openapi
 * /api/v1/produk:
 *   get:
 *     tags: [Produk]
 *     summary: Ambil semua produk (pagination + search)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: para
 *     responses:
 *       200:
 *         description: Berhasil ambil produk
 */
router.get("/", auth, produk.getProduk)
/**
 * @openapi
 * /api/v1/produk/search:
 *   get:
 *     tags: [Produk]
 *     summary: Search produk berdasarkan nama / barcode
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           example: para
 *     responses:
 *       200:
 *         description: Hasil pencarian produk
 */
router.get("/search", auth, produk.searchProduk)
/**
 * @openapi
 * /api/v1/produk/barcode/{barcode}:
 *   get:
 *     tags: [Produk]
 *     summary: Ambil produk berdasarkan barcode
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *           example: 8999990001234
 *     responses:
 *       200:
 *         description: Produk ditemukan
 *       404:
 *         description: Produk tidak ditemukan
 */
router.get("/barcode/:barcode", auth, produk.getProdukByBarcode)
/**
 * @openapi
 * /api/v1/produk/stok-menipis:
 *   get:
 *     tags: [Produk]
 *     summary: Ambil produk dengan stok di bawah minimum
 *     responses:
 *       200:
 *         description: Data stok menipis
 */
router.get("/stok-menipis", auth, produk.getStokMenipis)
/**
 * @openapi
 * /api/v1/produk/{id}:
 *   get:
 *     tags: [Produk]
 *     summary: Ambil produk berdasarkan ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Produk ditemukan
 *       404:
 *         description: Produk tidak ditemukan
 */
router.get("/id/:id", auth, produk.getProdukById)

/**
 * @openapi
 * /api/v1/produk/tersedia:
 *   get:
 *     tags: [Produk]
 *     summary: Ambil semua produk yang masih memiliki stok
 *     description: |
 *       Mengembalikan daftar produk aktif yang memiliki stok lebih dari 0.
 *       Endpoint ini direkomendasikan untuk halaman kasir/POS agar hanya
 *       menampilkan produk yang masih tersedia.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil produk yang tersedia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil produk yang tersedia
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_produk:
 *                         type: integer
 *                         example: 1
 *                       nama_produk:
 *                         type: string
 *                         example: Paracetamol 500 mg
 *                       barcode:
 *                         type: string
 *                         nullable: true
 *                         example: "8999990001234"
 *                       harga_jual:
 *                         type: number
 *                         example: 5000
 *                       stok:
 *                         type: integer
 *                         example: 42
 *                       kategori:
 *                         type: object
 *                         properties:
 *                           id_kategori:
 *                             type: integer
 *                             example: 3
 *                           nama_kategori:
 *                             type: string
 *                             example: Obat
 *                       satuan:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           kode:
 *                             type: string
 *                             example: STRIP
 *                           nama:
 *                             type: string
 *                             example: Strip
 *                       batchproduk:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id_batch:
 *                               type: integer
 *                               example: 15
 *                             no_batch:
 *                               type: string
 *                               example: BATCH-001
 *                             qty_sisa:
 *                               type: integer
 *                               example: 20
 *                             expired_date:
 *                               type: string
 *                               format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/tersedia", auth, produk.getProdukTersedia);
/**
 * @openapi
 * /api/v1/produk/{id}:
 *   put:
 *     tags: [Produk]
 *     summary: Update data produk
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_produk:
 *                 type: string
 *                 example: Paracetamol 500 mg
 *               id_kategori:
 *                 type: integer
 *                 example: 1
 *               satuan_id:
 *                 type: integer
 *                 example: 2
 *               stok_minimum:
 *                 type: integer
 *                 example: 10
 *               harga_jual:
 *                 type: number
 *                 example: 7500
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Produk berhasil diupdate
 *       400:
 *         description: Data tidak valid
 *       404:
 *         description: Produk tidak ditemukan
 *       409:
 *         description: Barcode sudah digunakan
 */
router.put("/:id", auth, produk.updateProduk);

/**
 * @openapi
 * /api/v1/produk:
 *   post:
 *     tags: [Produk]
 *     summary: Tambah produk baru
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama_produk
 *               - id_kategori
 *               - satuan_id
 *             properties:
 *               nama_produk:
 *                 type: string
 *                 example: Paracetamol 500 mg
 *               barcode:
 *                 type: string
 *                 nullable: true
 *                 example: "8999990001234"
 *               id_kategori:
 *                 type: integer
 *                 example: 1
 *               satuan_id:
 *                 type: integer
 *                 example: 2
 *               stok_minimum:
 *                 type: integer
 *                 example: 10
 *               harga_jual:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       201:
 *         description: Produk berhasil ditambahkan
 *       400:
 *         description: Data tidak valid
 *       409:
 *         description: Barcode sudah digunakan
 *       500:
 *         description: Internal Server Error
 */
router.post("/", auth, produk.createProduk);

/**
 * @openapi
 * /api/v1/produk/stok/{id}:
 *   get:
 *     tags: [Produk]
 *     summary: Ambil stok produk berdasarkan ID
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
 *         description: Berhasil mengambil stok produk
 *       400:
 *         description: ID tidak valid
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Internal Server Error
 */
router.get("/stok/:id", auth, produk.getStokProduk);

/**
 * @openapi
 * /api/v1/produk/stok/barcode/{barcode}:
 *   get:
 *     tags: [Produk]
 *     summary: Ambil stok produk berdasarkan barcode
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *           example: "8999990001234"
 *     responses:
 *       200:
 *         description: Berhasil mengambil stok produk
 *       400:
 *         description: Barcode tidak valid
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Internal Server Error
 */
router.get("/stok/barcode/:barcode", auth, produk.getStokProduk);

/**
 * @openapi
 * /api/v1/produk/{id}:
 *   delete:
 *     tags: [Produk]
 *     summary: Nonaktifkan produk (soft delete)
 *     description: Mengubah status produk menjadi tidak aktif (is_active = false), bukan menghapus data dari database.
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
 *         description: Produk berhasil dinonaktifkan
 *       400:
 *         description: ID tidak valid
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", auth, produk.deleteProduk);

module.exports = router