// DashboardSwitcher: Shows VC dashboard if VC, else StudentDashboard

import UniversityAdministrationDashboard from "./pages/dashboards/UniversityAdministrationDashboard";
import StudentUnionDashboard from "./pages/dashboards/StudentUnionDashboard";
import WardenDashboard from "./pages/dashboards/WardenDashboard";
import Profile from "./pages/Profile";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";

function DashboardSwitcher() {
  const auth = useAuth();
  const user = auth && auth.user;
  console.log('Current user:', user); // Debug log
  if (user) {
    if (user.role === 'vice-chancellor') return <ViceChancellorDashboard />;
    if (user.role === 'administration') return <UniversityAdministrationDashboard />;
    if (user.role === 'student-union') return <StudentUnionDashboard />;
    if (user.role === 'warden') return <WardenDashboard />;
  }
  return <UserDashboard />;
}


// ...existing code...
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PasswordRecovery from "./pages/auth/PasswordRecovery";
import UserDashboard from "./pages/dashboards/UserDashboard";
import ServiceProviderDashboard from "./pages/dashboards/ServiceProviderDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import ViceChancellorDashboard from "./pages/dashboards/ViceChancellorDashboard";
import VenueManagement from "./pages/VenueManagement";
import BookingSystem from "./pages/BookingSystem";
import EventPlanning from "./pages/EventPlanning";
import AdminTools from "./pages/AdminTools";
import Reports from "./pages/Reports";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Features from "./pages/Features";
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";
import FAQs from "./pages/FAQs";


const queryClient = new QueryClient();


const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

const DashboardRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'service-provider':
      return <Navigate to="/dashboards/service-provider" replace />;
    case 'vice-chancellor':
      return <Navigate to="/dashboards/vice-chancellor" replace />;
    case 'student':
    case 'faculty':
    default:
      return <Navigate to="/dashboard" replace />;
            {/* Vice Chancellor Dashboard Route */}
            <Route path="/dashboards/vice-chancellor" element={
              <ProtectedRoute allowedRoles={['vice-chancellor']}>
                <ViceChancellorDashboard />
              </ProtectedRoute>
            } />
  }
};
            {/* Service Provider Dashboard Route */}
            <Route path="/dashboards/service-provider" element={
              <ProtectedRoute allowedRoles={['service-provider']}>
                <ServiceProviderDashboard />
              </ProtectedRoute>
            } />


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Service Provider Dashboard Route (plural) */}
            <Route path="/dashboards/service-provider" element={
              <ProtectedRoute allowedRoles={['service-provider']}>
                <ServiceProviderDashboard />
              </ProtectedRoute>
            } />

            {/* Service Provider Dashboard Route (singular alias) */}
            <Route path="/dashboard/service-provider" element={
              <ProtectedRoute allowedRoles={['service-provider']}>
                <ServiceProviderDashboard />
              </ProtectedRoute>
            } />

            {/* Administration Dashboard Route */}
            <Route path="/dashboards/administration" element={
              <ProtectedRoute allowedRoles={['administration']}>
                <UniversityAdministrationDashboard />
              </ProtectedRoute>
            } />
            {/* Student Union Dashboard Route */}
            <Route path="/dashboards/student-union" element={
              <ProtectedRoute allowedRoles={['student-union']}>
                <StudentUnionDashboard />
              </ProtectedRoute>
            } />
            {/* Warden Dashboard Route */}
            <Route path="/dashboards/warden" element={
              <ProtectedRoute allowedRoles={['warden']}>
                <WardenDashboard />
              </ProtectedRoute>
            } />

            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password-recovery" element={<PasswordRecovery />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            {/* Home Page */}
            <Route path="/" element={<Index />} />
            
            {/* Protected Routes - Student/Faculty/Service Provider */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'service-provider', 'vice-chancellor', 'administration', 'student-union', 'warden']}>
                <DashboardSwitcher />
              </ProtectedRoute>
            } />

            <Route path="/venues" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'service-provider', 'admin', 'super-admin']}>
                <VenueManagement />
              </ProtectedRoute>
            } />
            <Route path="/booking" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'service-provider']}>
                <BookingSystem />
              </ProtectedRoute>
            } />
            <Route path="/event-planning" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'service-provider']}>
                <EventPlanning />
              </ProtectedRoute>
            } />
            
            {/* Protected Routes - Admin Only */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/tools" element={
              <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
                <AdminTools />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
                <Reports />
              </ProtectedRoute>
            } />
            
            {/* Profile Route - Accessible to all dashboard user roles */}
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['admin', 'super-admin', 'student', 'faculty', 'service-provider', 'vice-chancellor', 'administration', 'student-union', 'warden']}>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Catch-all routes */}
            <Route path="/unauthorized" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
                  <p className="text-xl text-gray-600">You don't have permission to access this page.</p>
                </div>
              </div>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
