require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const Alert = require("../models/Alert");
const Employee = require("../models/Employee");
const Lead = require("../models/Lead");

(async () => {
  try {
    await connectDB();
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Booking.deleteMany({}),
      Alert.deleteMany({}),
      Employee.deleteMany({}),
      Lead.deleteMany({}),
    ]);

    console.log("Seeding users...");
    // Only create the admin user. Staff logins will be created by the admin via the employees API.
    await User.create([
      { name: "Zargo Admin", email: "admin@zargo.in", password: "Zargo@123", role: "admin", hub: "HQ", forcePasswordChange: false },
    ]);

    console.log("No demo vehicles seeded. Vehicles will be added by staff after login.");

    // No demo bookings or alerts for production-ready inventory.
    // No demo employees seeded. Create employees via the admin UI/API after initial admin login.

    console.log("\nSeed complete.");
    console.log("Admin: admin@zargo.in / Zargo@123");
    console.log("Note: staff login removed from seed. Create employee logins via the admin UI or employees API.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error("Seed failed:", e);
    process.exit(1);
  }
})();