import { Booking, Lead, UploadFile, Vehicle, VehicleStatus, BookingStatus } from "@/types";

export interface CustomerDocsMap {
  [leadId: string]: { aadhaar?: UploadFile; drivingLicense?: UploadFile };
}

const CUSTOMER_DOCS_KEY = "zargo_customer_docs";

export const getVehicleKey = (vehicle: Vehicle | string | null | undefined): string => {
  if (!vehicle) return "";
  if (typeof vehicle === "string") return vehicle;
  return vehicle._id ?? vehicle.id ?? vehicle.vehicleId ?? vehicle.numberPlate ?? "";
};

export const getPendingPdiVehicles = (vehicles: Vehicle[]) => vehicles.filter((v) => v.status === "pdi_pending");
export const getReadyForBookingVehicles = (vehicles: Vehicle[]) => vehicles.filter((v) => v.status === "ready_for_booking");
export const getAvailableVehicles = (vehicles: Vehicle[]) => vehicles.filter((v) => v.status === "available");
export const getCompletedPdiVehicles = (vehicles: Vehicle[]) => getReadyForBookingVehicles(vehicles);
export const getBookedVehicles = (bookings: Booking[]) => bookings.filter((b) => b.status === "active" || b.status === "overdue");
export const getBookedVehicleIds = (bookings: Booking[]) => new Set(bookings
  .filter((b) => b.status !== "completed")
  .map((b) => getVehicleKey(b.vehicle))
  .filter(Boolean) as string[]);

export const getCustomersWithActiveBookings = (bookings: Booking[]) => new Set(
  bookings
    .filter((b) => b.status === "active")
    .map((b) => (b as any).riderId ?? (b as any).customerId ?? "")
    .filter(Boolean)
);

export const getAllCustomerDocs = (): CustomerDocsMap => {
  try {
    const stored = localStorage.getItem(CUSTOMER_DOCS_KEY);
    return stored ? (JSON.parse(stored) as CustomerDocsMap) : {};
  } catch {
    return {};
  }
};

export const getCustomerDocs = (leadId: string): { aadhaar?: UploadFile; drivingLicense?: UploadFile } => {
  const allDocs = getAllCustomerDocs();
  return allDocs[leadId] ?? {};
};

export const saveCustomerDocs = (leadId: string, docs: { aadhaar?: UploadFile; drivingLicense?: UploadFile }) => {
  try {
    const allDocs = getAllCustomerDocs();
    allDocs[leadId] = { ...allDocs[leadId], ...docs };
    localStorage.setItem(CUSTOMER_DOCS_KEY, JSON.stringify(allDocs));
  } catch {
    // ignore localStorage failures
  }
};

export const hasCustomerDocs = (docs?: { aadhaar?: UploadFile; drivingLicense?: UploadFile }) => !!docs?.aadhaar && !!docs?.drivingLicense;

export const VEHICLE_STATUSES: VehicleStatus[] = ["pdi_pending", "ready_for_booking", "available", "service"];
export const BOOKING_STATUSES: BookingStatus[] = ["active", "pending", "overdue", "completed"];

export const getAvailableCustomers = (
  leads: Lead[],
  docs: CustomerDocsMap,
  activeBookingCustomerIds: Set<string>
) => leads.filter((lead) =>
  lead.stage === "converted" &&
  !activeBookingCustomerIds.has(lead.id) &&
  hasCustomerDocs(docs[lead.id])
);
