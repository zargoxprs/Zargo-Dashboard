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

export type VehicleStatus = "available" | "pdi_pending" | "booked" | "service" | "ready_for_booking";

export interface UploadFile {
  name: string;
  url: string;
}

export interface PdiChecklistItem {
  label: string;
  done: boolean;
}

export interface PdiAuditRecord {
  id: string;
  action: string;
  details?: string;
  timestamp: string;
}

export interface Vehicle {
  _id: string;
  vehicleId: string;
  numberPlate: string;
  model: string;
  status: VehicleStatus;
  hub: string;
  createdAt: string;
  updatedAt: string;
  pdiComments?: string;
  pdiChecklist?: PdiChecklistItem[];
  pdiHistory?: PdiAuditRecord[];
  pdiKycLicense?: UploadFile;
  pdiKycAadhaar?: UploadFile;
  pdiOdometerPhoto?: UploadFile;
  pdiVehiclePhotos?: UploadFile[];
  completedAt?: string;
  completedBy?: string;
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
  type: "booking" | "vehicle" | "payment" | "employee" | "service" | "alert" | string;
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

export type LeadStage = "new" | "contacted" | "interested" | "qualified" | "converted" | "lost";

export interface Lead {
  id: string;
  leadId?: string;
  customerName: string;
  contact: string;
  source: string;
  stage: LeadStage;
  assignedTo: string;
  notes?: string;
  createdAt: string;
}

export interface OnboardingWorkflow {
  id: string;
  vehicleId: string;
  model: string;
  hub: string;
  assignedTo: string;
  stage: "assigned" | "pdi" | "odometer" | "photos" | "submitted" | "approval" | "available";
  checklist: { label: string; done: boolean }[];
  odometerPhotoRequired: boolean;
  photosRequired: boolean;
  status: string;
  createdAt: string;
}

export interface RenewalTask {
  id: string;
  customer: string;
  vehicleModel: string;
  dueDate: string;
  status: "due" | "upcoming" | "overdue";
  assignedTo: string;
  amount: number;
  createdAt: string;
}

export interface RecoveryCase {
  id: string;
  customer: string;
  vehicleModel: string;
  overdueBy: string;
  status: "open" | "contacted" | "recovered" | "escalated";
  assignedTo: string;
  createdAt: string;
}

export interface ReturnWorkflow {
  id: string;
  bookingId: string;
  vehicle: string;
  returnOdometer: number | null;
  photosSubmitted: boolean;
  pdiChecklistCompleted: boolean;
  refundRequested: boolean;
  refundApproved: boolean;
  accountClosed: boolean;
  status: "pending-return" | "in-review" | "refund-requested" | "closed";
  assignedTo: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  customer: string;
  type: "rental" | "security-deposit" | "refund";
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "refunded";
  assignedTo: string;
  createdAt: string;
}

export interface InsuranceCase {
  id: string;
  policyNumber: string;
  vehicle: string;
  type: "policy" | "claim";
  status: "active" | "expiring" | "claimed" | "closed";
  premium: number;
  renewalDate: string;
  assignedTo: string;
  createdAt: string;
}

export interface ServiceJobCard {
  id: string;
  vehicle: string;
  jobType: string;
  assignedTo: string;
  status: "scheduled" | "in-progress" | "completed" | "inspection";
  priority: "low" | "medium" | "high";
  reportedIssue: string;
  createdAt: string;
}

export interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  module: "Onboarding" | "Returns" | "Service" | "Insurance" | "Renewals" | "Recovery";
  assignedTo: string;
  dueDate: string;
  status: "assigned" | "in-progress" | "awaiting-approval" | "completed";
  createdAt: string;
}

export interface AsyncState<T> {
  data: T | undefined;
  isLoading: boolean;
  error: ApiError | null;
}