const express = require("express")
const router = express.Router()
const auth = require("../middleware/authMiddleware")
const shiftController = require("../controllers/shiftController")

router.get("/active", auth, shiftController.getActiveShift)
router.post("/buka", auth, shiftController.bukaShift)
router.put("/tutup", auth, shiftController.tutupShift)

module.exports = router