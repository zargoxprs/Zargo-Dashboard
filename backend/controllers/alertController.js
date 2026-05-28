const Alert = require("../models/Alert");

exports.list = async (_req, res, next) => {
  try { res.json(await Alert.find().sort({ createdAt: -1 })); } catch (e) { next(e); }
};
exports.create = async (req, res, next) => {
  try { res.status(201).json(await Alert.create(req.body)); } catch (e) { next(e); }
};
exports.markRead = async (req, res, next) => {
  try {
    const item = await Alert.findByIdAndUpdate(req.params.id, { status: "read" }, { new: true });
    if (!item) return res.status(404).json({ message: "Alert not found" });
    res.json(item);
  } catch (e) { next(e); }
};
exports.remove = async (req, res, next) => {
  try {
    const item = await Alert.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Alert not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
};