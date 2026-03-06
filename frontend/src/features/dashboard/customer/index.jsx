import { useNavigate } from "react-router-dom";
import httpClient from "../../../api/httpClient";
import React, { useState, useEffect } from "react";
import { Sidebar, Header } from "./CustomerNavbar";
import { ArrowLeft, Star, MapPin, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

// --- Cards ---

const ServiceCard = ({ service, onViewFixers }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
  >
    <div className="relative h-48 overflow-hidden">
      <img
        src={service.image || "https://via.placeholder.com/400"}
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
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>
      </div>

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

        <button className="px-4 py-2.5 rounded-xl bg-primary-light text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all duration-200">
          USE SERVICE
        </button>
      </div>
    </div>
  </motion.div>
);

const SpecialistCard = ({ specialist }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
  >
    <div className="relative h-56 overflow-hidden">
      <img
        src={specialist.profile_img ? specialist.profile_img : "/default-user.png"}
        alt={specialist.full_name}
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

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState("services");
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Load service categories ---
  useEffect(() => {
    const token = localStorage.getItem("token");

    const client = httpClient || axios;

    client
      .get("http://localhost:5000/api/users/allCategories", {
        headers: token
          ? {
            Authorization: `Bearer ${token}`,
          }
          : undefined,
      })
      .then((res) => {
        setServices(res.data || []);
      })
      .catch((err) => {
        console.error(err);
        setServices([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // --- Load providers by category ---
  const getProvidersByCategory = async (categoryId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/providersEachCategory/${categoryId}`
      );

      setProviders(res.data || []);
      setCurrentPage("specialists");
    } catch (err) {
      console.error("Failed to load providers", err);
      setProviders([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    if (httpClient && httpClient.defaults?.headers) {
      delete httpClient.defaults.headers.common?.["Authorization"];
    }

    navigate("/");
  };

  const renderPage = () => {
    if (currentPage === "specialists") {
      return (
        <motion.div
          key="specialists"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-6 mb-8">
            <button
              onClick={() => setCurrentPage("services")}
              className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary transition-all shadow-sm"
            >
              <ArrowLeft size={24} />
            </button>

            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">
                Service Providers Near You
              </h1>
              <p className="text-slate-500 font-medium flex items-center gap-2">
                <MapPin size={16} /> Showing providers in your category
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {providers.length === 0 ? (
              <div className="col-span-full text-center text-slate-500">
                No providers found.
              </div>
            ) : (
              providers.map((provider, index) => (
                <SpecialistCard key={index} specialist={provider} />
              ))
            )}
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="services"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Service Categories
          </h1>
          <p className="text-slate-500 font-medium">
            Showing service categories in Cambodia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center text-slate-500">
              Loading services…
            </div>
          ) : services.length === 0 ? (
            <div className="col-span-full text-center text-slate-500">
              No services found.
            </div>
          ) : (
            services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onViewFixers={() => getProvidersByCategory(service.id)}
              />
            ))
          )}
        </div>
      </motion.div>
    );
  };

  const sidebarTab = currentPage === "specialists" ? "services" : currentPage;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        activeTab={sidebarTab}
        onChange={(tab) => {
          if (tab === "services" || tab === "specialists")
            setCurrentPage(tab);
        }}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col">
        <Header />

        <div className="p-8">
          <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
        </div>
      </main>
    </div>
  );
}