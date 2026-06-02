const Lead = require("../models/Lead");

exports.list = async (_req, res, next) => {
  try {
    res.json(await Lead.find().sort({ createdAt: -1 }));
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    const item = await Lead.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Lead not found" });
    res.json(item);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    res.status(201).json(await Lead.create(req.body));
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Lead not found" });
    res.json(item);
  } catch (e) {
    next(e);
  }
};
