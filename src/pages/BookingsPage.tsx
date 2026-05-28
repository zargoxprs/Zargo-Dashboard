import { useState, useMemo } from "react";
import { useBookings, useAddBooking } from "@/hooks/useBookings";
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
}

const BookingsPage = () => {
  const bookingsQ = useBookings();
  const bookings = Array.isArray(bookingsQ.data) ? bookingsQ.data : [];
  const { data: vehicles = [] } = useVehicles();
  const addBooking = useAddBooking();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [form, setForm] = useState<BookingForm>({ riderName: "", phone: "", vehicle: "", startDate: "", endDate: "", kmLimit: 1500, kmUsed: 0, status: "active" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchParams] = useSearchParams();
  const { range } = useDateFilter();
  const { role, user } = useAuth();

  const isLoading = bookingsQ.isLoading;
  const hasBookings = bookings.length > 0;

  const normalizedVehicleText = (vehicle: any) => {
    if (!vehicle) return "N/A";
    if (typeof vehicle === "string") return vehicle;
    return `${vehicle.vehicleId ?? vehicle.vehicle_number ?? vehicle.model ?? ""} ${vehicle.numberPlate ?? vehicle.vehicle_number ?? ""} ${vehicle.model ?? ""}`.trim() || "N/A";
  };

  const getVehicleId = (vehicle: any) => vehicle?._id ?? vehicle?.id ?? "";
  const getVehicleLabel = (vehicle: any) => {
    if (!vehicle) return "Unknown vehicle";
    return `${vehicle.model ?? ""} – ${vehicle.numberPlate ?? vehicle.vehicle_number ?? vehicle.vehicleId ?? ""}`.trim() || "Unknown vehicle";
  };

  const availableVehicles = Array.isArray(vehicles) ? vehicles.filter((v: any) => v?.status === "available") : [];

  const paramQ = searchParams.get("query") ?? "";

  const filtered = useMemo(() => (bookings || []).filter((b) => {
    const safeBooking = b ?? {};
    const vehicleText = normalizedVehicleText(safeBooking.vehicle);
    const riderName = String(safeBooking.riderName ?? "N/A");
    const bookingId = String(safeBooking.bookingId ?? "");
    const term = (search || paramQ).toLowerCase();
    const matchSearch = !term || riderName.toLowerCase().includes(term) || bookingId.toLowerCase().includes(term) || vehicleText.toLowerCase().includes(term);
    const matchStatus = statusFilter === "all" || String(safeBooking.status ?? "pending") === statusFilter;

    // date range filter (based on start date or created)
    const startDateStr = safeBooking.startDate ?? safeBooking.start_date ?? safeBooking.createdAt ?? safeBooking.created_at;
    let matchDate = true;
    if (range?.start) {
      matchDate = new Date(startDateStr) >= new Date(range.start);
    }
    if (matchDate && range?.end) {
      matchDate = new Date(startDateStr) <= new Date(range.end);
    }

    // staff scoping: staff only sees bookings related to their hub or assigned bookings
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
  }), [bookings, search, paramQ, statusFilter, range, role, user, vehicles]);

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
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    addBooking.mutate(form as any, {
      onSuccess: () => {
        setForm({ riderName: "", phone: "", vehicle: "", startDate: "", endDate: "", kmLimit: 1500, kmUsed: 0, status: "active" });
        setErrors({});
        setOpen(false);
      },
    });
  };

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
          <DialogContent>
            <DialogHeader><DialogTitle>Add Booking</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label>Rider Name</Label>
                <Input placeholder="e.g. Rahul Sharma" value={form.riderName} onChange={(e) => setForm({ ...form, riderName: e.target.value })} />
                {errors.riderName && <p className="text-xs text-destructive">{errors.riderName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Vehicle</Label>
              <Select value={form.vehicle} onValueChange={(v) => setForm({ ...form, vehicle: v })}>
                <SelectTrigger><SelectValue placeholder="Select available vehicle" /></SelectTrigger>
                <SelectContent>
                  {availableVehicles.length > 0 ? (
                    availableVehicles.map((v) => {
                      const id = getVehicleId(v);
                      return <SelectItem key={id} value={id}>{getVehicleLabel(v)}</SelectItem>;
                    })
                  ) : (
                    <SelectItem value="" disabled>
                      No available vehicles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
                {errors.vehicle && <p className="text-xs text-destructive">{errors.vehicle}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Date</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>End Date</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>KM Limit</Label>
                <Input type="number" placeholder="Allowed KM" value={form.kmLimit} onChange={(e) => setForm({ ...form, kmLimit: Number(e.target.value) })} />
              </div>
              <Button className="w-full" onClick={handleSubmit}>Save</Button>
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
            <SelectItem value="all">All Status</SelectItem>
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
              {["ID", "Rider", "Vehicle", "Start", "End", "KM", "Status"].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const booking = b ?? {};
              const safeBookingId = String(booking.bookingId ?? "-");
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
                    <span className="text-muted-foreground">/{safeKmLimit}</span>
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
