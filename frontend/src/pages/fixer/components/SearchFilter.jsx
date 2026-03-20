import { Search } from 'lucide-react';

export default function SearchFilter({
  searchTerm,
  setSearchTerm,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
}) {
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const years = ['2021', '2022', '2023', '2024'];

  return (
    <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex flex-col md:flex-row gap-4">

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Job ID or Client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            {months.map(m => <option key={m}>{m}</option>)}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            {years.map(y => <option key={y}>{y}</option>)}
          </select>

          <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            Submit
          </button>
        </div>

      </div>
    </section>
  );
}