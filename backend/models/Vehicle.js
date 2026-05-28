const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, unique: true, trim: true },
    model: { type: String, required: true, trim: true },
    numberPlate: { type: String, required: true, unique: true, trim: true },
    battery: { type: Number, default: 100, min: 0, max: 100 },
    status: {
      type: String,
      enum: ["available", "rented", "service", "idle"],
      default: "available",
    },
    hub: { type: String, default: "HQ" },
    health: { type: String, enum: ["good", "fair", "poor"], default: "good" },
    lastServiceDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", VehicleSchema);