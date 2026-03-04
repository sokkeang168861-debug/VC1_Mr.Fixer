import { Link } from "react-router-dom";

export default function AdminNavbar({ onLogout }) {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="space-x-4">
        <Link to="/dashboard/admin" className="font-semibold">
          Admin Home
        </Link>
        <Link to="/dashboard/admin/users" className="hover:underline">
          Manage Users
        </Link>
      </div>
      <button onClick={onLogout} className="hover:underline">
        Logout
      </button>
    </nav>
  );
}
