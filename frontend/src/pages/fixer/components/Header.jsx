import { useState, useEffect } from "react";
import { Wrench } from "lucide-react";
import httpClient from "../../../api/httpClient";

const initials = (name) => {
  if (!name) return "FX";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
};
export const Header = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    httpClient
      .get("/user/currentUser")
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error(err);
        setUser(null);
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
          <div className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
            Premium Member
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
              {initials(user?.full_name)}
            </div>
            <div className="leading-tight">{renderUserInfo()}</div>
          </div>
        </div>
      </div>
    </header>
  );
};