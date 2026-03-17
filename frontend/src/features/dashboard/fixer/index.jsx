import { useNavigate } from "react-router-dom";
import FixerNavbar from "./FixerNavbar";
import FixerFooter from "./FixerFooter";
import { ROUTES } from "@/config/routes";
import { clearSession } from "@/lib/auth";

export default function FixerDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate(ROUTES.home);
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