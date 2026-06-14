const express = require("express");
const router = express.Router();

const satuan = require("../controllers/satuanController");
const auth = require("../middleware/authMiddleware");

/**
 * @openapi
 * components:
 *   schemas:
 *     Satuan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         kode:
 *           type: string
 *           example: BTL
 *         nama:
 *           type: string
 *           example: Botol
 *
 *     SatuanInput:
 *       type: object
 *       required:
 *         - kode
 *         - nama
 *       properties:
 *         kode:
 *           type: string
 *           example: BTL
 *         nama:
 *           type: string
 *           example: Botol
 *
 *     SatuanResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Satuan'
 *
 *     SatuanListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Satuan'
 */

/**
 * @openapi
 * /api/v1/satuan:
 *   get:
 *     tags: [Satuan]
 *     summary: Ambil semua satuan
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List semua satuan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SatuanListResponse'
 */
router.get("/", auth, satuan.getAll);

/**
 * @openapi
 * /api/v1/satuan/{id}:
 *   get:
 *     tags: [Satuan]
 *     summary: Ambil satuan berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail satuan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SatuanResponse'
 *       404:
 *         description: Satuan tidak ditemukan
 */
router.get("/:id", auth, satuan.getById);

/**
 * @openapi
 * /api/v1/satuan:
 *   post:
 *     tags: [Satuan]
 *     summary: Tambah satuan baru
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SatuanInput'
 *     responses:
 *       201:
 *         description: Berhasil tambah satuan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SatuanResponse'
 *       400:
 *         description: Data tidak valid / kode duplicate
 */
router.post("/", auth, satuan.create);

/**
 * @openapi
 * /api/v1/satuan/{id}:
 *   put:
 *     tags: [Satuan]
 *     summary: Update satuan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SatuanInput'
 *     responses:
 *       200:
 *         description: Berhasil update satuan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SatuanResponse'
 *       404:
 *         description: Satuan tidak ditemukan
 */
router.put("/:id", auth, satuan.update);

module.exports = router;