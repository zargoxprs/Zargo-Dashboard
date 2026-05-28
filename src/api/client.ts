import axios, { AxiosError, AxiosInstance } from "axios";
import { ApiError } from "@/types";

const TOKEN_KEY = "zargo_token";

export const getAuthToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearAuthToken = () => localStorage.removeItem(TOKEN_KEY);

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "development" ? "/api" : "/api");
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "true") !== "false";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && config.headers) {
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    if (status === 401) {
      clearAuthToken();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || "Request failed",
      status,
    };
    return Promise.reject(apiError);
  }
);

/**
 * Helper used by services so each call can transparently switch between
 * mock (in-memory) and real HTTP. When VITE_USE_MOCK is true (default),
 * the mock function is used; otherwise the real HTTP request fires.
 */
export async function mockOr<T>(mock: () => T | Promise<T>, real: () => Promise<T>): Promise<T> {
  if (USE_MOCK) return Promise.resolve(mock());
  return real();
}