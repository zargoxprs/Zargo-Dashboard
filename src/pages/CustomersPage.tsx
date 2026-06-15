import { useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState } from "@/components/states/EmptyState";
import { TableSkeleton } from "@/components/states/LoadingSkeleton";
import StatCard from "@/components/StatCard";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/useCustomers";
import { useEmployees } from "@/hooks/useEmployees";
import { Customer } from "@/types";

const emptyCustomerForm = {
  customerName: "",
  phone: "",
  source: "Website",
  assignedStaff: "",
  status: "Active" as const,
};

const normalizePhone = (phone: string) => phone.replace(/[^0-9]/g, "");

const CustomersPage = () => {
  const customersQ = useCustomers();
  const employeesQ = useEmployees();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [query, setQuery] = useState("");
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const customers = Array.isArray(customersQ.data) ? customersQ.data : [];
  const employees = Array.isArray(employeesQ.data) ? employeesQ.data : [];

  const filtered = useMemo(
    () => {
      if (!Array.isArray(customers)) return [];
      return customers.filter((customer) => {
        const search = query.toLowerCase();
        return (
          !search ||
          [customer?.customerId, customer?.customerName, customer?.phone, customer?.source, customer?.assignedStaff, customer?.status]
            .some((value) => value && String(value).toLowerCase().includes(search))
        );
      });
    },
    [customers, query]
  );

  const openDialog = (customer?: Customer) => {
    if (customer) {
      setCustomerForm({
        customerName: customer.customerName,
        phone: customer.phone,
        source: customer.source,
        assignedStaff: customer.assignedStaff,
        status: customer.status as "Active" | "Inactive",
      });
      setEditingId(customer.id);
    } else {
      setCustomerForm(emptyCustomerForm);
      setEditingId(null);
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = () => {
    const nextErrors: Record<string, string> = {};
    if (!customerForm.customerName.trim()) nextErrors.customerName = "Customer name is required";
    if (!normalizePhone(customerForm.phone)) nextErrors.phone = "A valid phone is required";
    if (!customerForm.assignedStaff.trim()) nextErrors.assignedStaff = "Assigned staff is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (editingId) {
      updateCustomer.mutate(
        { id: editingId, patch: customerForm },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setCustomerForm(emptyCustomerForm);
            setEditingId(null);
          },
        }
      );
    } else {
      createCustomer.mutate(customerForm, {
        onSuccess: () => {
          setDialogOpen(false);
          setCustomerForm(emptyCustomerForm);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer record?")) {
      deleteCustomer.mutate(id);
    }
  };

  const handleCall = (phone: string) => {
    const sanitized = normalizePhone(phone);
    if (sanitized) window.open(`tel:${sanitized}`, "_self");
  };

  const activeCount = Array.isArray(customers) ? customers.filter((c) => c?.status === "Active").length : 0;
  const inactiveCount = Array.isArray(customers) ? customers.filter((c) => c?.status === "Inactive").length : 0;

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return date;
    }
  };

  return (
    <div className="space-y-6">
      {customersQ.isError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive">
          <p className="text-sm font-medium">Failed to load customers. Please try refreshing the page.</p>
        </div>
      )}
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage and track customer records from converted leads.</p>
      </div>

      {customersQ.isLoading ? (
        <TableSkeleton />
      ) : customers.length === 0 ? (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-6 text-center space-y-4">
          <div>
            <h2 className="text-lg font-medium text-blue-900 mb-2">No Customers Yet</h2>
            <p className="text-sm text-blue-800">Create your first customer record to get started.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus size={16} className="mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Customer" : "Add Customer"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Customer Name</Label>
                  <Input
                    placeholder="e.g. Rajesh Kumar"
                    value={customerForm.customerName}
                    onChange={(e) => setCustomerForm({ ...customerForm, customerName: e.target.value })}
                  />
                  {errors.customerName && <p className="text-xs text-destructive">{errors.customerName}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>Lead Source</Label>
                  <Select value={customerForm.source} onValueChange={(v) => setCustomerForm({ ...customerForm, source: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Walk-in">Walk-in</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Phone Inquiry">Phone Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Assigned Staff</Label>
                  <Select value={customerForm.assignedStaff} onValueChange={(v) => setCustomerForm({ ...customerForm, assignedStaff: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.name}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.assignedStaff && <p className="text-xs text-destructive">{errors.assignedStaff}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={customerForm.status} onValueChange={(v) => setCustomerForm({ ...customerForm, status: v as "Active" | "Inactive" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSave} className="w-full">
                  {editingId ? "Update Customer" : "Create Customer"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Total Customers" value={customers.length} icon={<Search size={18} />} />
            <StatCard title="Active" value={activeCount} icon={<Search size={18} />} accent="success" />
            <StatCard title="Inactive" value={inactiveCount} icon={<Search size={18} />} accent="warning" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search customers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus size={16} className="mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Customer" : "Add Customer"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Customer Name</Label>
                    <Input
                      placeholder="e.g. Rajesh Kumar"
                      value={customerForm.customerName}
                      onChange={(e) => setCustomerForm({ ...customerForm, customerName: e.target.value })}
                    />
                    {errors.customerName && <p className="text-xs text-destructive">{errors.customerName}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Phone Number</Label>
                    <Input
                      placeholder="+91 98765 43210"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Lead Source</Label>
                    <Select value={customerForm.source} onValueChange={(v) => setCustomerForm({ ...customerForm, source: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Walk-in">Walk-in</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Phone Inquiry">Phone Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Assigned Staff</Label>
                    <Select value={customerForm.assignedStaff} onValueChange={(v) => setCustomerForm({ ...customerForm, assignedStaff: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.name}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.assignedStaff && <p className="text-xs text-destructive">{errors.assignedStaff}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={customerForm.status} onValueChange={(v) => setCustomerForm({ ...customerForm, status: v as "Active" | "Inactive" })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleSave} className="w-full">
                    {editingId ? "Update Customer" : "Create Customer"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-card rounded-3xl border border-border overflow-hidden">
            {filtered.length === 0 ? (
              <EmptyState title="No customers found" description="Create a new customer record or search for existing ones." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">Customer ID</th>
                      <th className="px-5 py-3">Customer Name</th>
                      <th className="px-5 py-3">Phone Number</th>
                      <th className="px-5 py-3">Lead Source</th>
                      <th className="px-5 py-3">Assigned Staff</th>
                      <th className="px-5 py-3">Created Date</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(filtered) && filtered.map((customer) => (
                      <tr key={customer?.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-medium text-xs">{customer?.customerId}</td>
                        <td className="px-5 py-3 font-medium">{customer?.customerName}</td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => handleCall(customer?.phone || "")}
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <Phone size={14} />
                            {customer?.phone}
                          </button>
                        </td>
                        <td className="px-5 py-3 text-sm">{customer?.source}</td>
                        <td className="px-5 py-3 text-sm">{customer?.assignedStaff}</td>
                        <td className="px-5 py-3 text-sm">{formatDate(customer?.createdAt || "")}</td>
                        <td className="px-5 py-3">
                          <StatusBadge status={customer?.status === "Active" ? "active" : "completed"} />
                        </td>
                        <td className="px-5 py-3 flex gap-2">
                          <button
                            onClick={() => openDialog(customer || undefined)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(customer?.id || "")}
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
