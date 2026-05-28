import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Bike, CalendarDays, Bell, Users, BarChart3, LogOut } from "lucide-react";
import zargoLogo from "@/assets/zargo-logo.png";
import { useAuth } from "@/context/AuthContext";

const allLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vehicles", label: "Vehicles", icon: Bike },
  { to: "/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/employees", label: "Employees", icon: Users, adminOnly: true },
  { to: "/reports", label: "Reports", icon: BarChart3, adminOnly: true },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const links = allLinks.filter((l) => !l.adminOnly || role === "admin");

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-30 border-r border-sidebar-border" style={{ background: "hsl(var(--sidebar-bg))" }}>
      <div className="px-5 py-5 flex items-center min-h-[68px] border-b border-sidebar-border/50">
        <img src={zargoLogo} alt="Zargo" className="h-11 object-contain" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1.5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-active text-sidebar-active-foreground shadow-[0_4px_14px_-4px_hsl(var(--sidebar-active)/0.5)]"
                  : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground hover:translate-x-0.5"
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
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

      <div className="px-5 pb-3 text-[10px] text-sidebar-foreground/40">
        © 2026 Zargo EV
      </div>
    </aside>
  );
};

export default Sidebar;
