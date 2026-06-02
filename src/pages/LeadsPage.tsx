import { useMemo, useState } from "react";
import { Search, Users, Phone, MessageCircle, Edit3, Sparkles, ArrowRightCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
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

const leadSources = ["Website", "Walk-in", "Referral", "WhatsApp", "Phone Inquiry"];
const leadStages: { value: LeadStage; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "rejected", label: "Rejected" },
];

const emptyLeadForm = {
  customerName: "",
  contact: "",
  source: "Website",
  stage: "new" as LeadStage,
  assignedTo: "",
  createdAt: new Date().toISOString().split("T")[0],
};

const normalizePhone = (phone: string) => phone.replace(/[^0-9]/g, "");

const LeadsPage = () => {
  const leadsQ = useLeads();
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
        [lead.id, lead.customerName, lead.contact, lead.source, lead.assignedTo, lead.stage]
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
    if (!leadForm.assignedTo.trim()) nextErrors.assignedTo = "Assign an owner";
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
          <Button className="w-full sm:w-auto">
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
          <table className="w-full text-sm">
            <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Lead ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3">Owner</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 font-medium">{lead.id}</td>
                  <td className="px-5 py-4">
                    <div>{lead.customerName}</div>
                    <div className="text-xs text-muted-foreground">{lead.contact}</div>
                  </td>
                  <td className="px-5 py-4">{lead.source}</td>
                  <td className="px-5 py-4"><StatusBadge status={lead.stage} /></td>
                  <td className="px-5 py-4">{lead.assignedTo}</td>
                  <td className="px-5 py-4 text-muted-foreground">{lead.createdAt}</td>
                  <td className="px-5 py-4 space-x-1 whitespace-nowrap">
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
                      onClick={() => {
                        // quick convert: only update the lead stage to converted
                        setLeadList((items) => items.map((item) => (item.id === lead.id ? { ...item, stage: "converted" } : item)));
                      }}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-primary disabled:opacity-40 disabled:pointer-events-none hover:bg-muted"
                    >
                      <ArrowRightCircle size={14} className="inline mr-1" /> Convert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={leadForm.contact}
                onChange={(e) => setLeadForm((prev) => ({ ...prev, contact: e.target.value }))}
              />
              {errors.contact ? <p className="text-xs text-destructive mt-1">{errors.contact}</p> : null}
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
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
              <Label htmlFor="assignedTo">Owner</Label>
              <Input
                id="assignedTo"
                value={leadForm.assignedTo}
                onChange={(e) => setLeadForm((prev) => ({ ...prev, assignedTo: e.target.value }))}
              />
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
