const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, unique: true, trim: true },
    model: { type: String, required: true, trim: true },
    numberPlate: { type: String, required: true, unique: true, trim: true },
    status: {
      type: String,
      enum: ["available", "pdi_pending", "booked", "service", "ready_for_booking"],
      default: "pdi_pending",
    },
    hub: { type: String, default: "HQ" },
    pdiComments: { type: String, default: "" },
    pdiChecklist: [
      {
        label: { type: String },
        done: { type: Boolean, default: false },
      },
    ],
    pdiHistory: [
      {
        id: { type: String },
        action: { type: String },
        details: { type: String },
        timestamp: { type: String },
      },
    ],
    pdiKycLicense: {
      name: { type: String },
      url: { type: String },
    },
    pdiKycAadhaar: {
      name: { type: String },
      url: { type: String },
    },
    pdiOdometerPhoto: {
      name: { type: String },
      url: { type: String },
    },
    pdiVehiclePhotos: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
    completedAt: { type: String },
    completedBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", VehicleSchema);