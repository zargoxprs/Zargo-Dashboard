import { cn } from "@/lib/utils";
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType | React.ReactNode;
  accent?: "primary" | "warning" | "destructive" | "success" | "accent";
  subtitle?: string;
}

const iconBg: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  success: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
};

const StatCard = ({ title, value, icon: Icon, accent = "primary", subtitle }: StatCardProps) => (
  <div className={cn("stat-card pl-6", `accent-${accent}`)}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{title}</p>
        <p className="text-2xl font-bold tracking-tight mt-1 truncate">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>}
      </div>
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", iconBg[accent])}>
        {React.isValidElement(Icon) ? (
          Icon
        ) : (
          <Icon size={18} />
        )}
      </div>
    </div>
  </div>
);

export default StatCard;
