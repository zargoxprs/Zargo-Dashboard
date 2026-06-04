import { useMemo, useState } from "react";
import { Search, Users, Phone, MessageCircle, Edit3, Sparkles, ArrowRightCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState } from "@/components/states/EmptyState";
import { TableSkeleton } from "@/components/states/LoadingSkeleton";
import StatCard from "@/components/StatCard";
import { leads as sampleLeads } from "@/data/workflows";
import { Lead, LeadStage } from "@/types";
import { useCreateLead, useLeads, useUpdateLead } from "@/hooks/useLeads";
import { useEmployees } from "@/hooks/useEmployees";

const leadSources = ["Website", "Walk-in", "Referral", "WhatsApp", "Phone Inquiry"];
const leadStages: { value: LeadStage; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
  { value: "rejected", label: "Rejected" },
];

const emptyLeadForm = {
  customerName: "",
  contact: "",
  source: "Website",
  stage: "new" as LeadStage,
  assignedTo: "",
  notes: "",
};

const normalizePhone = (phone: string) => phone.replace(/[^0-9]/g, "");

const formatCsvValue = (value: string | number | undefined) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const LeadsPage = () => {
  const leadsQ = useLeads();
  const employeesQ = useEmployees();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const [query, setQuery] = useState("");
  const [leadForm, setLeadForm] = useState(emptyLeadForm);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [statusValue, setStatusValue] = useState<LeadStage>("new");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // fallback to static sample leads when API is not available
  const leads = leadsQ.data ?? sampleLeads;

  const filtered = useMemo(
    () => leads.filter((lead) => {
      const search = query.toLowerCase();
      return (
        !search ||
        [lead.leadId ?? lead.id, lead.customerName, lead.contact, lead.source, lead.assignedTo, lead.stage]
          .some((value) => String(value).toLowerCase().includes(search))
      );
    }),
    [leads, query]
  );

  const openLeadDialog = () => {
    setLeadForm(emptyLeadForm);
    setErrors({});
    setLeadDialogOpen(true);
  };

  const openStatusDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setStatusValue(lead.stage);
    setErrors({});
    setStatusDialogOpen(true);
  };

  const handleCreateLead = () => {
    const nextErrors: Record<string, string> = {};
    if (!leadForm.customerName.trim()) nextErrors.customerName = "Customer name is required";
    if (!normalizePhone(leadForm.contact)) nextErrors.contact = "A valid phone is required";
    if (!leadForm.assignedTo.trim()) nextErrors.assignedTo = "Assign a staff member to follow up";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    createLead.mutate(leadForm, {
      onSuccess: () => {
        setLeadDialogOpen(false);
        setLeadForm(emptyLeadForm);
      },
    });
  };

  const handleUpdateStatus = () => {
    if (!selectedLead) return;
    updateLead.mutate(
      { id: selectedLead.id, patch: { stage: statusValue } },
      {
        onSuccess: () => {
          setStatusDialogOpen(false);
          setSelectedLead(null);
        },
      }
    );
  };

  const handleCall = (contact: string) => {
    const sanitized = normalizePhone(contact);
    if (sanitized) window.open(`tel:${sanitized}`, "_self");
  };

  const handleWhatsApp = (contact: string) => {
    const sanitized = normalizePhone(contact);
    if (sanitized) window.open(`https://wa.me/${sanitized}`, "_blank");
  };

  const handleExportPipeline = () => {
    const headers = ["Lead ID", "Customer", "Contact", "Source", "Stage", "Assigned Staff", "Created At"];
    const rows = leads.map((lead) => [
      lead.leadId ?? lead.id,
      lead.customerName,
      lead.contact,
      lead.source,
      lead.stage,
      lead.assignedTo,
      lead.createdAt,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(formatCsvValue).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-pipeline-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalLeads = leads.length;
  const activePipeline = leads.filter((lead) => lead.stage !== "converted" && lead.stage !== "rejected").length;
  const convertedLeads = leads.filter((lead) => lead.stage === "converted").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track new fleet inquiries and conversion progress.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Leads" value={totalLeads} icon={<Users size={18} />} />
        <StatCard title="Active Pipeline" value={activePipeline} icon={<Users size={18} />} accent="warning" />
        <StatCard title="Converted" value={convertedLeads} icon={<Users size={18} />} accent="success" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search leads..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button variant="secondary" onClick={openLeadDialog}>
            <Users size={16} className="mr-2" /> Create Lead
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleExportPipeline}>
            <Sparkles size={16} className="mr-2" /> Export pipeline
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        {leadsQ.isLoading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState title="No leads found" description="Use search to find leads or add a new lead." />
        ) : (
          <div className="overflow-hidden">
            <table className="w-full table-fixed text-sm">
            <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Lead ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3">Assigned Staff</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 font-medium max-w-[8rem] truncate">{lead.leadId ?? lead.id}</td>
                  <td className="px-5 py-4 max-w-[16rem] break-words">
                    <div className="font-medium truncate">{lead.customerName}</div>
                    <div className="text-xs text-muted-foreground truncate">{lead.contact}</div>
                  </td>
                  <td className="px-5 py-4 truncate">{lead.source}</td>
                  <td className="px-5 py-4"><StatusBadge status={lead.stage} /></td>
                  <td className="px-5 py-4 truncate">{lead.assignedTo}</td>
                  <td className="px-5 py-4 text-muted-foreground truncate">{lead.createdAt}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => handleCall(lead.contact)}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-primary hover:bg-muted"
                    >
                      <Phone size={14} className="inline mr-1" /> Call
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWhatsApp(lead.contact)}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-primary hover:bg-muted"
                    >
                      <MessageCircle size={14} className="inline mr-1" /> WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => openStatusDialog(lead)}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-primary hover:bg-muted"
                    >
                      <Edit3 size={14} className="inline mr-1" /> Status
                    </button>
                    <button
                      type="button"
                      disabled={lead.stage === "converted" || lead.stage === "rejected"}
                      onClick={() => updateLead.mutate({ id: lead.id, patch: { stage: "converted" } })}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-primary disabled:opacity-40 disabled:pointer-events-none hover:bg-muted"
                    >
                      <ArrowRightCircle size={14} className="inline mr-1" /> {lead.stage === "converted" ? "Converted ✓" : "Mark Converted"}
                    </button>
                  </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      <Dialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={leadForm.customerName}
                onChange={(e) => setLeadForm((prev) => ({ ...prev, customerName: e.target.value }))}
              />
              {errors.customerName ? <p className="text-xs text-destructive mt-1">{errors.customerName}</p> : null}
            </div>
            <div>
              <Label htmlFor="contact">Mobile Number</Label>
              <Input
                id="contact"
                value={leadForm.contact}
                onChange={(e) => setLeadForm((prev) => ({ ...prev, contact: e.target.value }))}
              />
              {errors.contact ? <p className="text-xs text-destructive mt-1">{errors.contact}</p> : null}
            </div>
            <div>
              <Label htmlFor="source">Lead Source</Label>
              <Select value={leadForm.source} onValueChange={(value) => setLeadForm((prev) => ({ ...prev, source: value }))}>
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {leadSources.map((source) => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignedTo">Assigned Staff</Label>
              {employeesQ.data && employeesQ.data.length > 0 ? (
                <Select
                  value={leadForm.assignedTo}
                  onValueChange={(value) => setLeadForm((prev) => ({ ...prev, assignedTo: value }))}
                >
                  <SelectTrigger id="assignedTo">
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeesQ.data.map((employee) => (
                      <SelectItem key={employee.id} value={employee.name}>{employee.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="assignedTo"
                  placeholder="Enter staff name"
                  value={leadForm.assignedTo}
                  onChange={(e) => setLeadForm((prev) => ({ ...prev, assignedTo: e.target.value }))}
                />
              )}
              <p className="text-xs text-muted-foreground mt-1">Staff responsible for follow-up on this lead.</p>
              {errors.assignedTo ? <p className="text-xs text-destructive mt-1">{errors.assignedTo}</p> : null}
            </div>
            <div>
              <Label htmlFor="stage">Stage</Label>
              <Select value={leadForm.stage} onValueChange={(value) => setLeadForm((prev) => ({ ...prev, stage: value as LeadStage }))}>
                <SelectTrigger id="stage">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {leadStages.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={leadForm.notes}
                onChange={(e) => setLeadForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setLeadDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateLead} disabled={createLead.isLoading}>
              Save Lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update lead status</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Lead</Label>
              <p className="text-sm text-muted-foreground">{selectedLead?.customerName}</p>
            </div>
            <div>
              <Label htmlFor="statusValue">Status</Label>
              <Select value={statusValue} onValueChange={(value) => setStatusValue(value as LeadStage)}>
                <SelectTrigger id="statusValue">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {leadStages.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus} disabled={updateLead.isLoading}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsPage;
