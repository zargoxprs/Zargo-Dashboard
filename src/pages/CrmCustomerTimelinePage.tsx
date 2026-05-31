import { crmTimeline } from "@/data/crm";
import type { ElementType } from "react";
import { Clock, FileText, CheckCircle2, ShieldCheck, ArrowRight, Bell } from "lucide-react";

const eventIcon: Record<string, ElementType> = {
  "Lead Created": FileText,
  "KYC Approved": CheckCircle2,
  "Vehicle Assigned": ShieldCheck,
  "Booking Created": ArrowRight,
  "Renewal Reminder": Bell,
  "Payment Received": CheckCircle2,
  "Vehicle Returned": Clock,
  "Recovery Initiated": ShieldCheck,
};

const CrmCustomerTimelinePage = () => {
  const sortedEvents = [...crmTimeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Timeline</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Review customer engagement milestones and service history in chronological order.</p>
      </div>

      <div className="space-y-4">
        {sortedEvents.map((event) => {
          const Icon = eventIcon[event.event] || Clock;
          return (
            <div key={event.id} className="bg-card rounded-3xl border border-border p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/70 text-muted-foreground">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{event.event}</p>
                      <p className="text-xs text-muted-foreground">{event.customerName}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{event.date}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{event.details}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CrmCustomerTimelinePage;
