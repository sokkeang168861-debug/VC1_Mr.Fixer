import { motion as Motion } from "motion/react";
import defaultImage from "../../../assets/image/default-service.png";

export default function ServiceCard({ service, onViewFixers }) {
  return (
    <Motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={service.imageUrl || defaultImage}
          alt={service.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
            {service.prosCount || 0} PROS NEARBY
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>

        <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-2">
          {service.description}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onViewFixers(service)}
            className="px-4 py-2.5 rounded-xl bg-primary-light text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all duration-200"
          >
            VIEW PROVIDERS
          </button>

          {/* <button className="px-4 py-2.5 rounded-xl bg-primary-light text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all duration-200">
            USE SERVICE
          </button> */}
        </div>
      </div>
    </Motion.div>
  );
}
