const mongoose = require("mongoose");

const DEFAULT_PDI_CHECKLIST = [
  { label: "Battery Health", done: false },
  { label: "Tyre Pressure", done: false },
  { label: "Charger", done: false },
  { label: "Brakes", done: false },
  { label: "Lights", done: false },
  { label: "Indicators", done: false },
  { label: "Horn", done: false },
];

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
    pdiChecklist: {
      type: [
        {
          label: { type: String },
          done: { type: Boolean, default: false },
        },
      ],
      default: () => DEFAULT_PDI_CHECKLIST,
    },
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