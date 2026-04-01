const express = require("express")
const router = express.Router()
const batch = require("../controllers/batchControllers")

/**
 * @openapi
 * /api/v1/batch/hampir-expired:
 *   get:
 *     tags: [Batch]
 *     summary: Mendapatkan daftar batch obat yang hampir expired
 *     description: Mengambil data batch obat yang tanggal kadaluarsanya sudah mendekati batas tertentu.
 *     responses:
 *       200:
 *         description: Data batch hampir expired berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_batch:
 *                         type: integer
 *                         example: 1
 *                       nama_obat:
 *                         type: string
 *                         example: Paracetamol
 *                       tanggal_expired:
 *                         type: string
 *                         example: 2026-04-10
 *                       stok:
 *                         type: integer
 *                         example: 20
 */
router.get("/hampir-expired", batch.getBatchHampirExpired)

module.exports = router