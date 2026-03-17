const DASHBOARD_ROOT = "/dashboard";
const ADMIN_ROOT = `${DASHBOARD_ROOT}/admin`;
const CUSTOMER_ROOT = `${DASHBOARD_ROOT}/customer`;
const FIXER_ROOT = `${DASHBOARD_ROOT}/fixer`;

export const ROUTES = {
  home: "/",
  services: "/services",
  contact: "/contact",
  login: "/login",
  signup: "/signup",
  dashboardAdmin: ADMIN_ROOT,
  dashboardAdminServiceCategories: `${ADMIN_ROOT}/ServiceCategories`,
  dashboardAdminUsers: `${ADMIN_ROOT}/users`,
  dashboardAdminFixers: `${ADMIN_ROOT}/fixers`,
  dashboardAdminTransactions: `${ADMIN_ROOT}/transactions`,
  dashboardCustomer: CUSTOMER_ROOT,
  dashboardCustomerOrders: `${CUSTOMER_ROOT}/orders`,
  dashboardCustomerHistory: `${CUSTOMER_ROOT}/history`,
  dashboardCustomerSettings: `${CUSTOMER_ROOT}/settings`,
  dashboardFixer: FIXER_ROOT,
  dashboardFixerJobs: `${FIXER_ROOT}/jobs`,
};

export function getFixerJobDetailRoute(jobId) {
  return `${ROUTES.dashboardFixerJobs}/${jobId}`;
}

export function getFixerProposalRoute(jobId) {
  return `${getFixerJobDetailRoute(jobId)}/set-proposal`;
}

export const ROLE_DASHBOARD_ROUTE = {
  admin: ROUTES.dashboardAdmin,
  customer: ROUTES.dashboardCustomer,
  fixer: ROUTES.dashboardFixer,
};
