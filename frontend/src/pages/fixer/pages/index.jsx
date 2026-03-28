import { useEffect, useState } from "react";
import {
  Briefcase,
  Star,
  Wallet,
  Percent,
  PiggyBank
} from 'lucide-react';
import { motion as Motion } from 'motion/react';
import httpClient from "@/api/httpClient";
import { Header } from "../components/Header";
import Sidebar from "../components/Sidebar";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const getInitials = (name) => {
  if (!name) return "NA";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
};

const formatReviewDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return dateFormatter.format(date);
};

const StatCard = ({ icon: Icon, label, value, badge, badgeColor, iconBg }) => (
  <Motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 min-w-[240px]"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-xl ${iconBg}`}>
        {Icon ? <Icon size={22} className="text-white" /> : null}
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${badgeColor}`}>
        {badge}
      </span>
    </div>
    <div className="space-y-1">
      <p className="text-slate-400 text-xs font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </Motion.div>
);

const RatingBar = ({ label, score }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="text-slate-900 font-bold">{score} / 5.0</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <Motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(score / 5) * 100}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full bg-blue-500 rounded-full"
      />
    </div>
  </div>
);

const ReviewItem = ({ name, date, comment, initials, rating }) => (
  <div className="py-4 border-b border-slate-50 last:border-0">
    <div className="flex justify-between items-start mb-1">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
          {initials}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">{name}</h4>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                className={i < Math.round(rating) ? "fill-orange-400 text-orange-400" : "text-slate-200"}
              />
            ))}
          </div>
        </div>
      </div>
      <span className="text-[10px] text-slate-400 font-medium">{date}</span>
    </div>
    <p className="text-xs text-slate-500 leading-relaxed pl-11">
      "{comment}"
    </p>
  </div>
);

export default function App() {
  const [dashboard, setDashboard] = useState({
    summary: {
      completedJobs: 0,
      totalProfit: 0,
      commission: 0,
      netProfit: 0,
    },
    overallRating: {
      value: 0,
      outOf: 5,
      totalRatings: 0,
    },
    categories: [],
    detailedRatings: [],
    feedback: [],
  });
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setDashboardError("");
        const res = await httpClient.get("/fixer/homepage");

        if (!isMounted) {
          return;
        }

        const payload = res.data || {};
        const summary = payload.summary || payload.data || {};

        setDashboard({
          summary: {
            completedJobs: Number(summary.completedJobs || 0),
            totalProfit: Number(summary.totalProfit || 0),
            commission: Number(summary.commission || 0),
            netProfit: Number(summary.netProfit || 0),
          },
          overallRating: {
            value: Number(payload.overallRating?.value || 0),
            outOf: Number(payload.overallRating?.outOf || 5),
            totalRatings: Number(payload.overallRating?.totalRatings || 0),
          },
          categories: Array.isArray(payload.categories) ? payload.categories : [],
          detailedRatings: Array.isArray(payload.detailedRatings) ? payload.detailedRatings : [],
          feedback: Array.isArray(payload.feedback) ? payload.feedback : [],
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load fixer dashboard:", error);
        setDashboardError(error.response?.data?.message || "Failed to load dashboard data");
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* Header */}
      <Header className="fixed top-0 left-0 right-0 z-50" />

      {/* Sidebar */}
      <Sidebar className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)] bg-white shadow-md" />

      {/* Main content */}
      <main className="ml-64 mt-16 p-8 bg-[#f4f5f7] min-h-screen">
        <div className="max-w-7xl mx-auto pb-20">
          {dashboardError ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {dashboardError}
            </div>
          ) : null}

          <div className="mb-8 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-orange-500">
                  Your Services
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-950">
                  Categories you currently serve
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {dashboard.categories.length > 0 ? (
                  dashboard.categories.map((category) => (
                    <span
                      key={category.id || category.name}
                      className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-800"
                    >
                      {category.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm font-medium text-slate-500">
                    No categories assigned yet.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Briefcase}
              label="Total Jobs"
              value={dashboard.summary.completedJobs.toLocaleString("en-US")}
              badge="Completed"
              badgeColor="bg-slate-100 text-slate-500"
              iconBg="bg-purple-400"
            />
            <StatCard
              icon={Wallet}
              label="Total Profit"
              value={currencyFormatter.format(dashboard.summary.totalProfit)}
              badge="Live"
              badgeColor="bg-emerald-50 text-emerald-600"
              iconBg="bg-orange-400"
            />
            <StatCard
              icon={Percent}
              label="Total Commission"
              value={currencyFormatter.format(dashboard.summary.commission)}
              badge="10%"
              badgeColor="bg-blue-50 text-blue-600"
              iconBg="bg-blue-400"
            />
            <StatCard
              icon={PiggyBank}
              label="Net Profit"
              value={currencyFormatter.format(dashboard.summary.netProfit)}
              badge="After fee"
              badgeColor="bg-emerald-50 text-emerald-600"
              iconBg="bg-emerald-400"
            />
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Detailed Ratings */}
              <Motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-[24rem] flex flex-col"
              >
                <h2 className="text-xl font-bold text-slate-800 mb-8">
                  Detailed Ratings
                </h2>

                <div className="space-y-8 overflow-y-auto pr-2 flex-1">
                  {dashboard.detailedRatings.length > 0 ? (
                    dashboard.detailedRatings.map((rating) => (
                      <RatingBar
                      key={rating.key}
                      label={rating.label}
                      score={Number(rating.value || 0)}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No ratings available yet.</p>
                )}
              </div>
            </Motion.div>

            {/* Ratings */}
              <Motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-[32rem] flex flex-col"
              >
                <h2 className="text-xl font-bold text-slate-800 mb-6">
                  Ratings & Feedback
                </h2>

              <div className="text-center mb-8">
                <h3 className="text-6xl font-black text-slate-900 mb-2">
                  {dashboard.overallRating.value.toFixed(1)}
                </h3>

                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < Math.round(dashboard.overallRating.value)
                          ? "fill-orange-500 text-orange-500"
                          : "text-slate-200"
                      }
                    />
                  ))}
                </div>

                <p className="text-sm text-slate-400 font-medium">
                  Total {dashboard.overallRating.totalRatings} Ratings
                </p>
              </div>

                <div className="space-y-2 overflow-y-auto pr-2 flex-1">
                  {dashboard.feedback.length > 0 ? (
                    dashboard.feedback.map((review) => (
                      <ReviewItem
                      key={review.id}
                      name={review.customerName || "Anonymous"}
                      date={formatReviewDate(review.createdAt)}
                      initials={getInitials(review.customerName)}
                      comment={review.comment}
                      rating={Number(review.rating || 0)}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No customer feedback yet.</p>
                )}
              </div>
            </Motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
