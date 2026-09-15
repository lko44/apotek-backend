const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const kasKecilController = require("../controllers/kasKecilController");

router.post("/", auth, kasKecilController.create);
router.get("/", auth, kasKecilController.list);

module.exports = router;