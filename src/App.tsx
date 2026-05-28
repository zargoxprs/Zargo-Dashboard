import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import VehiclesPage from "@/pages/VehiclesPage";
import BookingsPage from "@/pages/BookingsPage";
import AlertsPage from "@/pages/AlertsPage";
import EmployeesPage from "@/pages/EmployeesPage";
import ChangePassword from "@/pages/ChangePassword";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";
import { DateFilterProvider } from "@/context/DateFilterContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DateFilterProvider>
        <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/employees" element={<ProtectedRoute requiredRole="admin"><EmployeesPage /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute requiredRole="admin"><ReportsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute requiredRole="admin"><SettingsPage /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
        </DateFilterProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
