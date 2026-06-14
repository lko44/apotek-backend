const express = require("express")
const router = express.Router()

const kategori = require("../controllers/kategoriController")
const auth = require("../middleware/authMiddleware")

/**
 * @openapi
 * /api/v1/kategori:
 *   get:
 *     tags: [Kategori]
 *     summary: Mendapatkan semua kategori aktif dengan pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Jumlah data per halaman (maksimal 50)
 *     responses:
 *       200:
 *         description: Berhasil ambil kategori
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Berhasil ambil kategori"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nama_kategori:
 *                         type: string
 *                       _count:
 *                         type: object
 *                         properties:
 *                           produk:
 *                             type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Gagal ambil data kategori
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Gagal ambil data kategori"
 */
router.get("/", auth, kategori.getKategori);

/**
 * @openapi
 * /api/v1/kategori:
 *   post:
 *     tags: [Kategori]
 *     summary: Menambahkan kategori
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_kategori:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kategori berhasil dibuat
 */
router.post("/", auth, kategori.createKategori)

/**
 * @openapi
 * /api/v1/kategori/{id}:
 *   put:
 *     tags: [Kategori]
 *     summary: Update kategori
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_kategori:
 *                 type: string
 *     responses:
 *       200:
 *         description: Berhasil update kategori
 */
router.put("/:id", auth, kategori.updateKategori)

module.exports = router