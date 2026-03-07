import { useNavigate } from "react-router-dom";
import httpClient from "../../../api/httpClient";
import CustomerNavbar from "./CustomerNavbar";
import CustomerFooter from "./CustomerFooter";

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete httpClient.defaults.headers.common["Authorization"];
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <CustomerNavbar onLogout={handleLogout} />

      <main className="flex-grow p-8">
        <h1 className="mb-4 text-2xl font-bold">Customer Dashboard</h1>
        {/* dashboard content here */}
      </main>

      <CustomerFooter />
    </div>
  );
} 
