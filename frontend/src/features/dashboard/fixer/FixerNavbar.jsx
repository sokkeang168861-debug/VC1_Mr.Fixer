import { Link } from "react-router-dom";

export default function FixerNavbar({ onLogout }) {
  return (
    <nav className="bg-green-600 text-white p-4 flex justify-between">
      <div className="space-x-4">
        <Link to="/dashboard/fixer" className="font-semibold">
          Fixer Home
        </Link>
        <Link to="/dashboard/fixer/jobs" className="hover:underline">
          My Jobs
        </Link>
      </div>
      <button onClick={onLogout} className="hover:underline">
        Logout
      </button>
    </nav>
  );
}
