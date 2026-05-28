const express = require("express");
const ctrl = require("../controllers/vehicleController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", ctrl.list);
router.get("/:id", ctrl.get);

router.post("/", ctrl.create);router.patch("/:id", adminOnly, ctrl.update);
router.delete("/:id", adminOnly, ctrl.remove);

module.exports = router;