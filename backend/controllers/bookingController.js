const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

exports.list = async (_req, res, next) => {
  try { res.json(await Booking.find().populate("vehicle").sort({ createdAt: -1 })); } catch (e) { next(e); }
};
exports.get = async (req, res, next) => {
  try {
    const item = await Booking.findById(req.params.id).populate("vehicle");
    if (!item) return res.status(404).json({ message: "Booking not found" });
    res.json(item);
  } catch (e) { next(e); }
};
exports.create = async (req, res, next) => {
  try {

    const payload = {
      ...req.body,
      bookingId: req.body.bookingId || `BKG-${Date.now()}`,
    };
    const item = await Booking.create(payload);    if (item.vehicle && item.status === "active") {
      await Vehicle.findByIdAndUpdate(item.vehicle, { status: "rented" });
    }
    res.status(201).json(item);
  } catch (e) { next(e); }
};
exports.update = async (req, res, next) => {
  try {
    const item = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Booking not found" });
    res.json(item);
  } catch (e) { next(e); }
};
exports.remove = async (req, res, next) => {
  try {
    const item = await Booking.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Booking not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
};