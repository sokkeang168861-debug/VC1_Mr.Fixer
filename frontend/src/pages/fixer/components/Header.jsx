import { Wrench } from "lucide-react";

const initials = (name) => {
  if (!name) return "FX";
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
};

export default function Header({ name = "Fixer" }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between px-7 py-4">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <Wrench className="h-5 w-5 text-purple-600" />
          <span className="font-semibold text-slate-700">Dashboard</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
            Premium Member
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
              {initials(name)}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">{name}</p>
              <p className="text-xs text-slate-500">ID: 0pf_8892</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
