import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Bike,
  Home,
  Wrench,
  Zap,
  CalendarClock,
  TriangleAlert,
  Camera,
  Search,
  BadgeDollarSign,
  Send,
  CircleCheck,
} from "lucide-react";
import httpClient from "../../../api/httpClient";
import { Sidebar, Header } from "./CustomerNavbar";

const STEP_ITEMS = [
  { key: "choose", label: "CHOOSE ISSUE", icon: Search, active: true },
  { key: "find", label: "FIND FIXER", icon: Wrench },
  { key: "price", label: "CONFIRM PRICE", icon: BadgeDollarSign },
  { key: "arrival", label: "FIXER ARRIVAL", icon: Send },
  { key: "complete", label: "COMPLETE", icon: CircleCheck },
];

const URGENCY_OPTIONS = [
  {
    value: "normal",
    title: "Normal",
    description: "Within a few days. Best for minor fixes.",
    icon: CalendarClock,
  },
  {
    value: "urgent",
    title: "Urgent",
    description: "Within 24 hours. Needs quick attention.",
    icon: Zap,
  },
  {
    value: "emergency",
    title: "Emergency",
    description: "ASAP. For critical issues or safety risks.",
    icon: TriangleAlert,
  },
];

const getCategoryIcon = (name = "") => {
  const text = name.toLowerCase();
  if (text.includes("car")) return Car;
  if (text.includes("motor") || text.includes("bike")) return Bike;
  if (text.includes("bicycle")) return Bike;
  if (text.includes("home")) return Home;
  if (text.includes("plumb")) return Wrench;
  if (text.includes("electric")) return Zap;
  return Wrench;
};

const toMysqlDatetime = (date) => date.toISOString().slice(0, 19).replace("T", " ");

const buildScheduledAt = (urgency) => {
  const now = new Date();
  if (urgency === "emergency") {
    now.setMinutes(now.getMinutes() + 30);
    return toMysqlDatetime(now);
  }

  if (urgency === "urgent") {
    now.setHours(now.getHours() + 6);
    return toMysqlDatetime(now);
  }

  now.setDate(now.getDate() + 2);
  now.setHours(9, 0, 0, 0);
  return toMysqlDatetime(now);
};

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("bookings");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [issueDescription, setIssueDescription] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [photoName, setPhotoName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data } = await httpClient.get("/users/booking-categories");
        setCategories(data || []);
        if (data?.length) {
          setSelectedCategoryId(data[0].id);
        }
      } catch (error) {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete httpClient.defaults.headers.common?.Authorization;
    navigate("/");
  };

  const handleSubmitBooking = async () => {
    setSubmitMessage({ type: "", text: "" });

    if (!selectedCategory?.service_id) {
      setSubmitMessage({ type: "error", text: "Please select a service category." });
      return;
    }

    if (!issueDescription.trim()) {
      setSubmitMessage({ type: "error", text: "Please describe your issue first." });
      return;
    }

    try {
      setSubmitting(true);
      await httpClient.post("/users/bookings", {
        service_id: selectedCategory.service_id,
        issue_description: issueDescription,
        scheduled_at: buildScheduledAt(urgency),
      });

      setSubmitMessage({
        type: "success",
        text: "Booking submitted. Next step: finding the best fixer for you.",
      });
      setIssueDescription("");
      setPhotoName("");
      setUrgency("normal");
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to create booking.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar activeTab={activeTab} onChange={setActiveTab} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col">
        <Header />

        <div className="p-4 md:p-8">
          <section className="border-2 border-dashed border-sky-300 bg-white p-4 md:p-8 rounded-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 rounded-lg px-4 py-3 mb-7">
              {STEP_ITEMS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        step.active ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Icon size={12} />
                    </span>
                    <span className={step.active ? "text-primary" : ""}>{step.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="border border-slate-200 rounded-lg p-5 md:p-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">What can we help you fix today?</h1>
              <p className="text-slate-500 text-sm mb-6">
                Select a category that best describes your maintenance or repair need.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {loadingCategories && (
                  <div className="col-span-full text-center py-10 text-slate-500">Loading categories...</div>
                )}

                {!loadingCategories &&
                  categories.map((category) => {
                    const Icon = getCategoryIcon(category.name);
                    const isActive = selectedCategoryId === category.id;

                    return (
                      <button
                        type="button"
                        key={category.id}
                        onClick={() => setSelectedCategoryId(category.id)}
                        className={`text-left rounded-xl border p-6 transition ${
                          isActive
                            ? "border-primary bg-primary-light"
                            : "border-slate-200 bg-white hover:border-primary/50"
                        }`}
                      >
                        <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                          <Icon size={18} className="text-slate-500" />
                        </div>
                        <h3 className="font-semibold text-slate-900">{category.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{category.description || "Service support"}</p>
                      </button>
                    );
                  })}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-800 mb-2">What's the problem?</label>
                <textarea
                  rows={4}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary"
                  placeholder="e.g. My kitchen sink is leaking from the base and the wood underneath is damp."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Photos <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center"
                >
                  <div className="w-11 h-11 rounded-full bg-primary-light mx-auto mb-3 flex items-center justify-center">
                    <Camera size={18} className="text-primary" />
                  </div>
                  <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG or WEBP (max 10MB each)</p>
                  {photoName && <p className="text-xs text-primary mt-2">{photoName}</p>}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={(e) => setPhotoName(e.target.files?.[0]?.name || "")}
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-800 mb-3">How soon do you need help?</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {URGENCY_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = urgency === option.value;

                    return (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => setUrgency(option.value)}
                        className={`rounded-xl border p-4 text-left transition ${
                          active ? "border-primary bg-primary-light" : "border-slate-200 bg-white"
                        }`}
                      >
                        <Icon
                          size={16}
                          className={
                            option.value === "emergency"
                              ? "text-red-500"
                              : option.value === "urgent"
                              ? "text-amber-500"
                              : "text-slate-500"
                          }
                        />
                        <p className="font-semibold text-slate-900 mt-2">{option.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {submitMessage.text && (
                <div
                  className={`mb-5 rounded-lg px-4 py-3 text-sm ${
                    submitMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {submitMessage.text}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSubmitBooking}
                  disabled={submitting}
                  className="px-8 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Next: Find an Expert"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

CustomerDashboard.Dashboard = CustomerDashboard;
