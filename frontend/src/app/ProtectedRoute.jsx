import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let payload;
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Invalid token", e);
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && payload.role !== requiredRole) {
    // user logged in but doesn't have the right role
    // Redirect to their appropriate dashboard or home
    if (payload.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    if (payload.role === 'customer') return <Navigate to="/dashboard/customer" replace />;
    if (payload.role === 'fixer') return <Navigate to="/dashboard/fixer" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
