import { useMemo, useState } from "react";
import { CreditCard, Shield, ArrowRightCircle } from "lucide-react";
import { payments } from "@/data/workflows";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/EmptyState";

const PaymentsPage = () => {
  const [type, setType] = useState<"all" | "rental" | "security-deposit" | "refund">("all");
  const filtered = useMemo(
    () => payments.filter((item) => type === "all" || item.type === type),
    [type]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Separate rental collections from deposit and refund activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Total transactions</p>
          <p className="text-3xl font-semibold mt-3">{payments.length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Rental payments</p>
          <p className="text-3xl font-semibold mt-3">{payments.filter((item) => item.type === "rental").length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Security deposits</p>
          <p className="text-3xl font-semibold mt-3">{payments.filter((item) => item.type === "security-deposit").length}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {(["all", "rental", "security-deposit", "refund"] as const).map((option) => (
          <button
            key={option}
            onClick={() => setType(option)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${type === option ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}
          >
            {option.replace("security-deposit", "deposit")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No transactions" description="Transactions will appear when payments are recorded." />
      ) : (
        <div className="grid gap-6">
          {filtered.map((item) => (
            <div key={item.id} className="bg-card rounded-3xl border border-border p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.id}</p>
                  <h2 className="text-lg font-semibold mt-2">{item.customer}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{item.type === "security-deposit" ? "Security deposit" : item.type === "refund" ? "Refund request" : "Rental payment"}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Amount</p>
                  <p className="mt-2 font-semibold">₹{item.amount.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Due date</p>
                  <p className="mt-2 font-semibold">{item.dueDate}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Owner</p>
                  <p className="mt-2 font-semibold">{item.assignedTo}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
                <ArrowRightCircle size={18} /> Separate deposits from rental revenue for clearer reconciliation.
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="secondary">View invoice</Button>
                <Button>Mark paid</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
