const User = require("../models/User");
const { signToken } = require("../middleware/authMiddleware");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.login = async (req, res) => {
  try {
    const { identifier, email, password } = req.body || {};
    const id = (identifier || email || "").toString().trim();
    if (!id || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    const normalizedId = id.toLowerCase();
    const search = id.includes("@")
      ? { email: normalizedId }
      : {
          $or: [
            { email: normalizedId },
            { name: new RegExp(`^${escapeRegExp(id)}$`, "i") },
          ],
        };
    const user = await User.findOne(search).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = signToken(user);
    return res.json({ token, user: user.toSafeJSON() });
  } catch (e) {
    return res.status(500).json({ message: "Login failed" });
  }
};

exports.me = async (req, res) => res.json(req.user.toSafeJSON());

exports.logout = async (_req, res) => res.json({ ok: true });

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { oldPassword, newPassword } = req.body || {};
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    const user = await User.findById(userId).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // If user is not required to change password, verify oldPassword
    if (!user.forcePasswordChange) {
      if (!oldPassword) return res.status(400).json({ message: "Old password is required" });
      const ok = await user.comparePassword(oldPassword);
      if (!ok) return res.status(401).json({ message: "Old password is incorrect" });
    }

    user.password = newPassword;
    user.forcePasswordChange = false;
    await user.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: "Failed to change password" });
  }
};