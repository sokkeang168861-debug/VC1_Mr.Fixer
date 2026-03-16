import { Star, MapPin, Phone, Mail } from "lucide-react";
import { motion } from "motion/react";
import defaultProfile from "../../../assets/image/default-profile.png";

export default function SpecialistCard({ specialist }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={specialist.profile_img || defaultProfile}
          alt={specialist.full_name}
          className="w-full h-full object-cover"
        />

        <div className="absolute top-4 left-4 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-md bg-emerald-500/90 text-white">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            AVAILABLE
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xl font-bold text-slate-900">
            {specialist.full_name}
          </h3>

          <div className="flex items-center gap-1 text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg">
            <Star size={14} fill="currentColor" />
            <span className="text-sm font-bold">5.0</span>
          </div>
        </div>

        <p className="text-sm font-semibold text-primary mb-4">
          {specialist.company_name}
        </p>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-600">
            <MapPin size={16} className="text-slate-400 shrink-0" />
            <span className="text-xs font-medium">{specialist.location}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <Phone size={14} />
            <span className="text-xs font-medium">{specialist.phone}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <Mail size={14} />
            <span className="text-xs font-medium truncate">
              {specialist.email}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
