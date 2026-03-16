import { useNavigate } from "react-router-dom";
import httpClient from "../../../api/httpClient";
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { ArrowLeft, MapPin } from "lucide-react";
import { motion as Motion, AnimatePresence } from "motion/react";

// import ServiceCard from "../components/ServiceCard";
// import SpecialistCard from "../components/SpecialistCard";

export default function FixerDashboard() {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState("services");
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    httpClient
      .get("/user/allCategories")
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

  const getProvidersByCategory = async (categoryId) => {
    try {
      const res = await httpClient.get(
        `/user/providersEachCategory/${categoryId}`
      );

      setProviders(res.data || []);
      setCurrentPage("specialists");
    } catch (err) {
      console.error("Failed to load providers", err);
      setProviders([]);
    }
  };

  const handleLogout = async () => {
    try {
      await httpClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.removeItem("token");

    if (httpClient && httpClient.defaults?.headers) {
      delete httpClient.defaults.headers.common?.["Authorization"];
    }

    navigate("/");
  };

  const renderPage = () => {
    if (currentPage === "specialists") {
      return (
        <Motion.div
          key="specialists"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
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
                <MapPin size={16} />
                Showing providers in your category
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
        </Motion.div>
      );
    }

    return (
      <Motion.div
        key="services"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
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
      </Motion.div>
    );
  };

  const sidebarTab = currentPage === "specialists" ? "services" : currentPage;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* <Sidebar /> */}

      <Sidebar
        activeTab={sidebarTab}
        onChange={(tab) => {
          if (tab === "services" || tab === "specialists") {
            setCurrentPage(tab);
          }
        }}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col">
        <Header name="John Fixer" />

        <main className="flex-1 p-8 overflow-y-auto bg-[#f4f5f7]">

          {/* <main className="flex-1 flex flex-col">
        <Header /> */}

          <div className="p-8">
            <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
          </div>
        </main>
      </div>
    </div >
  );
}
