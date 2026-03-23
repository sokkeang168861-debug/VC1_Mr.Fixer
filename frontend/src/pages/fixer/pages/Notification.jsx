import React, { useState } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
  Star,
  UserCheck,
  Wallet,
  Wrench,
} from "lucide-react";
import { Header } from "../components/Header";
import Sidebar from "../components/Sidebar";

const initialNotifications = [
  {
    id: 1,
    type: "job",
    title: "New Job Assigned",
    message:
      'You have been assigned to a "Circuit Board Repair" for client Sarah J. in Downtown. Please confirm your availability within 30 minutes.',
    time: "Just now",
    isNew: true,
    tone: "border-l-4 border-orange-400",
    icon: Wrench,
    iconBg: "bg-orange-50 text-orange-500",
    cta: "View Details",
  },
  {
    id: 2,
    type: "payment",
    title: "Commission Paid",
    message:
      "Your earnings for the week of Oct 12-19 have been processed. $1,240.00 has been transferred to your linked bank account.",
    time: "2 hours ago",
    isNew: true,
    icon: Wallet,
    iconBg: "bg-emerald-50 text-emerald-500",
  },
  {
    id: 3,
    type: "profile",
    title: "Profile Updated",
    message:
      'Your certification as a "Certified Master Electrician" has been verified and added to your public profile badge list.',
    time: "Yesterday, 4:15 PM",
    icon: UserCheck,
    iconBg: "bg-blue-50 text-blue-500",
  },
  {
    id: 4,
    type: "maintenance",
    title: "System Maintenance",
    message:
      "The artisan portal will be undergoing scheduled maintenance this Sunday from 2:00 AM to 4:00 AM UTC. Job booking will be temporarily disabled.",
    time: "Oct 20, 2023",
    dashed: true,
    icon: Settings,
    iconBg: "bg-slate-100 text-slate-500",
  },
  {
    id: 5,
    type: "review",
    title: "New 5-Star Review",
    message:
      '"Marcus was professional, fast, and very clean. Fixed my wiring issue in under an hour!" — Emily R.',
    time: "Oct 19, 2023",
    icon: Star,
    iconBg: "bg-yellow-50 text-yellow-500",
  },
];

export default function NotificationPage() {
  const [notifications] = useState(initialNotifications);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />

      <div className="flex">
        <Sidebar className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)] bg-white shadow-md" />

        <main className="ml-64 mt-16 p-8 bg-[#f6f7fb] min-h-screen flex-1">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Notification Center</h1>
              <p className="text-sm text-slate-500 mt-1">
                Stay updated with your latest job assignments, earnings, and system updates.
              </p>
            </div>

            <div className="space-y-4">
              {notifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>   
          </div>
        </main>
      </div>
    </div>
  );
}

const NotificationCard = ({ notification }) => {
  const Icon = notification.icon;
  return (
    <div
      className={`rounded-2xl bg-white p-5 shadow-sm border border-slate-100 ${
        notification.dashed ? "border-dashed" : ""
      } ${notification.tone || ""}`}
    >
      <div className="flex items-start gap-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${notification.iconBg}`}>
          {Icon ? <Icon size={18} /> : null}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{notification.title}</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{notification.message}</p>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 whitespace-nowrap">
              {notification.isNew && (
                <span className="rounded-full bg-orange-100 text-orange-600 px-2 py-0.5 font-semibold uppercase">
                  New
                </span>
              )}
              <span>{notification.time}</span>
            </div>
          </div>

          {notification.cta && (
            <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">
              {notification.cta}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
