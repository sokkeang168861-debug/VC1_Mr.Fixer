import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Search,
  Filter,
  ChevronDown,
  Droplets,
  Car,
  Zap,
  Refrigerator,
  Wrench,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "motion/react";

import httpClient from "@/api/httpClient";
import defaultProfile from "@/assets/image/default-profile.png";
import { ROUTES } from "@/config/routes";
import { resolveUploadUrl } from "@/lib/assets";
import { logoutUser } from "@/lib/session";
import FixerProfile from "../components/FixerProfile";
import RatingForm from "../components/RatingForm";
import ReceiptView from "../components/ReceiptView";
import CustomDatePicker from "../components/CustomDatePicker";
import { Header, Sidebar } from "../components/navbar";

function formatHistoryDate(value) {
  if (!value) {
    return "N/A";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount || 0));
}

function getStatusLabel(status) {
  return String(status || "")
    .toLowerCase()
    .replace(/^complete$/, "completed")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getHistoryVisual(categoryName) {
  const normalized = String(categoryName || "").toLowerCase();

  if (normalized.includes("plumb")) {
    return {
      icon: <Droplets className="h-5 w-5 text-blue-500" />,
      iconBg: "bg-blue-50",
    };
  }

  if (normalized.includes("car") || normalized.includes("auto")) {
    return {
      icon: <Car className="h-5 w-5 text-orange-500" />,
      iconBg: "bg-orange-50",
    };
  }

  if (normalized.includes("elect")) {
    return {
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      iconBg: "bg-yellow-50",
    };
  }

  if (
    normalized.includes("appliance") ||
    normalized.includes("fridge") ||
    normalized.includes("refriger")
  ) {
    return {
      icon: <Refrigerator className="h-5 w-5 text-purple-500" />,
      iconBg: "bg-purple-50",
    };
  }

  return {
    icon: <Wrench className="h-5 w-5 text-slate-500" />,
    iconBg: "bg-slate-100",
  };
}

function isSameCalendarDate(left, right) {
  if (!(left instanceof Date) || !(right instanceof Date)) {
    return false;
  }

  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function mapHistoryItem(item) {
  const createdAt = item?.created_at ? new Date(item.created_at) : null;
  const categoryName = item?.category_name?.trim() || `Service #${item?.service_id ?? ""}`;
  const visual = getHistoryVisual(categoryName);

  return {
    id: String(item.booking_id),
    bookingId: Number(item.booking_id),
    serviceId: Number(item.service_id),
    service: categoryName,
    category: categoryName,
    date: formatHistoryDate(item.created_at),
    createdAt:
      createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt : null,
    fixer: {
      name: item?.fixer_name?.trim() || "Assigned Fixer",
      avatar: item?.fixer_avatar
        ? resolveUploadUrl(item.fixer_avatar)
        : defaultProfile,
    },
    amount: Number(item.amount || 0),
    status: getStatusLabel(item.status),
    icon: visual.icon,
    iconBg: visual.iconBg,
    orderId: `#BK-${String(item.booking_id).padStart(5, "0")}`,
  };
}

export default function CustomerHistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [currentView, setCurrentView] = useState("history");
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setLoadError("");

    httpClient
      .get("/user/bookings/history")
      .then((res) => {
        if (!isMounted) {
          return;
        }

        const list = res?.data?.data ?? [];
        const normalizedList = Array.isArray(list) ? list.map(mapHistoryItem) : [];
        setHistoryItems(normalizedList);
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load booking history:", err);
        setHistoryItems([]);

        const status = err?.response?.status;
        if (status === 401) {
          setLoadError("Session expired. Please log in again.");
          return;
        }

        if (status) {
          setLoadError(`Failed to load history (HTTP ${status}).`);
          return;
        }

        setLoadError("Failed to load history. Is the backend running?");
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRateService = (service) => {
    setSelectedService(service);
    setCurrentView("rating");
  };

  const handleViewReceipt = (service) => {
    setSelectedService(service);
    setCurrentView("receipt");
  };

  const handleViewFixerProfile = (service) => {
    setSelectedService(service);
    setCurrentView("profile");
  };

  const filteredData = historyItems.filter((item) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !normalizedQuery ||
      item.service.toLowerCase().includes(normalizedQuery) ||
      item.fixer.name.toLowerCase().includes(normalizedQuery) ||
      String(item.serviceId).includes(normalizedQuery);

    const matchesCategory =
      selectedCategory === "All Categories" ||
      item.category === selectedCategory;

    const matchesDate =
      !selectedDate || (item.createdAt && isSameCalendarDate(item.createdAt, selectedDate));

    return matchesSearch && matchesCategory && matchesDate;
  });

  const categoryOptions = [
    "All Categories",
    ...new Set(historyItems.map((item) => item.category).filter(Boolean)),
  ];

  const dateFilterLabel = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "All Dates";

  const handleSidebarChange = (tab) => {
    setShowFilterPopover(false);
    setShowDatePicker(false);

    if (tab === "services") {
      navigate(ROUTES.dashboardCustomer);
      return;
    }

    if (tab === "booking") {
      navigate(ROUTES.dashboardCustomerBooking);
      return;
    }

    if (tab === "settings") {
      navigate(ROUTES.dashboardCustomerSettings);
      return;
    }

    setCurrentView("history");
  };

  const handleLogout = async () => {
    await logoutUser({ navigate, redirectTo: ROUTES.home });
  };

  const renderHistoryBody = () => {
    if (loading) {
      return (
        <div className="px-4 py-10 text-center text-sm text-slate-500">
          Loading completed bookings...
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="px-4 py-10">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="text-sm font-semibold text-rose-700">{loadError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (filteredData.length === 0) {
      return (
        <div className="px-4 py-10 text-center text-sm text-slate-500">
          No completed bookings found for the selected filters.
        </div>
      );
    }

    return (
      <div>
        {filteredData.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 items-center border-b border-slate-100 px-4 py-4 last:border-none"
          >
            <div className="col-span-4 flex items-center gap-3">
              <div className={`rounded-xl p-2 ${item.iconBg}`}>{item.icon}</div>
              <div>
                <p className="text-sm font-bold text-slate-900">{item.service}</p>
                <p className="text-xs text-slate-500">Service ID: {item.serviceId}</p>
              </div>
            </div>

            <div className="col-span-2 text-sm text-slate-700">{item.date}</div>

            <div className="col-span-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <img
                src={item.fixer.avatar}
                alt={item.fixer.name}
                className="h-8 w-8 rounded-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = defaultProfile;
                }}
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => handleViewFixerProfile(item)}
                className="text-left hover:text-purple-700"
              >
                {item.fixer.name}
              </button>
            </div>

            <div className="col-span-2 text-sm font-bold text-slate-900">
              {formatCurrency(item.amount)}
            </div>

            <div className="col-span-2 flex items-center justify-end gap-3 text-sm font-semibold text-purple-600">
              <button
                type="button"
                onClick={() => handleRateService(item)}
                className="hover:text-purple-700"
              >
                Rate Service
              </button>
              <button
                type="button"
                onClick={() => handleViewReceipt(item)}
                className="hover:text-purple-700"
              >
                View Receipt
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          activeTab="history"
          onChange={handleSidebarChange}
          onLogout={handleLogout}
          sticky={false}
          scrollNav={false}
        />

        <main className="min-h-0 flex-1 overflow-y-auto p-10">
          <AnimatePresence>
            {currentView === "history" && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mx-auto max-w-6xl">
                  <div className="mb-2">
                    <h1 className="text-3xl font-bold">My Service History</h1>
                    <p className="text-sm text-slate-500">
                      Keep track of all your completed maintenance and repairs.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search by service, fixer name, or service ID..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowFilterPopover((value) => !value)}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-purple-200 hover:text-purple-700"
                          >
                            <Filter className="h-4 w-4" />
                            More Filters
                          </button>

                          {showFilterPopover && (
                            <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">
                                  Category
                                </label>
                                <select
                                  value={selectedCategory}
                                  onChange={(e) => setSelectedCategory(e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                                >
                                  {categoryOptions.map((option) => (
                                    <option key={option}>{option}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200">
                      <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <span className="col-span-4">Service</span>
                        <span className="col-span-2">Date</span>
                        <span className="col-span-2">Fixer</span>
                        <span className="col-span-2">Amount</span>
                        <span className="col-span-2 text-right">Actions</span>
                      </div>

                      {renderHistoryBody()}
                    </div>
                  </div>
                </div>
              </Motion.div>
            )}

            {currentView === "profile" && selectedService && (
              <FixerProfile
                onBack={() => setCurrentView("history")}
                name={selectedService.fixer.name}
                avatar={selectedService.fixer.avatar}
                primaryCategory={selectedService.category}
              />
            )}

            {currentView === "rating" && selectedService && (
              <RatingForm
                onBack={() => setCurrentView("history")}
                serviceName={selectedService.service}
                fixerName={selectedService.fixer.name}
                fixerAvatar={selectedService.fixer.avatar}
                date={selectedService.date}
                orderId={selectedService.orderId}
              />
            )}

            {currentView === "receipt" && selectedService && (
              <ReceiptView
                onClose={() => setCurrentView("history")}
                receipt={selectedService}
              />
            )}

            {showDatePicker && (
              <CustomDatePicker
                onClose={() => setShowDatePicker(false)}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setShowDatePicker(false);
                }}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
