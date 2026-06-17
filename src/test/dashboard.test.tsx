import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

const qc = new QueryClient();
const authMock = { role: "admin", user: { name: "Admin" } };

vi.mock("@/hooks/useDashboard", () => ({
  useDashboardStats: () => ({ data: { totalVehicles: 10, availableVehicles: 5, deployedVehicles: 3, activeRentals: 2, overdueVehicles: 0, totalCustomers: 7, unreadAlerts: 1, revenue: 12345 }, isLoading: false }),
}));

vi.mock("@/hooks/useBookings", () => ({
  useBookings: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/hooks/useAlerts", () => ({
  useAlerts: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/hooks/useEmployees", () => ({
  useEmployees: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => authMock,
  AuthProvider: ({ children }: any) => children,
}));

const Dashboard = React.lazy(() => import("@/pages/Dashboard"));

const renderDashboard = async () => {
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <React.Suspense fallback={null}>
          <Dashboard />
        </React.Suspense>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Dashboard rendering", () => {
  test("renders admin dashboard and KPIs", async () => {
    authMock.role = "admin";
    authMock.user = { name: "Admin" };

    await renderDashboard();

    expect(await screen.findByText(/Admin Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Available Vehicles/i)).toBeInTheDocument();
  });

  test("renders staff dashboard and operational cards", async () => {
    authMock.role = "staff";
    authMock.user = { name: "Staff" };

    await renderDashboard();

    expect(await screen.findByText(/Staff Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/My Assigned Tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/My Revenue/i)).toBeInTheDocument();
  });
});
