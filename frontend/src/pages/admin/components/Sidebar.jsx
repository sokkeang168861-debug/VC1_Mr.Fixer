import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { LuLayoutDashboard } from "react-icons/lu";
import { GiHammerNails, GiBoxUnpacking } from "react-icons/gi";
import { FaReceipt } from "react-icons/fa6";
import { HiOutlineWrenchScrewdriver} from "react-icons/hi2";
import { FiUsers } from "react-icons/fi";

import { GrServices } from "react-icons/gr";
import { ROUTES } from '@/config/routes';
import httpClient from '@/api/httpClient';
import { getTokenPayload } from '@/lib/auth';
import { logoutUser } from '@/lib/session';
import defaultProfileImage from '@/assets/image/default-profile.png';

// NavItem Component
const NavItem = ({ icon, children, to, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-lg transition-all cursor-pointer ${isActive
      ? 'bg-linear-to-r from-blue-100 to-blue-50 text-slate-900 font-semibold shadow-sm'
      : 'text-gray-600 hover:bg-gray-100'
      }`}
  >
    <span className="text-xl w-6 text-center">{icon}</span>
    <span className="text-sm font-medium">{children}</span>
  </NavLink>
);

// Sidebar Component
export default function Sidebar() {
  const navigate = useNavigate();
  const tokenPayload = getTokenPayload();
  const [profile, setProfile] = useState(() => ({
    full_name: tokenPayload?.full_name || 'Admin',
    role: tokenPayload?.role || 'admin',
    profile_img: '',
  }));

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const { data } = await httpClient.get('/user/currentUser');

        if (!isMounted || !data) {
          return;
        }

        setProfile({
          full_name: data.full_name || tokenPayload?.full_name || 'Admin',
          role: data.role || tokenPayload?.role || 'admin',
          profile_img: data.profile_img || '',
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setProfile((previous) => ({
          ...previous,
          full_name: previous.full_name || 'Admin',
          role: previous.role || 'admin',
        }));
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [tokenPayload?.full_name, tokenPayload?.role]);

  const roleLabel = String(profile.role || 'admin')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

  const handleLogout = async () => {
    await logoutUser({ navigate, redirectTo: ROUTES.login });
  };

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-gray-200 p-6 shadow-lg flex flex-col overflow-y-auto">
      {/* Profile Section */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
        <img
          src={profile.profile_img || defaultProfileImage}
          alt={profile.full_name || 'Admin'}
          className="w-12 h-12 rounded-lg object-cover ring-2 ring-blue-100"
        />
        <div className="flex flex-col">
          <div className="font-bold text-sm text-slate-900">
            {profile.full_name || 'Admin'}
          </div>
          <div className="text-xs text-gray-500">{roleLabel}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        <NavItem icon={<LuLayoutDashboard />} to={ROUTES.dashboardAdmin} end>
          Dashboard
        </NavItem>

        <NavItem icon={<HiOutlineWrenchScrewdriver />} to={ROUTES.dashboardAdminFixers}>
          Fixer Management
        </NavItem>
        <NavItem icon={<FiUsers  />} to={ROUTES.dashboardAdminUsers}>
          User Management
        </NavItem>

        <NavItem icon={<GrServices />} to={ROUTES.dashboardAdminServiceCategories}>
          Service Categories
        </NavItem>

        <NavItem icon={<FaReceipt />} to={ROUTES.dashboardAdminTransactions}>
          Transactions
        </NavItem>
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-auto rounded-lg bg-linear-to-r from-red-50 to-red-100 text-red-600 font-semibold hover:from-red-100 hover:to-red-200 transition-all shadow-sm hover:shadow-md border border-red-200"
      >
        <LogOut size={18} />
        <span>Log out</span>
      </button>
    </aside>
  );
}
