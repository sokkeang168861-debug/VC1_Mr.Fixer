import { Link } from "react-router-dom";

export default function CustomerNavbar({ onLogout }) {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <div className="space-x-4">
        <Link to="/dashboard/customer" className="font-semibold">
          Customer Home
        </Link>
        <Link to="/dashboard/customer/orders" className="hover:underline">
          My Orders
        </Link>
      </div>
      <button onClick={onLogout} className="hover:underline">
        Logout
      </button>
    </nav>
  );
}
