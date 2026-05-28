const express = require("express");
const ctrl = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

router.get("/stats", ctrl.stats);

module.exports = router;