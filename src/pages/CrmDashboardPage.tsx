import { useMemo } from "react";
import { ArrowRight, Bell, Clock, Phone, RefreshCcw, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import StatCard from "@/components/StatCard";
import { crmFollowUps, crmRecoveryQueue } from "@/data/crm";
import { StatusBadge } from "@/components/StatusBadge";

const statusLabel: Record<string, string> = {
  "pending-call": "Pending Call",
  "follow-up-done": "Follow Up Done",
  "recovery-visit-required": "Recovery Visit Required",
  resolved: "Resolved",
  "legal-escalation": "Legal Escalation",
};

const CrmDashboardPage = () => {
  const { role } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  const todaysCalls = useMemo(
    () => crmFollowUps.filter((item) => item.dueDate === today && item.reason.toLowerCase().includes("call")).length,
    [today],
  );

  const renewalFollowUps = useMemo(
    () => crmFollowUps.filter((item) => item.reason.toLowerCase().includes("renewal")).length,
    [],
  );

  const paymentReminders = useMemo(
    () => crmFollowUps.filter((item) => item.reason.toLowerCase().includes("payment")).length,
    [],
  );

  const recoveryCases = useMemo(
    () => crmRecoveryQueue.filter((item) => item.status !== "resolved").length,
    [],
  );

  const missedFollowUps = useMemo(
    () => crmFollowUps.filter((item) => item.status === "overdue").length,
    [],
  );

  const completedFollowUps = useMemo(
    () => crmFollowUps.filter((item) => item.status === "completed").length,
    [],
  );

  const recoveryStatusCounts = useMemo(
    () =>
      crmRecoveryQueue.reduce<Record<string, number>>((acc, item) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1;
        return acc;
      }, {}),
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CRM Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage customer touchpoints, follow ups, and recovery performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard title="Today's Calls" value={todaysCalls} icon={Phone} accent="primary" subtitle="Customer outreach" />
        <StatCard title="Renewal Follow Ups" value={renewalFollowUps} icon={RefreshCcw} accent="warning" subtitle="Renewal reminders" />
        <StatCard title="Payment Reminders" value={paymentReminders} icon={Bell} accent="destructive" subtitle="Pending payments" />
        <StatCard title="Recovery Cases" value={recoveryCases} icon={ShieldCheck} accent="accent" subtitle="Open recovery items" />
        <StatCard title="Missed Follow Ups" value={missedFollowUps} icon={Clock} accent="destructive" subtitle="Overdue actions" />
      </div>

      {role === "admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-3xl border border-border p-5">
            <p className="text-sm text-muted-foreground">CRM tasks</p>
            <p className="text-3xl font-semibold mt-3">{crmFollowUps.length + crmRecoveryQueue.length}</p>
          </div>
          <div className="bg-card rounded-3xl border border-border p-5">
            <p className="text-sm text-muted-foreground">Completed follow ups</p>
            <p className="text-3xl font-semibold mt-3">{completedFollowUps}</p>
          </div>
          <div className="bg-card rounded-3xl border border-border p-5">
            <p className="text-sm text-muted-foreground">Recovery queue</p>
            <p className="text-3xl font-semibold mt-3">{recoveryStatusCounts["pending-call"] ?? 0}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(statusLabel).map(([key, label]) => (
          <div key={key} className="bg-card rounded-3xl border border-border p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.24em]">{label}</p>
                <p className="text-2xl font-semibold mt-3">{recoveryStatusCounts[key] ?? 0}</p>
              </div>
              <ArrowRight className="text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrmDashboardPage;
