const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const Employee = require("../models/Employee");

const getLastMonths = (count) => {
  const months = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ name: d.toLocaleString("default", { month: "short" }), year: d.getFullYear(), value: `${d.toLocaleString("default", { month: "short" })}` });
  }
  return months;
};

exports.summary = async (_req, res, next) => {
  try {
    const [vehicles, bookings, employees] = await Promise.all([
      Vehicle.find(),
      Booking.find(),
      Employee.find(),
    ]);

    const vehicleStatusBreakdown = ["available", "rented", "service", "idle"].map((status) => ({
      name: status,
      value: vehicles.filter((v) => v.status === status).length,
    }));

    const bookingStatusBreakdown = ["active", "pending", "overdue", "completed"].map((status) => ({
      status,
      count: bookings.filter((b) => b.status === status).length,
    }));

    const months = getLastMonths(6);
    const rentalTrend = months.map((month) => {
      const count = bookings.filter((b) => {
        const date = new Date(b.startDate || b.start_date);
        return date.getFullYear() === month.year && date.toLocaleString("default", { month: "short" }) === month.value;
      }).length;
      return { month: month.value, rentals: count, revenue: 0 };
    });

    res.json({
      fleetSize: vehicles.length,
      totalBookings: bookings.length,
      completedBookings: bookings.filter((b) => b.status === "completed").length,
      totalOnboarded: employees.reduce((sum, employee) => sum + (employee.onboardings || 0), 0),
      vehicleStatusBreakdown,
      bookingStatusBreakdown,
      rentalTrend,
    });
  } catch (error) {
    next(error);
  }
};