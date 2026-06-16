import { Link } from "react-router-dom";
import { useState } from "react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Bike, CalendarDays, Battery, Bell, AlertTriangle, Zap, Users, FileCheck, Wrench, CreditCard, Repeat, ShieldCheck, ArrowLeftRight, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/hooks/useEmployees";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useBookings } from "@/hooks/useBookings";
import { useAlerts } from "@/hooks/useAlerts";
import { useLeads } from "@/hooks/useLeads";
import { renewals, recoveries, returns as returnWorkflows, insurances, serviceJobs, workflowTasks } from "@/data/workflows";
import { StatCardsSkeleton, TableSkeleton } from "@/components/states/LoadingSkeleton";
import { ErrorState } from "@/components/states/ErrorState";

const Dashboard = () => {
  const { role, user } = useAuth();
  const statsQ = useDashboardStats();
  const bookingsQ = useBookings();
  const alertsQ = useAlerts();
  const employeesQ = useEmployees();

  type TaskWithNotes = typeof workflowTasks[number] & { notes?: string[] };
  const stats = statsQ.data;
  const bookings = bookingsQ.data ?? [];
  const alerts = alertsQ.data ?? [];
  const employees = Array.isArray(employeesQ.data) ? employeesQ.data : [];
  const leadsQ = useLeads();
  const [taskQueue, setTaskQueue] = useState<TaskWithNotes[]>(workflowTasks);
  const [selectedTask, setSelectedTask] = useState<TaskWithNotes | null>(null);
  const [taskNotes, setTaskNotes] = useState<Record<string, string>>({});

  const today = new Date();
  const isToday = (date: string) => {
    if (!date) return false;
    const dt = new Date(date);
    return dt.toDateString() === today.toDateString();
  };

  const todaysDeliveries = bookings.filter((b) => isToday(b.startDate)).length;
  const todaysReturns = bookings.filter((b) => isToday(b.endDate)).length;
  const renewalFollowups = renewals.filter((r) => ["upcoming", "overdue"].includes(r.status)).length;
  const openServiceJobs = serviceJobs.filter((job) => job.status !== "completed").length;
  const activeAssignedBookings = bookings.filter((b: any) => {
    const isActive = String(b.status ?? "").toLowerCase() === "active";
    const handler = String((b as any).assignedTo ?? (b as any).assignedStaff ?? (b as any).handledBy ?? "").toLowerCase();
    const isAssignedToMe = handler && handler === (user?.name ?? "").toLowerCase();
    const isInMyHub = user?.hub && String((b as any).hub ?? (b.vehicle as any)?.hub ?? "").toLowerCase() === user.hub.toLowerCase();
    return isActive && (isAssignedToMe || isInMyHub);
  });
  const activeAssignedBookingsCount = activeAssignedBookings.length;
  const pendingRefundApprovals = returnWorkflows.filter((r) => r.refundRequested && !r.refundApproved).length;
  const staffTasksOpen = workflowTasks.filter((task) => task.status !== "completed").length;
  const leadsWaiting = leadsQ.data?.length ?? 0;
  const assignedTasks = taskQueue.filter((task) => task.assignedTo.toLowerCase() === (user?.name ?? "").toLowerCase());
  const pendingPrdTasks = assignedTasks.filter((task) => task.status === "awaiting-approval").length;
  const unreadAlerts = alerts.filter((a) => a.status === "unread").length;
  const activeBookings = bookings.filter((b) => b.status === "active");

  const myBookings = bookings.filter((b: any) => {
    const handler = String((b as any).assignedTo ?? (b as any).assignedStaff ?? (b as any).handledBy ?? "").toLowerCase();
    return handler && handler === (user?.name ?? "").toLowerCase();
  });

  const myRevenue = myBookings.reduce((sum, b: any) => sum + (Number(b.amount ?? b.fare ?? 0) || 0), 0);
  const monthlyRevenue = stats?.revenue ?? 0;
  const formatRevenue = (val: any) => {
    if (val === undefined || val === null) return "₹0";
    if (typeof val === "number") return `₹${val.toLocaleString()}`;
    const s = String(val).trim();
    if (s.startsWith("₹")) return s;
    const n = Number(s.replace(/[^0-9.-]+/g, ""));
    if (Number.isNaN(n)) return `₹${s}`;
    return `₹${n.toLocaleString()}`;
  };
  const utilizationPercentage = stats?.totalVehicles ? Math.round((stats.deployedVehicles / stats.totalVehicles) * 100) : 0;
  const utilizationSummary = `${stats?.deployedVehicles ?? 0} of ${stats?.totalVehicles ?? 0} vehicles booked`;

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
            <StatCard title="My Revenue" value={`₹${myRevenue.toLocaleString()}`} icon={CreditCard} accent="primary" subtitle="Bookings handled by you" />
            <StatCard title="Available Vehicles" value={stats?.availableVehicles ?? 0} icon={Battery} accent="success" subtitle="Ready for assignment" />
            <StatCard title="Today's Deliveries" value={todaysDeliveries} icon={CalendarDays} accent="success" subtitle="Scheduled starts" />
            <StatCard title="Active Bookings" value={activeAssignedBookingsCount} icon={ArrowLeftRight} accent="accent" subtitle="Currently assigned rentals" />
            <StatCard title="Renewal Followups" value={renewalFollowups} icon={Repeat} accent="warning" subtitle="Ongoing renewals" />
            <StatCard title="Open Service Jobs" value={openServiceJobs} icon={Wrench} accent="destructive" subtitle="Maintenance queue" />
            <StatCard title="Unread Alerts" value={unreadAlerts} icon={Bell} accent="destructive" subtitle="Critical notices" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
            <div className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Task Queue</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Assigned and updateable tasks</p>
                </div>
                <Link to="/tasks" className="text-xs text-primary hover:underline">View my tasks</Link>
              </div>
              <div className="overflow-x-auto">
                {taskQueue.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No task assignments available.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3">Task</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Due Date</th>
                        <th className="px-5 py-3">Assigned To</th>
                        <th className="px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taskQueue.map((task) => (
                        <tr key={task.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3 font-medium whitespace-nowrap">{task.title}</td>
                          <td className="px-5 py-3 whitespace-nowrap"><StatusBadge status={task.status} /></td>
                          <td className="px-5 py-3 whitespace-nowrap">{formatDate(task.dueDate)}</td>
                          <td className="px-5 py-3 whitespace-nowrap">{task.assignedTo}</td>
                          <td className="px-5 py-3 whitespace-nowrap space-y-2">
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="rounded-md border border-border px-3 py-1 text-xs font-medium text-primary hover:bg-muted/40"
                            >
                              View Task
                            </button>
                            <select
                              value={task.status}
                              onChange={(e) => {
                                const nextStatus = e.target.value as typeof task.status;
                                setTaskQueue((prev) => prev.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item));
                                if (selectedTask?.id === task.id) {
                                  setSelectedTask({ ...selectedTask, status: nextStatus });
                                }
                              }}
                              className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                            >
                              {[
                                { value: "assigned", label: "Assigned" },
                                { value: "in-progress", label: "In Progress" },
                                { value: "completed", label: "Completed" },
                              ].map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                value={taskNotes[task.id] ?? ""}
                                onChange={(e) => setTaskNotes((prev) => ({ ...prev, [task.id]: e.target.value }))}
                                placeholder="Add notes"
                                className="flex-1 text-xs"
                              />
                              <button
                                onClick={() => {
                                  const note = (taskNotes[task.id] ?? "").trim();
                                  if (!note) return;
                                  setTaskQueue((prev) => prev.map((item) => item.id === task.id ? { ...item, notes: [...(item.notes ?? []), note] } : item));
                                  if (selectedTask?.id === task.id) {
                                    setSelectedTask({ ...selectedTask, notes: [...(selectedTask.notes ?? []), note] });
                                  }
                                  setTaskNotes((prev) => ({ ...prev, [task.id]: "" }));
                                }}
                                className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary/90"
                              >
                                Add
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {selectedTask && (
                <div className="border-t p-5 bg-muted/30">
                  <h3 className="font-semibold">Task details</h3>
                  <p className="text-sm text-muted-foreground mt-2">{selectedTask.description}</p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    <p><span className="font-medium">Module:</span> {selectedTask.module}</p>
                    <p><span className="font-medium">Assigned To:</span> {selectedTask.assignedTo}</p>
                    <p><span className="font-medium">Due:</span> {formatDate(selectedTask.dueDate)}</p>
                    <p><span className="font-medium">Notes:</span> {(selectedTask.notes ?? []).join(" • ") || "No notes added."}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl border border-border/60 shadow-sm">
              <div className="p-5 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Active Bookings</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Your routed rental schedule</p>
                </div>
                <Link to="/bookings" className="text-xs text-primary hover:underline">View all</Link>
              </div>
              <div className="overflow-x-auto max-h-[440px] p-2">
                {bookingsQ.isLoading ? (
                  <TableSkeleton rows={5} cols={5} />
                ) : activeAssignedBookings.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground sticky top-0">
                      <tr className="border-b">
                        {['Booking ID', 'Customer', 'Vehicle', 'Return Date', 'Status'].map((h) => (
                          <th key={h} className="px-5 py-3 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeAssignedBookings.map((b: any) => {
                        const bookingId = b.bookingId ?? b._id ?? b.id ?? "";
                        const customer = b.riderName ?? b.rider_name ?? "";
                        const vehicle = typeof b.vehicle === "string" ? b.vehicle : (b.vehicle?.numberPlate || b.vehicle?.vehicleId || "");
                        const returnDate = b.endDate ?? b.end_date ?? "";
                        return (
                          <tr key={bookingId} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-5 py-3 font-medium whitespace-nowrap text-primary">{bookingId}</td>
                            <td className="px-5 py-3 whitespace-nowrap">{customer}</td>
                            <td className="px-5 py-3 whitespace-nowrap">{vehicle}</td>
                            <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{formatDate(returnDate)}</td>
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
              <StatCard title="Active Rentals" value={activeBookings.length} icon={CalendarDays} accent="primary" subtitle="Currently booked" />
              <StatCard title="Monthly Revenue" value={formatRevenue(monthlyRevenue)} icon={CreditCard} accent="primary" subtitle="Revenue generated during selected date range" />
              <StatCard title="Available Vehicles" value={stats.availableVehicles} icon={Battery} accent="success" subtitle="Ready for dispatch" />
              <StatCard title="Pending Returns" value={returnWorkflows.filter((r) => !r.accountClosed).length} icon={ArrowLeftRight} accent="accent" subtitle="Needs attention" />
              <StatCard title="Today's Deliveries" value={todaysDeliveries} icon={CalendarDays} accent="success" subtitle="Scheduled starts" />
              <StatCard title="Today's Returns" value={todaysReturns} icon={ArrowLeftRight} accent="accent" subtitle="Expected returns" />
              <StatCard title="Renewals Due" value={renewals.length} icon={Repeat} accent="warning" subtitle="Follow-ups needed" />
              <StatCard title="Recovery Cases" value={recoveries.length} icon={AlertTriangle} accent="destructive" subtitle="Open cases" />
              <StatCard title="Open Service Jobs" value={openServiceJobs} icon={Wrench} accent="destructive" subtitle="Maintenance work" />
              <StatCard title="Pending Refund Approvals" value={pendingRefundApprovals} icon={CreditCard} accent="warning" subtitle="Return claims" />
              <StatCard title="Staff Tasks Open" value={staffTasksOpen} icon={Users} accent="primary" subtitle="Team workload" />
              <StatCard title="Leads Waiting" value={leadsWaiting} icon={Zap} accent="success" subtitle="Sales pipeline" />
              <StatCard title="Vehicle Utilization" value={`${utilizationPercentage}%`} icon={Bike} accent="success" subtitle={utilizationSummary} />
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
