import { useState, useMemo } from "react";
import { useVehicles, useAddVehicle, useDeleteVehicle } from "@/hooks/useVehicles";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import { Plus, Trash2, MoreVertical, Battery, Truck, CalendarDays, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Vehicle } from "@/types";
import { TableSkeleton } from "@/components/states/LoadingSkeleton";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import { useDateFilter } from "@/context/DateFilterContext";
import { useSearchParams, useNavigate } from "react-router-dom";

const MODELS = ["Quanta S", "Quanta S+"];
const HUBS = ["Kukatpally", "Madhapur", "Gachibowli"];

const VehiclesPage = () => {

  const { role } = useAuth();
  const vehiclesQ = useVehicles();
  const vehicles = vehiclesQ.data ?? [];
  const addVehicle = useAddVehicle();
  const deleteVehicle = useDeleteVehicle();
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ vehicleId: "", numberPlate: "", model: "", status: "available" as Vehicle["status"], hub: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Remove mock extras, use backend data
  const statusDot: Record<string, string> = {
    available: "bg-success",
    rented: "bg-primary",
    service: "bg-warning",
    idle: "bg-muted-foreground",
  };
  const healthColor: Record<string, string> = {

    good: "text-success",
    fair: "text-warning",
    poor: "text-destructive",
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!form.vehicleId.trim()) newErrors.vehicleId = "Vehicle ID is required";
    if (!form.numberPlate.trim()) newErrors.numberPlate = "Vehicle number is required";
    if (!form.model) newErrors.model = "Model is required";
    if (!form.hub) newErrors.hub = "Hub is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    addVehicle.mutate(form, {
      onSuccess: () => {

        setForm({ vehicleId: "", numberPlate: "", model: "", status: "available", hub: "" });
        setErrors({});
        setOpen(false);
      },
    });
  };

  const { range } = useDateFilter();

  // Apply search param if any
  const q = searchParams.get("query") ?? "";

  const filteredVehicles = useMemo(() => {
    let list = vehicles.slice();
    if (statusFilter) {
      if (statusFilter === "service") list = list.filter((v) => v.status === "service");
      else list = list.filter((v) => v.status === statusFilter);
    }
    if (q) {
      const qq = q.toLowerCase();
      list = list.filter((v) => (v.numberPlate || v.vehicleId || "").toLowerCase().includes(qq) || (v.model || "").toLowerCase().includes(qq));
    }
    if (range?.start || range?.end) {
      list = list.filter((v) => {
        const dt = new Date(v.createdAt || v.created_at || v.updatedAt || new Date().toISOString());
        if (range.start && dt < new Date(range.start)) return false;
        if (range.end && dt > new Date(range.end)) return false;
        return true;
      });
    }
    return list;
  }, [vehicles, statusFilter, q, range]);

  const statsCards = [
    { key: "total", title: "Total Vehicles", value: vehicles.length, icon: Truck, accent: "primary", subtitle: "+2 added this month" },
    { key: "available", title: "Available", value: vehicles.filter((v) => v.status === "available").length, icon: Battery, accent: "success", subtitle: "Ready to deploy" },
    { key: "rented", title: "Rented", value: vehicles.filter((v) => v.status === "rented").length, icon: CalendarDays, accent: "accent", subtitle: "Currently rented" },
    { key: "service", title: "Service / Maintenance", value: vehicles.filter((v) => v.status === "service").length, icon: Wrench, accent: "warning", subtitle: "Needs service attention" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((c) => (
          <div key={c.key} onClick={() => setStatusFilter(c.key === "total" ? null : c.key)} className={`cursor-pointer ${statusFilter === c.key ? "ring-2 ring-primary/30" : ""}`}>
            <StatCard title={c.title} value={c.value} icon={c.icon} accent={c.accent as any} subtitle={c.subtitle} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your EV fleet across all hubs</p>
        </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus size={16} className="mr-2" />Add Vehicle</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Vehicle</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label>Vehicle ID</Label>
                <Input placeholder="e.g. ZRG-001" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} />
                {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Vehicle Number</Label>
                <Input placeholder="e.g. TG01AB1234" value={form.numberPlate} onChange={(e) => setForm({ ...form, numberPlate: e.target.value })} />
                {errors.numberPlate && <p className="text-xs text-destructive">{errors.numberPlate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Model</Label>
                <Select value={form.model} onValueChange={(v) => setForm({ ...form, model: v })}>
                  <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                  <SelectContent>
                    {MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Hub</Label>
                <Select value={form.hub} onValueChange={(v) => setForm({ ...form, hub: v })}>
                  <SelectTrigger><SelectValue placeholder="Select hub" /></SelectTrigger>
                  <SelectContent>
                    {HUBS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.hub && <p className="text-xs text-destructive">{errors.hub}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Vehicle["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="idle">Idle</SelectItem>
                </SelectContent>
              </Select>
              </div>
              <Button className="w-full" onClick={handleSubmit}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border overflow-x-auto">
        {vehiclesQ.isLoading ? (
          <TableSkeleton rows={6} cols={8} />
        ) : vehiclesQ.error ? (
          <ErrorState message="Failed to load vehicles" onRetry={() => vehiclesQ.refetch()} />
        ) : vehicles.length === 0 ? (
          <EmptyState title="No vehicles" description="Add your first vehicle to get started." />
        ) : (
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/60 z-10">
            <tr className="border-b">

              {["ID", "Number Plate", "Model", "Hub", "Battery", "Last Service", "Health", "Status", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>

            {filteredVehicles.map((v) => (
                <tr key={v._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", statusDot[v.status])} />
                      {v.vehicleId}
                    </span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap font-mono text-xs">{v.numberPlate}</td>
                  <td className="px-5 py-3 whitespace-nowrap">{v.model}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{v.hub}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">

                      <Battery size={14} className={v.battery > 50 ? "text-success" : "text-warning"} />
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", v.battery > 50 ? "bg-success" : "bg-warning")} style={{ width: `${v.battery}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{v.battery}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{v.lastServiceDate ? new Date(v.lastServiceDate).toLocaleDateString() : "N/A"}</td>
                  <td className={cn("px-5 py-3 whitespace-nowrap font-medium", healthColor[v.health])}>{v.health}</td>
                  <td className="px-5 py-3 whitespace-nowrap"><StatusBadge status={v.status} /></td>
                  <td className="px-5 py-3 whitespace-nowrap text-right">
                    {role === "admin" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-md hover:bg-muted transition-colors"><MoreVertical size={14} /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => deleteVehicle.mutate(v._id)} className="text-destructive gap-2">
                            <Trash2 size={14} /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
};

export default VehiclesPage;
