import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  type LucideIcon,
  LayoutDashboard,
  Bike,
  CalendarDays,
  Bell,
  Users,
  BarChart3,
  LogOut,
  FileCheck,
  RefreshCcw,
  AlertTriangle,
  ArrowLeftRight,
  CreditCard,
  ShieldCheck,
  Wrench,
  ClipboardList,
  ChevronDown,
  Phone,
  FileText,
} from "lucide-react";
import zargoLogo from "@/assets/zargo-logo.png";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";

type SidebarLink = {
  to?: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  subItems?: SidebarLink[];
};

type SidebarGroup = {
  label: string;
  items: SidebarLink[];
};

const sidebarGroups: SidebarGroup[] = [
  {
    label: "Fleet Operations",
    items: [
      { to: "/leads", label: "Leads", icon: Users, roles: ["admin", "staff"] },
      {
        label: "Onboarding",
        icon: FileCheck,
        roles: ["admin", "staff"],
        subItems: [
          { to: "/vehicles", label: "Vehicles", icon: Bike, roles: ["admin", "staff"] },
          { to: "/onboarding", label: "PDI Check", icon: FileCheck, roles: ["admin", "staff"] },
          { to: "/bookings", label: "Bookings", icon: CalendarDays, roles: ["admin", "staff"] },
        ],
      },
    ],
  },
  {
    label: "Rental Lifecycle",
    items: [
      { to: "/renewals", label: "Renewals", icon: RefreshCcw, roles: ["admin", "staff"] },
      { to: "/returns", label: "Returns", icon: ArrowLeftRight, roles: ["admin", "staff"] },
      { to: "/recovery", label: "Recovery", icon: AlertTriangle, roles: ["admin"] },
    ],
  },
  {
    label: "Support",
    items: [
      { to: "/service-job-cards", label: "Service Jobs", icon: Wrench, roles: ["admin", "staff"] },
      { to: "/insurance", label: "Insurance", icon: ShieldCheck, roles: ["admin"] },
    ],
  },
  {
    label: "CRM",
    items: [
      { to: "/crm", label: "CRM Dashboard", icon: Bell, roles: ["admin", "staff"] },
      { to: "/crm/follow-ups", label: "Follow Ups", icon: Phone, roles: ["admin", "staff"] },
      { to: "/crm/customer-history", label: "Customer History", icon: FileText, roles: ["admin", "staff"] },
      { to: "/crm/recovery-queue", label: "Recovery Queue", icon: ShieldCheck, roles: ["admin", "staff"] },
    ],
  },
  {
    label: "Administration",
    items: [
      { to: "/payments", label: "Payments", icon: CreditCard, roles: ["admin"] },
      { to: "/employees", label: "Employees", icon: Users, roles: ["admin"] },
      { to: "/reports", label: "Reports", icon: BarChart3, roles: ["admin"] },
      { to: "/alerts", label: "Alerts", icon: Bell, roles: ["admin", "staff"] },
    ],
  },
];

const standaloneLinks: SidebarLink[] = [
  { to: "/tasks", label: "My Tasks", icon: ClipboardList, roles: ["staff"] },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const location = useLocation();

  const groups = useMemo(
    () =>
      sidebarGroups
        .map((group) => ({
          ...group,
          items: group.items
            .map((item) => ({
              ...item,
              subItems: item.subItems?.filter((sub) => sub.roles.includes(role ?? "admin")),
            }))
            .filter((item) => item.roles.includes(role ?? "admin") || (item.subItems?.length ?? 0) > 0),
        }))
        .filter((group) => group.items.length > 0),
    [role],
  );

  const links = useMemo(
    () => standaloneLinks.filter((item) => item.roles.includes(role ?? "admin")),
    [role],
  );

  const handleToggleGroup = (groupLabel: string) => {
    setOpenGroups((state) => ({ ...state, [groupLabel]: !state[groupLabel] }));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-30 border-r border-sidebar-border" style={{ background: "hsl(var(--sidebar-bg))" }}>
      <div className="px-5 py-5 flex items-center min-h-[68px] border-b border-sidebar-border/50">
        <img src={zargoLogo} alt="Zargo" className="h-11 object-contain" />
      </div>

      <nav className="flex-1 px-3 py-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-sidebar-active text-sidebar-active-foreground shadow-[0_4px_14px_-4px_hsl(var(--sidebar-active)/0.5)]"
                : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground"
            }`
          }
        >
          <LayoutDashboard size={18} className="shrink-0" />
          <span>Dashboard</span>
        </NavLink>

        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-active text-sidebar-active-foreground shadow-[0_4px_14px_-4px_hsl(var(--sidebar-active)/0.5)]"
                  : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground"
            }`
            }
          >
            <Icon size={18} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="mt-4 space-y-1">
          {groups.map((group) => {
            const isOpen = openGroups[group.label];
            return (
              <div key={group.label}>
                <button
                  type="button"
                  aria-expanded={isOpen ? "true" : "false"}
                  onClick={() => handleToggleGroup(group.label)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:text-sidebar-accent-foreground"
                >
                  <span>{group.label}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`overflow-hidden transition-[max-height] duration-200 ${isOpen ? "max-h-72" : "max-h-0"}`}>
                  <div className="space-y-1 pl-10 pr-3 pb-1">
                    {group.items.map((item) => {
                      if (item.subItems) {
                        const isOpenItem = openGroups[item.label] ?? item.subItems.some((sub) => location.pathname === sub.to);
                        return (
                          <div key={item.label}>
                            <button
                              type="button"
                              aria-expanded={isOpenItem ? "true" : "false"}
                              onClick={() => handleToggleGroup(item.label)}
                              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/80 transition-colors hover:text-sidebar-accent-foreground"
                            >
                              <div className="flex items-center gap-3">
                                <item.icon size={16} className="shrink-0" />
                                <span>{item.label}</span>
                              </div>
                              <ChevronDown size={16} className={`transition-transform duration-200 ${isOpenItem ? "rotate-180" : ""}`} />
                            </button>
                            <div className={`overflow-hidden transition-[max-height] duration-200 ${isOpenItem ? "max-h-72" : "max-h-0"}`}>
                              <div className="space-y-1 pl-10 pr-3 pb-1">
                                {item.subItems.map(({ to, label, icon: Icon }) => (
                                  <NavLink
                                    key={to}
                                    to={to!}
                                    className={({ isActive }) =>
                                      `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                                        isActive
                                          ? "bg-sidebar-active text-sidebar-active-foreground shadow-[0_4px_14px_-4px_hsl(var(--sidebar-active)/0.5)]"
                                          : "text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-accent-foreground"
                                      } transition-all duration-200`
                                    }
                                  >
                                    <Icon size={16} className="shrink-0" />
                                    <span>{label}</span>
                                  </NavLink>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <NavLink
                          key={item.to}
                          to={item.to!}
                          className={({ isActive }) =>
                            `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                              isActive
                                ? "bg-sidebar-active text-sidebar-active-foreground shadow-[0_4px_14px_-4px_hsl(var(--sidebar-active)/0.5)]"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-accent-foreground"
                            } transition-all duration-200`
                          }
                        >
                          <item.icon size={16} className="shrink-0" />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      <div className="px-3 pb-3 border-t border-sidebar-border/50 pt-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Logout</span>
        </button>
      </div>

      <div className="px-5 pb-3 text-[10px] text-sidebar-foreground/40">© 2026 Zargo EV</div>
    </aside>
  );
};

export default Sidebar;
