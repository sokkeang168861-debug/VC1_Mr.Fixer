import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  BriefcaseBusiness,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { logoutUser } from "@/lib/session";

export default function Sidebar({ className = "" }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser({ navigate, redirectTo: ROUTES.login });
  };

  const menuItems = [
    { name: "Home", icon: Home, path: ROUTES.dashboardFixer },
    { name: "Job", icon: BriefcaseBusiness, path: ROUTES.dashboardFixerJobs },
    { name: "Notification", icon: Bell, path: ROUTES.dashboardFixerNotifications },
  ];

  return (
    <aside className={`w-64 bg-white h-full border-r border-gray-200 flex flex-col ${className}`}>
      <nav className="mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === ROUTES.dashboardFixer
            ? location.pathname === ROUTES.dashboardFixer
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-orange-500" : "text-slate-400"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-6 pt-4 mt-80 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex w-full items-end gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
