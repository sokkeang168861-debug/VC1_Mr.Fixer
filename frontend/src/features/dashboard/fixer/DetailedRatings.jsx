export default function DetailedRatings() {
  const ratings = [
    {
      category: "Quality of Work",
      score: "4.8/5.0",
      percentage: 96,
    },
    {
      category: "Speed of Service",
      score: "4.2/5.0",
      percentage: 84,
    },
    {
      category: "Price Fairness",
      score: "4.5/5.0",
      percentage: 90,
    },
    {
      category: "Professional Behavior",
      score: "4.9/5.0",
      percentage: 98,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6">Detailed Ratings</h2>
      <div className="space-y-4">
        {ratings.map((rating, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {rating.category}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {rating.score}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${rating.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
