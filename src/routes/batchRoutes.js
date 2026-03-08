const express = require("express")
const router = express.Router()
const batch = require("../controllers/batchControllers")

router.get("/hampir-expired", batch.getBatchHampirExpired)

module.exports = router