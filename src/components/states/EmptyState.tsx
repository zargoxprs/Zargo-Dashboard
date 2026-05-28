import { LucideIcon, Inbox } from "lucide-react";

export const EmptyState = ({
  title = "Nothing to show",
  description,
  icon: Icon = Inbox,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
}) => (
  <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
    <Icon size={28} className="mx-auto mb-2 opacity-40" />
    <p className="text-sm font-medium text-foreground">{title}</p>
    {description && <p className="text-xs mt-1">{description}</p>}
  </div>
);