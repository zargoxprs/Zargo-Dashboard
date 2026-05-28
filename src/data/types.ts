export interface Vehicle {

  _id: string;
  vehicleId: string;
  model: string;
  numberPlate: string;
  battery: number;
  status: "available" | "rented" | "service" | "idle";
  hub: string;
  health: "good" | "fair" | "poor";
  lastServiceDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  bookingId: string;
  riderName: string;
  phone: string;
  vehicle: string | Vehicle; // ObjectId string or populated Vehicle
  startDate: string;
  endDate: string;
  kmUsed: number;
  kmLimit: number;
  status: "active" | "completed" | "overdue" | "pending";
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  type: "rider" | "employee" | "management";
  message: string;
  severity: "info" | "warning" | "critical";
  status: "unread" | "read";
  created_at: string;
}

export interface Employee {
  _id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Staff";
  phone: string;
  status: "Active" | "Inactive";
  onboardings: number;
  hub: string;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  hub: string;
  createdAt: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
