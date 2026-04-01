const express = require("express")
const router = express.Router()

const kategori = require("../controllers/kategoriController")
const auth = require("../middleware/authMiddleware")

/**
 * @openapi
 * /api/v1/kategori:
 *   get:
 *     tags: [Kategori]
 *     summary: Mendapatkan semua kategori obat
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data kategori berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_kategori:
 *                     type: integer
 *                     example: 1
 *                   nama_kategori:
 *                     type: string
 *                     example: Obat Demam
 */
router.get("/", auth, kategori.getKategori)

/**
 * @openapi
 * /api/v1/kategori:
 *   post:
 *     tags: [Kategori]
 *     summary: Menambahkan kategori obat
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
 *                 example: Antibiotik
 *     responses:
 *       201:
 *         description: Kategori berhasil ditambahkan
 */
router.post("/", auth, kategori.createKategori)

module.exports = router