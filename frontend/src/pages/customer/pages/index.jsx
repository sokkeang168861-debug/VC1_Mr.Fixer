import { useNavigate } from "react-router-dom";
import httpClient from "../../../api/httpClient";
import React, { useState, useEffect } from "react";
import { ROUTES } from "@/config/routes";
import { logoutUser } from "@/lib/session";
import { Sidebar, Header } from "../components/navbar";
import { ArrowLeft, MapPin } from "lucide-react";
import { motion as Motion, AnimatePresence } from "motion/react";

import ServiceCard from "../components/ServiceCard";
import SpecialistCard from "../components/SpecialistCard";
import CustomerSettings from "./setting";

function getCurrentCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        reject(new Error("Location access is required to find nearby providers."));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export default function CustomerDashboard({ initialPage = "services" }) {
  const navigate = useNavigate();
  const MotionDiv = Motion.div;

  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [providersError, setProvidersError] = useState("");

  useEffect(() => {
    setLoading(true);
    setLoadError("");

    httpClient
      .get("/user/allCategories")
      .then((res) => {
        const list =
          res?.data?.data?.data ??
          res?.data?.data ??
          res?.data?.categories ??
          res?.data ??
          [];
        setServices(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error(err);
        setServices([]);
        const status = err?.response?.status;
        if (status === 401) {
          setLoadError("Session expired. Please log in again.");
        } else if (status) {
          setLoadError(`Failed to load services (HTTP ${status}).`);
        } else {
          setLoadError("Failed to load services. Is the backend running?");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getProvidersByCategory = async (categoryId) => {
    try {
      setProvidersError("");
      const { latitude, longitude } = await getCurrentCoordinates();
      const res = await httpClient.get(
        `/user/providersEachCategory/${categoryId}`,
        {
          params: { latitude, longitude },
        }
      );

      const list = res?.data?.data ?? res?.data ?? [];
      setProviders(Array.isArray(list) ? list : []);
      setCurrentPage("specialists");
    } catch (err) {
      console.error("Failed to load providers", err);
      setProviders([]);
      setProvidersError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load nearby providers."
      );
    }
  };

  const handleLogout = async () => {
    await logoutUser({ navigate, redirectTo: ROUTES.home });
  };

  const renderPage = () => {
    if (currentPage === "specialists") {
      return (
        <MotionDiv
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
            {providersError ? (
              <div className="col-span-full text-center text-rose-600">
                {providersError}
              </div>
            ) : providers.length === 0 ? (
              <div className="col-span-full text-center text-slate-500">
                No providers found.
              </div>
            ) : (
              providers.map((provider, index) => (
                <SpecialistCard key={index} specialist={provider} />
              ))
            )}
          </div>
        </MotionDiv>
      );
    }

    if (currentPage === "settings") {
      return (
        <MotionDiv
          key="settings"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <CustomerSettings />
        </MotionDiv>
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
              Loading services...
            </div>
          ) : loadError ? (
            <div className="col-span-full rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
              <p className="text-sm font-semibold text-rose-700">{loadError}</p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.login)}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
              >
                Go to Login
              </button>
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
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <div className="flex flex-1 ">
        <Sidebar
          activeTab={sidebarTab}
          onChange={(tab) => {
            if (tab === "services") {
              setCurrentPage("services");
              return;
            }
            if (tab === "booking") {
              navigate(ROUTES.dashboardCustomerBooking);
              return;
            }
            if (tab === "history") {
              navigate(ROUTES.dashboardCustomerHistory);
              return;
            }
            if (tab === "settings") {
              setCurrentPage("settings");
            }
          }}
          onLogout={handleLogout}
        />

        <main className="flex-1 min-h-0 overflow-y-auto p-8">
          <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
        </main>
      </div>
    </div>
  );
}
