import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BriefcaseBusiness, Wrench, LogOut } from "lucide-react";

export default function Sidebar({ className = "" }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const menuItems = [
    { name: "Home", icon: Home, path: "/dashboard/fixer" },
    { name: "Jobs", icon: BriefcaseBusiness, path: "/dashboard/fixer/jobs" },
    // { name: "Profit", icon: TrendingUp, path: "/dashboard/fixer/profit" },
    // { name: "Notification", icon: Bell, path: "/dashboard/fixer/notifications" },
    // { name: "Settings", icon: Settings, path: "/dashboard/fixer/settings" },
  ];

  return (
    <aside className={`w-64 bg-white h-full border-r border-gray-200 ${className}`}>
      <nav className="mt-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.path === "/dashboard/fixer" 
            ? location.pathname === "/dashboard/fixer"
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-purple-100 text-purple-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-purple-600" : "text-slate-400"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pb-6 pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
