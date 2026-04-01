const express = require("express")
const router = express.Router()
const auth = require("../controllers/authController")

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register user baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Enriko
 *               email:
 *                 type: string
 *                 example: enriko@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Berhasil daftar
 */
router.post("/register", auth.register)

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: enriko@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Berhasil login
 */
router.post("/login", auth.login)

/**
 * @openapi
 * /api/v1/auth/send-code:
 *   post:
 *     tags: [Auth]
 *     summary: Mengirim kode verifikasi ke email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: enriko@gmail.com
 *     responses:
 *       200:
 *         description: Kode verifikasi berhasil dikirim
 */
router.post("/send-code", auth.sendCode)

/**
 * @openapi
 * /api/v1/auth/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Verifikasi kode OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: enriko@gmail.com
 *               code:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Verifikasi berhasil
 */
router.post("/verify", auth.verifyCode)
/**
 * @openapi
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Request reset password (kirim kode OTP ke email)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: enriko@gmail.com
 *     responses:
 *       200:
 *         description: Kode reset berhasil dikirim ke email
 */
router.post("/forgot-password", auth.forgotPassword)

/**
 * @openapi
 * /api/v1/auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset password menggunakan kode OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: enriko@gmail.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: passwordBaru123
 *     responses:
 *       200:
 *         description: Password berhasil diperbarui
 */
router.post("/reset-password", auth.resetPassword)
module.exports = router