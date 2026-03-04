import { useNavigate } from "react-router-dom";
import httpClient from "../../../api/httpClient";
import AdminNavbar from "./AdminNavbar";
import AdminFooter from "./AdminFooter";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete httpClient.defaults.headers.common["Authorization"];
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminNavbar onLogout={handleLogout} />

      <main className="flex-grow p-8">
        <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>
        {/* dashboard content here */}
      </main>

      <AdminFooter />
    </div>
  );
} 