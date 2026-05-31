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
import LeadsPage from "@/pages/LeadsPage";
import OnboardingPage from "@/pages/OnboardingPage";
import RenewalsPage from "@/pages/RenewalsPage";
import RecoveryPage from "@/pages/RecoveryPage";
import ReturnsPage from "@/pages/ReturnsPage";
import PaymentsPage from "@/pages/PaymentsPage";
import InsurancePage from "@/pages/InsurancePage";
import ServiceJobCardsPage from "@/pages/ServiceJobCardsPage";
import TasksPage from "@/pages/TasksPage";
import EmployeesPage from "@/pages/EmployeesPage";
import ChangePassword from "@/pages/ChangePassword";
import ReportsPage from "@/pages/ReportsPage";
import SecurityDepositsPage from "@/pages/SecurityDepositsPage";
import VehicleHandoverPage from "@/pages/VehicleHandoverPage";
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
                <Route path="/vehicles" element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/leads" element={<LeadsPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/renewals" element={<RenewalsPage />} />
                <Route path="/returns" element={<ReturnsPage />} />
                <Route path="/service-job-cards" element={<ServiceJobCardsPage />} />
                <Route path="/vehicle-handover" element={<ProtectedRoute requiredRole="admin"><VehicleHandoverPage /></ProtectedRoute>} />
                <Route path="/tasks" element={<ProtectedRoute requiredRole="staff"><TasksPage /></ProtectedRoute>} />
                <Route path="/employees" element={<ProtectedRoute requiredRole="admin"><EmployeesPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute requiredRole="admin"><ReportsPage /></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute requiredRole="admin"><PaymentsPage /></ProtectedRoute>} />
                <Route path="/insurance" element={<ProtectedRoute requiredRole="admin"><InsurancePage /></ProtectedRoute>} />
                <Route path="/recovery" element={<ProtectedRoute requiredRole="admin"><RecoveryPage /></ProtectedRoute>} />
                <Route path="/security-deposits" element={<ProtectedRoute requiredRole="admin"><SecurityDepositsPage /></ProtectedRoute>} />
                <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
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
