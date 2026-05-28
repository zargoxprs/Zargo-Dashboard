const express = require("express");
const ctrl = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);
router.get("/summary", ctrl.summary);

module.exports = router;
