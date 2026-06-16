import { useState, useMemo } from "react";
import { useBookings, useAddBooking } from "@/hooks/useBookings";
import { useLeads } from "@/hooks/useLeads";
import { useVehicles } from "@/hooks/useVehicles";
import StatusBadge from "@/components/StatusBadge";
import { Plus, Search, CalendarDays, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/states/LoadingSkeleton";
import { EmptyState } from "@/components/states/EmptyState";
import { useDateFilter } from "@/context/DateFilterContext";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const CUSTOMER_DOCS_KEY = "zargo_customer_docs";

const getCustomerDocs = (leadId: string): { aadhaar?: any; drivingLicense?: any } => {
  try {
    const stored = localStorage.getItem(CUSTOMER_DOCS_KEY);
    const allDocs = stored ? JSON.parse(stored) : {};
    return allDocs[leadId] ?? {};
  } catch {
    return {};
  }
};

type BookingStatus = "active" | "completed" | "overdue" | "pending";

interface BookingForm {
  riderName: string;
  phone: string;
  vehicle: string;
  startDate: string;
  endDate: string;
  kmLimit: number;
  kmUsed: number;
  status: BookingStatus;
  amount: number;
  paymentMethod: "Cash" | "Online";
  referenceNumber: string;
}

const rentalPlans = [
  { id: "qs-weekly", model: "Quanta S", name: "Weekly", durationDays: 7, rental: 1800, deposit: 1800, kmLimit: 999999, kmLabel: "Unlimited KM" },
  { id: "qs-monthly-2000", model: "Quanta S", name: "Monthly", durationDays: 30, rental: 5400, deposit: 1800, kmLimit: 2000, kmLabel: "2000 KM" },
  { id: "qs-monthly-3000", model: "Quanta S", name: "Monthly", durationDays: 30, rental: 6200, deposit: 1800, kmLimit: 3000, kmLabel: "3000 KM" },
  { id: "qs-monthly-unlimited", model: "Quanta S", name: "Monthly", durationDays: 30, rental: 7000, deposit: 1800, kmLimit: 999999, kmLabel: "Unlimited KM" },
  { id: "qsplus-weekly", model: "Quanta S+", name: "Weekly", durationDays: 7, rental: 1950, deposit: 1950, kmLimit: 999999, kmLabel: "Unlimited KM" },
];

const BookingsPage = () => {
  const bookingsQ = useBookings();
  const bookings = Array.isArray(bookingsQ.data) ? bookingsQ.data : [];
  const { data: vehicles = [] } = useVehicles();
  const addBooking = useAddBooking();
  const leadsQ = useLeads();
  const leads = Array.isArray(leadsQ.data) ? leadsQ.data : [];
  
  // Only show converted leads that have both documents uploaded
  const readyCustomers = leads.filter((lead: any) => {
    if (lead.stage !== "converted") return false;
    const docs = getCustomerDocs(lead.id);
    return !!(docs?.aadhaar && docs?.drivingLicense);
  });
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPlanId, setSelectedPlanId] = useState(rentalPlans[0].id);
  const [form, setForm] = useState<BookingForm>({ riderName: "", phone: "", vehicle: "", startDate: "", endDate: "", kmLimit: rentalPlans[0].kmLimit, kmUsed: 0, status: "active", amount: rentalPlans[0].rental, paymentMethod: "Cash", referenceNumber: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchParams] = useSearchParams();
  const { range } = useDateFilter();
  const { role, user } = useAuth();

  const selectedPlan = rentalPlans.find((plan) => plan.id === selectedPlanId) ?? rentalPlans[0];

  const availableVehicles = Array.isArray(vehicles)
    ? vehicles.filter((v: any) => v?.status === "ready_for_booking")
    : [];
  const filteredVehicles = availableVehicles.filter((v: any) => v.model === selectedPlan.model);
  const vehicleOptions = filteredVehicles;

  const calculateEndDate = (startDate: string, durationDays: number) => {
    if (!startDate) return "";
    const date = new Date(startDate);
    date.setDate(date.getDate() + durationDays);
    return date.toISOString().split("T")[0];
  };

  const handlePlanChange = (planId: string) => {
    const plan = rentalPlans.find((item) => item.id === planId) ?? rentalPlans[0];
    setSelectedPlanId(plan.id);
    setForm((prev) => ({
      ...prev,
      amount: plan.rental,
      kmLimit: plan.kmLimit,
      endDate: calculateEndDate(prev.startDate || new Date().toISOString().split("T")[0], plan.durationDays),
    }));
  };

  const handleStartDateChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      startDate: value,
      endDate: calculateEndDate(value, selectedPlan.durationDays),
    }));
  };

  const safeVehicleText = (vehicle: any) => {
    if (!vehicle) return "N/A";
    if (typeof vehicle === "string") return vehicle;
    return `${vehicle.model ?? ""}${vehicle.numberPlate ? ` – ${vehicle.numberPlate}` : ""}`.trim() || "N/A";
  };

  const getVehicleId = (vehicle: any) => vehicle?._id ?? vehicle?.id ?? "";
  const getVehicleLabel = (vehicle: any) => vehicle ? `${vehicle.model ?? "Unknown"} – ${vehicle.numberPlate ?? vehicle.vehicleId ?? "Unknown"}` : "Unknown vehicle";

  const filtered = useMemo(() => (bookings || []).filter((b) => {
    const safeBooking = b ?? {};
    const vehicleText = safeVehicleText(safeBooking.vehicle);
    const riderName = String(safeBooking.riderName ?? "N/A");
    const bookingId = String(safeBooking.bookingId ?? safeBooking._id ?? safeBooking.id ?? "");
    const term = ((search || searchParams.get("query")) ?? "").toLowerCase();
    const matchSearch = !term || riderName.toLowerCase().includes(term) || bookingId.toLowerCase().includes(term) || vehicleText.toLowerCase().includes(term);
    const matchStatus = statusFilter === "all" || String(safeBooking.status ?? "pending") === statusFilter;

    const startDateStr = safeBooking.startDate ?? safeBooking.start_date ?? safeBooking.createdAt ?? safeBooking.created_at;
    let matchDate = true;
    if (range?.start) {
      matchDate = new Date(startDateStr) >= new Date(range.start);
    }
    if (matchDate && range?.end) {
      matchDate = new Date(startDateStr) <= new Date(range.end);
    }

    let matchRole = true;
    if (role === "staff" && user) {
      try {
        const vehicleObj = safeBooking.vehicle;
        const hub = vehicleObj?.hub || (Array.isArray(vehicles) ? (vehicles as any[]).find((v) => (v._id ?? v.id ?? v.vehicleId) === (vehicleObj?._id || vehicleObj))?.hub : undefined);
        matchRole = hub ? hub === user.hub : true;
      } catch (e) {
        matchRole = true;
      }
    }

    return matchSearch && matchStatus && matchDate && matchRole;
  }), [bookings, search, searchParams, statusFilter, range, role, user, vehicles]);

  const initials = (name: string) => {
    const safeName = String(name ?? "").trim();
    if (!safeName) return "NA";
    return safeName.split(" ").map((n) => n[0] || "").join("").toUpperCase().slice(0, 2);
  };

  const summary = {
    total: bookings?.length || 0,
    active: (bookings || []).filter((b) => (b?.status ?? "pending") === "active").length,
    overdue: (bookings || []).filter((b) => (b?.status ?? "pending") === "overdue").length,
    pending: (bookings || []).filter((b) => (b?.status ?? "pending") === "pending").length,
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!form.riderName.trim()) newErrors.riderName = "Rider name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    if (!form.vehicle) newErrors.vehicle = "Vehicle is required";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    if (!form.endDate) newErrors.endDate = "End date is required";
    if (!form.referenceNumber.trim()) {
      if (form.paymentMethod === "Cash") {
        newErrors.referenceNumber = "Bill Number is required";
      } else {
        newErrors.referenceNumber = "UTR Number is required";
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    addBooking.mutate(form as any, {
      onSuccess: () => {
        setForm({ riderName: "", phone: "", vehicle: "", startDate: "", endDate: "", kmLimit: selectedPlan.kmLimit, kmUsed: 0, status: "active", amount: selectedPlan.rental, paymentMethod: "Cash", referenceNumber: "" });
        setSelectedPlanId(rentalPlans[0].id);
        setErrors({});
        setOpen(false);
      },
    });
  };

  const planDescription = `${selectedPlan.model} ${selectedPlan.name} · ₹${selectedPlan.rental} · Deposit ₹${selectedPlan.deposit} · ${selectedPlan.kmLabel}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage rider bookings and assignments</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus size={16} className="mr-2" />Add Booking</Button>
          </DialogTrigger>
          <DialogContent className="flex flex-col max-h-[90vh]">
            <DialogHeader><DialogTitle>Add Booking</DialogTitle></DialogHeader>
            <div className="overflow-y-auto flex-1 px-6">
              <div className="space-y-6 py-4">
                {/* Rider Details - select only customers ready for booking */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Rider Details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Customer</Label>
                      <Select value={selectedCustomerId} onValueChange={(value) => {
                        setSelectedCustomerId(value);
                        const c = readyCustomers.find((x: any) => x.id === value);
                        if (c) setForm({ ...form, riderName: c.customerName, phone: c.contact });
                      }}>
                        <SelectTrigger><SelectValue placeholder={readyCustomers.length ? "Select customer" : "No ready customers"} /></SelectTrigger>
                        <SelectContent>
                          {readyCustomers.length ? readyCustomers.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>{c.customerName} · {c.contact}</SelectItem>
                          )) : (
                            <SelectItem value="no-customer" disabled>No customers ready for booking</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.riderName && <p className="text-xs text-destructive">{errors.riderName}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone Number</Label>
                      <Input placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Rental Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Rental Details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Rental plan</Label>
                      <Select value={selectedPlanId} onValueChange={handlePlanChange}>
                        <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                        <SelectContent>
                          {rentalPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.model} / {plan.name} / {plan.kmLabel} / ₹{plan.rental}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Vehicle</Label>
                      <Select value={form.vehicle} onValueChange={(value) => setForm({ ...form, vehicle: value })}>
                        <SelectTrigger><SelectValue placeholder={vehicleOptions.length ? "Select available vehicle" : "No available vehicles"} /></SelectTrigger>
                        <SelectContent>
                          {vehicleOptions.length > 0 ? vehicleOptions.map((v: any) => (
                            <SelectItem key={getVehicleId(v)} value={getVehicleId(v)}>{getVehicleLabel(v)}</SelectItem>
                          )) : (
                            <SelectItem value="no-vehicle" disabled>No available vehicles</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.vehicle && <p className="text-xs text-destructive">{errors.vehicle}</p>}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Start Date</Label>
                      <Input type="date" value={form.startDate} onChange={(e) => handleStartDateChange(e.target.value)} />
                      {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>End Date</Label>
                      <Input type="date" value={form.endDate} readOnly />
                      {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as BookingStatus })}>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>KM Used</Label>
                      <Input type="number" value={form.kmUsed} onChange={(e) => setForm({ ...form, kmUsed: Number(e.target.value) })} />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">KM Limit</p>
                      <p className="mt-2 font-semibold">{selectedPlan.kmLabel}</p>
                    </div>
                    <div className="rounded-2xl border border-border p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Duration</p>
                      <p className="mt-2 font-semibold">{selectedPlan.name} ({selectedPlan.durationDays} days)</p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Payment Details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Rental</p>
                      <p className="mt-2 font-semibold">₹{selectedPlan.rental}</p>
                    </div>
                    <div className="rounded-2xl border border-border p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Deposit</p>
                      <p className="mt-2 font-semibold">₹{selectedPlan.deposit}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Payment Method</Label>
                      <Select value={form.paymentMethod} onValueChange={(value) => setForm({ ...form, paymentMethod: value as "Cash" | "Online", referenceNumber: "" })}>
                        <SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Online">Online</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>{form.paymentMethod === "Cash" ? "Bill Number" : "UTR Number"}</Label>
                      <Input
                        placeholder={form.paymentMethod === "Cash" ? "Enter Bill Number" : "Enter UTR Number"}
                        value={form.referenceNumber}
                        onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                      />
                      {errors.referenceNumber && <p className="text-xs text-destructive">{errors.referenceNumber}</p>}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">{planDescription}</div>
                </div>
              </div>
            </div>
            <div className="px-6 pb-4 border-t">
              <Button className="w-full" onClick={handleSubmit}>Create booking</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bookings" value={summary.total} icon={CalendarDays} />
        <StatCard title="Active" value={summary.active} icon={CheckCircle2} accent="success" />
        <StatCard title="Overdue" value={summary.overdue} icon={AlertTriangle} accent="destructive" />
        <StatCard title="Pending" value={summary.pending} icon={Clock} accent="warning" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search bookings..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status.</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border overflow-x-auto">
        {bookingsQ.isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : bookingsQ.error ? (
          <EmptyState title="Failed to load bookings" description="Check your backend connection or refresh the page." />
        ) : filtered.length === 0 ? (
          <EmptyState title="No bookings" description="Try adjusting your filters or create a booking." />
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/60 z-10">
              <tr className="border-b">
                {['ID', 'Rider', 'Vehicle', 'Start', 'End', 'KM', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const booking = b ?? {};
                const safeBookingId = String(booking.bookingId ?? booking._id ?? booking.id ?? "-");
                const safeRiderName = String(booking.riderName ?? "N/A");
                const safePhone = String(booking.phone ?? "-");
                const safeVehicleValue = booking.vehicle ?? "N/A";
                const vehicleRecord = Array.isArray(vehicles)
                  ? (vehicles as any[]).find((v) => getVehicleId(v) === safeVehicleValue)
                  : undefined;
                const safeVehicleLabel = vehicleRecord
                  ? `${vehicleRecord.model ?? ""} – ${vehicleRecord.numberPlate ?? ""}`.trim() || "N/A"
                  : typeof safeVehicleValue === "string"
                    ? safeVehicleValue
                    : `${safeVehicleValue?.vehicleId ?? ""} – ${safeVehicleValue?.numberPlate ?? ""}`.trim() || "N/A";
                const safeStartDateObj = booking.startDate ? new Date(booking.startDate) : null;
                const safeEndDateObj = booking.endDate ? new Date(booking.endDate) : null;
                const safeStartDate = safeStartDateObj instanceof Date && !isNaN(safeStartDateObj.getTime()) ? safeStartDateObj.toLocaleDateString() : "-";
                const safeEndDate = safeEndDateObj instanceof Date && !isNaN(safeEndDateObj.getTime()) ? safeEndDateObj.toLocaleDateString() : "-";
                const safeKmUsed = Number(booking.kmUsed ?? 0);
                const safeKmLimit = Number(booking.kmLimit ?? 0);
                const safeStatus = String(booking.status ?? "pending") as BookingStatus;

                return (
                  <tr key={String(booking._id ?? safeBookingId)} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-medium whitespace-nowrap text-primary">{safeBookingId}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                          {initials(safeRiderName)}
                        </div>
                        <div>
                          <div className="font-medium">{safeRiderName}</div>
                          <div className="text-xs text-muted-foreground">{safePhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">{safeVehicleLabel}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{safeStartDate}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{safeEndDate}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={safeKmUsed > safeKmLimit ? "text-destructive font-semibold" : ""}>{safeKmUsed}</span>
                      <span className="text-muted-foreground">/{safeKmLimit >= 999999 ? "Unlimited" : safeKmLimit}</span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap"><StatusBadge status={safeStatus} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
