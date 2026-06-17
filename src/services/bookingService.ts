import { apiClient, mockOr } from "@/api/client";
import { Booking } from "@/types";
import { useStore } from "@/data/store";
import { getVehicleKey } from "@/lib/lifecycle";

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
        if (payload.vehicle) {
          const vehicleId = getVehicleKey(payload.vehicle);
          if (vehicleId) {
            useStore.getState().updateVehicle(vehicleId, { status: "booked" });
          }
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
        const booking = useStore.getState().bookings.find((b) => b._id === id || b.id === id || b.bookingId === id);
        if (!booking) throw new Error("Booking not found");
        useStore.getState().updateBookingStatus(id, status);

        const vehicleId = getVehicleKey(booking.vehicle);
        if (vehicleId) {
          if (status === "completed") {
            const activeBookingsForVehicle = useStore.getState().bookings.filter(
              (b) => b.status !== "completed" && getVehicleKey(b.vehicle) === vehicleId
            );
            if (activeBookingsForVehicle.length === 0) {
              useStore.getState().updateVehicle(vehicleId, { status: "available" });
            }
          } else {
            useStore.getState().updateVehicle(vehicleId, { status: "booked" });
          }
        }

        return useStore.getState().bookings.find((b) => b._id === id || b.id === id || b.bookingId === id)!;
      },
      async () => (await apiClient.patch<Booking>(`/bookings/${id}`, { status })).data
    );
  },
};