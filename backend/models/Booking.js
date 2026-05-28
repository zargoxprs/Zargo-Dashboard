const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, trim: true },
    riderName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    kmUsed: { type: Number, default: 0 },
    kmLimit: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "completed", "overdue", "pending"], default: "pending" },
    amount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);