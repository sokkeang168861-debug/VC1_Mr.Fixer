import { Star } from "lucide-react";

export default function RatingFeedback() {
  const overallRating = 4.8;
  const maxRating = 5;
  const totalRatings = 84;

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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6">Ratings & Feedback</h2>
      
      <div className="flex items-center mb-4">
        <div className="flex mr-3">
          {renderStars(overallRating)}
        </div>
        <span className="text-2xl font-bold text-gray-900">
          {overallRating}
        </span>
        <span className="text-gray-600 ml-2">/ {maxRating}</span>
      </div>

      <p className="text-sm text-gray-600 mb-4">Total {totalRatings} Ratings</p>

      <div className="space-y-3">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700 italic">
            "Great service! Very professional and knowledgeable. Fixed my issue quickly and efficiently. Highly recommend!"
          </p>
          <p className="text-sm text-gray-500 mt-2">- James Lee</p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700 italic">
            "Excellent work quality and attention to detail. Completed the job on time and within budget. Will definitely use again!"
          </p>
          <p className="text-sm text-gray-500 mt-2">- Sarah Williams</p>
        </div>
      </div>
    </div>
  );
}
