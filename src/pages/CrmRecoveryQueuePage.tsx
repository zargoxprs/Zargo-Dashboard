import { useMemo } from "react";
import { crmRecoveryQueue, crmFollowUps } from "@/data/crm";
import StatusBadge from "@/components/StatusBadge";
import { ShieldCheck, AlertTriangle, Clock, ArrowRight, Bell, Phone } from "lucide-react";

const statusDisplay: Record<string, string> = {
  "pending-call": "Pending Call",
  "follow-up-done": "Follow Up Done",
  "recovery-visit-required": "Recovery Visit Required",
  resolved: "Resolved",
  "legal-escalation": "Legal Escalation",
};

const CrmRecoveryQueuePage = () => {
  const today = new Date();
  const alertCounts = useMemo(() => {
    const summaries = {
      renewalDue7Days: 0,
      renewalDue3Days: 0,
      paymentDueToday: 0,
      oneDayOverdue: 0,
      threeDaysOverdue: 0,
    };

    crmFollowUps.forEach((item) => {
      const due = new Date(item.dueDate);
      const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const reason = item.reason.toLowerCase();

      if (reason.includes("renewal") && diff === 7) summaries.renewalDue7Days += 1;
      if (reason.includes("renewal") && diff === 3) summaries.renewalDue3Days += 1;
      if (reason.includes("payment") && diff === 0) summaries.paymentDueToday += 1;
      if (diff === -1) summaries.oneDayOverdue += 1;
      if (diff === -3) summaries.threeDaysOverdue += 1;
    });

    return summaries;
  }, [today]);

  const statusCounts = useMemo(
    () => crmRecoveryQueue.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    }, {}),
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recovery Queue</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track recovery cases and escalate action items for overdue accounts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Renewal Due in 7 Days</p>
          <p className="text-3xl font-semibold mt-3">{alertCounts.renewalDue7Days}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Renewal Due in 3 Days</p>
          <p className="text-3xl font-semibold mt-3">{alertCounts.renewalDue3Days}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Payment Due Today</p>
          <p className="text-3xl font-semibold mt-3">{alertCounts.paymentDueToday}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">1 Day Overdue</p>
          <p className="text-3xl font-semibold mt-3">{alertCounts.oneDayOverdue}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">3 Days Overdue</p>
          <p className="text-3xl font-semibold mt-3">{alertCounts.threeDaysOverdue}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(statusDisplay).map(([code, label]) => (
          <div key={code} className="bg-card rounded-3xl border border-border p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold mt-3">{statusCounts[code] ?? 0}</p>
              </div>
              {code === "pending-call" ? <Phone size={20} className="text-primary" /> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              {['Customer Name', 'Phone Number', 'Vehicle', 'Booking ID', 'Reason', 'Due Date', 'Status', 'Assigned Staff', 'Comments'].map((label) => (
                <th key={label} className="px-5 py-3">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {crmRecoveryQueue.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-5 py-4 font-medium">{item.customerName}</td>
                <td className="px-5 py-4">{item.phone}</td>
                <td className="px-5 py-4">{item.vehicle}</td>
                <td className="px-5 py-4">{item.bookingId}</td>
                <td className="px-5 py-4">{item.reason}</td>
                <td className="px-5 py-4">{item.dueDate}</td>
                <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                <td className="px-5 py-4">{item.assignedStaff}</td>
                <td className="px-5 py-4">{item.comments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CrmRecoveryQueuePage;
