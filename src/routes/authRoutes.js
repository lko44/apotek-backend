const express = require("express");
const router = express.Router();

const auth = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

/**
 * @openapi
 * /auth/login:
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
 *         description: Akses ditolak
 *       404:
 *         description: User tidak ditemukan
 */
router.put(
  "/reset-password/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  auth.resetPasswordByOwner
);

/**
 * @openapi
 * /api/v1/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Mendapatkan profile user yang sedang login
 *     description: Mengambil data user berdasarkan token JWT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Admin
 *                     email:
 *                       type: string
 *                       example: admin@gmail.com
 *                     role:
 *                       type: string
 *                       example: ADMIN
 *       401:
 *         description: Token tidak valid
 *       404:
 *         description: User tidak ditemukan
 */
router.get("/login", authMiddleware, auth.getProfile);

/**
 * @openapi
 * /api/v1/auth/users:
 *   get:
 *     tags: [Auth]
 *     summary: Mendapatkan semua user
 *     description: Hanya ADMIN yang dapat melihat daftar user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Admin
 *                       email:
 *                         type: string
 *                         example: admin@gmail.com
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: Akses ditolak
 */
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("ADMIN"),
  auth.getAllUsers
);

module.exports = router;