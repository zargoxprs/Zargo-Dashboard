import { apiClient, mockOr } from "@/api/client";
import { Alert } from "@/types";
import { useStore } from "@/data/store";

export const alertService = {
  async list(): Promise<Alert[]> {
    return mockOr(
      () => useStore.getState().alerts,
      async () => (await apiClient.get<Alert[]>("/alerts")).data
    );
  },
  async create(payload: Omit<Alert, "id" | "created_at">): Promise<Alert> {
    return mockOr(
      () => {
        useStore.getState().addAlert(payload);
        return useStore.getState().alerts[0];
      },
      async () => (await apiClient.post<Alert>("/alerts", payload)).data
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
};