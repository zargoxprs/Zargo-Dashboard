import { apiClient, mockOr } from "@/api/client";
import { Vehicle } from "@/types";
import { useStore } from "@/data/store";

export const vehicleService = {
  async list(): Promise<Vehicle[]> {
    return mockOr(
      () => useStore.getState().vehicles,
      async () => (await apiClient.get<Vehicle[]>("/vehicles")).data
    );
  },
  async create(payload: Omit<Vehicle, "id" | "created_at">): Promise<Vehicle> {
    return mockOr(
      () => {
        useStore.getState().addVehicle(payload);
        const list = useStore.getState().vehicles;
        return list[list.length - 1];
      },
      async () => (await apiClient.post<Vehicle>("/vehicles", payload)).data
    );
  },
  async update(id: string, patch: Partial<Vehicle>): Promise<Vehicle> {
    return mockOr(
      () => {
        useStore.getState().updateVehicle(id, patch);
        return useStore.getState().vehicles.find((v) => v.id === id)!;
      },
      async () => (await apiClient.patch<Vehicle>(`/vehicles/${id}`, patch)).data
    );
  },
  async remove(id: string): Promise<void> {
    return mockOr(
      () => useStore.getState().deleteVehicle(id),
      async () => {
        await apiClient.delete(`/vehicles/${id}`);
      }
    );
  },
};