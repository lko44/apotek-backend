const express = require("express")
const router = express.Router()
const auth = require("../middleware/authMiddleware")
const holdController = require("../controllers/holdController")

router.post("/", auth, holdController.createHold)
router.get("/", auth, holdController.getAllHold)
router.patch("/:id/recall", auth, holdController.recallHold)
router.delete("/:id", auth, holdController.cancelHold)

module.exports = router