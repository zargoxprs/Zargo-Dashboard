import { useMemo, useState } from "react";
import { Phone, MessageSquare, CheckCircle2, FileText } from "lucide-react";
import { crmFollowUps } from "@/data/crm";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const formatPhoneLink = (phone: string) => {
  const digits = phone.replace(/[^0-9]/g, "");
  return `tel:+${digits}`;
};

const formatWhatsAppLink = (phone: string) => {
  const digits = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}`;
};

const CrmFollowUpCenterPage = () => {
  const { role } = useAuth();
  const [query, setQuery] = useState("");
  const [followUps, setFollowUps] = useState(crmFollowUps);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});

  const filtered = useMemo(
    () => followUps.filter((item) => {
      const term = query.toLowerCase();
      return (
        !term ||
        [item.customerName, item.phone, item.vehicle, item.bookingId, item.reason, item.assignedStaff]
          .some((value) => value.toLowerCase().includes(term))
      );
    }),
    [followUps, query],
  );

  const handleComplete = (id: string) => {
    setFollowUps((items) => items.map((item) => item.id === id ? { ...item, status: "completed" } : item));
  };

  const handleSaveNote = (id: string) => {
    const note = noteDrafts[id]?.trim();
    if (!note) return;
    setFollowUps((items) => items.map((item) => item.id === id ? { ...item, notes: [...(item.notes ?? []), note] } : item));
    setNoteDrafts((drafts) => ({ ...drafts, [id]: "" }));
    setOpenNotes((open) => ({ ...open, [id]: false }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Follow Up Center</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage customer calls, reminders, and follow up actions from a single view.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Input className="pl-3" placeholder="Search follow ups..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="bg-card rounded-3xl border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.24em]">Total follow ups</p>
            <p className="text-2xl font-semibold mt-2">{followUps.length}</p>
          </div>
          <div className="bg-card rounded-3xl border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.24em]">Completed</p>
            <p className="text-2xl font-semibold mt-2">{followUps.filter((item) => item.status === "completed").length}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              {['Customer Name', 'Phone Number', 'Vehicle', 'Booking ID', 'Reason', 'Due Date', 'Status', 'Assigned Staff', 'Actions'].map((label) => (
                <th key={label} className="px-5 py-3">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-5 py-4 font-medium">{item.customerName}</td>
                <td className="px-5 py-4">{item.phone}</td>
                <td className="px-5 py-4">{item.vehicle}</td>
                <td className="px-5 py-4">{item.bookingId}</td>
                <td className="px-5 py-4">{item.reason}</td>
                <td className="px-5 py-4">{item.dueDate}</td>
                <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                <td className="px-5 py-4">{item.assignedStaff}</td>
                <td className="px-5 py-4 space-y-2">
                  <a href={formatPhoneLink(item.phone)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-sidebar-foreground hover:bg-muted/50"> <Phone size={14} /> Call</a>
                  <a href={formatWhatsAppLink(item.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-sidebar-foreground hover:bg-muted/50"> <MessageSquare size={14} /> WhatsApp</a>
                  <Button size="sm" className="w-full" disabled={item.status === "completed"} onClick={() => handleComplete(item.id)}>
                    <CheckCircle2 size={14} /> Mark Completed
                  </Button>
                  <Button size="sm" variant="secondary" className="w-full" onClick={() => setOpenNotes((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}>
                    <FileText size={14} /> Add Notes
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.map((item) => openNotes[item.id] && (
        <div key={`notes-${item.id}`} className="bg-card rounded-3xl border border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Add notes for {item.customerName}</p>
              <p className="text-sm text-muted-foreground">Existing notes: {item.notes?.length ?? 0}</p>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              placeholder="Enter note"
              value={noteDrafts[item.id] ?? ""}
              onChange={(e) => setNoteDrafts((drafts) => ({ ...drafts, [item.id]: e.target.value }))}
            />
            <Button size="sm" onClick={() => handleSaveNote(item.id)}>Save</Button>
          </div>
          {item.notes?.length ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Notes</p>
              {item.notes.map((note, index) => (
                <div key={index} className="rounded-2xl border border-border/70 bg-muted/10 p-3 text-sm">{note}</div>
              ))}
            </div>
          ) : null}
        </div>
      ))}

      {role === "admin" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-card rounded-3xl border border-border p-5">
            <p className="text-sm text-muted-foreground">Admin follow ups</p>
            <p className="text-3xl font-semibold mt-3">{followUps.filter((item) => item.assignedStaff).length}</p>
          </div>
          <div className="bg-card rounded-3xl border border-border p-5">
            <p className="text-sm text-muted-foreground">Outstanding reminders</p>
            <p className="text-3xl font-semibold mt-3">{followUps.filter((item) => item.status === "pending").length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmFollowUpCenterPage;
