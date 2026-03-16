import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../pages/components/frontpage-Navbar";
import Footer from "../pages/components/frontpage-Footer";
import Home from "../pages/frontpage/index";
import Services from "../pages/frontpage/Services";
import Contact from "../pages/frontpage/Contact";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import NotFoundPage from "./NotFoundPage";
import ComingSoon from "./ComingSoon";

// customer pages
import CustomerDashboard from "../pages/customer/pages";

// fixer pages
import FixerDashboard from "../pages/fixer/pages";
import Job from "../pages/fixer/pages/jobs";
import JobList from "../pages/fixer/components/JobList";
import JobDetail from "../pages/fixer/components/jobDetail";
import SetProposal from "../pages/fixer/components/setProposal";

// admin pages
import AdminDashboard from "../pages/admin/pages/index";
import ServiceCategories from "../pages/admin/pages/ServiceCategories";
import FixerManagement from "../pages/admin/pages/FixerManagement";

import ProtectedRoute from "./ProtectedRoute";

const routerBasename = import.meta.env.BASE_URL;

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function AppRoutes() {
  return (
    <Router basename={routerBasename}>
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
      <main className="grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Admin Dashboard */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin sub-routes */}
          <Route
            path="/dashboard/admin/ServiceCategories"
            element={
              <ProtectedRoute requiredRole="admin">
                <ServiceCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <ComingSoon title="User Management" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/fixers"
            element={
              <ProtectedRoute requiredRole="admin">
                <FixerManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/transactions"
            element={
              <ProtectedRoute requiredRole="admin">
                <ComingSoon title="Transactions" />
              </ProtectedRoute>
            }
          />

          {/* Customer Dashboard */}
          <Route
            path="/dashboard/customer"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/customer/orders"
            element={
              <ProtectedRoute requiredRole="customer">
                <ComingSoon title="My Orders" />
              </ProtectedRoute>
            }
          />

          {/* Fixer Dashboard */}
          <Route
            path="/dashboard/fixer"
            element={
              <ProtectedRoute requiredRole="fixer">
                <FixerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/fixer/jobs"
            element={
              <ProtectedRoute requiredRole="fixer">
                <Job />
              </ProtectedRoute>
            }
          >
            <Route index element={<JobList />} />
            <Route path=":id" element={<JobDetail />} />
            <Route path=":id/set-proposal" element={<SetProposal />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
}
