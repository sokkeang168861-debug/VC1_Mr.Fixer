import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BriefcaseBusiness, Wrench, LogOut } from "lucide-react";

export default function Sidebar() {
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
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600">
          <Wrench className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-lg font-bold text-purple-700">Mr. Fixer</p>
          <p className="text-xs font-medium text-slate-500">Fixer Console</p>
        </div>
      </div>

      <nav className="mt-2 space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

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
