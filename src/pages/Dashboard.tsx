import { Link } from "react-router-dom";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Bike, CalendarDays, Battery, Bell, AlertTriangle, Zap, Users, FileCheck, Wrench, CreditCard, Repeat, ShieldCheck, ArrowLeftRight, ClipboardList } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/hooks/useEmployees";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useBookings } from "@/hooks/useBookings";
import { useAlerts } from "@/hooks/useAlerts";
import { leads, renewals, recoveries, returns as returnWorkflows, insurances, serviceJobs, workflowTasks } from "@/data/workflows";
import { StatCardsSkeleton, TableSkeleton } from "@/components/states/LoadingSkeleton";
import { ErrorState } from "@/components/states/ErrorState";

const Dashboard = () => {
  const { role, user } = useAuth();
  const statsQ = useDashboardStats();
  const bookingsQ = useBookings();
  const alertsQ = useAlerts();
  const employeesQ = useEmployees();

  const stats = statsQ.data;
  const bookings = bookingsQ.data ?? [];
  const alerts = alertsQ.data ?? [];
  const employees = Array.isArray(employeesQ.data) ? employeesQ.data : [];

  const today = new Date();
  const isToday = (date: string) => {
    if (!date) return false;
    const dt = new Date(date);
    return dt.toDateString() === today.toDateString();
  };

  const todaysDeliveries = bookings.filter((b) => isToday(b.startDate)).length;
  const todaysReturns = returnWorkflows.filter((r) => isToday(r.createdAt)).length;
  const renewalFollowups = renewals.filter((r) => ["upcoming", "overdue"].includes(r.status)).length;
  const openServiceJobs = serviceJobs.filter((job) => job.status !== "closed").length;
  const pendingRefundApprovals = returnWorkflows.filter((r) => r.refundRequested && !r.refundApproved).length;
  const insuranceClaims = insurances.filter((i) => i.type === "claim").length;
  const staffTasksOpen = workflowTasks.filter((task) => task.status !== "closed").length;
  const leadsWaiting = leads.length;
  const pendingKYC = employees.filter((e) => Number(e.onboard_count ?? 0) === 0).length;
  const assignedTasks = workflowTasks.filter((task) => task.assignedTo.toLowerCase() === (user?.name ?? "").toLowerCase());
  const pendingPrdTasks = assignedTasks.filter((task) => task.status === "awaiting-approval").length;
  const unreadAlerts = alerts.filter((a) => a.status === "unread").length;
  const activeBookings = bookings.filter((b) => b.status !== "completed");

  const formatDate = (date: string) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return date;
    }
  };

  const getEmployeeOnboards = (employee: any) => Number(employee.onboard_count ?? 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{role === "staff" ? "Staff Dashboard" : "Admin Dashboard"}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Summary of tasks, operations, and key metrics.</p>
      </div>

      {role === "staff" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="My Assigned Tasks" value={assignedTasks.length} icon={ClipboardList} accent="primary" subtitle="Current work items" />
            <StatCard title="Pending PRD Tasks" value={pendingPrdTasks} icon={FileCheck} accent="warning" subtitle="Approval required" />
            <StatCard title="Today's Deliveries" value={todaysDeliveries} icon={CalendarDays} accent="success" subtitle="Scheduled starts" />
            <StatCard title="Today's Returns" value={todaysReturns} icon={ArrowLeftRight} accent="accent" subtitle="Expected returns" />
            <StatCard title="Renewal Followups" value={renewalFollowups} icon={Repeat} accent="warning" subtitle="Ongoing renewals" />
            <StatCard title="Open Service Jobs" value={openServiceJobs} icon={Wrench} accent="destructive" subtitle="Maintenance queue" />
            <StatCard title="Unread Alerts" value={unreadAlerts} icon={Bell} accent="destructive" subtitle="Critical notices" />
          </div>

          <div className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Task Queue</h2>
                <p className="text-xs text-muted-foreground mt-0.5">All assignments for your team</p>
              </div>
              <Link to="/tasks" className="text-xs text-primary hover:underline">View my tasks</Link>
            </div>
            <div className="overflow-x-auto">
              {workflowTasks.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No task assignments available.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">Task</th>
                      <th className="px-5 py-3">Module</th>
                      <th className="px-5 py-3">Assigned To</th>
                      <th className="px-5 py-3">Due Date</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflowTasks.map((task) => (
                      <tr key={task.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-medium whitespace-nowrap">{task.id}</td>
                        <td className="px-5 py-3 whitespace-nowrap">{task.module}</td>
                        <td className="px-5 py-3 whitespace-nowrap">{task.assignedTo}</td>
                        <td className="px-5 py-3 whitespace-nowrap">{formatDate(task.dueDate)}</td>
                        <td className="px-5 py-3 whitespace-nowrap"><StatusBadge status={task.status.replace("-", " ")} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {statsQ.isLoading || !stats ? (
            <StatCardsSkeleton count={8} />
          ) : statsQ.error ? (
            <ErrorState message="Failed to load stats" onRetry={() => statsQ.refetch()} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard title="Total Vehicles" value={stats.totalVehicles} icon={Bike} subtitle="Fleet size" />
              <StatCard title="Available Vehicles" value={stats.availableVehicles} icon={Battery} accent="success" subtitle="Ready for dispatch" />
              <StatCard title="Active Rentals" value={stats.deployedVehicles} icon={CalendarDays} accent="primary" subtitle="Currently rented" />
              <StatCard title="Pending Returns" value={returnWorkflows.filter((r) => !r.accountClosed).length} icon={ArrowLeftRight} accent="accent" subtitle="Needs attention" />
              <StatCard title="Pending KYC" value={pendingKYC} icon={FileCheck} accent="warning" subtitle="Awaiting approval" />
              <StatCard title="Today's Deliveries" value={todaysDeliveries} icon={CalendarDays} accent="success" subtitle="Scheduled starts" />
              <StatCard title="Today's Returns" value={todaysReturns} icon={ArrowLeftRight} accent="accent" subtitle="Expected returns" />
              <StatCard title="Renewals Due" value={renewals.length} icon={Repeat} accent="warning" subtitle="Follow-ups needed" />
              <StatCard title="Recovery Cases" value={recoveries.length} icon={AlertTriangle} accent="destructive" subtitle="Open cases" />
              <StatCard title="Open Service Jobs" value={openServiceJobs} icon={Wrench} accent="destructive" subtitle="Maintenance work" />
              <StatCard title="Pending Refund Approvals" value={pendingRefundApprovals} icon={CreditCard} accent="warning" subtitle="Return claims" />
              <StatCard title="Insurance Claims" value={insuranceClaims} icon={ShieldCheck} accent="accent" subtitle="Policy cases" />
              <StatCard title="Staff Tasks Open" value={staffTasksOpen} icon={Users} accent="primary" subtitle="Team workload" />
              <StatCard title="Leads Waiting" value={leadsWaiting} icon={Zap} accent="success" subtitle="Sales pipeline" />
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-card rounded-xl border border-border/60 shadow-sm">
              <div className="p-5 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Active Bookings</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Live rentals and fleet usage</p>
                </div>
                <Link to="/bookings" className="text-xs text-primary hover:underline">View all</Link>
              </div>
              <div className="overflow-x-auto max-h-[440px] p-2">
                {bookingsQ.isLoading ? (
                  <TableSkeleton rows={5} cols={6} />
                ) : activeBookings.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/60 backdrop-blur z-10">
                      <tr className="border-b">
                        {["Booking ID", "Customer", "Vehicle", "Start", "End", "KM / Limit", "Status"].map((h) => (
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

                        return (
                          <tr key={bookingId} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-5 py-3 font-medium whitespace-nowrap text-primary">{bookingId}</td>
                            <td className="px-5 py-3 whitespace-nowrap">{customer}</td>
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
                )}
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
