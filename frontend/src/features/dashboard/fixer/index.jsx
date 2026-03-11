import { useNavigate } from "react-router-dom";
import httpClient from "../../../api/httpClient";
import FixerNavbar from "./FixerNavbar";
import FixerFooter from "./FixerFooter";

export default function FixerDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await httpClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("token");
    delete httpClient.defaults.headers.common["Authorization"];
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <FixerNavbar onLogout={handleLogout} />

      <main className="flex-grow p-8">
        <h1 className="mb-4 text-2xl font-bold">Fixer Dashboard</h1>
        {/* dashboard content here */}
      </main>

      <FixerFooter />
    </div>
  );
} 