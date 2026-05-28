const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ["Admin", "Manager", "Staff"], default: "Staff" },
    phone: { type: String, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    onboardings: { type: Number, default: 0 },
    hub: { type: String, default: "HQ" },
    joinDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", EmployeeSchema);