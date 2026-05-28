// react-router hooks
import { Bell, User, LogOut, Settings, ChevronDown, Search, MapPin, Calendar, AlertCircle, AlertTriangle, Info, ArrowRight, Check, X } from "lucide-react";
import { useStore } from "@/data/store";
import { useAuth } from "@/context/AuthContext";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { useDateFilter } from "@/context/DateFilterContext";
import DateRangePicker from "@/components/DateRangePicker";
import { useLocation, useNavigate } from "react-router-dom";
import { alertService } from "@/services/alertService";
import { cn } from "@/lib/utils";

const TopBar = () => {
  const navigate = useNavigate();
  const alerts = useStore((s) => s.alerts);
  const markAlertRead = useStore((s) => s.markAlertRead);
  const { role, logout } = useAuth();
  const displayName = role === "admin" ? "Admin" : "Staff";
  const [hub, setHub] = useState("Kukatpally");
  const [activeTab, setActiveTab] = useState<"unread" | "critical" | "warning" | "info">("unread");
  const [query, setQuery] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const { range, setRange } = useDateFilter();
  const location = useLocation();
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const today = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  // Categorize alerts
  const unreadAlerts = alerts.filter((a) => a.status === "unread");
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const warningAlerts = alerts.filter((a) => a.severity === "warning");
  const infoAlerts = alerts.filter((a) => a.severity === "info");
  const unreadCount = unreadAlerts.length;

  // Get alerts for current tab
  const getTabAlerts = () => {
    switch (activeTab) {
      case "critical":
        return criticalAlerts.slice(0, 5);
      case "warning":
        return warningAlerts.slice(0, 5);
      case "info":
        return infoAlerts.slice(0, 5);
      case "unread":
      default:
        return unreadAlerts.slice(0, 5);
    }
  };

  const tabAlerts = getTabAlerts();

  const severityMeta = {
    critical: { icon: AlertCircle, text: "text-destructive", bg: "bg-destructive/10" },
    warning: { icon: AlertTriangle, text: "text-warning", bg: "bg-warning/10" },
    info: { icon: Info, text: "text-primary", bg: "bg-primary/10" },
  };

  const handleAlertClick = (alertId: string) => {
    markAlertRead(alertId);
    navigate(`/alerts?alertId=${encodeURIComponent(alertId)}`);
  };

  const handleMarkRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // update local store immediately
    markAlertRead(id);
    try {
      await alertService.markRead(id);
    } catch (err) {
      // ignore network error for now
    }
  };

  // simple in-memory search across store
  const searchResults = useMemo(() => {
    if (!query || query.trim().length < 1) return [];
    const q = query.toLowerCase();
    const s = useStore.getState();
    const vehicles = (s.vehicles || []).filter((v: any) => (v.numberPlate || v.vehicleId || "").toLowerCase().includes(q)).slice(0, 5).map((v: any) => ({ type: "vehicle", id: v.id || v._id || v.vehicleId, title: v.numberPlate || v.vehicleId, subtitle: v.model || v.hub }));
    const bookings = (s.bookings || []).filter((b: any) => (b.bookingId || b.riderName || b.rider_name || "").toLowerCase().includes(q)).slice(0, 5).map((b: any) => ({ type: "booking", id: b.id || b._id || b.bookingId, title: b.bookingId || b.id, subtitle: b.riderName || b.rider_name }));
    const employees = (s.employees || []).filter((e: any) => (e.name || "").toLowerCase().includes(q)).slice(0, 5).map((e: any) => ({ type: "employee", id: e.id, title: e.name, subtitle: e.email }));
    const alertsList = (s.alerts || []).filter((a: any) => (a.message || "").toLowerCase().includes(q)).slice(0, 5).map((a: any) => ({ type: "alert", id: a.id, title: a.message, subtitle: a.type }));
    return [...bookings, ...vehicles, ...employees, ...alertsList].slice(0, 8);
  }, [query]);

  // keep URL query param in sync for global search
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (query && query.trim().length > 0) params.set("query", query);
      else params.delete("query");
      const q = params.toString();
      navigate(`${location.pathname}${q ? `?${q}` : ""}`, { replace: true });
    } catch (e) {
      // ignore
    }
  }, [query, location.pathname]);

  return (
    <header className="h-16 bg-card/80 backdrop-blur border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full hidden md:flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpenSearch(true); }}
              onFocus={() => setOpenSearch(true)}
              onBlur={() => setTimeout(() => setOpenSearch(false), 150)}
              placeholder="Search vehicles, bookings, riders..."
              className="pl-9 h-9 bg-muted/40 border-transparent focus-visible:bg-card focus-visible:border-border"
            />

            {openSearch && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-40 overflow-hidden max-h-72 overflow-y-auto">
                {searchResults.map((r) => (
                  <button
                    key={`${r.type}-${r.id}`}
                    onMouseDown={() => {
                      // navigate based on type
                      if (r.type === "vehicle") navigate(`/vehicles?query=${encodeURIComponent(r.title)}`);
                      else if (r.type === "booking") navigate(`/bookings?query=${encodeURIComponent(r.title)}`);
                      else if (r.type === "employee") navigate(`/employees?query=${encodeURIComponent(r.title)}`);
                      else if (r.type === "alert") navigate(`/alerts?alertId=${encodeURIComponent(r.id)}`);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-muted/40 flex items-center gap-3"
                  >
                    <div className="text-sm font-medium w-28 truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{r.type} • {r.subtitle}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Select
            value={range.key}
            onValueChange={(v) => {
              if (v === "custom") {
                // open custom range picker
                setShowCustomPicker(true);
                setRange({ key: "custom", start: range.start, end: range.end });
                return;
              }
              // compute dates for named ranges
              const now = new Date();
              if (v === "today") {
                const s = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                const e = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
                setRange({ key: "today", start: s, end: e });
              } else if (v === "week") {
                const start = new Date(now);
                start.setDate(now.getDate() - 7);
                setRange({ key: "week", start: start.toISOString(), end: now.toISOString() });
              } else if (v === "month") {
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                setRange({ key: "month", start: start.toISOString(), end: now.toISOString() });
              } else {
                setRange({ key: v as any });
              }
            }}
          >
            <SelectTrigger className="h-9 w-[160px] gap-1.5">
              <Calendar size={14} className="text-primary" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          {/* Custom range picker panel */}
          {showCustomPicker && (
            <div className="absolute z-50 mt-2 right-0">
              <DateRangePicker
                initialStart={range.start}
                initialEnd={range.end}
                onApply={(s, e) => {
                  setRange({ key: "custom", start: s, end: e });
                  setShowCustomPicker(false);
                }}
                onCancel={() => setShowCustomPicker(false)}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground border-r pr-3">
          <Calendar size={14} /> {today}
        </div>
        <Select value={hub} onValueChange={setHub}>
          <SelectTrigger className="h-9 w-[170px] gap-1.5 hidden sm:flex">
            <MapPin size={14} className="text-primary" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Kukatpally">Kukatpally Hub</SelectItem>
            <SelectItem value="Madhapur">Madhapur Hub</SelectItem>
            <SelectItem value="Gachibowli">Gachibowli Hub</SelectItem>
            <SelectItem value="all">All Hubs</SelectItem>
          </SelectContent>
          {showCustomPicker && (
            <Popover>
              <PopoverTrigger asChild>
                <div />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <DateRangePicker
                  initialStart={range.start}
                  initialEnd={range.end}
                  onApply={(s, e) => {
                    setRange({ key: "custom", start: s, end: e });
                    setShowCustomPicker(false);
                    // refresh route to ensure pages pick up query changes
                    navigate(location.pathname + location.search, { replace: true });
                  }}
                  onCancel={() => setShowCustomPicker(false)}
                />
              </PopoverContent>
            </Popover>
          )}
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell size={18} className="text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-accent text-accent-foreground text-[9px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {unreadCount === 0 ? "All caught up!" : `${unreadCount} unread alert${unreadCount !== 1 ? "s" : ""}`}
              </p>
            </div>

            {alerts.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm text-muted-foreground">No alerts yet</p>
              </div>
            ) : (
              <>
                {/* Tab Navigation */}
                <div className="flex border-b px-2 pt-2 gap-0.5 overflow-x-auto">
                  {[
                    { id: "unread" as const, label: "Unread", count: unreadAlerts.length, icon: null },
                    { id: "critical" as const, label: "Critical", count: criticalAlerts.length, icon: AlertCircle },
                    { id: "warning" as const, label: "Warnings", count: warningAlerts.length, icon: AlertTriangle },
                    { id: "info" as const, label: "Info", count: infoAlerts.length, icon: Info },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2",
                        activeTab === tab.id
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab.icon && <tab.icon size={13} />}
                      {tab.label}
                      {tab.count > 0 && (
                        <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-muted text-muted-foreground min-w-[20px]">
                          {tab.count > 99 ? "99+" : tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Alerts List */}
                <div className="max-h-80 overflow-y-auto">
                  {tabAlerts.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No {activeTab} alerts
                    </div>
                  ) : (
                    tabAlerts.map((a) => {
                      const meta = a.severity === "critical" || a.severity === "warning" || a.severity === "info"
                        ? severityMeta[a.severity]
                        : severityMeta.info;
                      const Icon = meta.icon;

                      return (
                        <div
                          key={a.id}
                          onClick={() => handleAlertClick(a.id)}
                          className={cn(
                            "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-0 flex items-start gap-3 group cursor-pointer",
                            a.status === "read" ? "opacity-70" : ""
                          )}
                        >
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", meta.bg, meta.text)}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium line-clamp-2",
                              a.status === "unread" && "text-foreground font-semibold"
                            )}>
                              {/* Title */}
                              <span className="block truncate">{a.message}</span>
                              <span className="text-xs text-muted-foreground inline-block mt-1">{a.type}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(a.created_at).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {a.status === "unread" && (
                              <button onClick={(e) => handleMarkRead(e, a.id)} className="p-2 rounded-md hover:bg-muted/30">
                                <Check size={14} />
                              </button>
                            )}
                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* View All Button */}
                <button
                  onClick={() => navigate("/alerts")}
                  className="w-full px-4 py-3 text-sm font-medium text-center border-t hover:bg-muted/30 transition-colors flex items-center justify-center gap-2 text-primary"
                >
                  View all alerts
                  <ArrowRight size={14} />
                </button>
              </>
            )}
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 border-l hover:bg-muted rounded-lg px-2 py-1.5 transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">{displayName}</span>
              <ChevronDown size={14} className="text-muted-foreground hidden sm:inline" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {role === "admin" && <DropdownMenuItem className="gap-2" onClick={() => navigate("/settings")}>
              <Settings size={14} /> Settings
            </DropdownMenuItem>}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-destructive"
              onClick={async () => {
                await logout();
                navigate("/login", { replace: true });
              }}
            >
              <LogOut size={14} /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
