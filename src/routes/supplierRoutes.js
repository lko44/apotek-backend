const express = require("express")
const router = express.Router()

const supplier = require("../controllers/supplierController")
const auth = require("../middleware/authMiddleware")

/**
 * @openapi
 * /api/v1/supplier:
 *   get:
 *     tags: [Supplier]
 *     summary: Mendapatkan semua data supplier
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data supplier berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_supplier:
 *                     type: integer
 *                     example: 1
 *                   nama_supplier:
 *                     type: string
 *                     example: PT Kimia Farma
 *                   email:
 *                     type: string
 *                     example: supplier@email.com
 *                   telepon:
 *                     type: string
 *                     example: "08123456789"
 *                   alamat:
 *                     type: string
 *                     example: Jakarta
 *       500:
 *         description: Gagal mengambil data supplier
 */
router.get("/", auth, supplier.getSupplier)

/**
 * @openapi
 * /api/v1/supplier/{id}:
 *   get:
 *     tags: [Supplier]
 *     summary: Mendapatkan supplier berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Data supplier berhasil ditemukan
 *       400:
 *         description: ID bukan angka
 *       404:
 *         description: Supplier tidak ditemukan
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", auth, supplier.getSupplierById)

/**
 * @openapi
 * /api/v1/supplier:
 *   post:
 *     tags: [Supplier]
 *     summary: Menambahkan supplier baru (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama_supplier
 *               - email
 *             properties:
 *               nama_supplier:
 *                 type: string
 *                 example: PT Kimia Farma
 *               email:
 *                 type: string
 *                 format: email
 *                 example: kimiafarma@gmail.com
 *               telepon:
 *                 type: string
 *                 example: "08123456789"
 *               alamat:
 *                 type: string
 *                 example: Jakarta
 *     responses:
 *       201:
 *         description: Supplier berhasil ditambahkan
 *       400:
 *         description: Nama/email kosong atau email sudah terdaftar
 *       403:
 *         description: Hanya Admin yang dapat membuat supplier
 *       500:
 *         description: Gagal membuat supplier
 */
router.post("/", auth, supplier.createSupplier)

/**
 * @openapi
 * /api/v1/supplier/{id}:
 *   put:
 *     tags: [Supplier]
 *     summary: Mengupdate data supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_supplier:
 *                 type: string
 *                 example: PT Kalbe Farma
 *               email:
 *                 type: string
 *                 format: email
 *                 example: kalbe@gmail.com
 *               telepon:
 *                 type: string
 *                 example: "08123456789"
 *               alamat:
 *                 type: string
 *                 example: Bandung
 *     responses:
 *       200:
 *         description: Supplier berhasil diperbarui
 *       500:
 *         description: Gagal update. ID tidak ditemukan atau email duplikat
 */
router.put("/:id", auth, supplier.updateSupplier)

/**
 * @openapi
 * /api/v1/supplier/{id}:
 *   delete:
 *     tags: [Supplier]
 *     summary: Menghapus supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Supplier berhasil dihapus
 *       400:
 *         description: Supplier memiliki riwayat transaksi/pembelian
 *       500:
 *         description: Terjadi kesalahan server
 */
router.delete("/:id", auth, supplier.deleteSupplier)

module.exports = router