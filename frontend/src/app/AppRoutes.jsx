import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../pages/components/Navbar";
import Footer from "../pages/components/Footer";
import Home from "../pages/index";
import Services from "../pages/Services";
import Contact from "../pages/Contact";
import LoginPage from "../features/auth/LoginPage";
import SignupPage from "../features/auth/SignupPage";
import NotFoundPage from "./NotFoundPage";
import ComingSoon from "./ComingSoon";

// dashboard pages
import AdminDashboard from "../features/dashboard/admin";
import CustomerDashboard from "../features/dashboard/customer";
import FixerDashboard from "../features/dashboard/fixer";
import ServiceCategories from "../features/dashboard/admin/service_categories";
import FixerManagement from "../features/dashboard/admin/fixers";
import UserManagement from "../features/dashboard/admin/users";

import ProtectedRoute from "./ProtectedRoute";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function AppRoutes() {
  return (
    <Router>
      <ScrollToTop />
      <InnerRoutes />
    </Router>
  );
}

function InnerRoutes() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboard && <Navbar />}
      <main className="flex-grow">
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* dashboard routes; users will be redirected after login */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard.Dashboard />} />
              <Route path="service-categories" element={<ServiceCategories />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="fixers" element={<FixerManagement />} />
              <Route path="transactions" element={<ComingSoon title="Transactions" />} />
            </Route>
            
            <Route
              path="/dashboard/customer"
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<CustomerDashboard.Dashboard />} />
              <Route path="orders" element={<ComingSoon title="My Orders" />} />
            </Route>

            <Route
              path="/dashboard/fixer"
              element={
                <ProtectedRoute requiredRole="fixer">
                  <FixerDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<FixerDashboard.Dashboard />} />
              <Route path="jobs" element={<ComingSoon title="My Jobs" />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        {!isDashboard && <Footer />}
      </div>
  );
}
