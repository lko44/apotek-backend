const express = require("express")
const router = express.Router()
const auth = require("../controllers/authController")

router.post("/register",auth.register)
router.post("/send-code",auth.sendCode)
router.post("/verify",auth.verifyCode)
router.post("/login",auth.login)

module.exports = router