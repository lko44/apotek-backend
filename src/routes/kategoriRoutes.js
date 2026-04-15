const express = require("express")
const router = express.Router()

const kategori = require("../controllers/kategoriController")
const auth = require("../middleware/authMiddleware")

/**
 * @openapi
 * /api/v1/kategori:
 *   get:
 *     tags: [Kategori]
 *     summary: Mendapatkan semua kategori aktif
 *     security:
 *       - bearerAuth: []
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_kategori:
 *                         type: integer
 *                       nama_kategori:
 *                         type: string
 *                       is_active:
 *                         type: boolean
 *                       _count:
 *                         type: object
 *                         properties:
 *                           produk:
 *                             type: integer
 */
router.get("/", auth, kategori.getKategori)

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