import { apiClient, mockOr } from "@/api/client";
import { DashboardStats } from "@/types";
import { useStore } from "@/data/store";

export const dashboardService = {
  async getStats(filter?: { start?: string; end?: string }): Promise<DashboardStats> {
    return mockOr(
      () => {
        const { vehicles, bookings, alerts } = useStore.getState();
        // optionally filter bookings by date range
        const filteredBookings = bookings.filter((b) => {
          if (!filter?.start && !filter?.end) return true;
          const dt = new Date((b as any).startDate ?? (b as any).start_date ?? (b as any).created_at ?? "");
          if (filter?.start && dt < new Date(filter.start)) return false;
          if (filter?.end && dt > new Date(filter.end)) return false;
          return true;
        });

        const revenue = filteredBookings.reduce((s, b) => s + (Number((b as any).amount ?? (b as any).fare ?? 0) || 0), 0);
        return {
          totalVehicles: vehicles.length,
          availableVehicles: vehicles.filter((v) => v.status === "available").length,
          deployedVehicles: vehicles.filter((v) => v.status === "rented").length,
          activeRentals: filteredBookings.filter((b) => (b as any).status === "active").length,
          overdueVehicles: filteredBookings.filter((b) => (b as any).status === "overdue").length,
          totalCustomers: new Set(filteredBookings.map((b) => (b as any).phone)).size,
          unreadAlerts: alerts.filter((a) => a.status === "unread").length,
          revenue: revenue,
        };
      },
      async () => (await apiClient.get<DashboardStats>("/dashboard/stats")).data
    );
  },
};