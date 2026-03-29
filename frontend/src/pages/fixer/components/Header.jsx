import { useState, useEffect } from "react";
import httpClient from "../../../api/httpClient";
import { resolveUploadUrl } from "@/lib/assets";
import defaultProfile from "@/assets/image/default-profile.png";

const FIXER_SETTINGS_STORAGE_KEY = "fixer_settings_local";

const loadLocalFixerSettings = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(FIXER_SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getAvatarSource = (profileImage) => {
  return profileImage ? resolveUploadUrl(profileImage) : defaultProfile;
};

export const Header = ({ className = "" }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem("token"));
  const [avatarSrc, setAvatarSrc] = useState(defaultProfile);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const applyLocalSettings = () => {
      const localSettings = loadLocalFixerSettings();
      const localProfile = localSettings?.profile;

      if (!localProfile) {
        return;
      }

      setUser((prev) => ({
        ...(prev || {}),
        full_name: localProfile.fullName || prev?.full_name || "Fixer User",
        email: localProfile.email || prev?.email || "",
        phone: localProfile.phone || prev?.phone || "",
        role: prev?.role || "fixer",
      }));
      setAvatarSrc(getAvatarSource(localProfile.profileImage));
    };

    applyLocalSettings();

    httpClient
      .get("/fixer/settings/profile")
      .then((res) => {
        const profile = res.data || {};
        setUser((prev) => ({
          ...(prev || {}),
          full_name: profile.full_name || prev?.full_name || "Fixer User",
          email: profile.email || prev?.email || "",
          phone: profile.phone || prev?.phone || "",
          role: profile.role || prev?.role || "fixer",
        }));
        setAvatarSrc(getAvatarSource(profile.profile_img));
      })
      .catch((err) => {
        console.error(err);
        applyLocalSettings();
      })
      .finally(() => {
        setLoading(false);
      });

    const handleFixerSettingsUpdated = () => {
      applyLocalSettings();
    };

    window.addEventListener("fixer-settings-updated", handleFixerSettingsUpdated);

    return () => {
      window.removeEventListener("fixer-settings-updated", handleFixerSettingsUpdated);
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
    <header
      className={`fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex justify-between z-50 ${className}`}
    >
      <div className="p-6 flex items-center gap-3">
        <img
          src="/fixer-logo.png"
          alt="Mr. Fixer"
          className="rounded-lg h-11 w-auto object-contain"
        />
        <h1 className="text-3xl font-bold text-orange-600">Mr. Fixer</h1>
      </div>

      <div className="flex items-center justify-end px-7 py-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 overflow-hidden flex items-center justify-center text-white font-semibold">
              <img
                src={avatarSrc}
                alt={user?.full_name || "Fixer profile"}
                className="w-full h-full object-cover"
                onError={() => setAvatarSrc(defaultProfile)}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="leading-tight">{renderUserInfo()}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
