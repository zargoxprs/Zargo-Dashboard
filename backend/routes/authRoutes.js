const express = require("express");
const ctrl = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", ctrl.login);
router.get("/me", protect, ctrl.me);
router.post("/logout", protect, ctrl.logout);
router.post("/change-password", protect, ctrl.changePassword);

module.exports = router;