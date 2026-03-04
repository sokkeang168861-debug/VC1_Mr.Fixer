import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../pages/components/Navbar";
import Footer from "../pages/components/Footer";
import Home from "../pages/index";
import Services from "../pages/Services";
import Contact from "../pages/Contact";
import LoginPage from "../features/auth/LoginPage";
import SignupPage from "../features/auth/SignupPage";

// dashboard pages
import AdminDashboard from "../features/dashboard/admin";
import CustomerDashboard from "../features/dashboard/customer";
import FixerDashboard from "../features/dashboard/fixer";

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
            />
            <Route
              path="/dashboard/customer"
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/fixer"
              element={
                <ProtectedRoute requiredRole="fixer">
                  <FixerDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        {!isDashboard && <Footer />}
      </div>
  );
}
