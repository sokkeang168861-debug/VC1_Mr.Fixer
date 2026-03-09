import { useEffect, useMemo, useState } from "react";
import httpClient from "../../../api/httpClient";
import Sidebar from "./Sidebar";
import Header from "./Header";
import StatsCards from "./StatsCards";
import DetailedRatings from "./DetailedRatings";
import RatingFeedback from "./RatingFeedback";

export default function FixerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");
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

  const displayName = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return "Fixer";

    try {
      const payloadPart = token.split(".")[1];
      const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64));
      const emailName = payload?.email ? payload.email.split("@")[0] : "";
      return emailName ? `${emailName[0].toUpperCase()}${emailName.slice(1)}` : "Fixer";
    } catch {
      return "Fixer";
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header name={displayName} />
        
        <main className="flex-1 p-8 overflow-y-auto bg-[#f4f5f7]">
          <StatsCards />

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
