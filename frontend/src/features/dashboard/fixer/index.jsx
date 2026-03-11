import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // Missing import
import httpClient from "../../../api/httpClient";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Star, Briefcase, Wallet, Percent, PiggyBank } from "lucide-react";

/* ---------------------- Stats Cards ---------------------- */
function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}
              >
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>

              {stat.tag && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  {stat.tag}
                </span>
              )}

              {stat.change && (
                <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                  {stat.change}
                </span>
              )}
            </div>

            <h3 className="text-lg font-medium text-gray-500 mb-1">{stat.title}</h3>
            <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------- Detailed Ratings ---------------------- */
function DetailedRatings({ ratings, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Detailed Ratings</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-4xl font-bold mb-6 text-gray-800">Detailed Ratings</h2>

      <div className="space-y-4">
        {ratings.map((rating) => (
          <div key={rating.key} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-xl font-medium text-gray-700">{rating.label}</span>
                <span className="text-xl font-semibold text-gray-900">
                  {Number(rating.value).toFixed(1)} / {Number(rating.outOf).toFixed(1)}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${rating.percentage || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}

        {ratings.length === 0 && (
          <p className="text-sm text-gray-500">No ratings yet.</p>
        )}
      </div>
    </div>
  );
}

/* ---------------------- Rating Feedback ---------------------- */
function formatFeedbackDate(input) {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString();
}

function initials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
}

function RatingFeedback({ overallRating, feedback, loading }) {
  const maxRating = Number(overallRating?.outOf || 5);
  const ratingValue = Number(overallRating?.value || 0);
  const totalRatings = Number(overallRating?.totalRatings || 0);

  const renderStars = (rating) =>
    Array.from({ length: maxRating }, (_, index) => (
      <Star
        key={index}
        className={`w-6 h-6 ${
          index < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Ratings & Feedback</h2>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Ratings & Feedback</h2>

      <div className="flex flex-col items-start mb-6">
        <span className="text-6xl font-extrabold text-gray-900">{ratingValue.toFixed(1)}</span>
        <div className="flex mt-2">{renderStars(ratingValue)}</div>
        <p className="text-lg text-gray-500 mt-2">Total {totalRatings} Ratings</p>
      </div>

      <div className="space-y-3">
        {feedback.map((item) => (
          <div key={item.id} className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                  {initials(item.customerName)}
                </div>

                <div>
                  <p className="font-semibold text-gray-900">{item.customerName}</p>
                  <div className="flex">{renderStars(item.rating)}</div>
                </div>
              </div>

              <p className="text-xs text-gray-400">{formatFeedbackDate(item.createdAt)}</p>
            </div>

            <p className="text-sm text-gray-600 mt-2 italic">"{item.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------- Main Dashboard ---------------------- */
export default function FixerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Static stats array
  const stats = [
    {
      title: "Total Jobs",
      value: "1,284",
      tag: "All Jobs",
      icon: Briefcase,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Total Profit",
      value: "$45,280.00",
      change: "+12.5%",
      icon: Wallet,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "Total Commission",
      value: "$6,792.00",
      tag: "Standard",
      icon: Percent,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Net Profit",
      value: "$38,488.00",
      change: "+8.2%",
      icon: PiggyBank,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await httpClient.get("/api/fixer/dashboard/homepage?limit=5");
        setDashboardData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Display name from token
  const displayName = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return "Fixer";

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const emailName = payload?.email?.split("@")[0];
      return emailName ? `${emailName[0].toUpperCase()}${emailName.slice(1)}` : "Fixer";
    } catch {
      return "Fixer";
    }
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await httpClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("token");
    delete httpClient.defaults.headers.common["Authorization"];
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 flex flex-col">
        <Header name={displayName} onLogout={handleLogout} />

        <main className="flex-1 p-8 overflow-y-auto bg-[#f4f5f7]">
          <StatsCards stats={stats} />

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DetailedRatings
              ratings={dashboardData?.detailedRatings || []}
              loading={loading}
            />

            <RatingFeedback
              overallRating={dashboardData?.overallRating}
              feedback={dashboardData?.feedback || []}
              loading={loading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}