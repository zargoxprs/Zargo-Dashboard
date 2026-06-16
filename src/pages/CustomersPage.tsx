import { useState, useMemo } from "react";
import { Search, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState } from "@/components/states/EmptyState";
import { TableSkeleton } from "@/components/states/LoadingSkeleton";
import StatCard from "@/components/StatCard";
import { useLeads } from "@/hooks/useLeads";
import { Lead } from "@/types";

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

const saveCustomerDocs = (leadId: string, docs: any) => {
  try {
    const stored = localStorage.getItem(CUSTOMER_DOCS_KEY);
    const allDocs = stored ? JSON.parse(stored) : {};
    allDocs[leadId] = { ...allDocs[leadId], ...docs };
    localStorage.setItem(CUSTOMER_DOCS_KEY, JSON.stringify(allDocs));
  } catch {
    // ignore
  }
};

const emptyCustomerForm = {
  customerName: "",
  phone: "",
};

const normalizePhone = (phone: string) => phone.replace(/[^0-9]/g, "");

const CustomersPage = () => {
  const leadsQ = useLeads();

  const [query, setQuery] = useState("");
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadAadhaarFile, setUploadAadhaarFile] = useState<File | null>(null);
  const [uploadDlFile, setUploadDlFile] = useState<File | null>(null);

  const leads = Array.isArray(leadsQ.data) ? leadsQ.data : [];

  // Derive customers from leads where stage === "Converted"
  const convertedLeads = leads.filter((lead) => lead.stage === "converted");

  const filtered = useMemo(() => {
    const search = query.toLowerCase();
    if (!search) return convertedLeads;
    return convertedLeads.filter((lead) =>
      [lead.id, lead.customerName, lead.contact]
        .some((value) => value && String(value).toLowerCase().includes(search))
    );
  }, [convertedLeads, query]);

  const openDialog = (lead?: Lead) => {
    if (lead) {
      setCustomerForm({ customerName: lead.customerName, phone: lead.contact });
      setEditingLeadId(lead.id);
    } else {
      setCustomerForm(emptyCustomerForm);
      setEditingLeadId(null);
    }
    setErrors({});
    setUploadAadhaarFile(null);
    setUploadDlFile(null);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingLeadId) return setDialogOpen(false);
    const docs: any = {};

    if (uploadAadhaarFile) {
      docs.aadhaar = { name: uploadAadhaarFile.name, url: URL.createObjectURL(uploadAadhaarFile) };
    }
    if (uploadDlFile) {
      docs.drivingLicense = { name: uploadDlFile.name, url: URL.createObjectURL(uploadDlFile) };
    }

    if (Object.keys(docs).length > 0) {
      saveCustomerDocs(editingLeadId, docs);
    }

    setDialogOpen(false);
    setCustomerForm(emptyCustomerForm);
    setEditingLeadId(null);
  };

  const handleCall = (phone: string) => {
    const sanitized = normalizePhone(phone);
    if (sanitized) window.open(`tel:${sanitized}`, "_self");
  };

  const readyCount = convertedLeads.filter((lead) => {
    const docs = getCustomerDocs(lead.id);
    return !!(docs?.aadhaar && docs?.drivingLicense);
  }).length;

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return date;
    }
  };

  return (
    <div className="space-y-6">
      {leadsQ.isError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive">
          <p className="text-sm font-medium">Failed to load customers. Please try refreshing the page.</p>
        </div>
      )}
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage and track customer records created from converted leads.</p>
      </div>

      {leadsQ.isLoading ? (
        <TableSkeleton />
      ) : convertedLeads.length === 0 ? (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-6 text-center space-y-4">
          <div>
            <h2 className="text-lg font-medium text-blue-900 mb-2">No Customers From Leads</h2>
            <p className="text-sm text-blue-800">Customers are created automatically when leads are converted.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Total Customers (from leads)" value={convertedLeads.length} icon={<Search size={18} />} />
            <StatCard title="Ready for Booking" value={readyCount} icon={<Search size={18} />} accent="success" />
            <StatCard title="Pending Documents" value={convertedLeads.length - readyCount} icon={<Search size={18} />} accent="warning" />
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
          
          </div>

          <div className="bg-card rounded-3xl border border-border overflow-hidden">
            {filtered.length === 0 ? (
              <EmptyState title="No customers found" description="No customers match the search; customers are created when leads are converted." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                      <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        <tr>
                          <th className="px-5 py-3">Customer Name</th>
                          <th className="px-5 py-3">Phone Number</th>
                          <th className="px-5 py-3">Aadhaar Status</th>
                          <th className="px-5 py-3">Driving Licence Status</th>
                          <th className="px-5 py-3">Overall Status</th>
                          <th className="px-5 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(filtered) && filtered.map((lead) => {
                          const docs = getCustomerDocs(lead.id);
                          const hasAadhaar = !!docs?.aadhaar;
                          const hasDl = !!docs?.drivingLicense;
                          const overall = hasAadhaar && hasDl ? "ready for booking" : "pending";
                          return (
                            <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                              <td className="px-5 py-3 font-medium">{lead.customerName}</td>
                              <td className="px-5 py-3">
                                <button
                                  onClick={() => handleCall(lead.contact)}
                                  className="flex items-center gap-2 text-primary hover:underline"
                                >
                                  <Phone size={14} />
                                  {lead.contact}
                                </button>
                              </td>
                              <td className="px-5 py-3">
                                {hasAadhaar ? <a href={docs.aadhaar.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{docs.aadhaar.name}</a> : <span className="text-sm text-muted-foreground">Missing</span>}
                              </td>
                              <td className="px-5 py-3">
                                {hasDl ? <a href={docs.drivingLicense.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{docs.drivingLicense.name}</a> : <span className="text-sm text-muted-foreground">Missing</span>}
                              </td>
                              <td className="px-5 py-3">
                                <StatusBadge status={overall} />
                              </td>
                              <td className="px-5 py-3 flex gap-2">
                                <Button onClick={() => openDialog(lead)} className="h-8">
                                  {hasAadhaar && hasDl ? "View" : "Upload Docs"}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
          {/* Upload / View modal */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Documents</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Customer Name</Label>
                  <Input readOnly value={customerForm.customerName} />
                </div>

                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input readOnly value={customerForm.phone} />
                </div>

                <div className="space-y-1.5">
                  <Label>Aadhaar</Label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => setUploadAadhaarFile(e.target.files?.[0] ?? null)} />
                </div>

                <div className="space-y-1.5">
                  <Label>Driving Licence</Label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => setUploadDlFile(e.target.files?.[0] ?? null)} />
                </div>

                <Button onClick={handleSave} className="w-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
    </div>
  );
};

export default CustomersPage;
