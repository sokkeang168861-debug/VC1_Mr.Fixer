import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";

import { ROUTES } from "@/config/routes";
import Navbar from "../pages/components/frontpage-Navbar";
import Footer from "../pages/components/frontpage-Footer";
import ProtectedRoute from "./ProtectedRoute";

const Home = lazy(() => import("../pages/frontpage/index"));
const Services = lazy(() => import("../pages/frontpage/Services"));
const Contact = lazy(() => import("../pages/frontpage/Contact"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const SignupPage = lazy(() => import("../pages/auth/SignupPage"));

const NotFoundPage = lazy(() => import("./NotFoundPage"));
const ComingSoon = lazy(() => import("./ComingSoon"));

const CustomerDashboard = lazy(() => import("../pages/customer/pages"));
const CustomerHistory = lazy(() => import("../pages/customer/pages/history"));

const FixerDashboard = lazy(() => import("../pages/fixer/pages"));
const Job = lazy(() => import("../pages/fixer/pages/jobs"));
const Profit = lazy(() => import("../pages/fixer/pages/profit"));
const Settings = lazy(() => import("../pages/fixer/pages/settings"));
const JobList = lazy(() => import("../pages/fixer/components/JobList"));
const JobDetail = lazy(() => import("../pages/fixer/components/jobDetail"));
const SetProposal = lazy(() => import("../pages/fixer/components/setProposal"));

const AdminDashboard = lazy(() => import("../pages/admin/pages/index"));
const ServiceCategories = lazy(() => import("../pages/admin/pages/ServiceCategories"));
const FixerManagement = lazy(() => import("../pages/admin/pages/FixerManagement"));

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
      <main className="grow">
        <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path={ROUTES.home} element={<Home />} />
            <Route path={ROUTES.services} element={<Services />} />
            <Route path={ROUTES.contact} element={<Contact />} />
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.signup} element={<SignupPage />} />

            {/* Admin Dashboard */}
            <Route
              path={ROUTES.dashboardAdmin}
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin sub-routes */}
            <Route
              path={ROUTES.dashboardAdminServiceCategories}
              element={
                <ProtectedRoute requiredRole="admin">
                  <ServiceCategories />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.dashboardAdminUsers}
              element={
                <ProtectedRoute requiredRole="admin">
                  <ComingSoon title="User Management" />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.dashboardAdminFixers}
              element={
                <ProtectedRoute requiredRole="admin">
                  <FixerManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.dashboardAdminTransactions}
              element={
                <ProtectedRoute requiredRole="admin">
                  <ComingSoon title="Transactions" />
                </ProtectedRoute>
              }
            />

            {/* Customer Dashboard */}
            <Route
              path={ROUTES.dashboardCustomer}
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.dashboardCustomerOrders}
              element={
                <ProtectedRoute requiredRole="customer">
                  <ComingSoon title="My Orders" />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.dashboardCustomerHistory}
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.dashboardCustomerSettings}
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard initialPage="settings" />
                </ProtectedRoute>
              }
            />

            {/* Fixer Dashboard */}
            <Route
              path={ROUTES.dashboardFixer}
              element={
                <ProtectedRoute requiredRole="fixer">
                  <FixerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.dashboardFixerJobs}
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
            <Route
              path={ROUTES.dashboardFixerProfit}
              element={
                <ProtectedRoute requiredRole="fixer">
                  <Profit />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.dashboardFixerSettings}
              element={
                <ProtectedRoute requiredRole="fixer">
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
}
