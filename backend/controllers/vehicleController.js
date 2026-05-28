const Vehicle = require("../models/Vehicle");

exports.list = async (_req, res, next) => {
  try { res.json(await Vehicle.find().sort({ createdAt: -1 })); } catch (e) { next(e); }
};
exports.get = async (req, res, next) => {
  try {
    const item = await Vehicle.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Vehicle not found" });
    res.json(item);
  } catch (e) { next(e); }
};
exports.create = async (req, res, next) => {
  try { res.status(201).json(await Vehicle.create(req.body)); } catch (e) { next(e); }
};
exports.update = async (req, res, next) => {
  try {
    const item = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Vehicle not found" });
    res.json(item);
  } catch (e) { next(e); }
};
exports.remove = async (req, res, next) => {
  try {
    const item = await Vehicle.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
};