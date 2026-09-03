const express = require("express")

const router = express.Router()

const auth = require("../middleware/authMiddleware")

const shiftController = require("../controllers/shiftController")

/**
 * @openapi
 * /api/v1/shift/active:
 *   get:
 *     tags: [Shift]
 *     summary: Mengecek shift aktif kasir
 *     description: Mengembalikan informasi shift yang sedang berstatus OPEN untuk user yang sedang login.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status shift berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 active:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   nullable: true
 *                   type: object
 *                   properties:
 *                     id_shift:
 *                       type: integer
 *                       example: 1
 *                     id_user:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       enum: [OPEN, CLOSED]
 *                       example: OPEN
 *                     modal_awal:
 *                       type: number
 *                       example: 100000
 *                     modal_akhir:
 *                       type: number
 *                       nullable: true
 *                       example: null
 *                     waktu_buka:
 *                       type: string
 *                       format: date-time
 *                     waktu_tutup:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       500:
 *         description: Gagal mengambil status shift
 */
router.get("/active", auth, shiftController.getActiveShift)

/**
 * @openapi
 * /api/v1/shift/buka:
 *   post:
 *     tags: [Shift]
 *     summary: Membuka shift
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modal_awal
 *             properties:
 *               modal_awal:
 *                 type: number
 *                 minimum: 0
 *                 example: 100000
 *     responses:
 *       201:
 *         description: Shift berhasil dibuka
 *       400:
 *         description: Data modal tidak valid atau user masih memiliki shift aktif
 *       500:
 *         description: Gagal membuka shift
 */
router.post("/buka", auth, shiftController.bukaShift)

/**
 * @openapi
 * /api/v1/shift/tutup:
 *   put:
 *     tags: [Shift]
 *     summary: Menutup shift
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modal_akhir
 *             properties:
 *               modal_akhir:
 *                 type: number
 *                 minimum: 0
 *                 example: 175000
 *     responses:
 *       200:
 *         description: Shift berhasil ditutup
 *       400:
 *         description: Data modal tidak valid
 *       404:
 *         description: Tidak ada shift aktif
 *       500:
 *         description: Gagal menutup shift
 */
router.put("/tutup", auth, shiftController.tutupShift)

module.exports = router