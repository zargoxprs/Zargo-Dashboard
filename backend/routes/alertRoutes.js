const express = require("express");
const ctrl = require("../controllers/alertController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.patch("/:id/read", ctrl.markRead);
router.delete("/:id", ctrl.remove);

module.exports = router;