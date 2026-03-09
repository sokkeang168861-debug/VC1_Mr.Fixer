import { Wrench } from "lucide-react";

const initials = (name) => {
  if (!name) return "FX";
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
};

export default function Header({ name = "Fixer" }) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-7 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-orange-500">Mr.FIXER</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
              {initials(name)}
            </div>
            <div className="leading-tight">
              <p className="text-lg font-semibold text-gray-800">{name}</p>
              <p className="text-xs text-gray-500">ID: 0pf_8892</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
