import { Link, useLocation } from "react-router-dom";
import { Home, BriefcaseBusiness, TrendingUp, Bell, Settings, Wrench } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: "Home", icon: Home, path: "/dashboard/fixer" },
    { name: "Job", icon: BriefcaseBusiness, path: "/dashboard/fixer" },
    { name: "Profit", icon: TrendingUp, path: "/dashboard/fixer" },
    { name: "Notification", icon: Bell, path: "/dashboard/fixer" },
    { name: "Settings", icon: Settings, path: "/dashboard/fixer" },
  ];

  return (
    <aside className="w-64 bg-white h-full border-r border-gray-200">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-orange-500">Mr.FIXER</h1>
      </div>
      <nav className="mt-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === 0 && location.pathname === item.path;
          
          return (
            <Link
              key={`${item.name}-${index}`}
              to={item.path}
              className={`flex items-center px-5 py-3 text-lg transition-colors rounded-xl mx-3 mb-1 ${
                isActive 
                  ? "bg-orange-100 text-orange-600 font-semibold" 
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-orange-500" : "text-gray-500"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
