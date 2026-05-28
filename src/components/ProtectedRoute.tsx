import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { notify } from "@/lib/notify";
import type { UserRole } from "@/types";

interface Props {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const FullPageLoader = ({ label = "Verifying session..." }: { label?: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
    <Loader2 className="animate-spin text-primary" size={28} />
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

const ProtectedRoute = ({ children, requiredRole }: Props) => {
  const location = useLocation();
  const { status, role, user } = useAuth();
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (notifiedRef.current) return;
    if (status === "unauthenticated") {
      notify.error("Session expired", "Please sign in to continue.");
      notifiedRef.current = true;
    } else if (status === "authenticated" && requiredRole && role !== requiredRole) {
      notify.error("Access denied", "You don't have permission to view that page.");
      notifiedRef.current = true;
    }
  }, [status, role, requiredRole]);

  if (status === "loading") return <FullPageLoader />;
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (user?.forcePasswordChange && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
