import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, createElement, useEffect } from "react";
import { getTokenPayload } from "@/lib/auth";

import ScrollToTop from "@/app/components/ScrollToTop";
import PublicLayout from "@/app/layouts/PublicLayout";
import {
  preloadCommonRouteChunks,
  preloadGuestRouteChunks,
  publicRoutes,
} from "@/app/routes/publicRoutes";
import {
  adminDashboardRoute,
  dashboardRoutes,
  preloadDashboardForRole,
} from "@/app/routes/dashboardRoutes";

import ProtectedRoute from "./ProtectedRoute";

function RoleRoute({ requiredRole, children }) {
  return <ProtectedRoute requiredRole={requiredRole}>{children}</ProtectedRoute>;
}

function RouteLoader() {
  return <div className="p-6 text-sm text-slate-500">Loading...</div>;
}

export default function AppRoutes() {
  useEffect(() => {
    const preload = () => {
      preloadCommonRouteChunks();

      const payload = getTokenPayload();
      if (payload?.role) {
        preloadDashboardForRole(payload.role);
      } else {
        preloadGuestRouteChunks();
      }
    };

    if (typeof window.requestIdleCallback === "function") {
      const callbackId = window.requestIdleCallback(preload, { timeout: 1200 });
      return () => window.cancelIdleCallback(callbackId);
    }

    const timeoutId = window.setTimeout(preload, 600);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {publicRoutes.map(({ path, component }) => (
            <Route
              key={path}
              path={path}
              element={<PublicLayout>{createElement(component)}</PublicLayout>}
            />
          ))}

          <Route
            path={adminDashboardRoute.path}
            element={
              <RoleRoute requiredRole={adminDashboardRoute.requiredRole}>
                {createElement(adminDashboardRoute.component)}
              </RoleRoute>
            }
          >
            {adminDashboardRoute.children.map((childRoute) => (
              <Route
                key={childRoute.path ?? "index"}
                index={childRoute.index}
                path={childRoute.path}
                element={createElement(childRoute.component)}
              />
            ))}
          </Route>

          {dashboardRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <RoleRoute requiredRole={route.requiredRole}>
                  {createElement(route.component)}
                </RoleRoute>
              }
            />
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
