import { apiClient, mockOr } from "@/api/client";
import { ReportSummary, VehicleStatus, BookingStatus } from "@/types";
import { useStore } from "@/data/store";

export const reportService = {
  async getSummary(filter?: { start?: string; end?: string }): Promise<ReportSummary> {
    return mockOr(
      () => {
        const { vehicles, bookings, employees } = useStore.getState();
        const vStatuses: VehicleStatus[] = ["available", "rented", "service", "idle"];
        const bStatuses: BookingStatus[] = ["active", "pending", "overdue", "completed"];

        // apply optional date filter to bookings
        const filteredBookings = (bookings || []).filter((b: any) => {
          if (!filter?.start && !filter?.end) return true;
          const dt = new Date(b.startDate ?? b.start_date ?? b.createdAt ?? b.created_at ?? "");
          if (filter?.start && dt < new Date(filter.start)) return false;
          if (filter?.end && dt > new Date(filter.end)) return false;
          return true;
        });

        return {
          fleetSize: vehicles.length,
          totalBookings: filteredBookings.length,
          completedBookings: filteredBookings.filter((b: any) => b.status === "completed").length,
          totalOnboarded: employees.reduce((s, e) => s + (e.onboard_count || 0), 0),
          vehicleStatusBreakdown: vStatuses.map((s) => ({ name: s, value: vehicles.filter((v) => v.status === s).length })),
          bookingStatusBreakdown: bStatuses.map((s) => ({ status: s, count: filteredBookings.filter((b) => b.status === s).length })),

          // build rental trend dynamically for last 6 months
          rentalTrend: (() => {
            const now = new Date();
            const months: { month: string; year: number }[] = [];
            for (let i = 5; i >= 0; i--) {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              months.push({ month: d.toLocaleString("default", { month: "short" }), year: d.getFullYear() });
            }
            return months.map((m) => {
              const monthBookings = bookings.filter((b: any) => {
                const dt = new Date(b.startDate ?? b.start_date ?? b.createdAt ?? b.created_at ?? "");
                return dt.getFullYear() === m.year && dt.toLocaleString("default", { month: "short" }) === m.month;
              });
              const rentals = monthBookings.length;
              const revenue = monthBookings.reduce((s: number, b: any) => s + (Number(b.amount ?? b.fare ?? 0) || 0), 0);
              return { month: m.month, rentals, revenue };
            });
          })(),
        };
      },
      async () => (await apiClient.get<ReportSummary>("/reports/summary")).data
    );
  },
};