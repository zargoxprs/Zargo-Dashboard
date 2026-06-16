import { create } from "zustand";
import { Vehicle, Booking, Alert, Employee, Lead } from "./types";


function generateAlerts(bookings: Booking[], existingAlerts: Alert[]): Alert[] {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const auto: Alert[] = [];
  let id = 1;

  const existingByMessage = new Map(existingAlerts.map((a) => [a.message, a]));

  for (const b of bookings) {
    if (b.status === "completed") continue;
    const end = new Date(b.end_date);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      auto.push({ id: `AUTO-${id++}`, message: `Vehicle not returned – ${b.rider_name}`, type: "management", severity: "critical", status: "unread", created_at: todayStr });
    }
    if (diff >= 3 && diff <= 7) {
      auto.push({ id: `AUTO-${id++}`, message: `${diff} days left for ${b.rider_name}`, type: "rider", severity: "info", status: "unread", created_at: todayStr });
    }
    if (diff >= 0 && diff <= 2) {
      auto.push({ id: `AUTO-${id++}`, message: `${diff} day${diff !== 1 ? "s" : ""} left for ${b.rider_name}`, type: "rider", severity: "warning", status: "unread", created_at: todayStr });
    }
    if (b.current_km > b.allowed_km) {
      auto.push({ id: `AUTO-${id++}`, message: `KM exceeded for ${b.rider_name} (${b.current_km}/${b.allowed_km} km)`, type: "rider", severity: "warning", status: "unread", created_at: todayStr });
    }
  }

  const mergedAuto = auto.map((alert) => {
    const previous = existingByMessage.get(alert.message);
    return previous ? { ...alert, id: previous.id, status: previous.status } : alert;
  });

  const manual = existingAlerts.filter((a) => !a.id.startsWith("AUTO-"));
  return [...mergedAuto, ...manual];
}

function applyBookingStatuses(bookings: Booking[]): Booking[] {
  const today = new Date();
  return bookings.map((b) => {
    if (b.status === "completed") return b;
    const end = new Date(b.end_date);
    if (today > end) return { ...b, status: "overdue" as const };
    return b;
  });
}

interface AppState {
  vehicles: Vehicle[];
  bookings: Booking[];
  alerts: Alert[];
  activities: import("@/types").Activity[];
  employees: Employee[];
  leads: Lead[];
  addVehicle: (v: Omit<Vehicle, "id" | "created_at">) => void;
  updateVehicle: (id: string, v: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addBooking: (b: Omit<Booking, "id" | "created_at">) => void;
  updateBookingStatus: (id: string, status: Booking["status"]) => void;
  addAlert: (a: Omit<Alert, "id" | "created_at">) => void;
  markAlertRead: (id: string) => void;
  addActivity: (a: Omit<import("@/types").Activity, "id" | "created_at">) => void;
  addEmployee: (e: Omit<Employee, "id">) => void;
  removeEmployee: (id: string) => void;
  updateEmployeeCount: (id: string, count: number) => void;
  addLead: (l: Omit<Lead, "id" | "createdAt">) => void;
  updateLead: (id: string, lead: Partial<Lead>) => void;
}

export const useStore = create<AppState>((set) => ({

  vehicles: [],
  bookings: [],
  alerts: [],
  activities: [],
  employees: [],
  leads: [],

  addVehicle: (v) => set((s) => ({
    vehicles: [...s.vehicles, { ...v, id: `V${String(s.vehicles.length + 1).padStart(3, "0")}`, created_at: new Date().toISOString().split("T")[0] }],
  })),
  updateVehicle: (id, v) => set((s) => ({
    vehicles: s.vehicles.map((x) => (x.id === id ? { ...x, ...v } : x)),
  })),
  deleteVehicle: (id) => set((s) => ({
    vehicles: s.vehicles.filter((x) => x.id !== id),
  })),
  addBooking: (b) => set((s) => {
    const bookingId = `BKG-${s.bookings.length + 100}`;
    const entry = {
      ...b,
      _id: bookingId,
      bookingId,
      created_at: new Date().toISOString().split("T")[0],
    };
    const newBookings = [...s.bookings, entry];
    const updated = applyBookingStatuses(newBookings);
    // add activity for booking created
    const activityMsg = `New booking ${b.rider_name ?? b.riderName ?? ""} (${bookingId}) created`;
    const newActivity = { id: `ACT-${s.activities.length + 1}`, type: "booking", message: activityMsg, created_at: new Date().toISOString() };
    return { bookings: updated, alerts: generateAlerts(updated, s.alerts), activities: [newActivity, ...s.activities] };
  }),
  updateBookingStatus: (id, status) => set((s) => {
    const newBookings = s.bookings.map((x) => ((x.id === id || x._id === id || x.bookingId === id) ? { ...x, status } : x));
    const updated = applyBookingStatuses(newBookings);
    // when status changes to 'active' or 'overdue' we can add activity
    const msg = `Booking ${id} status updated to ${status}`;
    const newActivity = { id: `ACT-${s.activities.length + 1}`, type: "booking", message: msg, created_at: new Date().toISOString() };
    return { bookings: updated, alerts: generateAlerts(updated, s.alerts), activities: [newActivity, ...s.activities] };
  }),
  addLead: (l) => set((s) => ({
    leads: [...s.leads, { ...l, id: `L${String(s.leads.length + 1).padStart(3, "0")}`, leadId: `Ld${String(s.leads.length + 1).padStart(3, "0")}`, createdAt: new Date().toISOString() }],
  })),
  updateLead: (id, lead) => set((s) => ({
    leads: s.leads.map((x) => (x.id === id ? { ...x, ...lead } : x)),
  })),
  addAlert: (a) => set((s) => ({
    alerts: [{ ...a, id: `A${s.alerts.length + 1}`, created_at: new Date().toISOString().split("T")[0] }, ...s.alerts],
    activities: [{ id: `ACT-${s.activities.length + 1}`, type: "alert", message: a.message, created_at: new Date().toISOString() }, ...s.activities],
  })),
  markAlertRead: (id) => set((s) => ({
    alerts: s.alerts.map((x) => (x.id === id ? { ...x, status: "read" as const } : x)),
  })),
  markAllAlertsRead: () => set((s) => ({
    alerts: s.alerts.map((x) => ({ ...x, status: "read" as const })),
  })),
  addEmployee: (e) => set((s) => ({
    employees: [...s.employees, { ...e, id: `E${String(s.employees.length + 1).padStart(3, "0")}` }],
    activities: [{ id: `ACT-${s.activities.length + 1}`, type: "employee", message: `${e.name} added`, created_at: new Date().toISOString() }, ...s.activities],
  })),
  removeEmployee: (id) => set((s) => ({
    employees: s.employees.filter((x) => x.id !== id),
  })),
  updateEmployeeCount: (id, count) => set((s) => ({
    employees: s.employees.map((x) => (x.id === id ? { ...x, onboard_count: count } : x)),
  })),
  addActivity: (a) => set((s) => ({ activities: [{ ...a, id: `ACT-${s.activities.length + 1}`, created_at: new Date().toISOString() }, ...s.activities] })),
}));
