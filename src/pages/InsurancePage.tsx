import { useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, CalendarDays } from "lucide-react";
import { insurances } from "@/data/workflows";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/states/EmptyState";

const InsurancePage = () => {
  const [filter, setFilter] = useState<"all" | "active" | "expiring" | "claimed" | "closed">("all");
  const filtered = useMemo(
    () => insurances.filter((item) => filter === "all" || item.status === filter),
    [filter]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Insurance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track policies, claims, and renewal readiness.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Total records</p>
          <p className="text-3xl font-semibold mt-3">{insurances.length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Expiring soon</p>
          <p className="text-3xl font-semibold mt-3">{insurances.filter((item) => item.status === "expiring").length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Open claims</p>
          <p className="text-3xl font-semibold mt-3">{insurances.filter((item) => item.type === "claim" && item.status === "active").length}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {(["all", "active", "expiring", "claimed", "closed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${filter === status ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}
          >
            {status}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No insurance records" description="Insurance policies and claims appear here." />
      ) : (
        <div className="grid gap-6">
          {filtered.map((item) => (
            <div key={item.id} className="bg-card rounded-3xl border border-border p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.id}</p>
                  <h2 className="text-lg font-semibold mt-2">{item.policyNumber}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{item.vehicle} · {item.type === "policy" ? "Policy" : "Claim"}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Premium</p>
                  <p className="mt-2 font-semibold">₹{item.premium.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Renewal</p>
                  <p className="mt-2 font-semibold">{item.renewalDate}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Managed by</p>
                  <p className="mt-2 font-semibold">{item.assignedTo}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck size={18} /> Keep policy and claim data separate from regular rental operations.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InsurancePage;
