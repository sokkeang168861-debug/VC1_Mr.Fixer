import { Link, useLocation } from "react-router-dom";
import { Home, User, Calendar, CreditCard, MessageSquare, Users } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: "Home", icon: Home, path: "/dashboard/fixer" },
    { name: "Profile", icon: User, path: "/dashboard/fixer/profile" },
    { name: "Bookings", icon: Calendar, path: "/dashboard/fixer/bookings" },
    { name: "Payments", icon: CreditCard, path: "/dashboard/fixer/payments" },
    { name: "Reviews", icon: MessageSquare, path: "/dashboard/fixer/reviews" },
    { name: "Customers", icon: Users, path: "/dashboard/fixer/customers" },
  ];

  return (
    <div className="w-64 bg-white h-full shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-orange-600">Mr. Fixer</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-700 transition-colors rounded-lg mx-3 ${
                isActive 
                  ? "bg-orange-100 text-orange-600" 
                  : "hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-orange-500" : ""}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
