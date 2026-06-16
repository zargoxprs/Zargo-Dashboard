import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  active: "bg-primary/15 text-primary",
  available: "bg-success/15 text-success",
  "ready_for_booking": "bg-primary/15 text-primary",
  completed: "bg-success/15 text-success",
  assigned: "bg-primary/15 text-primary",
  "in-progress": "bg-warning/15 text-warning",
  "pdi_pending": "bg-warning/15 text-warning",
  "pdi_checklist": "bg-warning/15 text-warning",
  pending: "bg-warning/15 text-warning",
  due: "bg-warning/15 text-warning",
  overdue: "bg-destructive/15 text-destructive",
  critical: "bg-destructive/15 text-destructive",
  service: "bg-warning/15 text-warning",
  idle: "bg-muted text-muted-foreground",
  info: "bg-primary/15 text-primary",
  warning: "bg-warning/15 text-warning",
  unread: "bg-destructive/15 text-destructive",
  read: "bg-muted text-muted-foreground",
  contacted: "bg-primary/15 text-primary",
  qualified: "bg-amber-500/15 text-amber-700",
  converted: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
  "ready for booking": "bg-success/15 text-success",
};

const labelMap: Record<string, string> = {
  pdi_pending: "PDI Pending",
  ready_for_booking: "Ready For Booking",
  idle: "Idle",
};

export const StatusBadge = ({ status }: { status: string }) => {
  const label = labelMap[status] ?? status.replace(/_/g, " ");
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize", colorMap[status] || "bg-muted text-muted-foreground")}>
      {label}
    </span>
  );
};

export default StatusBadge;
