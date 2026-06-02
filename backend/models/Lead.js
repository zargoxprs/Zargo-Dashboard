const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    source: { type: String, required: true, trim: true, default: "Website" },
    stage: {
      type: String,
      enum: ["new", "contacted", "qualified", "converted", "rejected"],
      default: "new",
    },
    assignedTo: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", LeadSchema);
