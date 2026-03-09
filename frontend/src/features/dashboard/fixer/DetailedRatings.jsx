export default function DetailedRatings({ ratings, loading }) {
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
                <span className="text-xl font-medium text-gray-700">
                  {rating.label}
                </span>
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
