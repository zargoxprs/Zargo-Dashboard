import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  active: "bg-primary/15 text-primary",
  available: "bg-success/15 text-success",
  completed: "bg-muted text-muted-foreground",
  rented: "bg-primary/15 text-primary",
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
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize", colorMap[status] || "bg-muted text-muted-foreground")}>
    {status}
  </span>
);

export default StatusBadge;
