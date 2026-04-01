const express = require('express');
const router = express.Router();
const pembelianController = require('../controllers/pembelianController');
const auth = require("../middleware/authMiddleware")

/**
 * @openapi
 * /api/v1/pembelian:
 *   post:
 *     tags: [Pembelian]
 *     summary: Membuat data pembelian obat dari supplier
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplier_id:
 *                 type: integer
 *                 example: 1
 *               tanggal:
 *                 type: string
 *                 example: 2026-03-14
 *               total:
 *                 type: number
 *                 example: 500000
 *     responses:
 *       201:
 *         description: Pembelian berhasil dibuat
 */
router.post("/", auth, pembelianController.createPembelian)

/**
 * @openapi
 * /api/v1/pembelian:
 *   get:
 *     tags: [Pembelian]
 *     summary: Mendapatkan semua data pembelian
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data pembelian berhasil diambil
 */
router.get("/", auth, pembelianController.getPembelian)

/**
 * @openapi
 * /api/v1/pembelian/{id}:
 *   get:
 *     tags: [Pembelian]
 *     summary: Mendapatkan detail pembelian berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pembelian
 *     responses:
 *       200:
 *         description: Detail pembelian berhasil diambil
 */
router.get("/:id", auth, pembelianController.getPembelianById)

module.exports = router;