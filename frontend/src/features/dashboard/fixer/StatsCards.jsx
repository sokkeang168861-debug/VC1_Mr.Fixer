import { Briefcase, Wallet, Percent, PiggyBank } from "lucide-react";

export default function StatsCards() {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${stat.iconBg}`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
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
            <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
