const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const Alert = require("../models/Alert");

exports.stats = async (_req, res, next) => {
  try {
    const [vehicles, bookings, alerts] = await Promise.all([
      Vehicle.find(), Booking.find(), Alert.find(),
    ]);
    const revenue = bookings
      .filter((b) => b.status === "completed")
      .reduce((s, b) => s + (b.amount || 0), 0);
    res.json({
      totalVehicles: vehicles.length,
      availableVehicles: vehicles.filter((v) => v.status === "available").length,
      deployedVehicles: vehicles.filter((v) => v.status === "rented").length,
      activeRentals: bookings.filter((b) => b.status === "active").length,
      overdueVehicles: bookings.filter((b) => b.status === "overdue").length,
      totalCustomers: new Set(bookings.map((b) => b.phone)).size,
      unreadAlerts: alerts.filter((a) => a.status === "unread").length,
      revenue: `₹${revenue.toLocaleString("en-IN")}`,
    });
  } catch (e) { next(e); }
};