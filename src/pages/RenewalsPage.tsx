import { useMemo, useState } from "react";
import { RefreshCcw, CalendarCheck, AlertTriangle } from "lucide-react";
import { renewals } from "@/data/workflows";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/states/EmptyState";

const RenewalsPage = () => {
  const [filter, setFilter] = useState<"all" | "due" | "upcoming" | "overdue">("all");
  const filtered = useMemo(
    () => renewals.filter((item) => filter === "all" || item.status === filter),
    [filter]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Renewals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Monitor due dates and overdue renewal triggers.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Total contracts</p>
          <p className="text-3xl font-semibold mt-3">{renewals.length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-3xl font-semibold mt-3">{renewals.filter((item) => item.status === "overdue").length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Upcoming</p>
          <p className="text-3xl font-semibold mt-3">{renewals.filter((item) => item.status === "upcoming").length}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {(["all", "due", "upcoming", "overdue"] as const).map((status) => (
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
        <EmptyState title="No renewal items" description="Adjust the filter to discover pending or overdue contracts." />
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
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Due date</p>
                  <p className="mt-2 font-semibold">{item.dueDate}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Amount</p>
                  <p className="mt-2 font-semibold">₹{item.amount.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Owner</p>
                  <p className="mt-2 font-semibold">{item.assignedTo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RenewalsPage;
