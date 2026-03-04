import { useNavigate } from "react-router-dom";
import httpClient from "../../../api/httpClient";
import Sidebar from "./Sidebar";
import Header from "./Header";
import StatsCards from "./StatsCards";
import DetailedRatings from "./DetailedRatings";
import RatingFeedback from "./RatingFeedback";

export default function FixerDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete httpClient.defaults.headers.common["Authorization"];
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DetailedRatings />
            <RatingFeedback />
          </div>
        </main>
      </div>
    </div>
  );
}