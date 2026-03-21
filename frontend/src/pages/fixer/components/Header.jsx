import { useState, useEffect } from "react";
import { Wrench } from "lucide-react";
import httpClient from "../../../api/httpClient";
import { resolveUploadUrl } from "@/lib/assets";
import defaultProfile from "@/assets/image/default-profile.png";
export const Header = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem("token"));
  const [avatarSrc, setAvatarSrc] = useState(defaultProfile);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    httpClient
      .get("/user/currentUser")
      .then((res) => {
        setUser(res.data);
        setAvatarSrc(
          res.data?.profile_img ? resolveUploadUrl(res.data.profile_img) : defaultProfile
        );
      })
      .catch((err) => {
        console.error(err);
        setUser(null);
        setAvatarSrc(defaultProfile);
      })
      .finally(() => {
        setLoading(false);
      });
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
    <header className={`fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex justify-between z-50`}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-orange-500">Mr.FIXER</h1>
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
