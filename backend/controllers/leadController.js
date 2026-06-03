const Lead = require("../models/Lead");

const getNextLeadId = async () => {
  const count = await Lead.countDocuments();
  return `Ld${String(count + 1).padStart(3, "0")}`;
};

const fillMissingLeadIds = async (leads) => {
  const sorted = [...leads].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    if (aTime !== bTime) return aTime - bTime;
    return String(a._id).localeCompare(String(b._id));
  });

  const updatedLeads = await Promise.all(
    sorted.map(async (lead, index) => {
      if (lead.leadId) return lead;
      const generatedId = `Ld${String(index + 1).padStart(3, "0")}`;
      return await Lead.findByIdAndUpdate(lead._id, { leadId: generatedId }, { new: true });
    })
  );

  return updatedLeads.map((lead) => ({ ...lead.toObject(), leadId: lead.leadId }));
};

exports.list = async (_req, res, next) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(await fillMissingLeadIds(leads));
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
    const payload = {
      ...req.body,
      leadId: req.body.leadId || (await getNextLeadId()),
    };
    res.status(201).json(await Lead.create(payload));
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
