import { Star } from "lucide-react";

const formatFeedbackDate = (input) => {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString();
};

const initials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
};

export default function RatingFeedback({ overallRating, feedback, loading }) {
  const maxRating = Number(overallRating?.outOf || 5);
  const ratingValue = Number(overallRating?.value || 0);
  const totalRatings = Number(overallRating?.totalRatings || 0);

  const renderStars = (rating) => {
    return Array.from({ length: maxRating }, (_, index) => (
      <Star
        key={index}
        className={`w-6 h-6 ${
          index < Math.floor(rating)
            ? "text-yellow-400 fill-yellow-400"
            : index < rating
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Ratings & Feedback</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-28 bg-gray-200 rounded" />
          <div className="h-4 w-36 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-100 rounded-lg" />
          <div className="h-20 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Ratings & Feedback</h2>
      
      <div className="flex flex-col items-start mb-6">
        <span className="text-6xl font-extrabold text-gray-900">
          {ratingValue.toFixed(1)}
        </span>
        <div className="flex mt-2">
          {renderStars(ratingValue)}
        </div>
        <p className="text-lg text-gray-500 mt-2">Total {totalRatings} Ratings</p>
      </div>

      <div className="space-y-3">
        {feedback.map((item) => (
          <div key={item.id} className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center">
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

        {feedback.length === 0 && (
          <p className="text-sm text-gray-500">No feedback yet.</p>
        )}
      </div>
    </div>
  );
}
