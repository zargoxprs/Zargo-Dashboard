import { apiClient, mockOr } from "@/api/client";
import { Booking } from "@/types";
import { useStore } from "@/data/store";

export const bookingService = {
  async list(): Promise<Booking[]> {
    return mockOr(
      () => useStore.getState().bookings,
      async () => (await apiClient.get<Booking[]>("/bookings")).data
    );
  },

  async create(payload: Omit<Booking, "_id" | "createdAt" | "updatedAt">): Promise<Booking> {
    return mockOr(
      () => {
        useStore.getState().addBooking(payload);
        const vehicleId = typeof payload.vehicle === "string" ? payload.vehicle : payload.vehicle._id || payload.vehicle.id;
        if (vehicleId && payload.status === "active") {
          useStore.getState().updateVehicle(vehicleId, { status: "booked" });
        } else if (vehicleId && payload.status === "completed") {
          useStore.getState().updateVehicle(vehicleId, { status: "available" });
        }
        const list = useStore.getState().bookings;
        return list[list.length - 1];
      },
      async () => (await apiClient.post<Booking>("/bookings", payload)).data
    );
  },
  async updateStatus(id: string, status: Booking["status"]): Promise<Booking> {
    return mockOr(
      () => {
        useStore.getState().updateBookingStatus(id, status);

        return useStore.getState().bookings.find((b) => b._id === id)!;
      },
      async () => (await apiClient.patch<Booking>(`/bookings/${id}`, { status })).data
    );
  },
};