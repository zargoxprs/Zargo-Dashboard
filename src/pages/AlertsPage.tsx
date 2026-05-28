import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAlerts, useMarkAlertRead } from "@/hooks/useAlerts";
import { TableSkeleton } from "@/components/states/LoadingSkeleton";
import { AlertTriangle, AlertCircle, Info, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDateFilter } from "@/context/DateFilterContext";
import { useBookings } from "@/hooks/useBookings";
import { useAuth } from "@/context/AuthContext";

const severityTabs = ["all", "critical", "warning", "info"] as const;
const typeTabs = ["all", "rider", "employee", "management"] as const;

const severityMeta: Record<string, { icon: typeof Bell; border: string; text: string; bg: string }> = {
  critical: { icon: AlertCircle, border: "border-l-destructive", text: "text-destructive", bg: "bg-destructive/10" },
  warning: { icon: AlertTriangle, border: "border-l-warning", text: "text-warning", bg: "bg-warning/10" },
  info: { icon: Info, border: "border-l-primary", text: "text-primary", bg: "bg-primary/10" },
};

const AlertsPage = () => {
  const alertsQ = useAlerts();
  const alerts = alertsQ.data ?? [];
  const markAlertRead = useMarkAlertRead();
  const [severity, setSeverity] = useState<typeof severityTabs[number]>("all");
  const [type, setType] = useState<typeof typeTabs[number]>("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSelectedId = searchParams.get("alertId") ?? undefined;
  const [selectedAlertId, setSelectedAlertId] = useState<string | undefined>(initialSelectedId);
  const { range } = useDateFilter();
  const bookingsQ = useBookings();
  const bookings = bookingsQ.data ?? [];
  const { role, user } = useAuth();

  useEffect(() => {
    setSelectedAlertId(searchParams.get("alertId") ?? undefined);
  }, [searchParams]);

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId);

  // Prepare a set of booking-related identifiers for staff scoping
  const hubBookingIdentifiers = useMemo(() => {
    if (role !== "staff" || !user?.hub) return null;
    const related = (bookings || []).filter((b: any) => {
      const vehicle = b.vehicle;
      const hub = vehicle?.hub || (Array.isArray(vehicle) ? undefined : undefined);
      return hub === user.hub;
    });
    const names = new Set(related.map((r: any) => (r.riderName || r.rider_name || "").toLowerCase()));
    const ids = new Set(related.map((r: any) => r.bookingId || r._id || r.id));
    return { names, ids };
  }, [bookings, role, user]);

  const filtered = alerts.filter((a) => {
    if (!(severity === "all" || a.severity === severity)) return false;
    if (!(type === "all" || a.type === type)) return false;
    // date filter
    if (range?.start) {
      if (new Date(a.created_at) < new Date(range.start)) return false;
    }
    if (range?.end) {
      if (new Date(a.created_at) > new Date(range.end)) return false;
    }
    // staff scoping: only alerts connected to bookings in their hub
    if (hubBookingIdentifiers) {
      const msg = (a.message || "").toLowerCase();
      const matchesName = Array.from(hubBookingIdentifiers.names).some((n) => n && msg.includes(n));
      const matchesId = Array.from(hubBookingIdentifiers.ids).some((id) => id && msg.includes(String(id)));
      return matchesName || matchesId;
    }
    return true;
  });

  const counts = {
    all: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    info: alerts.filter((a) => a.severity === "info").length,
  };

  const handleSelectAlert = (id: string) => {
    setSelectedAlertId(id);
    setSearchParams({ alertId: id });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Real-time notifications across your operation</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {severityTabs.map((t) => (
          <button
            key={t}
            onClick={() => setSeverity(t)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all border",
              severity === t ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted border-border"
            )}
          >
            {t} <span className="ml-1 opacity-70">{counts[t as keyof typeof counts]}</span>
          </button>
        ))}
        <span className="mx-2 h-5 w-px bg-border" />
        {typeTabs.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors border",
              type === t ? "bg-foreground/90 text-background border-foreground" : "bg-card hover:bg-muted border-border text-muted-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {selectedAlert && (
        <div className="bg-card rounded-2xl border p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Selected alert</p>
              <h2 className="text-xl font-semibold mt-1">{selectedAlert.message}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedAlert.created_at} · {selectedAlert.type} · {selectedAlert.severity}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium uppercase",
                selectedAlert.severity === "critical" && "border-destructive text-destructive bg-destructive/10",
                selectedAlert.severity === "warning" && "border-warning text-warning bg-warning/10",
                selectedAlert.severity === "info" && "border-primary text-primary bg-primary/10"
              )}>
                {selectedAlert.status}
              </span>
              {selectedAlert.status === "unread" && (
                <button
                  onClick={() => markAlertRead.mutate(selectedAlert.id)}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                >
                  Mark read
                </button>
              )}
            </div>
          </div>
          <div className="mt-5 text-sm text-muted-foreground">
            Detailed information about this alert is available here. Use the list below to switch between alerts.
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {alertsQ.isLoading ? (
          <TableSkeleton rows={5} cols={3} />
        ) : filtered.length === 0 ? (
          <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
            <Bell size={28} className="mx-auto mb-2 opacity-40" />
            No alerts match your filters
          </div>
        ) : (
          filtered.map((a) => {
            const meta = severityMeta[a.severity] || severityMeta.info;
            const Icon = meta.icon;
            return (
              <button
                key={a.id}
                onClick={() => handleSelectAlert(a.id)}
                className={cn(
                  "w-full rounded-lg border border-l-4 px-5 py-4 flex items-center justify-between gap-4 text-left transition-all",
                  meta.border,
                  a.status === "unread" && "ring-1 ring-border/80",
                  selectedAlertId === a.id && "bg-muted"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", meta.bg, meta.text)}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-sm", a.status === "unread" && "font-semibold")}>
                      {a.message}
                      {a.status === "unread" && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-primary align-middle" />}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                      <span className={meta.text}>{a.severity}</span> · {a.type} · {a.created_at}
                    </p>
                  </div>
                </div>
                {a.status === "unread" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAlertRead.mutate(a.id);
                    }}
                    className="text-xs text-primary hover:underline shrink-0 font-medium"
                  >
                    Mark read
                  </button>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
