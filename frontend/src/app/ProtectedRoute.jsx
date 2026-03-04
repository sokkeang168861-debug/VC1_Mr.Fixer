import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (requiredRole && payload.role !== requiredRole) {
      // user logged in but doesn't have the right role
      return <Navigate to="/" replace />;
    }
  } catch (e) {
    // token not parseable or invalid
    console.error("Invalid token", e);
    return <Navigate to="/login" replace />;
  }

  return children;
}
