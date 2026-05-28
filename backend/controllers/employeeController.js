const Employee = require("../models/Employee");

const User = require("../models/User");
const crypto = require("crypto");

exports.list = async (_req, res, next) => {
  try { res.json(await Employee.find().sort({ createdAt: -1 })); } catch (e) { next(e); }
};
exports.create = async (req, res, next) => {

  try {
    const { name, email, role = "Staff", phone, status = "Active", onboardings = 0, hub = "HQ" } = req.body;
    const normalizedEmail = (email || "").toLowerCase().trim();
    if (!normalizedEmail || !name) {
      return res.status(400).json({ message: "Employee name and email are required" });
    }
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "A login already exists for this email" });
    }

    // Generate a strong random password for the employee login
    const raw = crypto.randomBytes(8).toString("base64");
    const password = raw.replace(/[^a-zA-Z0-9]/g, "A").slice(0, 12);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: role === "Admin" ? "admin" : "staff",
      hub,
      forcePasswordChange: true,
    });

    const employee = await Employee.create({
      name,
      email: normalizedEmail,
      role,
      phone,
      status,
      onboardings,
      hub,
      joinDate: req.body.join_date || req.body.joinDate || new Date(),
    });

    // Try to email credentials to the new employee (optional)
    try {
      const { sendCredentials } = require("../lib/email");
      const subject = "Your Zargo account credentials";
      const html = `<p>Hello ${name},</p><p>Your account has been created. Use the following credentials to sign in:</p><p><strong>Email:</strong> ${user.email}<br/><strong>Password:</strong> ${password}</p><p>Please change your password on first login.</p>`;
      sendCredentials(user.email, subject, html).catch(() => {});
    } catch (e) {
      /* ignore if mail helper not available */
    }

    res.status(201).json({ employee, credentials: { email: user.email, password } });
  } catch (e) {
    next(e);
  }
};
exports.update = async (req, res, next) => {
  try {
    const item = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Employee not found" });
    res.json(item);
  } catch (e) { next(e); }
};
exports.remove = async (req, res, next) => {
  try {
    const item = await Employee.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Employee not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
};