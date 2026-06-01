import { useMemo, useState } from "react";
import { Search, Users, Phone, MessageCircle, Edit3, ArrowRightCircle, Sparkles } from "lucide-react";
import { leads } from "@/data/workflows";
import { useAuth } from "@/context/AuthContext";
import { useVehicles } from "@/hooks/useVehicles";
import { useAddBooking } from "@/hooks/useBookings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState } from "@/components/states/EmptyState";
import { TableSkeleton } from "@/components/states/LoadingSkeleton";
import { Lead, LeadStage } from "@/types";

const leadSources = ["Website", "Walk-in", "Referral", "WhatsApp", "Phone Inquiry"];
const leadStages: { value: LeadStage; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const plans = [
  { id: "qs-weekly", model: "Quanta S", label: "Weekly", durationDays: 7, rental: 1800, deposit: 1800, kmLimit: 999999, kmLabel: "Unlimited KM" },
  { id: "qs-monthly-2000", model: "Quanta S", label: "Monthly", durationDays: 30, rental: 5400, deposit: 1800, kmLimit: 2000, kmLabel: "2000 KM" },
  { id: "qs-monthly-3000", model: "Quanta S", label: "Monthly", durationDays: 30, rental: 6200, deposit: 1800, kmLimit: 3000, kmLabel: "3000 KM" },
  { id: "qs-monthly-unlimited", model: "Quanta S", label: "Monthly", durationDays: 30, rental: 7000, deposit: 1800, kmLimit: 999999, kmLabel: "Unlimited KM" },
  { id: "qsplus-weekly", model: "Quanta S+", label: "Weekly", durationDays: 7, rental: 1950, deposit: 1950, kmLimit: 999999, kmLabel: "Unlimited KM" },
];

const emptyLeadForm = {
  id: "",
  customerName: "",
  contact: "",
  source: "Website",
  stage: "new" as LeadStage,
  assignedTo: "",
  createdAt: "",
};

const normalizePhone = (phone: string) => phone.replace(/[^0-9]/g, "");

const LeadsPage = () => {
  const { role } = useAuth();
  const vehiclesQ = useVehicles();
  const availableVehicles = (vehiclesQ.data ?? []).filter((v: any) => v.status === "available");
  const addBooking = useAddBooking();

  const [leadList, setLeadList] = useState<Lead[]>(() => leads.map((lead) => ({ ...lead })));
  const [query, setQuery] = useState("");
  const [leadForm, setLeadForm] = useState({ ...emptyLeadForm });
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [convertPlanId, setConvertPlanId] = useState(plans[0].id);
  const [convertStartDate, setConvertStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(
    () => leadList.filter((lead) => {
      const search = query.toLowerCase();
      return !search || [lead.id, lead.customerName, lead.contact, lead.source, lead.assignedTo]
        .some((value) => String(value).toLowerCase().includes(search));
    }),
    [leadList, query]
  );

  const plan = plans.find((item) => item.id === convertPlanId) ?? plans[0];
  const calculatedEndDate = (() => {
    if (!convertStartDate) return "";
    const date = new Date(convertStartDate);
    date.setDate(date.getDate() + plan.durationDays);
    return date.toISOString().split("T")[0];
  })();

  const openLeadDialog = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setLeadForm({ ...lead });
    } else {
      setEditingLead(null);
      setLeadForm({ ...emptyLeadForm, source: "Website", stage: "new" });
    }
    setErrors({});
    setLeadDialogOpen(true);
  };

  const saveLead = () => {
    const nextErrors: Record<string, string> = {};
    if (!leadForm.customerName.trim()) nextErrors.customerName = "Customer name is required";
    if (!normalizePhone(leadForm.contact)) nextErrors.contact = "A valid phone is required";
    if (!leadForm.assignedTo.trim()) nextErrors.assignedTo = "Assign an owner";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (editingLead) {
      setLeadList((items) => items.map((item) => (item.id === editingLead.id ? { ...item, ...leadForm } : item)));
    } else {
      const nextLead: Lead = {
        ...leadForm,
        id: `L-${1000 + leadList.length + 1}`,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setLeadList((items) => [nextLead, ...items]);
    }
    setLeadDialogOpen(false);
  };

  const openConvertDialog = (lead: Lead) => {
    setConvertLead(lead);
    setConvertPlanId(plans[0].id);
    setConvertStartDate(new Date().toISOString().split("T")[0]);
    setConvertDialogOpen(true);
  };

  const handleConvert = () => {
    if (!convertLead) return;
    if (availableVehicles.length === 0) {
      setErrors({ convert: "No available vehicle currently to convert this lead." });
      return;
    }
    const vehicle = availableVehicles[0];
    const payload = {
      riderName: convertLead.customerName,
      phone: convertLead.contact,
      vehicle: vehicle._id || vehicle.id || vehicle.vehicleId || vehicle.numberPlate,
      startDate: convertStartDate,
      endDate: calculatedEndDate,
      kmLimit: plan.kmLimit,
      kmUsed: 0,
      status: "active" as const,
      amount: plan.rental,
      bookingId: `BKG-${1000 + leadList.length}`,
    };
    addBooking.mutate(payload, {
      onSuccess: () => {
        setLeadList((items) => items.map((item) => (item.id === convertLead.id ? { ...item, stage: "converted" } : item)));
        setConvertDialogOpen(false);
      },
    });
  };

  const handleCall = (contact: string) => {
    const sanitized = normalizePhone(contact);
    if (sanitized) window.open(`tel:${sanitized}`, "_self");
  };

  const handleWhatsApp = (contact: string) => {
    const sanitized = normalizePhone(contact);
    if (sanitized) window.open(`https://wa.me/${sanitized}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track new fleet inquiries and conversion progress.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Total Leads</p>
          <p className="text-3xl font-semibold mt-3">{leadList.length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Active Pipeline</p>
          <p className="text-3xl font-semibold mt-3">{leadList.filter((lead) => lead.stage !== "lost" && lead.stage !== "converted").length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Converted</p>
          <p className="text-3xl font-semibold mt-3">{leadList.filter((lead) => lead.stage === "converted").length}</p>
        </div>
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
          <Button variant="secondary" onClick={() => openLeadDialog()}>
            <Users size={16} className="mr-2" /> Create Lead
          </Button>
          <Button className="w-full sm:w-auto">
            <Sparkles size={16} className="mr-2" /> Export pipeline
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState title="No leads found" description="Use search to find leads or update your filters." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                {['Lead ID', 'Customer', 'Source', 'Stage', 'Owner', 'Created', 'Actions'].map((label) => (
                  <th key={label} className="px-5 py-3">{label}</th>
                ))}
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
                      onClick={() => openLeadDialog(lead)}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-primary hover:bg-muted"
                    >
                      <Edit3 size={14} className="inline mr-1" /> Edit
                    </button>
                    <button
                      type="button"
                      disabled={lead.stage === "converted" || lead.stage === "lost" || availableVehicles.length === 0}
                      onClick={() => openConvertDialog(lead)}
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
            <DialogTitle>{editingLead ? "Edit Lead" : "Create Lead"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Customer name</Label>
                <Input value={leadForm.customerName} onChange={(e) => setLeadForm({ ...leadForm, customerName: e.target.value })} />
                {errors.customerName && <p className="text-xs text-destructive">{errors.customerName}</p>}
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={leadForm.contact} onChange={(e) => setLeadForm({ ...leadForm, contact: e.target.value })} />
                {errors.contact && <p className="text-xs text-destructive">{errors.contact}</p>}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Source</Label>
                <Select value={leadForm.source} onValueChange={(value) => setLeadForm({ ...leadForm, source: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadSources.map((source) => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Stage</Label>
                <Select value={leadForm.stage} onValueChange={(value) => setLeadForm({ ...leadForm, stage: value as LeadStage })}>
                  <SelectTrigger>
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

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Assigned to</Label>
                <Input value={leadForm.assignedTo} onChange={(e) => setLeadForm({ ...leadForm, assignedTo: e.target.value })} />
                {errors.assignedTo && <p className="text-xs text-destructive">{errors.assignedTo}</p>}
              </div>
              <div className="space-y-1">
                <Label>Created at</Label>
                <Input type="date" value={leadForm.createdAt || new Date().toISOString().split("T")[0]} onChange={(e) => setLeadForm({ ...leadForm, createdAt: e.target.value })} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setLeadDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveLead}>{editingLead ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert lead to booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {convertLead ? (
              <>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Lead</p>
                  <p className="font-semibold">{convertLead.customerName}</p>
                  <p className="text-xs text-muted-foreground">{convertLead.contact}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Plan</Label>
                    <Select value={convertPlanId} onValueChange={(value) => setConvertPlanId(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((planOption) => (
                          <SelectItem key={planOption.id} value={planOption.id}>
                            {planOption.model} / {planOption.label} / {planOption.kmLabel} / ₹{planOption.rental}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Start date</Label>
                    <Input type="date" value={convertStartDate} onChange={(e) => setConvertStartDate(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs text-muted-foreground">Rental price</p>
                    <p className="font-semibold">₹{plan.rental}</p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs text-muted-foreground">Security deposit</p>
                    <p className="font-semibold">₹{plan.deposit}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs text-muted-foreground">KM limit</p>
                    <p className="font-semibold">{plan.kmLabel}</p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs text-muted-foreground">End date</p>
                    <p className="font-semibold">{calculatedEndDate}</p>
                  </div>
                </div>
                <div className="text-xs text-destructive">{errors.convert}</div>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setConvertDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleConvert}>Convert and create booking</Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select a lead to convert.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsPage;
