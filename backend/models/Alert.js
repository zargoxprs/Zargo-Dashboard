const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["rider", "employee", "management"], default: "management" },
    message: { type: String, required: true },
    severity: { type: String, enum: ["info", "warning", "critical"], default: "info" },
    status: { type: String, enum: ["unread", "read"], default: "unread" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", AlertSchema);