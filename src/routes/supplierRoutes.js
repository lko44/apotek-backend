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
 */
router.get("/:id", auth, supplier.getSupplierById)

/**
 * @openapi
 * /api/v1/supplier:
 *   post:
 *     tags: [Supplier]
 *     summary: Menambahkan supplier baru
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_supplier:
 *                 type: string
 *                 example: PT Kimia Farma
 *               alamat:
 *                 type: string
 *                 example: Jakarta
 *               telepon:
 *                 type: string
 *                 example: 08123456789
 *     responses:
 *       201:
 *         description: Supplier berhasil ditambahkan
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
 *               alamat:
 *                 type: string
 *                 example: Bandung
 *               telepon:
 *                 type: string
 *                 example: 08123456789
 *     responses:
 *       200:
 *         description: Supplier berhasil diperbarui
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
 */
router.delete("/:id", auth, supplier.deleteSupplier)

module.exports = router