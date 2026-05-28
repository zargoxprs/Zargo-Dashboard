/**
 * Compatibility shim — the canonical auth implementation now lives in
 * `src/services/authService.ts` (HTTP-ready) and `src/context/AuthContext.tsx`
 * (React state + persistence). These helpers read the same JWT/user storage
 * so legacy callers keep working until fully migrated.
 */
import { clearAuthToken, getAuthToken } from "@/api/client";
import type { User, UserRole } from "@/types";

export type { UserRole } from "@/types";

const USER_KEY = "zargo_user";

const readUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => !!getAuthToken() && !!readUser();

export const getUserRole = (): UserRole | null => readUser()?.role ?? null;

export const getCurrentUser = (): string | null => readUser()?.username ?? null;

export const logout = () => {
  clearAuthToken();
  localStorage.removeItem(USER_KEY);
};
