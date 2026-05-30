import { useMemo, useState } from "react";
import { Search, Users, Phone, Tag, Sparkles } from "lucide-react";
import { leads } from "@/data/workflows";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/states/EmptyState";
import { TableSkeleton } from "@/components/states/LoadingSkeleton";

const stageLabel: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
};

const LeadsPage = () => {
  const { role } = useAuth();
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => leads.filter((lead) => {
      const search = query.toLowerCase();
      return !search || [lead.id, lead.customerName, lead.contact, lead.source, lead.assignedTo]
        .some((value) => String(value).toLowerCase().includes(search));
    }),
    [query]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track new fleet inquiries and conversion progress.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Total Leads</p>
          <p className="text-3xl font-semibold mt-3">{leads.length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Active Pipeline</p>
          <p className="text-3xl font-semibold mt-3">{leads.filter((lead) => lead.stage !== "lost" && lead.stage !== "converted").length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Converted</p>
          <p className="text-3xl font-semibold mt-3">{leads.filter((lead) => lead.stage === "converted").length}</p>
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
        <Button className="w-full sm:w-auto" variant="secondary">
          <Users size={16} className="mr-2" /> Export pipeline
        </Button>
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState title="No leads found" description="Use search to find leads or update your filters." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                {['Lead ID', 'Customer', 'Source', 'Stage', 'Owner', 'Created'].map((label) => (
                  <th key={label} className="px-5 py-3">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 font-medium">{lead.id}</td>
                  <td className="px-5 py-4">{lead.customerName}<br/><span className="text-xs text-muted-foreground">{lead.contact}</span></td>
                  <td className="px-5 py-4">{lead.source}</td>
                  <td className="px-5 py-4"><StatusBadge status={lead.stage} /></td>
                  <td className="px-5 py-4">{lead.assignedTo}</td>
                  <td className="px-5 py-4 text-muted-foreground">{lead.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-3xl border border-border p-5 flex items-center gap-3">
            <Sparkles size={20} className="text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Fast-moving leads</p>
              <p className="font-semibold">{leads.filter((lead) => lead.stage === 'qualified').length} qualified</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
