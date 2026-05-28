// Centralized domain types — used across services, hooks and UI.
export type UserRole = "admin" | "staff";

export interface User {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  role: UserRole;
  hub?: string;
  forcePasswordChange?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type VehicleStatus = "available" | "rented" | "service" | "idle";

export interface Vehicle {

  _id: string;
  vehicleId: string;
  numberPlate: string;
  model: string;
  battery: number;
  status: VehicleStatus;
  hub: string;
  health: "good" | "fair" | "poor";
  lastServiceDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = "active" | "completed" | "overdue" | "pending";

export interface Booking {

  _id: string;
  bookingId: string;
  riderName: string;
  phone: string;
  vehicle: string | Vehicle;
  startDate: string;
  endDate: string;
  kmUsed: number;
  kmLimit: number;
  status: BookingStatus;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertType = "rider" | "employee" | "management";

export interface Alert {
  id: string;
  message: string;
  type: AlertType;
  severity: AlertSeverity;
  status: "unread" | "read";
  created_at: string;
}

export interface Activity {
  id: string;
  type: "booking" | "vehicle" | "kyc" | "payment" | "employee" | "service" | "alert" | string;
  message: string;
  created_at: string;
  meta?: Record<string, any>;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Admin" | "Manager" | "Staff";
  onboard_count: number;
  join_date: string;
  status: "Active" | "Inactive";
}

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  deployedVehicles: number;
  activeRentals: number;
  overdueVehicles: number;
  totalCustomers: number;
  unreadAlerts: number;
  revenue: number;
}

export interface ReportSummary {
  fleetSize: number;
  totalBookings: number;
  completedBookings: number;
  totalOnboarded: number;
  vehicleStatusBreakdown: { name: VehicleStatus; value: number }[];
  bookingStatusBreakdown: { status: BookingStatus; count: number }[];
  rentalTrend: { month: string; rentals: number; revenue: number }[];
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface AsyncState<T> {
  data: T | undefined;
  isLoading: boolean;
  error: ApiError | null;
}