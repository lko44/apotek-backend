const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login menggunakan username
 *     description: Digunakan oleh ADMIN, STAFF, atau KASIR untuk masuk ke sistem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: kasir
 *               password:
 *                 type: string
 *                 example: kasir123
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: jwt_token_disini
 *       400:
 *         description: Input tidak lengkap
 *       401:
 *         description: Username atau password salah
 */
router.post("/login", auth.login);

/**
 * @openapi
 * /api/v1/auth/reset-password/{id}:
 *   put:
 *     tags: [Auth]
 *     summary: Reset password user oleh ADMIN
 *     description: Hanya ADMIN yang dapat mengganti password user lain
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID user yang ingin direset passwordnya
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: passwordBaru123
 *     responses:
 *       200:
 *         description: Password berhasil direset
 *       400:
 *         description: Password baru tidak diisi
 *       401:
 *         description: Token tidak valid / tidak ada
 *       403:
 *         description: Akses ditolak (bukan ADMIN)
 *       404:
 *         description: User tidak ditemukan
 */
router.put(
  "/reset-password/:id",
  authMiddleware,
  roleMiddleware("ADMIN"), // 🔥 FIX: sesuai schema lu
  auth.resetPasswordByOwner
);

module.exports = router;