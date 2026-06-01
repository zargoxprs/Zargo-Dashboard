import { apiClient, mockOr } from "@/api/client";
import { Alert } from "@/types";
import { useStore } from "@/data/store";

const normalizeAlert = (alert: any): Alert => ({
  id: alert.id ?? alert._id ?? "",
  message: alert.message,
  type: alert.type,
  severity: alert.severity,
  status: alert.status ?? "unread",
  created_at: alert.created_at ?? alert.createdAt ?? new Date().toISOString().split("T")[0],
});

export const alertService = {
  async list(): Promise<Alert[]> {
    return mockOr(
      () => useStore.getState().alerts,
      async () => (await apiClient.get<Alert[]>("/alerts")).data.map(normalizeAlert)
    );
  },
  async create(payload: Omit<Alert, "id" | "created_at">): Promise<Alert> {
    return mockOr(
      () => {
        useStore.getState().addAlert(payload);
        return useStore.getState().alerts[0];
      },
      async () => normalizeAlert((await apiClient.post<Alert>("/alerts", payload)).data)
    );
  },
  async markRead(id: string): Promise<void> {
    return mockOr(
      () => useStore.getState().markAlertRead(id),
      async () => {
        await apiClient.patch(`/alerts/${id}/read`);
      }
    );
  },
  async markAllRead(): Promise<void> {
    return mockOr(
      () => useStore.getState().markAllAlertsRead(),
      async () => {
        await apiClient.patch(`/alerts/read/all`);
      }
    );
  },
};