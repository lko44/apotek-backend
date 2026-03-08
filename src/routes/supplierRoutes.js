const express = require("express")
const router = express.Router()

const supplier = require("../controllers/supplierController")
const auth = require("../middleware/authMiddleware")

router.get("/",auth,supplier.getSupplier)
router.get("/:id",auth,supplier.getSupplierById)
router.post("/",auth,supplier.createSupplier)
router.put("/:id",auth,supplier.updateSupplier)
router.delete("/:id",auth,supplier.deleteSupplier)

module.exports = router