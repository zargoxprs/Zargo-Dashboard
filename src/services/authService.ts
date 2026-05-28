import { apiClient, mockOr, setAuthToken, clearAuthToken, getAuthToken } from "@/api/client";
import { AuthResponse, User } from "@/types";

const USER_CACHE_KEY = "zargo_user";
const MOCK_USER_STORE_KEY = "mock_employee_users";

const DEFAULT_MOCK_USERS: { username: string; email: string; password: string; user: User }[] = [
  { username: "zargo", email: "admin@zargo.com", password: "Zargo2026", user: { id: "U1", username: "zargo", email: "admin@zargo.com", role: "admin" } },
];

const readMockUsers = () => {
  try {
    const raw = localStorage.getItem(MOCK_USER_STORE_KEY);
    const extra = raw ? (JSON.parse(raw) as typeof DEFAULT_MOCK_USERS) : [];
    return [...DEFAULT_MOCK_USERS, ...extra];
  } catch {
    return [...DEFAULT_MOCK_USERS];
  }
};

const saveMockUser = (user: { username: string; email: string; password: string; user: User }) => {
  try {
    const raw = localStorage.getItem(MOCK_USER_STORE_KEY);
    const existing = raw ? (JSON.parse(raw) as typeof DEFAULT_MOCK_USERS) : [];
    const updated = [...existing.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase()), user];
    localStorage.setItem(MOCK_USER_STORE_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
};
export const authService = {
  async login(identifier: string, password: string): Promise<AuthResponse> {
    return mockOr(
      () => {

        const mockUsers = readMockUsers();
        const match = mockUsers.find(
          (u) =>
            (u.username?.toLowerCase() === identifier.toLowerCase() ||
              u.email.toLowerCase() === identifier.toLowerCase()) &&
            u.password === password
        );
        if (!match) throw { message: "Invalid credentials", status: 401 };
        const token = `mock.${btoa(match.user.id)}.${Date.now()}`;
        setAuthToken(token);
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(match.user));
        return { token, user: match.user };
      },
      async () => {
        const { data } = await apiClient.post<AuthResponse>("/auth/login", { identifier, password });
        setAuthToken(data.token);
        return data;
      }
    );
  },

  async me(): Promise<User | null> {
    return mockOr(
      () => {
        if (!getAuthToken()) return null;
        try {
          const raw = localStorage.getItem(USER_CACHE_KEY);
          return raw ? (JSON.parse(raw) as User) : null;
        } catch {
          return null;
        }
      },
      async () => {
        const { data } = await apiClient.get<User>("/auth/me");
        return data;
      }
    );
  },

  async changePassword(oldPassword: string | undefined, newPassword: string): Promise<void> {
    return mockOr(
      () => {
        // Mock: accept change
        return Promise.resolve();
      },
      async () => {
        await apiClient.post("/auth/change-password", { oldPassword, newPassword });
      }
    );
  },

  async logout(): Promise<void> {
    return mockOr(
      () => {
        clearAuthToken();
        localStorage.removeItem(USER_CACHE_KEY);
      },
      async () => {
        try {
          await apiClient.post("/auth/logout");
        } catch {
          /* ignore — proceed with local cleanup */
        }
        clearAuthToken();
        localStorage.removeItem(USER_CACHE_KEY);
      }
    );
  },
};