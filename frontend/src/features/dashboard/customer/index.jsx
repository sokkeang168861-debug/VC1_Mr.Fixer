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

      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h1>Hello Customer 👋</h1>
        <p>Welcome to our website</p>
      </div>

      <CustomerFooter />
    </div>
  );
} 
