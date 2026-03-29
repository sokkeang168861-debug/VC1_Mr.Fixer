import { useState, useEffect } from "react";
import { Calendar, Wrench, History, Settings, LogOut } from "lucide-react";
import httpClient from "@/api/httpClient";
import { resolveUploadUrl } from "@/lib/assets";
import defaultProfile from "@/assets/image/default-profile.png";

const PROFILE_UPDATED_EVENT = "user-profile-updated";

export const Sidebar = ({
  activeTab,
  onChange,
  onLogout,
  sticky = true,
  scrollNav = false,
  fixed = false,
}) => {
  const menuItems = [
    { id: "services", label: "Services", icon: Wrench },
    { id: "booking", label: "Booking", icon: Calendar },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const sidebarPositionClasses = fixed
    ? "fixed left-0 top-16 z-20"
    : sticky
      ? "sticky top-16"
      : "";
  const sidebarHeightClasses = "h-[calc(100vh-4rem)]";
  const navScrollClasses = scrollNav ? "overflow-y-auto" : "overflow-hidden";

  return (
    <div
      className={`w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col p-4 overflow-hidden ${sidebarHeightClasses} ${sidebarPositionClasses}`}
    >
      <nav className={`min-h-0 flex-1 space-y-1 pb-4 ${navScrollClasses}`}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange && onChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? "bg-primary-light text-primary font-semibold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

    </div>
  );
};

export const Header = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem("token"));
  const [avatarSrc, setAvatarSrc] = useState(defaultProfile);

  useEffect(() => {
    const applyUserProfile = (profile) => {
      setUser(profile || null);
      setAvatarSrc(
        profile?.profile_img ? resolveUploadUrl(profile.profile_img) : defaultProfile
      );
    };

    const loadCurrentUser = () => {
      httpClient
        .get("/user/currentUser")
        .then((res) => {
          applyUserProfile(res.data);
        })
        .catch((err) => {
          console.error(err);
          setUser(null);
          setAvatarSrc(defaultProfile);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const handleProfileUpdated = (event) => {
      if (event?.detail) {
        applyUserProfile(event.detail);
        return;
      }

      loadCurrentUser();
    };

    loadCurrentUser();
    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);

    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    };
  }, []);

  const renderUserInfo = () => {
    if (loading) return <p className="text-sm text-slate-500">Loading...</p>;
    if (!user) return <p className="text-sm text-slate-500">Not signed in</p>;

    return (
      <>
        <p className="text-sm font-bold text-slate-900">{user.full_name}</p>
        <p className="text-xs text-slate-500 font-medium">{user.role}</p>
      </>
    );
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Mr. Fixer"
          className="rounded-lg h-11 w-auto object-contain"
        />
        <span className="text-xl font-bold tracking-tight text-primary">Mr. Fixer</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4 ml-8">
        <div className="text-right">{renderUserInfo()}</div>
        <div className="w-12 h-12 rounded-2xl bg-orange-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
          <img
            src={avatarSrc}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={() => setAvatarSrc(defaultProfile)}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
};
