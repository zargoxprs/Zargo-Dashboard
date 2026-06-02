const express = require("express");
const ctrl = require("../controllers/leadController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Listing and getting leads remain protected behind auth.
router.get("/", protect, ctrl.list);
router.get("/:id", protect, ctrl.get);

// Public creation endpoint: leads can originate from public sources (website forms),
// so allow POST without authentication to avoid 404/401 for unauthenticated clients.
router.post("/", ctrl.create);

// Updating a lead requires authentication.
router.patch("/:id", protect, ctrl.update);

module.exports = router;
