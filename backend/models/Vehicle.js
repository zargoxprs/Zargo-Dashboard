const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, unique: true, trim: true },
    model: { type: String, required: true, trim: true },
    numberPlate: { type: String, required: true, unique: true, trim: true },
    status: {
      type: String,
      enum: ["available", "pdi_pending", "booked", "service"],
      default: "pdi_pending",
    },
    hub: { type: String, default: "HQ" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", VehicleSchema);