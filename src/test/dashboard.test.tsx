import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

const qc = new QueryClient();

vi.mock("@/hooks/useDashboard", async () => ({
  useDashboardStats: () => ({ data: { totalVehicles: 10, availableVehicles: 5, deployedVehicles: 3, activeRentals: 2, overdueVehicles: 0, totalCustomers: 7, unreadAlerts: 1, revenue: 12345 }, isLoading: false }),
}));

vi.mock("@/hooks/useBookings", async () => ({
  useBookings: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/hooks/useAlerts", async () => ({
  useAlerts: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/hooks/useEmployees", async () => ({
  useEmployees: () => ({ data: [], isLoading: false }),
}));

describe("Dashboard rendering", () => {
  test("renders admin dashboard and KPIs", async () => {
    vi.resetModules();
    vi.doMock("@/context/AuthContext", async () => ({
      useAuth: () => ({ role: "admin", user: { name: "Admin" } }),
      AuthProvider: ({ children }: any) => children,
    }));
    const { default: Dashboard } = await import("@/pages/Dashboard");

    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Admin Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Available Vehicles/i)).toBeInTheDocument();
  });

  test("renders staff dashboard and operational cards", async () => {
    vi.resetModules();
    vi.doMock("@/context/AuthContext", async () => ({
      useAuth: () => ({ role: "staff", user: { name: "Staff" } }),
      AuthProvider: ({ children }: any) => children,
    }));
    const { default: Dashboard } = await import("@/pages/Dashboard");

    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Staff Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/My Assigned Tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/My Revenue/i)).toBeInTheDocument();
  });
});
