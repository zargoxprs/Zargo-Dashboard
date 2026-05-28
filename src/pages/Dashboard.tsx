import { Link } from "react-router-dom";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Bike, CalendarDays, Battery, Bell, AlertTriangle, Zap, Users, Plus, FileCheck, BellPlus, Activity, Wrench, CreditCard, Repeat } from "lucide-react";
import RupeeIcon from "@/components/ui/icons/RupeeIcon";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/hooks/useEmployees";
import { useStore } from "@/data/store";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useBookings } from "@/hooks/useBookings";
import { useAlerts } from "@/hooks/useAlerts";
import { StatCardsSkeleton, TableSkeleton } from "@/components/states/LoadingSkeleton";
import { ErrorState } from "@/components/states/ErrorState";

const Dashboard = () => {
  const statsQ = useDashboardStats();
  const bookingsQ = useBookings();
  const alertsQ = useAlerts();

  const stats = statsQ.data;
  const bookings = bookingsQ.data ?? [];
  const alerts = alertsQ.data ?? [];

  const activeBookings = bookings.filter((b) => b.status !== "completed");

  const { role } = useAuth();

  const employeesQ = useEmployees();
  const employees = Array.isArray(employeesQ.data) ? employeesQ.data : [];

  const getEmployeeOnboards = (employee: any) => Number(employee.onboard_count ?? employee.onboardings ?? 0) || 0;

  const quickActions = [
    { to: "/vehicles", label: "Add Vehicle", icon: Plus, color: "text-primary bg-primary/10" },
    { to: "/bookings", label: "Create Booking", icon: CalendarDays, color: "text-accent bg-accent/10" },
    { to: "/employees", label: "Start KYC", icon: FileCheck, color: "text-warning bg-warning/10" },
    { to: "/alerts", label: "Create Alert", icon: BellPlus, color: "text-destructive bg-destructive/10" },
  ];

  const activities = useStore((s) => s.activities ?? []);

  const sortedActivities = [...activities].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const iconMap: Record<string, any> = {
    booking: { icon: CalendarDays, color: "text-primary bg-primary/10" },
    vehicle: { icon: Bike, color: "text-primary bg-primary/10" },
    kyc: { icon: FileCheck, color: "text-warning bg-warning/10" },
    payment: { icon: CreditCard, color: "text-accent bg-accent/10" },
    employee: { icon: Users, color: "bg-muted text-muted-foreground" },
    service: { icon: Wrench, color: "text-warning bg-warning/10" },
    alert: { icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
    default: { icon: Activity, color: "text-primary bg-primary/10" },
  };

  const relativeTime = (iso: string) => {
    if (!iso) return "";
    const dt = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - dt.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const sameDay = dt.toDateString() === now.toDateString();
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24 && sameDay) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Operations Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Real-time overview of your EV fleet</p>
      </div>

      {statsQ.isLoading || !stats ? (
        <StatCardsSkeleton count={4} />
      ) : statsQ.error ? (
        <ErrorState message="Failed to load stats" onRetry={() => statsQ.refetch()} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Vehicles" value={stats.totalVehicles} icon={Bike} subtitle="+2 added this month" />
          <StatCard title="Available" value={stats.availableVehicles} icon={Battery} accent="success" subtitle="Ready to deploy" />
          <StatCard title="Rented" value={stats.deployedVehicles} icon={CalendarDays} accent="primary" subtitle="Currently rented" />
          <StatCard title="Service / Maintenance" value={stats.overdueVehicles} icon={Wrench} accent="accent" subtitle="Needs service attention" />
        </div>
      )}

      {role === "staff" ? (
        <div className="bg-card rounded-xl border border-border/60 shadow-sm p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Zap size={16} className="text-primary" /> Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((a) => (
              <Link key={a.label} to={a.to} className="group flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-muted/40 transition-all">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${a.color}`}>
                  <a.icon size={16} />
                </div>
                <span className="text-sm font-medium group-hover:text-primary transition-colors">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/60 shadow-sm p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Zap size={16} className="text-primary" /> Management Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Pending KYC Approvals" value={employees.filter((e) => getEmployeeOnboards(e) === 0).length} icon={FileCheck} accent="primary" subtitle="Awaiting review" />
            <StatCard title="Renewals Due" value={stats?.overdueVehicles ?? 0} icon={Repeat} accent="warning" subtitle="Contracts expiring" />
            <StatCard title="Recovery Cases" value={stats?.overdueVehicles ?? 0} icon={AlertTriangle} accent="destructive" subtitle="Overdue recoveries" />
            <StatCard title="Service Requests" value={alerts.filter((a) => a.severity === "warning" || a.severity === "critical").length} icon={Wrench} accent="accent" subtitle="Open requests" />
            <StatCard title="Staff Performance" value={employees.length ? Math.round((employees.reduce((s, e) => s + getEmployeeOnboards(e), 0) / employees.length) * 10) / 10 : 0} icon={Users} accent="success" subtitle="Avg onboards" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-card rounded-xl border border-border/60 shadow-sm">
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Active Bookings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Live rental status across the fleet</p>
            </div>
            <Link to="/bookings" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto max-h-[440px] p-2">
            {bookingsQ.isLoading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : (
              (activeBookings && activeBookings.length > 0) ? (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/60 backdrop-blur z-10">
                    <tr className="border-b">
                      {[
                        "Booking ID",
                        "Customer Name",
                        "Vehicle Number",
                        "Rental Start Date",
                        "Rental End Date",
                        "KM Used / KM Limit",
                        "Status",
                      ].map((h) => (
                        <th key={h} className="text-left px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeBookings.map((b: any) => {
                      const bookingId = b.bookingId ?? b._id ?? b.id ?? "";
                      const customer = b.riderName ?? b.rider_name ?? "";
                      const vehicle = typeof b.vehicle === "string" ? b.vehicle : (b.vehicle?.numberPlate || b.vehicle?.vehicleId || "");
                      const start = b.startDate ?? b.start_date ?? "";
                      const end = b.endDate ?? b.end_date ?? "";
                      const kmUsed = b.kmUsed ?? b.current_km;
                      const kmLimit = b.kmLimit ?? b.allowed_km;

                      const formatDate = (d: string) => {
                        if (!d) return "";
                        try {
                          const dt = new Date(d);
                          return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                        } catch {
                          return d;
                        }
                      };

                      return (
                        <tr key={bookingId} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3 font-medium whitespace-nowrap text-primary">{bookingId}</td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="font-medium">{customer}</div>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">{vehicle}</td>
                          <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{formatDate(start)}</td>
                          <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{formatDate(end)}</td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span className={kmUsed > kmLimit ? "text-destructive font-semibold" : ""}>{kmUsed ?? ""}</span>
                            <span className="text-muted-foreground">/{kmLimit ?? ""}</span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap"><StatusBadge status={b.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">No active bookings available</div>
              )
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border/60 shadow-sm">
          <div className="p-5 border-b">
            <h2 className="font-semibold flex items-center gap-2"><Activity size={16} className="text-primary" /> Recent Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest events from your fleet</p>
          </div>
          <div className="divide-y">
            {sortedActivities.length > 0 ? (
              sortedActivities.map((a) => {
                const map = iconMap[a.type] || iconMap.default;
                const IconComp = map.icon || Activity;
                const color = map.color;
                return (
                  <div key={a.id} className="px-5 py-3 flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      <IconComp size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{a.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{relativeTime(a.created_at)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">No recent activity</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/60 shadow-sm">
        <div className="p-5 border-b">
          <h2 className="font-semibold flex items-center gap-2"><Bell size={16} className="text-primary" /> Latest Alerts</h2>
        </div>
        <div className="divide-y">
          {alerts.slice(0, 5).map((a) => (
            <div key={a.id} className="px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <StatusBadge status={a.severity} />
                <span className="text-sm truncate">{a.message}</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{a.created_at}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
