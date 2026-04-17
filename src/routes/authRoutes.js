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
 *     summary: Login user menggunakan username
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: 123456
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
 *       401:
 *         description: Username atau password salah
 */
router.post("/login", auth.login);

/**
 * @openapi
 * /api/v1/auth/reset-password/{id}:
 *   put:
 *     tags: [Auth]
 *     summary: Reset password user oleh OWNER
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
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: passwordBaru123
 *     responses:
 *       200:
 *         description: Password berhasil direset
 *       401:
 *         description: Token tidak valid / tidak ada
 *       403:
 *         description: Bukan OWNER (akses ditolak)
 *       404:
 *         description: User tidak ditemukan
 */
router.put(
  "/reset-password/:id",
  authMiddleware,
  roleMiddleware("OWNER"),
  auth.resetPasswordByOwner
);

module.exports = router;