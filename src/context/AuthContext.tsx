import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { clearAuthToken, getAuthToken } from "@/api/client";
import { User, UserRole } from "@/types";
import { notify } from "@/lib/notify";

const USER_KEY = "zargo_user";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readCachedUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const initialToken = getAuthToken();
  const initialUser = initialToken ? readCachedUser() : null;
  const [user, setUser] = useState<User | null>(initialUser);
  const [status, setStatus] = useState<AuthStatus>(
    initialToken ? "loading" : "unauthenticated"
  );

  // Verify token on mount / refresh — auto-restore or auto-logout.
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setStatus("unauthenticated");
      return;
    }
    let cancelled = false;
    authService
      .me()
      .then((u) => {
        if (cancelled) return;
        if (u) {
          setUser(u);
          localStorage.setItem(USER_KEY, JSON.stringify(u));
          setStatus("authenticated");
        } else {
          clearAuthToken();
          localStorage.removeItem(USER_KEY);
          setUser(null);
          setStatus("unauthenticated");
        }
      })
      .catch(() => {
        if (cancelled) return;
        clearAuthToken();
        localStorage.removeItem(USER_KEY);
        setUser(null);
        setStatus("unauthenticated");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      const { user } = await authService.login(identifier, password);
      setUser(user);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setStatus("authenticated");
      notify.success("Welcome back", user.name || user.username || user.email);
      return user;
    } catch (e) {
      notify.apiError(e);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setStatus("unauthenticated");
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        status,
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};