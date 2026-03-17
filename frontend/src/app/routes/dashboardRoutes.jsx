import { lazy } from "react";
import { ROUTES } from "@/config/routes";

const loadAdminDashboard = () => import("@/features/dashboard/admin");
const loadAdminDashboardHome = () =>
  import("@/features/dashboard/admin").then((module) => ({
    default: module.Dashboard,
  }));
const loadCustomerDashboard = () => import("@/features/dashboard/customer");
const loadFixerDashboard = () => import("@/features/dashboard/fixer");
const loadServiceCategories = () =>
  import("@/features/dashboard/admin/service_categories");

const AdminDashboard = lazy(loadAdminDashboard);
const AdminDashboardHome = lazy(loadAdminDashboardHome);
const CustomerDashboard = lazy(loadCustomerDashboard);
const FixerDashboard = lazy(loadFixerDashboard);
const ServiceCategories = lazy(loadServiceCategories);

export const adminDashboardRoute = {
  path: ROUTES.dashboardAdmin,
  requiredRole: "admin",
  component: AdminDashboard,
  children: [
    { index: true, component: AdminDashboardHome },
    { path: "service-categories", component: ServiceCategories },
  ],
};

export const dashboardRoutes = [
  {
    path: ROUTES.dashboardCustomer,
    requiredRole: "customer",
    component: CustomerDashboard,
  },
  {
    path: ROUTES.dashboardFixer,
    requiredRole: "fixer",
    component: FixerDashboard,
  },
];

export function preloadDashboardForRole(role) {
  if (role === "admin") {
    return Promise.allSettled([
      loadAdminDashboard(),
      loadAdminDashboardHome(),
      loadServiceCategories(),
    ]);
  }

  if (role === "customer") {
    return Promise.allSettled([loadCustomerDashboard()]);
  }

  if (role === "fixer") {
    return Promise.allSettled([loadFixerDashboard()]);
  }

  return Promise.resolve([]);
}
