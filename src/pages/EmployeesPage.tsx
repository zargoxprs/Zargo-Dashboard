import { useState } from "react";
import { useEmployees, useAddEmployee, useDeleteEmployee } from "@/hooks/useEmployees";
import { Employee } from "@/types";
import { TableSkeleton } from "@/components/states/LoadingSkeleton";
import { EmptyState } from "@/components/states/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users, UserCheck, ClipboardCheck, FileCheck2, Repeat, Plus, Search, Mail, Phone } from "lucide-react";
import StatCard from "@/components/StatCard";

const roleColors: Record<string, string> = {
  Admin: "bg-primary text-primary-foreground",
  Manager: "bg-chart-2 text-white",
  Staff: "bg-muted text-muted-foreground",
};

const statusColors: Record<string, string> = {
  Active: "bg-chart-2/10 text-chart-2",
  Inactive: "bg-muted text-muted-foreground",
};

const EmployeesPage = () => {
  const employeesQ = useEmployees();
  const employees = Array.isArray(employeesQ.data) ? employeesQ.data : [];
  const addEmployee = useAddEmployee();
  const deleteEmployee = useDeleteEmployee();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "Staff" as Employee["role"], join_date: "" });

  const getEmployeeOnboards = (employee: Partial<Employee> | null) => Number(employee?.onboard_count ?? (employee as any)?.onboardings ?? 0) || 0;
  const getEmployeeStatus = (employee: Partial<Employee> | null) => String(employee?.status ?? "Inactive");
  const getEmployeeRole = (employee: Partial<Employee> | null) => String(employee?.role ?? "Staff");
  const getEmployeeName = (employee: Partial<Employee> | null) => String(employee?.name ?? "Unknown");
  const getEmployeeEmail = (employee: Partial<Employee> | null) => String(employee?.email ?? "N/A");
  const getEmployeePhone = (employee: Partial<Employee> | null) => String(employee?.phone ?? "N/A");
  const getEmployeeJoinDate = (employee: Partial<Employee> | null) => String(employee?.join_date ?? (employee as any)?.joinDate ?? "");
  const getEmployeeId = (employee: Partial<Employee> | null) => String(employee?.id ?? (employee as any)?._id ?? "");

  const totalOnboards = employees.reduce((s, e) => s + getEmployeeOnboards(e), 0);
  const activeCount = employees.filter((e) => getEmployeeStatus(e) === "Active").length;

  const filtered = employees.filter((e) => {
    const matchSearch = getEmployeeName(e).toLowerCase().includes(search.toLowerCase()) || getEmployeeEmail(e).toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || getEmployeeRole(e) === roleFilter;
    return matchSearch && matchRole;
  });

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    addEmployee.mutate(
      { ...form, onboard_count: 0, status: "Active", join_date: form.join_date || new Date().toISOString().split("T")[0] },
      {
        onSuccess: (res: any) => {
          setForm({ name: "", email: "", phone: "", role: "Staff", join_date: "" });
          const creds = (res as any)?.credentials ?? null;
          if (creds) {
            setCreatedCreds({ email: creds.email, password: creds.password });
          } else {
            setOpen(false);
          }
        },
      }
    );
  };

  const getInitials = (name: string) => {
    const safeName = String(name ?? "").trim();
    if (!safeName) return "NA";
    return safeName.split(" ").map((n) => n[0] || "").join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (d: string) => {
    const value = String(d ?? "").trim();
    if (!value) return "No date available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "No date available";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Team performance and operational tasks</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Employees" value={activeCount} icon={UserCheck} accent="success" subtitle={`${employees.length} total`} />
        <StatCard title="Pending Tasks" value={7} icon={ClipboardCheck} accent="warning" subtitle="Across all hubs" />
        <StatCard title="KYC Approvals" value={4} icon={FileCheck2} accent="primary" subtitle="Awaiting review" />
        <StatCard title="Handovers Today" value={3} icon={Repeat} accent="accent" subtitle={`${totalOnboards} onboards total`} />
      </div>

      {/* Team Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Team Management</h2>
          <p className="text-sm text-muted-foreground">View and manage your team members</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus size={16} /> Add Employee
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-card rounded-xl border">
        <div className="p-5 border-b">
          <h3 className="font-semibold">All Employees</h3>
          <p className="text-sm text-muted-foreground">Manage your team members and their roles</p>
        </div>

        <div className="p-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          {employeesQ.isLoading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : employeesQ.error ? (
            <EmptyState title="Unable to load employees" description="Please refresh or check your connection." />
          ) : employees.length === 0 ? (
            <EmptyState title="No employees available" description="Add new staff from the button above." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Contact</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Onboards</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Join Date</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const safeName = getEmployeeName(e);
                  const safeEmail = getEmployeeEmail(e);
                  const safePhone = getEmployeePhone(e);
                  const safeRole = getEmployeeRole(e);
                  const safeOnboards = getEmployeeOnboards(e);
                  const safeJoinDate = formatDate(getEmployeeJoinDate(e));
                  const safeStatus = getEmployeeStatus(e);
                  const safeId = getEmployeeId(e) || safeEmail || safeName;
                  return (
                    <tr key={safeId} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                            {getInitials(safeName)}
                          </div>
                          <span className="font-medium">{safeName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground"><Mail size={13} /> {safeEmail}</div>
                          <div className="flex items-center gap-1.5 text-muted-foreground"><Phone size={13} /> {safePhone}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[safeRole] ?? "bg-muted text-muted-foreground"}`}>{safeRole}</span>
                      </td>
                      <td className="px-5 py-4 font-medium">{safeOnboards} <span className="text-muted-foreground font-normal">onboardings</span></td>
                      <td className="px-5 py-4 text-muted-foreground">{safeJoinDate}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[safeStatus] ?? "bg-muted text-muted-foreground"}`}>{safeStatus}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedEmployee(e)}>View</Button>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedEmployee(e)}>Edit</Button>
                          {safeRole !== "Admin" ? (
                            <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(e)}>Delete</Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Admin protected</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No employees found for this filter.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedEmployee && (
        <div className="bg-card rounded-xl border p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Employee details</h3>
              <p className="text-sm text-muted-foreground">Review employee information and status.</p>
            </div>
            <Button variant="outline" onClick={() => setSelectedEmployee(null)}>Close</Button>
          </div>
          {selectedEmployee && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{getEmployeeName(selectedEmployee)}</p>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{getEmployeeEmail(selectedEmployee)}</p>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{getEmployeePhone(selectedEmployee)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium">{getEmployeeRole(selectedEmployee)}</p>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{getEmployeeStatus(selectedEmployee)}</p>
              <p className="text-sm text-muted-foreground">Join Date</p>
              <p className="font-medium">{formatDate(getEmployeeJoinDate(selectedEmployee))}</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm text-muted-foreground">Onboardings</p>
              <p className="font-medium">{getEmployeeOnboards(selectedEmployee)} onboardings</p>
            </div>
          </div>
          )}
        </div>
      )}

      {/* Add Employee Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg z-50 overflow-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>Add a new team member to your organization.</DialogDescription>
            </DialogHeader>

            {createdCreds ? (
              <div className="space-y-4 pt-4">
                <div className="p-4 border rounded-md bg-muted/10">
                  <h4 className="font-semibold">Employee created — credentials</h4>
                  <p className="text-sm text-muted-foreground mt-1">Copy or download these credentials now — this password will not be visible again.</p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="font-mono text-sm">{createdCreds.email}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">Password</span>
                      <span className="font-mono text-sm">{createdCreds.password}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button variant="ghost" onClick={() => { navigator.clipboard?.writeText(createdCreds.email); }}>
                    <Mail size={14} className="mr-2" />Copy Email
                  </Button>
                  <Button onClick={() => { navigator.clipboard?.writeText(createdCreds.password); }}>
                    <ClipboardCheck size={14} className="mr-2" />Copy Password
                  </Button>
                  <Button variant="ghost" onClick={() => {
                    const data = JSON.stringify(createdCreds, null, 2);
                    const blob = new Blob([data], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = `employee-${createdCreds.email}.json`; a.click(); URL.revokeObjectURL(url);
                  }}>
                    <FileCheck2 size={14} className="mr-2" />Download JSON
                  </Button>
                  <Button variant="ghost" onClick={() => {
                    const csv = `email,password\n${createdCreds.email},${createdCreds.password}`;
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = `employee-${createdCreds.email}.csv`; a.click(); URL.revokeObjectURL(url);
                  }}>
                    <FileCheck2 size={14} className="mr-2" />Download CSV
                  </Button>
                  <Button variant="outline" onClick={() => { setOpen(false); setCreatedCreds(null); }}>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Full Name</Label>
                  <Input placeholder="Enter full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input placeholder="email@zargo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Role</Label>
                    <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Employee["role"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Join Date</Label>
                    <Input type="date" value={form.join_date} onChange={(e) => setForm({ ...form, join_date: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => { setOpen(false); setCreatedCreds(null); }}>Cancel</Button>
                  <Button onClick={handleAdd}>Add Employee</Button>
                </div>
              </div>
            )}
          </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        {deleteTarget && (
        <DialogContent className="sm:max-w-md z-50 overflow-auto">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>Are you sure you want to delete this employee?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            <div className="rounded-xl border border-border p-4 bg-muted/10">
              <p className="font-medium">{getEmployeeName(deleteTarget)}</p>
              <p className="text-sm text-muted-foreground">{getEmployeeRole(deleteTarget)}</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!deleteTarget) return;
                  deleteEmployee.mutate(getEmployeeId(deleteTarget), {
                    onSuccess: () => setDeleteTarget(null),
                  });
                }}
                disabled={deleteEmployee.isLoading}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default EmployeesPage;
