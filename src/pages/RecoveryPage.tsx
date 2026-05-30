import { useMemo, useState } from "react";
import { AlertTriangle, PhoneIncoming, ShieldAlert } from "lucide-react";
import { recoveries } from "@/data/workflows";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/states/EmptyState";

const RecoveryPage = () => {
  const [filter, setFilter] = useState<"all" | "open" | "contacted" | "recovered" | "escalated">("all");
  const filtered = useMemo(
    () => recoveries.filter((item) => filter === "all" || item.status === filter),
    [filter]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recovery</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage overdue recoveries and follow-up triggers.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Active cases</p>
          <p className="text-3xl font-semibold mt-3">{recoveries.length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Open cases</p>
          <p className="text-3xl font-semibold mt-3">{recoveries.filter((item) => item.status === "open").length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Escalated</p>
          <p className="text-3xl font-semibold mt-3">{recoveries.filter((item) => item.status === "escalated").length}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {(["all", "open", "contacted", "recovered", "escalated"] as const).map((status) => (
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
        <EmptyState title="No recovery cases" description="There are no cases matching this status." />
      ) : (
        <div className="grid gap-6">
          {filtered.map((item) => (
            <div key={item.id} className="bg-card rounded-3xl border border-border p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.id}</p>
                  <h2 className="text-lg font-semibold mt-2">{item.customer}</h2>
                  <p className="text-sm text-muted-foreground mt-1">Vehicle {item.vehicleModel}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Overdue</p>
                  <p className="mt-2 font-semibold">{item.overdueBy}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Assigned</p>
                  <p className="mt-2 font-semibold">{item.assignedTo}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Action</p>
                  <p className="mt-2 font-semibold">{item.status === "open" ? "Initiate contact" : item.status === "contacted" ? "Track response" : "Resolve"}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <AlertTriangle size={18} className="text-destructive" />
                <p className="text-sm text-muted-foreground">Keep overdue cases visible until recovery or escalation is complete.</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecoveryPage;
