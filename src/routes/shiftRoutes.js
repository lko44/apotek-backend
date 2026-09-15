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

/**
 * @openapi
 * /api/v1/shift:
 *   get:
 *     tags: [Shift]
 *     summary: Daftar riwayat shift
 *     description: Menampilkan seluruh shift (OPEN maupun CLOSED) beserta ringkasan total transaksi dan omzet per shift.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema: { type: string, format: date, example: "2026-09-01" }
 *         description: Filter shift yang dibuka mulai tanggal ini
 *       - in: query
 *         name: end_date
 *         schema: { type: string, format: date, example: "2026-09-30" }
 *         description: Filter shift yang dibuka sampai tanggal ini
 *       - in: query
 *         name: id_user
 *         schema: { type: integer, example: 1 }
 *         description: Filter berdasarkan kasir
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [OPEN, CLOSED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar shift
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_shift: { type: integer, example: 5 }
 *                       id_user: { type: integer, example: 1 }
 *                       nama_kasir: { type: string, example: Admin Utama }
 *                       status: { type: string, enum: [OPEN, CLOSED] }
 *                       modal_awal: { type: string, example: "500000" }
 *                       modal_akhir: { type: string, nullable: true, example: "545000" }
 *                       waktu_buka: { type: string, format: date-time }
 *                       waktu_tutup: { type: string, format: date-time, nullable: true }
 *                       total_transaksi: { type: integer, example: 12 }
 *                       total_omzet: { type: number, example: 645000 }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer, example: 5 }
 *                     page: { type: integer, example: 1 }
 *                     limit: { type: integer, example: 20 }
 *                     totalPages: { type: integer, example: 1 }
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Gagal mengambil daftar shift
 */
router.get("/", auth, shiftController.getAllShift)

/**
 * @openapi
 * /api/v1/shift/{id}:
 *   get:
 *     tags: [Shift]
 *     summary: Detail satu shift beserta transaksinya
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: Detail shift berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_shift: { type: integer, example: 5 }
 *                     id_user: { type: integer, example: 1 }
 *                     nama_kasir: { type: string, example: Admin Utama }
 *                     status: { type: string, enum: [OPEN, CLOSED] }
 *                     modal_awal: { type: string, example: "500000" }
 *                     modal_akhir: { type: string, nullable: true }
 *                     waktu_buka: { type: string, format: date-time }
 *                     waktu_tutup: { type: string, format: date-time, nullable: true }
 *                     total_transaksi: { type: integer, example: 12 }
 *                     total_omzet: { type: number, example: 645000 }
 *                     transaksi:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_transaksi: { type: integer, example: 102 }
 *                           no_transaksi: { type: string, example: "TRX-1788444865742" }
 *                           total: { type: string, example: "64500" }
 *                           status: { type: string, enum: [SELESAI, DIBATALKAN] }
 *                           tanggal_transaksi: { type: string, format: date-time }
 *       400:
 *         description: ID shift tidak valid
 *       404:
 *         description: Shift tidak ditemukan
 *       500:
 *         description: Gagal mengambil detail shift
 */
router.get("/:id", auth, shiftController.getShiftById)

module.exports = router