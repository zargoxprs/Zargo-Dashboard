const express = require("express");
const ctrl = require("../controllers/employeeController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect, adminOnly);

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.patch("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;