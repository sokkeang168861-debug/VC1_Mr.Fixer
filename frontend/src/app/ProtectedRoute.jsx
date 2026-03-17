import { Navigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import {
  clearSession,
  getDashboardByRole,
  getToken,
  getTokenPayload,
} from "@/lib/auth";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = getToken();
  if (!token) {
    return <Navigate to={ROUTES.login} replace />;
  }

  const payload = getTokenPayload(token);
  if (!payload) {
    clearSession();
    return <Navigate to={ROUTES.login} replace />;
  }

  if (requiredRole && payload.role !== requiredRole) {
    return <Navigate to={getDashboardByRole(payload.role)} replace />;
  }

  return children;
}
