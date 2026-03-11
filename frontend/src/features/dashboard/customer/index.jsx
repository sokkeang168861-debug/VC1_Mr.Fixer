import { useNavigate } from "react-router-dom";
import httpClient from "../../../api/httpClient";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Sidebar, Header } from "./CustomerNavbar";
import {
  ArrowLeft,
  Bell,
  Bike,
  Calendar,
  Camera,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Droplets,
  Home,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  SlidersHorizontal,
  Star,
  TriangleAlert,
  User,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Cards ---

const ServiceCard = ({ service, onViewFixers }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
  >
    <div className="relative h-48 overflow-hidden">
      <img
        src={service.image || "https://via.placeholder.com/400"}
        alt={service.name}
        className="w-full h-full object-cover"
      />

      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
          {service.prosCount || 0} PROS NEARBY
        </span>
      </div>
    </div>

    <div className="p-6">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>
      </div>

      <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-2">
        {service.description}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onViewFixers(service)}
          className="px-4 py-2.5 rounded-xl bg-primary-light text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all duration-200"
        >
          VIEW PROVIDERS
        </button>

        <button className="px-4 py-2.5 rounded-xl bg-primary-light text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all duration-200">
          USE SERVICE
        </button>
      </div>
    </div>
  </motion.div>
);

const SpecialistCard = ({ specialist }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
  >
    <div className="relative h-56 overflow-hidden">
      <img
        src={specialist.profile_img ? specialist.profile_img : "/default-user.png"}
        alt={specialist.full_name}
      />

      <div className="absolute top-4 left-4 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-md bg-emerald-500/90 text-white">
        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          AVAILABLE
        </span>
      </div>
    </div>

    <div className="p-6">
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-xl font-bold text-slate-900">
          {specialist.full_name}
        </h3>

        <div className="flex items-center gap-1 text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg">
          <Star size={14} fill="currentColor" />
          <span className="text-sm font-bold">5.0</span>
        </div>
      </div>

      <p className="text-sm font-semibold text-primary mb-4">
        {specialist.company_name}
      </p>

      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-2.5 text-slate-600">
          <MapPin size={16} className="text-slate-400 shrink-0" />
          <span className="text-xs font-medium">{specialist.location}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <Phone size={14} />
          <span className="text-xs font-medium">{specialist.phone}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <Mail size={14} />
          <span className="text-xs font-medium truncate">
            {specialist.email}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

const bookingFallbackCategories = [
  {
    id: "car-repair",
    name: "Car Repair",
    description: "Engine, tires & body work",
  },
  {
    id: "motor-bike-repair",
    name: "Motor/Bike Repair",
    description: "Performance & part swap",
  },
  {
    id: "bicycle-maintenance",
    name: "Bicycle Maintenance",
    description: "Chain, brake & gear checks",
  },
  {
    id: "home-appliances",
    name: "Home Appliances",
    description: "Fridge, washer & electronics",
  },
  {
    id: "plumbing",
    name: "Plumbing",
    description: "Leaks, pipes & drain issues",
  },
  {
    id: "electrical",
    name: "Electrical",
    description: "Wiring, lighting & safety",
  },
];

const bicycleMaintenanceCategoryDisplay = {
  name: "Bicycle Maintenance",
  description: "Chain, brake & gear checks",
};

const motorBikeRepairCategoryDisplay = {
  name: "Motor/Bike Repair",
  description: "Performance & part swap",
};

const homeAppliancesCategoryDisplay = {
  name: "Home Appliances",
  description: "Fridge, washer & electronics",
};

const bookingCategoryNameOverrides = {
  babe: bicycleMaintenanceCategoryDisplay,
  baby: bicycleMaintenanceCategoryDisplay,
  bike: motorBikeRepairCategoryDisplay,
  motor: motorBikeRepairCategoryDisplay,
  "motor bike": motorBikeRepairCategoryDisplay,
  motorbike: motorBikeRepairCategoryDisplay,
  "motor-bike": motorBikeRepairCategoryDisplay,
  "bike repair": motorBikeRepairCategoryDisplay,
  "motor repair": motorBikeRepairCategoryDisplay,
  appliance: homeAppliancesCategoryDisplay,
  appliances: homeAppliancesCategoryDisplay,
  electronic: homeAppliancesCategoryDisplay,
  electronics: homeAppliancesCategoryDisplay,
  fridge: homeAppliancesCategoryDisplay,
  washer: homeAppliancesCategoryDisplay,
};

const bookingSteps = [
  { id: "issue", label: "Choose Issue", icon: Search },
  { id: "fixer", label: "Find Fixer", icon: Users },
  { id: "price", label: "Confirm Price", icon: CreditCard },
  { id: "arrival", label: "Fixer Arrival", icon: MapPin },
  { id: "complete", label: "Complete", icon: CheckCircle2 },
];

const urgencyOptions = [
  {
    id: "normal",
    title: "Normal",
    description: "Within a few days. Best for minor fixes.",
    icon: Calendar,
  },
  {
    id: "urgent",
    title: "Urgent",
    description: "Within 24 hours. Needs quick attention.",
    icon: Clock3,
  },
  {
    id: "emergency",
    title: "Emergency",
    description: "ASAP. For critical issues or safety risks.",
    icon: TriangleAlert,
  },
];

const bookingMapMarkerPositions = [
  { top: "24%", left: "72%" },
  { top: "58%", left: "43%" },
  { top: "42%", left: "81%" },
  { top: "73%", left: "60%" },
];

const bookingDistanceLabels = [
  "0.8 miles away",
  "1.2 miles away",
  "1.5 miles away",
  "2.1 miles away",
];

const bookingReviewCounts = [124, 98, 42, 77];
const bookingRatings = [4.9, 4.8, 5.0, 4.7];
const bookingEtaLabels = ["12 min ETA", "18 min ETA", "25 min ETA", "32 min ETA"];

const formatCurrency = (value) => `$${value.toFixed(2)}`;

const bookingReviewFields = [
  { key: "quality", label: "Quality" },
  { key: "speed", label: "Speed" },
  { key: "price", label: "Price" },
  { key: "behavior", label: "Behavior" },
];

const detailedReviewFields = [
  { key: "quality", label: "Quality of Work" },
  { key: "speed", label: "Speed of Service" },
  { key: "price", label: "Price Fairness" },
  { key: "behavior", label: "Professional Behavior" },
];

const initialBookingReviewRatings = {
  quality: 0,
  speed: 0,
  price: 0,
  behavior: 0,
  overall: 0,
};

const initialSettingsProfile = {
  fullName: "Alex Johnson",
  email: "alex.johnson@example.com",
  phone: "+1 (555) 000-0000",
  address: "Phnom Penh, Cambodia",
};

const initialSettingsNotifications = {
  email: true,
  push: true,
  sms: false,
};

const initialSettingsAddresses = [
  {
    id: "home",
    label: "Home",
    line1: "123 Maple Street, Apt 4D",
    line2: "Springfield, IL 62704",
    accentClassName: "from-emerald-50 to-emerald-100 text-emerald-600",
  },
  {
    id: "office",
    label: "Office",
    line1: "808 Business Plaza, Suite 200",
    line2: "Springfield, IL 62701",
    accentClassName: "from-slate-100 to-slate-200 text-slate-500",
  },
];

const initialSettingsPaymentMethods = [
  {
    id: "visa-4242",
    brand: "VISA",
    numberLabel: "•••• •••• •••• 4242",
    expiryLabel: "Expires 12/26",
    isDefault: true,
  },
];

const initialSettingsAddressForm = {
  label: "",
  line1: "",
  line2: "",
  accentClassName: "from-emerald-50 to-emerald-100 text-emerald-600",
};

const initialSettingsPaymentForm = {
  brand: "VISA",
  cardNumber: "",
  expiry: "",
};

const initialSettingsPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const ReviewStars = ({ value = 0, onChange, size = 18 }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((starValue) => {
      const isActive = starValue <= value;

      return (
        <button
          key={starValue}
          type="button"
          onClick={() => onChange(starValue)}
          className="rounded-md p-0.5 text-slate-300 transition-transform hover:scale-110"
          aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
        >
          <Star
            size={size}
            className={isActive ? "text-amber-400" : "text-slate-300"}
            fill={isActive ? "currentColor" : "none"}
          />
        </button>
      );
    })}
  </div>
);

const getBookingAppointmentDate = (urgency) => {
  const appointmentDate = new Date();

  appointmentDate.setHours(
    urgency === "emergency"
      ? appointmentDate.getHours() + 1
      : urgency === "urgent"
        ? appointmentDate.getHours() + 3
        : 14,
    0,
    0,
    0
  );

  return appointmentDate;
};

const getCategoryIcon = (name = "") => {
  const value = name.toLowerCase();

  if (value.includes("car")) return Car;
  if (value.includes("motor") || value.includes("bike")) return Bike;
  if (value.includes("bicycle")) return Bike;
  if (value.includes("home") || value.includes("appliance")) return Home;
  if (value.includes("plumb") || value.includes("water")) return Droplets;
  if (value.includes("elect")) return Zap;

  return Wrench;
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "MF";

const formatHistoryDate = (date) =>
  date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatHistoryTime = (date) =>
  date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const formatHistoryMonth = (date) =>
  date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

const normalizeHistoryDate = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameHistoryDay = (firstDate, secondDate) =>
  normalizeHistoryDate(firstDate).getTime() ===
  normalizeHistoryDate(secondDate).getTime();

const getHistoryCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const calendarDays = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    calendarDays.push(new Date(year, month, day));
  }

  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  return calendarDays;
};

const historyWeekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

const formatFixerTagLabel = (value = "") =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getRelativeHistoryDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

const createReceiptTransactionId = (value = "") => {
  const normalizedValue = String(value).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  return normalizedValue ? `TXN-${normalizedValue}` : "TXN-MRFIXER";
};

const createReceiptBreakdown = (totalAmount = 0) => {
  const safeTotal = Number(totalAmount || 0);
  const subtotalBeforeTax = safeTotal / 1.05;
  const taxAmount = Number((safeTotal - subtotalBeforeTax).toFixed(2));
  const serviceFee = Number((subtotalBeforeTax * 0.72).toFixed(2));
  const materialsFee = Number(Math.max(subtotalBeforeTax - serviceFee, 0).toFixed(2));

  return {
    serviceFee,
    materialsFee,
    taxAmount,
  };
};

const createHistoryEntry = ({
  daysAgo,
  paymentStatusLabel = "Paid",
  paymentMethodLabel = "Card Payment",
  providerImage = "/default-user.png",
  transactionId,
  ...entry
}) => {
  const dateValue = getRelativeHistoryDate(daysAgo);

  return {
    ...entry,
    dateValue: dateValue.toISOString(),
    dateLabel: formatHistoryDate(dateValue),
    createdAtLabel: formatHistoryDate(dateValue),
    createdTimeLabel: formatHistoryTime(dateValue),
    paymentStatusLabel,
    paymentMethodLabel,
    providerImage,
    transactionId: transactionId || createReceiptTransactionId(entry.id),
    ...createReceiptBreakdown(entry.amount),
  };
};

const historyStatusFilters = [
  { id: "all", label: "All Status" },
  { id: "completed", label: "Completed" },
];

const historyAmountFilters = [
  { id: "all", label: "All Amounts" },
  { id: "low", label: "Under $100" },
  { id: "mid", label: "$100 - $200" },
  { id: "high", label: "Above $200" },
];

const historySampleEntries = [
  createHistoryEntry({
    id: "history-1",
    serviceName: "Kitchen Sink Leak",
    category: "Plumbing",
    fixerName: "Marcus Chen",
    amount: 120,
    status: "Completed",
    icon: Wrench,
    serviceIconClassName: "bg-sky-100 text-sky-600",
    fixerAvatarClassName: "bg-slate-900 text-white",
    daysAgo: 5,
  }),
  createHistoryEntry({
    id: "history-2",
    serviceName: "Brake Pad Change",
    category: "Car Repair",
    fixerName: "Sarah W.",
    amount: 245.5,
    status: "Completed",
    icon: Car,
    serviceIconClassName: "bg-orange-100 text-orange-500",
    fixerAvatarClassName: "bg-cyan-500 text-white",
    daysAgo: 14,
  }),
  createHistoryEntry({
    id: "history-3",
    serviceName: "Light Fixture Install",
    category: "Electrical",
    fixerName: "James T.",
    amount: 85,
    status: "Completed",
    icon: Zap,
    serviceIconClassName: "bg-amber-100 text-amber-500",
    fixerAvatarClassName: "bg-teal-500 text-white",
    daysAgo: 27,
  }),
  createHistoryEntry({
    id: "history-4",
    serviceName: "Fridge Maintenance",
    category: "Home Appliances",
    fixerName: "Emily L.",
    amount: 150,
    status: "Completed",
    icon: Home,
    serviceIconClassName: "bg-violet-100 text-violet-500",
    fixerAvatarClassName: "bg-emerald-500 text-white",
    daysAgo: 63,
  }),
];

const historyFixerProfileLibrary = {
  "Marcus Chen": {
    companyName: "The Master Workshop",
    rating: 4.8,
    reviewCount: 89,
    skillLabels: ["PLUMBING", "ELECTRICAL"],
    experienceLabel: "5 Years",
    acceptanceRateLabel: "98%",
    completedJobsLabel: "150+",
    locationLabel: "452 Valencia St, San Francisco, CA 94103",
    etaLabel: "18 min ETA",
    email: "m.chen@masterworkshop.com",
    phone: "+1 (555) 012-3456",
    aboutText:
      "Expert technician specialized in modern home systems. I pride myself on clean work environments and transparent pricing. Every job comes with a 1-year labor warranty.",
    detailedRatings: [
      { label: "Quality of Work", value: 4.8 },
      { label: "Speed of Service", value: 4.2 },
      { label: "Price Fairness", value: 4.5 },
      { label: "Professional Behavior", value: 4.9 },
    ],
    recentReviews: [
      {
        id: "marcus-review-1",
        name: "Sarah Williams",
        rating: 5,
        timeLabel: "2 days ago",
        comment:
          "Marcus was incredibly professional. He fixed my kitchen leak quickly and even checked my other pipes for potential issues.",
      },
      {
        id: "marcus-review-2",
        name: "James Lee",
        rating: 5,
        timeLabel: "Oct 12, 2023",
        comment:
          "Excellent electrical work on our renovation. Very knowledgeable and transparent throughout.",
      },
    ],
  },
  "Sarah W.": {
    companyName: "Swift Auto Care",
    rating: 4.9,
    reviewCount: 74,
    skillLabels: ["CAR REPAIR", "BRAKES"],
    experienceLabel: "6 Years",
    acceptanceRateLabel: "96%",
    completedJobsLabel: "132+",
    locationLabel: "214 Mission St, San Francisco, CA 94105",
    etaLabel: "22 min ETA",
    email: "sarah@swiftautocare.com",
    phone: "+1 (555) 240-1188",
    aboutText:
      "Reliable vehicle repair specialist focused on brake systems, diagnostics, and routine maintenance with honest pricing and fast turnaround.",
    detailedRatings: [
      { label: "Quality of Work", value: 4.9 },
      { label: "Speed of Service", value: 4.6 },
      { label: "Price Fairness", value: 4.5 },
      { label: "Professional Behavior", value: 4.8 },
    ],
    recentReviews: [
      {
        id: "sarah-review-1",
        name: "Kevin D.",
        rating: 5,
        timeLabel: "4 days ago",
        comment:
          "Sarah diagnosed the issue quickly and explained everything clearly before starting the repair.",
      },
      {
        id: "sarah-review-2",
        name: "Olivia P.",
        rating: 5,
        timeLabel: "2 weeks ago",
        comment: "Very efficient and transparent about costs. Great communication throughout.",
      },
    ],
  },
  "James T.": {
    companyName: "BrightLine Electrical",
    rating: 4.7,
    reviewCount: 58,
    skillLabels: ["ELECTRICAL", "INSTALLATION"],
    experienceLabel: "4 Years",
    acceptanceRateLabel: "97%",
    completedJobsLabel: "118+",
    locationLabel: "89 Howard St, San Francisco, CA 94103",
    etaLabel: "20 min ETA",
    email: "james@brightlineelectric.com",
    phone: "+1 (555) 303-4412",
    aboutText:
      "Licensed electrician experienced in light fixture installation, outlet troubleshooting, and safe residential upgrades.",
    detailedRatings: [
      { label: "Quality of Work", value: 4.7 },
      { label: "Speed of Service", value: 4.4 },
      { label: "Price Fairness", value: 4.6 },
      { label: "Professional Behavior", value: 4.8 },
    ],
    recentReviews: [
      {
        id: "james-review-1",
        name: "Jason M.",
        rating: 5,
        timeLabel: "1 week ago",
        comment: "Clean installation, great safety checks, and everything worked perfectly after the visit.",
      },
      {
        id: "james-review-2",
        name: "Nina R.",
        rating: 4,
        timeLabel: "3 weeks ago",
        comment: "Arrived on time and finished the fixture install neatly. Would book again.",
      },
    ],
  },
  "Emily L.": {
    companyName: "FreshHome Appliances",
    rating: 4.8,
    reviewCount: 63,
    skillLabels: ["APPLIANCES", "MAINTENANCE"],
    experienceLabel: "7 Years",
    acceptanceRateLabel: "95%",
    completedJobsLabel: "140+",
    locationLabel: "301 Pine St, San Francisco, CA 94104",
    etaLabel: "24 min ETA",
    email: "emily@freshhomeappliances.com",
    phone: "+1 (555) 820-1144",
    aboutText:
      "Home appliance specialist helping customers keep refrigerators, washers, and small appliances running smoothly.",
    detailedRatings: [
      { label: "Quality of Work", value: 4.8 },
      { label: "Speed of Service", value: 4.5 },
      { label: "Price Fairness", value: 4.4 },
      { label: "Professional Behavior", value: 4.9 },
    ],
    recentReviews: [
      {
        id: "emily-review-1",
        name: "Grace T.",
        rating: 5,
        timeLabel: "5 days ago",
        comment: "Emily was careful, knowledgeable, and fixed the appliance issue much faster than expected.",
      },
      {
        id: "emily-review-2",
        name: "Daniel C.",
        rating: 4,
        timeLabel: "2 weeks ago",
        comment: "Helpful maintenance tips and a very tidy service visit.",
      },
    ],
  },
};

const BookingStepper = ({ activeStep = "issue" }) => {
  const activeIndex = bookingSteps.findIndex((step) => step.id === activeStep);

  return (
    <div className="flex items-start justify-between gap-2 mb-8 overflow-x-auto pb-2">
      {bookingSteps.map((step, index) => {
        const Icon = step.icon;
        const isReached = index <= activeIndex;

        return (
          <div
            key={step.id}
            className="flex items-center flex-1 min-w-[96px] last:flex-none"
          >
            <div className="flex flex-col items-center w-full">
              <div
                className={`w-11 h-11 rounded-full border flex items-center justify-center ${
                  isReached
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white border-slate-200 text-slate-400"
                }`}
              >
                <Icon size={18} />
              </div>

              <span
                className={`mt-3 text-[10px] font-semibold uppercase tracking-wide text-center ${
                  isReached ? "text-primary" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < bookingSteps.length - 1 && (
              <div
                className={`h-px flex-1 mx-3 -mt-6 min-w-6 ${
                  index < activeIndex ? "bg-primary/40" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const BookingCategoryCard = ({ service, selected, onSelect }) => {
  const Icon = getCategoryIcon(service.name);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex min-h-[184px] w-full flex-col items-center justify-center rounded-[18px] border px-6 py-8 text-center transition-all duration-200 ${
        selected
          ? "border-2 border-[#b784ff] bg-[#f4eefc]"
          : "border border-slate-200 bg-white hover:border-[#d7b7ff]"
      }`}
    >
      <div
        className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
          selected
            ? "bg-[#f8fafc] text-[#667085]"
            : "bg-slate-50 text-[#667085] group-hover:text-[#8b5cf6]"
        }`}
      >
        <Icon size={24} strokeWidth={2.2} />
      </div>
      <h3 className="line-clamp-2 min-h-[28px] text-[17px] font-semibold leading-7 text-slate-900 md:text-[18px]">
        {service.name}
      </h3>
      <p className="mt-2 line-clamp-2 max-w-[240px] text-[12px] leading-5 text-[#98a2b3]">
        {service.description}
      </p>
    </button>
  );
};

const UrgencyCard = ({ option, selected, onSelect }) => {
  const Icon = option.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-2xl border p-5 transition-all duration-200 ${
        selected
          ? "border-primary ring-2 ring-primary/20 shadow-[0_10px_24px_rgba(139,92,246,0.12)]"
          : "border-slate-200 hover:border-primary/40"
      }`}
    >
      <Icon
        size={18}
        className={
          option.id === "urgent"
            ? "text-amber-500"
            : option.id === "emergency"
            ? "text-rose-500"
            : "text-slate-400"
        }
      />

      <h4 className="mt-4 text-base font-bold text-slate-900">{option.title}</h4>
      <p className="mt-2 text-xs leading-5 text-slate-400">
        {option.description}
      </p>
    </button>
  );
};

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState("services");
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [problem, setProblem] = useState("");
  const [photos, setPhotos] = useState([]);
  const [urgency, setUrgency] = useState("normal");
  const [bookingError, setBookingError] = useState("");
  const [specialistsSource, setSpecialistsSource] = useState("services");
  const [selectedBookingProviderIndex, setSelectedBookingProviderIndex] =
    useState(null);
  const [bookingRequestProgress, setBookingRequestProgress] = useState(0);
  const [bookingRequestStatus, setBookingRequestStatus] = useState("idle");
  const [hasReviewedAgreement, setHasReviewedAgreement] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookingReviewRatings, setBookingReviewRatings] = useState(
    initialBookingReviewRatings
  );
  const [bookingReviewComment, setBookingReviewComment] = useState("");
  const [bookingReviewSubmitted, setBookingReviewSubmitted] = useState(false);
  const [historyFixerReviewRatings, setHistoryFixerReviewRatings] = useState(
    initialBookingReviewRatings
  );
  const [historyFixerReviewComment, setHistoryFixerReviewComment] = useState("");
  const [historyFixerReviewSubmitted, setHistoryFixerReviewSubmitted] =
    useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(null);
  const [pendingHistoryDate, setPendingHistoryDate] = useState(null);
  const [historyCalendarMonth, setHistoryCalendarMonth] = useState(() =>
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedHistoryStatus, setSelectedHistoryStatus] = useState("all");
  const [selectedHistoryAmountFilter, setSelectedHistoryAmountFilter] =
    useState("all");
  const [selectedHistoryFixerEntry, setSelectedHistoryFixerEntry] = useState(null);
  const [selectedHistoryReceiptEntry, setSelectedHistoryReceiptEntry] = useState(null);
  const [settingsProfile, setSettingsProfile] = useState(initialSettingsProfile);
  const [savedSettingsProfile, setSavedSettingsProfile] = useState(initialSettingsProfile);
  const [settingsNotifications, setSettingsNotifications] = useState(
    initialSettingsNotifications
  );
  const [savedSettingsNotifications, setSavedSettingsNotifications] = useState(
    initialSettingsNotifications
  );
  const [settingsAddresses, setSettingsAddresses] = useState(initialSettingsAddresses);
  const [savedSettingsAddresses, setSavedSettingsAddresses] = useState(
    initialSettingsAddresses
  );
  const [settingsPaymentMethods, setSettingsPaymentMethods] = useState(
    initialSettingsPaymentMethods
  );
  const [savedSettingsPaymentMethods, setSavedSettingsPaymentMethods] = useState(
    initialSettingsPaymentMethods
  );
  const [settingsAvatarUrl, setSettingsAvatarUrl] = useState("");
  const [savedSettingsAvatarUrl, setSavedSettingsAvatarUrl] = useState("");
  const [isSettingsAddressFormOpen, setIsSettingsAddressFormOpen] = useState(false);
  const [editingSettingsAddressId, setEditingSettingsAddressId] = useState(null);
  const [settingsAddressForm, setSettingsAddressForm] = useState(
    initialSettingsAddressForm
  );
  const [isSettingsPaymentFormOpen, setIsSettingsPaymentFormOpen] = useState(false);
  const [settingsPaymentForm, setSettingsPaymentForm] = useState(
    initialSettingsPaymentForm
  );
  const [isSettingsPasswordFormOpen, setIsSettingsPasswordFormOpen] = useState(false);
  const [settingsPasswordForm, setSettingsPasswordForm] = useState(
    initialSettingsPasswordForm
  );
  const [settingsPasswordChangedLabel, setSettingsPasswordChangedLabel] = useState(
    "Last changed 3 months ago"
  );
  const [settingsFeedbackMessage, setSettingsFeedbackMessage] = useState("");
  const [hasHydratedSettings, setHasHydratedSettings] = useState(false);
  const [isHistoryDateMenuOpen, setIsHistoryDateMenuOpen] = useState(false);
  const [isHistoryFilterMenuOpen, setIsHistoryFilterMenuOpen] = useState(false);
  const settingsAvatarInputRef = useRef(null);
  const historyDateMenuRef = useRef(null);
  const historyFilterMenuRef = useRef(null);
  const todayHistoryDate = useMemo(() => normalizeHistoryDate(new Date()), []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        historyDateMenuRef.current &&
        !historyDateMenuRef.current.contains(event.target)
      ) {
        setIsHistoryDateMenuOpen(false);
      }

      if (
        historyFilterMenuRef.current &&
        !historyFilterMenuRef.current.contains(event.target)
      ) {
        setIsHistoryFilterMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (currentPage !== "settings" || hasHydratedSettings) {
      return;
    }

    let isMounted = true;

    httpClient
      .get("/users/currentUser")
      .then((res) => {
        if (!isMounted || !res?.data) {
          return;
        }

        const nextProfile = {
          fullName: res.data.full_name || initialSettingsProfile.fullName,
          email: res.data.email || initialSettingsProfile.email,
          phone: res.data.phone || initialSettingsProfile.phone,
          address: res.data.address || initialSettingsProfile.address,
        };
        const nextAvatarUrl = res.data.profile_img || "";

        setSettingsProfile(nextProfile);
        setSavedSettingsProfile(nextProfile);
        setSettingsAvatarUrl(nextAvatarUrl);
        setSavedSettingsAvatarUrl(nextAvatarUrl);
      })
      .catch((err) => {
        console.error("Failed to load settings profile", err);
      })
      .finally(() => {
        if (isMounted) {
          setHasHydratedSettings(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, hasHydratedSettings]);

  useEffect(() => {
    if (currentPage !== "bookings" || !activeBooking || activeBooking.stage !== "arrival") {
      return;
    }

    const fixingTimeoutId = window.setTimeout(() => {
      setActiveBooking((currentBooking) => {
        if (!currentBooking || currentBooking.stage !== "arrival") {
          return currentBooking;
        }

        return {
          ...currentBooking,
          stage: "fixing",
          statusLabel: "Fixer Arrived",
          arrivalMinutes: 0,
          distanceLabel: "Fixer is on site",
          startedFixingAtLabel: new Date().toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        };
      });
    }, 4000);

    return () => window.clearTimeout(fixingTimeoutId);
  }, [currentPage, activeBooking?.stage]);

  useEffect(() => {
    if (currentPage !== "bookings" || !activeBooking || activeBooking.stage !== "fixing") {
      return;
    }

    const completedTimeoutId = window.setTimeout(() => {
      setActiveBooking((currentBooking) => {
        if (!currentBooking || currentBooking.stage !== "fixing") {
          return currentBooking;
        }

        return {
          ...currentBooking,
          stage: "complete",
          statusLabel: "Service Completed",
          completedAtLabel: new Date().toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          paymentStatusLabel: "Paid",
        };
      });
    }, 1000);

    return () => window.clearTimeout(completedTimeoutId);
  }, [currentPage, activeBooking?.stage]);

  // --- Load service categories ---
  useEffect(() => {
    setLoading(true);
    httpClient
      .get("/users/allCategories")
      .then((res) => {
        setServices(res.data || []);
      })
      .catch((err) => {
        console.error(err);
        setServices([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const bookingCategories = useMemo(() => {
    const source = services.length > 0 ? services.slice(0, 6) : bookingFallbackCategories;

    const normalizedCategories = source.map((service, index) => {
      const fallbackCategory = bookingFallbackCategories[index] || {};
      const rawName =
        service.name ?? fallbackCategory.name ?? `Service ${index + 1}`;
      const override = bookingCategoryNameOverrides[rawName.trim().toLowerCase()];

      return {
        id: service.id ?? fallbackCategory.id ?? `booking-${index}`,
        name: override?.name ?? rawName,
        description:
          override?.description ??
          service.description ??
          fallbackCategory.description ??
          "Repair and maintenance support",
      };
    });

    const hasMotorBikeRepair = normalizedCategories.some((category) => {
      const normalizedName = category.name?.trim().toLowerCase();
      const normalizedId = String(category.id ?? "").trim().toLowerCase();

      return (
        normalizedName === "motor/bike repair" ||
        normalizedId === "motor-bike-repair"
      );
    });

    const hasHomeAppliances = normalizedCategories.some((category) => {
      const normalizedName = category.name?.trim().toLowerCase();
      const normalizedId = String(category.id ?? "").trim().toLowerCase();

      return (
        normalizedName === "home appliances" ||
        normalizedId === "home-appliances"
      );
    });

    if (hasMotorBikeRepair && hasHomeAppliances) {
      return normalizedCategories;
    }

    const additionalCategories = [];

    if (!hasMotorBikeRepair) {
      additionalCategories.push({
        id: "motor-bike-repair",
        ...motorBikeRepairCategoryDisplay,
      });
    }

    if (!hasHomeAppliances) {
      additionalCategories.push({
        id: "home-appliances",
        ...homeAppliancesCategoryDisplay,
      });
    }

    return [...normalizedCategories, ...additionalCategories];
  }, [services]);

  const selectedCategory =
    bookingCategories.find((category) => category.id === selectedCategoryId) ||
    null;

  const bookingNearbyProviders = useMemo(
    () =>
      providers.map((provider, index) => ({
        ...provider,
        distanceLabel:
          bookingDistanceLabels[index] ?? `${(index + 2) * 0.6} miles away`,
        reviewCount: bookingReviewCounts[index] ?? 30 + index * 11,
        rating: bookingRatings[index] ?? 4.8,
        etaLabel: bookingEtaLabels[index] ?? `${12 + index * 6} min ETA`,
        markerPosition:
          bookingMapMarkerPositions[index] ?? bookingMapMarkerPositions[0],
      })),
    [providers]
  );

  const selectedBookingProvider =
    selectedBookingProviderIndex === null
      ? null
      : bookingNearbyProviders[selectedBookingProviderIndex] || null;

  const selectedBookingEstimate = useMemo(() => {
    if (!selectedBookingProvider) {
      return null;
    }

    const providerIndex = selectedBookingProviderIndex ?? 0;
    const baseFee = 45 + providerIndex * 5;
    const distanceFee = 12.5 + providerIndex * 1.5;
    const urgencyFee =
      urgency === "emergency" ? 18 : urgency === "urgent" ? 11 : 0;

    return {
      baseFee,
      distanceFee,
      urgencyFee,
      total: baseFee + distanceFee + urgencyFee,
    };
  }, [selectedBookingProvider, selectedBookingProviderIndex, urgency]);

  const bookingMapQuery = useMemo(() => {
    if (bookingNearbyProviders[0]?.location) {
      return bookingNearbyProviders[0].location;
    }

    if (selectedCategory?.name) {
      return `${selectedCategory.name} repair near me`;
    }

    return "Phnom Penh Cambodia";
  }, [bookingNearbyProviders, selectedCategory]);

  const selectedBookingProviderProfile = useMemo(() => {
    if (!selectedBookingProvider) {
      return null;
    }

    const providerIndex = selectedBookingProviderIndex ?? 0;
    const firstName = selectedBookingProvider.full_name?.split(" ")?.[0] || "Fixer";
    const serviceLabel = selectedCategory?.name || "General Repair";
    const companyName =
      selectedBookingProvider.company_name || `${serviceLabel} Workshop`;
    const baseRating = Number(selectedBookingProvider.rating || 4.8);

    return {
      companyName,
      firstName,
      aboutText: `${firstName} is a trusted ${serviceLabel.toLowerCase()} specialist known for clean work, on-time arrival, and clear communication. Every visit is handled carefully with transparent pricing and dependable after-service support.`,
      skillLabels: [
        serviceLabel.toUpperCase(),
        formatFixerTagLabel(urgency).toUpperCase(),
        "VERIFIED",
      ],
      experienceLabel: `${5 + providerIndex} Years`,
      acceptanceRateLabel: `${Math.max(93, 98 - providerIndex)}%`,
      completedJobsLabel: `${150 + providerIndex * 18}+`,
      detailedRatings: [
        {
          label: "Quality of Work",
          value: Number(Math.min(baseRating + 0.1, 5).toFixed(1)),
        },
        {
          label: "Speed of Service",
          value: Number(Math.max(baseRating - 0.3, 4.1).toFixed(1)),
        },
        {
          label: "Price Fairness",
          value: Number(Math.max(baseRating - 0.1, 4.2).toFixed(1)),
        },
        {
          label: "Professional Behavior",
          value: Number(Math.min(baseRating + 0.2, 5).toFixed(1)),
        },
      ],
      recentReviews: [
        {
          id: "review-1",
          name: "Sarah Williams",
          rating: 5,
          timeLabel: "2 days ago",
          comment: `${firstName} was incredibly professional. The ${serviceLabel.toLowerCase()} issue was checked carefully and fixed on the first visit.`,
        },
        {
          id: "review-2",
          name: "James Lee",
          rating: 5,
          timeLabel: "1 week ago",
          comment:
            "Excellent communication, transparent pricing, and very knowledgeable from start to finish.",
        },
        {
          id: "review-3",
          name: "Jason M.",
          rating: 4,
          timeLabel: "2 weeks ago",
          comment: `Arrived on time and completed the work neatly. I would happily book ${firstName} again.`,
        },
      ],
      locationLabel:
        selectedBookingProvider.location || bookingMapQuery || "Phnom Penh Cambodia",
    };
  }, [
    bookingMapQuery,
    selectedBookingProvider,
    selectedBookingProviderIndex,
    selectedCategory,
    urgency,
  ]);

  const selectedHistoryFixerProfile = useMemo(() => {
    if (!selectedHistoryFixerEntry) {
      return null;
    }

    const libraryProfile =
      historyFixerProfileLibrary[selectedHistoryFixerEntry.fixerName] || {};
    const firstName =
      selectedHistoryFixerEntry.fixerName?.split(" ")?.[0] || "Fixer";
    const baseReviewCount = Number(libraryProfile.reviewCount || 0);
    const baseRating = Number(libraryProfile.rating || 0);
    const reviewCount = historyFixerReviewSubmitted ? baseReviewCount + 1 : baseReviewCount;
    const rating = historyFixerReviewSubmitted
      ? Number(
          (
            ((baseRating || 0) * baseReviewCount + historyFixerReviewRatings.overall) /
            Math.max(baseReviewCount + 1, 1)
          ).toFixed(1)
        )
      : baseRating;
    const detailedRatings = detailedReviewFields.map((field) => ({
      label: field.label,
      value: historyFixerReviewSubmitted
        ? Number(
            (
              ((Number(
                libraryProfile.detailedRatings?.find((item) => item.label === field.label)?.value || 0
              ) || 0) * baseReviewCount + Number(historyFixerReviewRatings[field.key] || 0)) /
              Math.max(baseReviewCount + 1, 1)
            ).toFixed(1)
          )
        : Number(
            libraryProfile.detailedRatings?.find((item) => item.label === field.label)?.value || 0
          ),
    }));
    const recentReviews = historyFixerReviewSubmitted
      ? [
          {
            id: `${selectedHistoryFixerEntry.id}-history-review`,
            name: "You",
            rating: historyFixerReviewRatings.overall,
            timeLabel: "Just now",
            comment: historyFixerReviewComment.trim(),
          },
          ...(libraryProfile.recentReviews || []),
        ]
      : libraryProfile.recentReviews || [];

    return {
      source: "history",
      backPage: "history",
      subtitle: "Review fixer details from your completed service history.",
      summaryLabel: selectedHistoryFixerEntry.category,
      estimateTitle: "Service Total",
      estimateTotal: selectedHistoryFixerEntry.amount,
      estimateSubtitle: `Completed ${selectedHistoryFixerEntry.dateLabel}`,
      imageSrc: "/default-user.png",
      name: selectedHistoryFixerEntry.fixerName,
      rating,
      reviewCount,
      companyName:
        libraryProfile.companyName ||
        `${selectedHistoryFixerEntry.category} Experts`,
      skillLabels: libraryProfile.skillLabels || [
        selectedHistoryFixerEntry.category.toUpperCase(),
        "VERIFIED",
      ],
      experienceLabel: libraryProfile.experienceLabel || "5 Years",
      acceptanceRateLabel: libraryProfile.acceptanceRateLabel || "96%",
      completedJobsLabel: libraryProfile.completedJobsLabel || "120+",
      locationLabel: libraryProfile.locationLabel || "Phnom Penh Cambodia",
      etaLabel: libraryProfile.etaLabel || "Completed service",
      firstName,
      aboutText:
        libraryProfile.aboutText ||
        `${firstName} is a trusted ${selectedHistoryFixerEntry.category.toLowerCase()} specialist known for dependable service, clear communication, and professional workmanship.`,
      email: libraryProfile.email || "support@mrfixer.com",
      phone: libraryProfile.phone || "+1 (555) 012-3456",
      detailedRatings,
      recentReviews,
      actionLabel: "Completed Service",
      actionDisabled: true,
    };
  }, [
    historyFixerReviewComment,
    historyFixerReviewRatings,
    historyFixerReviewSubmitted,
    selectedHistoryFixerEntry,
  ]);

  const activeFixerProfile = useMemo(() => {
    if (selectedHistoryFixerProfile) {
      return selectedHistoryFixerProfile;
    }

    if (
      !selectedBookingProvider ||
      !selectedBookingEstimate ||
      !selectedBookingProviderProfile
    ) {
      return null;
    }

    return {
      source: "booking",
      backPage: "specialists",
      subtitle: "Review expert details before booking your service.",
      summaryLabel: selectedBookingProvider.distanceLabel,
      estimateTitle: "Estimated Total",
      estimateTotal: selectedBookingEstimate.total,
      estimateSubtitle: selectedBookingProvider.etaLabel,
      imageSrc: selectedBookingProvider.profile_img || "/default-user.png",
      name: selectedBookingProvider.full_name,
      rating: selectedBookingProvider.rating,
      reviewCount: selectedBookingProvider.reviewCount,
      companyName: selectedBookingProviderProfile.companyName,
      skillLabels: selectedBookingProviderProfile.skillLabels,
      experienceLabel: selectedBookingProviderProfile.experienceLabel,
      acceptanceRateLabel: selectedBookingProviderProfile.acceptanceRateLabel,
      completedJobsLabel: selectedBookingProviderProfile.completedJobsLabel,
      locationLabel: selectedBookingProviderProfile.locationLabel,
      etaLabel: selectedBookingProvider.etaLabel,
      firstName: selectedBookingProviderProfile.firstName,
      aboutText: selectedBookingProviderProfile.aboutText,
      email: selectedBookingProvider.email || "support@mrfixer.com",
      phone: selectedBookingProvider.phone || "+1 (555) 012-3456",
      detailedRatings: selectedBookingProviderProfile.detailedRatings,
      recentReviews: selectedBookingProviderProfile.recentReviews,
      actionLabel: "Book Service",
      actionDisabled: false,
    };
  }, [
    selectedBookingEstimate,
    selectedBookingProvider,
    selectedBookingProviderProfile,
    selectedHistoryFixerProfile,
  ]);

  const historyEntries = useMemo(() => {
    if (!activeBooking || activeBooking.stage !== "complete") {
      return historySampleEntries;
    }

    const fallbackReceiptBreakdown = createReceiptBreakdown(activeBooking.total);

    return [
      {
        id: activeBooking.serviceId,
        serviceName: activeBooking.serviceName,
        category: activeBooking.providerCompanyName || "Recent booking",
        dateValue: activeBooking.historyDateValue || new Date().toISOString(),
        dateLabel: activeBooking.appointmentDateLabel || activeBooking.createdAtLabel,
        fixerName: activeBooking.providerName,
        amount: activeBooking.total,
        status: "Completed",
        icon: getCategoryIcon(activeBooking.serviceName),
        serviceIconClassName: "bg-emerald-100 text-emerald-600",
        fixerAvatarClassName: "bg-primary text-white",
        createdAtLabel: activeBooking.createdAtLabel,
        createdTimeLabel: activeBooking.createdTimeLabel,
        paymentStatusLabel: activeBooking.paymentStatusLabel || "Paid",
        paymentMethodLabel: activeBooking.paymentMethodLabel || "Card Payment",
        transactionId:
          activeBooking.transactionId || createReceiptTransactionId(activeBooking.serviceId),
        providerImage: activeBooking.providerImage || "/default-user.png",
        serviceFee: activeBooking.serviceFee ?? fallbackReceiptBreakdown.serviceFee,
        materialsFee: activeBooking.materialsFee ?? fallbackReceiptBreakdown.materialsFee,
        taxAmount: activeBooking.taxAmount ?? fallbackReceiptBreakdown.taxAmount,
      },
      ...historySampleEntries,
    ];
  }, [activeBooking]);

  const activeHistoryPanelFilterCount =
    (selectedHistoryStatus !== "all" ? 1 : 0) +
    (selectedHistoryAmountFilter !== "all" ? 1 : 0);

  const totalActiveHistoryFilterCount =
    activeHistoryPanelFilterCount + (selectedHistoryDate ? 1 : 0);

  const historyCalendarDays = useMemo(
    () => getHistoryCalendarDays(historyCalendarMonth),
    [historyCalendarMonth]
  );

  const filteredHistoryEntries = useMemo(() => {
    const normalizedSearch = historySearchTerm.trim().toLowerCase();
    let nextEntries = historyEntries;

    if (selectedHistoryDate) {
      nextEntries = nextEntries.filter((entry) => {
        const entryDate = new Date(entry.dateValue);
        return (
          !Number.isNaN(entryDate.getTime()) &&
          isSameHistoryDay(entryDate, selectedHistoryDate)
        );
      });
    }

    if (selectedHistoryStatus !== "all") {
      nextEntries = nextEntries.filter(
        (entry) => entry.status.toLowerCase() === selectedHistoryStatus
      );
    }

    if (selectedHistoryAmountFilter === "low") {
      nextEntries = nextEntries.filter((entry) => entry.amount < 100);
    }

    if (selectedHistoryAmountFilter === "mid") {
      nextEntries = nextEntries.filter(
        (entry) => entry.amount >= 100 && entry.amount <= 200
      );
    }

    if (selectedHistoryAmountFilter === "high") {
      nextEntries = nextEntries.filter((entry) => entry.amount > 200);
    }

    if (!normalizedSearch) {
      return nextEntries;
    }

    return nextEntries.filter((entry) =>
      [entry.serviceName, entry.category, entry.fixerName, entry.status].some((value) =>
        value.toLowerCase().includes(normalizedSearch)
      )
    );
  }, [
    historyEntries,
    historySearchTerm,
    selectedHistoryDate,
    selectedHistoryStatus,
    selectedHistoryAmountFilter,
  ]);

  const bookingRequestLocationLabel = useMemo(() => {
    const locationSource = selectedBookingProvider?.location || bookingMapQuery;
    return locationSource?.split(",")?.[0]?.trim() || "Phnom Penh";
  }, [selectedBookingProvider, bookingMapQuery]);

  useEffect(() => {
    if (
      selectedCategoryId &&
      !bookingCategories.some((category) => category.id === selectedCategoryId)
    ) {
      setSelectedCategoryId(null);
    }
  }, [bookingCategories, selectedCategoryId]);

  useEffect(() => {
    if (specialistsSource !== "bookings") {
      setSelectedBookingProviderIndex(null);
      return;
    }

    setSelectedBookingProviderIndex(null);
  }, [providers, specialistsSource]);

  useEffect(() => {
    if (currentPage !== "booking-confirmation") {
      setBookingRequestProgress(0);
      setBookingRequestStatus("idle");
      return;
    }

    setBookingRequestProgress(0);
    setBookingRequestStatus("connecting");

    let intervalId;
    let successTimeoutId;

    const startTimeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setBookingRequestProgress((currentProgress) => {
          const nextProgress = Math.min(currentProgress + 10, 100);

          if (nextProgress >= 100) {
            window.clearInterval(intervalId);
            successTimeoutId = window.setTimeout(() => {
              setBookingRequestStatus("success");
            }, 120);
          }

          return nextProgress;
        });
      }, 100);
    }, 120);

    return () => {
      window.clearTimeout(startTimeoutId);
      window.clearInterval(intervalId);
      window.clearTimeout(successTimeoutId);
    };
  }, [currentPage]);

  useEffect(() => {
    if (
      currentPage !== "booking-confirmation" ||
      bookingRequestStatus !== "success"
    ) {
      return;
    }

    const autoOpenAgreementTimeoutId = window.setTimeout(() => {
      setCurrentPage("booking-agreement");
    }, 1000);

    return () => window.clearTimeout(autoOpenAgreementTimeoutId);
  }, [currentPage, bookingRequestStatus]);

  useEffect(() => {
    if (currentPage === "booking-agreement") {
      setHasReviewedAgreement(false);
    }
  }, [currentPage, selectedBookingProviderIndex]);

  const photoPreviews = useMemo(
    () =>
      photos.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    [photos]
  );

  useEffect(() => {
    return () => {
      photoPreviews.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, [photoPreviews]);

  // --- Load providers by category ---
  const getProvidersByCategory = async (categoryId, source = "services") => {
    setSpecialistsSource(source);

    try {
      const res = await httpClient.get(
        `/users/providersEachCategory/${categoryId}`
      );

      setProviders(res.data || []);
      setCurrentPage("specialists");
    } catch (err) {
      console.error("Failed to load providers", err);
      setProviders([]);
      setCurrentPage("specialists");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    if (httpClient && httpClient.defaults?.headers) {
      delete httpClient.defaults.headers.common?.["Authorization"];
    }

    navigate("/");
  };

  const handlePhotoChange = (event) => {
    setPhotos(Array.from(event.target.files || []).slice(0, 3));
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setBookingError("");
  };

  const handleNextStep = () => {
    if (!selectedCategoryId || !selectedCategory) {
      setBookingError("Please choose a category before finding an expert.");
      return;
    }

    setBookingError("");
    getProvidersByCategory(selectedCategory.id, "bookings");
  };

  const handleOpenFixerProfile = (providerIndex) => {
    setSelectedHistoryFixerEntry(null);
    setSelectedBookingProviderIndex(providerIndex);
    setBookingRequestProgress(0);
    setBookingRequestStatus("idle");
    setCurrentPage("fixer-profile");
  };

  const handleOpenHistoryFixerProfile = (entry) => {
    const isSameEntry = selectedHistoryFixerEntry?.id === entry.id;

    setSelectedHistoryFixerEntry(entry);
    setSelectedBookingProviderIndex(null);
    if (!isSameEntry) {
      setHistoryFixerReviewRatings(initialBookingReviewRatings);
      setHistoryFixerReviewComment("");
      setHistoryFixerReviewSubmitted(false);
    }
    setBookingRequestProgress(0);
    setBookingRequestStatus("idle");
    setCurrentPage("fixer-profile");
  };

  const handleOpenHistoryServiceReview = (entry) => {
    const isSameEntry = selectedHistoryFixerEntry?.id === entry.id;

    setSelectedHistoryFixerEntry(entry);
    setSelectedBookingProviderIndex(null);
    if (!isSameEntry) {
      setHistoryFixerReviewRatings(initialBookingReviewRatings);
      setHistoryFixerReviewComment("");
      setHistoryFixerReviewSubmitted(false);
    }
    setBookingRequestProgress(0);
    setBookingRequestStatus("idle");
    setCurrentPage("history-review");
  };

  const handleOpenHistoryReceipt = (entry) => {
    setSelectedHistoryReceiptEntry(entry);
    setSelectedBookingProviderIndex(null);
    setBookingRequestProgress(0);
    setBookingRequestStatus("idle");
    setCurrentPage("history-receipt");
  };

  const handleBookSelectedProvider = () => {
    if (!selectedBookingProvider || !selectedBookingEstimate) {
      return;
    }

    setBookingRequestProgress(0);
    setBookingRequestStatus("idle");
    setCurrentPage("booking-confirmation");
  };

  const handleConfirmBooking = () => {
    if (!selectedBookingProvider || !selectedBookingEstimate) {
      return;
    }

    const appointmentDate = getBookingAppointmentDate(urgency);
    const bookingCreatedAt = new Date();
    const arrivalMinutes = parseInt(selectedBookingProvider.etaLabel, 10) || 12;
    const serviceId = `#HF-${String(Date.now()).slice(-4)}`;
    const subtotalBeforeTax = selectedBookingEstimate.total / 1.05;
    const taxAmount = Number(
      (selectedBookingEstimate.total - subtotalBeforeTax).toFixed(2)
    );
    const serviceFee = Number(selectedBookingEstimate.baseFee.toFixed(2));
    const materialsFee = Number(
      Math.max(subtotalBeforeTax - serviceFee, 0).toFixed(2)
    );

    setHasReviewedAgreement(true);
    setBookingReviewRatings(initialBookingReviewRatings);
    setBookingReviewComment("");
    setBookingReviewSubmitted(false);
    setActiveBooking({
      serviceId,
      stage: "arrival",
      serviceName: selectedCategory?.name || "General Repair",
      providerName: selectedBookingProvider.full_name,
      providerCompanyName:
        selectedBookingProvider.company_name ||
        `${selectedCategory?.name || "Repair"} Workshop`,
      providerImage: selectedBookingProvider.profile_img || "/default-user.png",
      providerPhone: selectedBookingProvider.phone || "",
      providerEmail: selectedBookingProvider.email || "",
      providerRating: selectedBookingProvider.rating,
      reviewCount: selectedBookingProvider.reviewCount ?? 0,
      statusLabel: "Fixer En Route",
      etaLabel: selectedBookingProvider.etaLabel,
      arrivalMinutes,
      distanceLabel: selectedBookingProvider.distanceLabel || "2.4 miles left",
      startedFixingAtLabel: null,
      completedAtLabel: null,
      paymentStatusLabel: "Pending",
      serviceFee,
      materialsFee,
      taxAmount,
      total: selectedBookingEstimate.total,
      issueSummary:
        problem.trim() || "Your service request has been confirmed and is being tracked.",
      location:
        selectedBookingProvider.location || bookingMapQuery || "Phnom Penh Cambodia",
      createdAtLabel: bookingCreatedAt.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      historyDateValue: bookingCreatedAt.toISOString(),
      createdTimeLabel: bookingCreatedAt.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      appointmentDateLabel: appointmentDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      appointmentTimeLabel: appointmentDate.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    });
    setCurrentPage("bookings");
  };

  const handleBookingReviewRatingChange = (field, value) => {
    setBookingReviewSubmitted(false);
    setBookingReviewRatings((currentRatings) => ({
      ...currentRatings,
      [field]: value,
    }));
  };

  const handleSubmitBookingReview = () => {
    if (!activeBooking || activeBooking.stage !== "complete" || bookingReviewRatings.overall === 0) {
      return;
    }

    setBookingReviewSubmitted(true);
  };

  const handleHistoryFixerReviewRatingChange = (field, value) => {
    setHistoryFixerReviewSubmitted(false);
    setHistoryFixerReviewRatings((currentRatings) => ({
      ...currentRatings,
      [field]: value,
    }));
  };

  const handleSubmitHistoryFixerReview = () => {
    if (!selectedHistoryFixerEntry || historyFixerReviewRatings.overall === 0) {
      return;
    }

    setHistoryFixerReviewSubmitted(true);
  };

  const renderHistoryReviewPage = () => {
    if (!selectedHistoryFixerEntry) {
      return renderHistoryPage();
    }

    const libraryProfile =
      historyFixerProfileLibrary[selectedHistoryFixerEntry.fixerName] || {};

    if (historyFixerReviewSubmitted) {
      return (
        <motion.div
          key="history-review-success"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-4xl"
        >
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="w-full rounded-[28px] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm md:px-10 md:py-20">
              <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-primary shadow-[0_20px_50px_-20px_rgba(124,58,237,0.7)] ring-4 ring-violet-100">
                <CheckCircle2 size={48} className="text-white" strokeWidth={2.6} />
                <div className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-white ring-4 ring-white">
                  <Star size={16} fill="currentColor" />
                </div>
              </div>

              <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                Thank You for Your Feedback!
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-500">
                Your review for {" "}
                <span className="font-semibold text-primary">
                  {selectedHistoryFixerEntry.fixerName}
                </span>{" "}
                has been shared with the community. It helps others find great
                fixers like them.
              </p>

              <button
                type="button"
                onClick={() => setCurrentPage("history")}
                className="mt-10 inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/35 bg-white px-7 py-3.5 text-sm font-bold text-primary transition hover:bg-primary-light/40"
              >
                <Clock3 size={16} />
                Go to History
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="history-review"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -18 }}
        transition={{ duration: 0.25 }}
        className="mx-auto max-w-4xl"
      >
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setCurrentPage("history")}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-primary hover:text-primary"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Rate Service</h1>
            <p className="mt-1 text-sm text-slate-500 md:text-base">
              Share your experience and leave a comment for this completed service.
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  {selectedHistoryFixerEntry.serviceName}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span>Completed on {selectedHistoryFixerEntry.dateLabel}</span>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 md:block" />
                  <span>Order ID: #{selectedHistoryFixerEntry.id}</span>
                </div>
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-white p-4 md:min-w-[240px]">
                <div className="flex items-center gap-3">
                  <img
                    src="/default-user.png"
                    alt={selectedHistoryFixerEntry.fixerName}
                    className="h-14 w-14 rounded-full border border-slate-200 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                      Your Fixer
                    </p>
                    <p className="truncate text-xl font-bold leading-tight text-slate-900">
                      {selectedHistoryFixerEntry.fixerName}
                    </p>
                    <p className="mt-1 text-sm font-medium text-emerald-600">
                      {libraryProfile.companyName || `${selectedHistoryFixerEntry.category} Expert`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-3xl font-bold text-slate-900">Rating</h3>

            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Detail Rating
              </p>

              <div className="mt-4 space-y-4">
                {bookingReviewFields.map((field) => (
                  <div
                    key={field.key}
                    className="flex flex-col gap-3 border-b border-slate-100 pb-4 last:border-b-0 md:flex-row md:items-center md:justify-between"
                  >
                    <span className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                      {field.label}
                    </span>
                    <ReviewStars
                      value={historyFixerReviewRatings[field.key]}
                      onChange={(value) => handleHistoryFixerReviewRatingChange(field.key, value)}
                      size={22}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <p className="text-base font-bold text-slate-900">Overall Feedback:</p>
              <div className="mt-3">
                <ReviewStars
                  value={historyFixerReviewRatings.overall}
                  onChange={(value) => handleHistoryFixerReviewRatingChange("overall", value)}
                  size={24}
                />
              </div>

              <textarea
                value={historyFixerReviewComment}
                onChange={(event) => {
                  setHistoryFixerReviewSubmitted(false);
                  setHistoryFixerReviewComment(event.target.value);
                }}
                rows={5}
                placeholder={`Share your general experience working with ${selectedHistoryFixerEntry.fixerName}...`}
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:bg-white"
              />

              <button
                type="button"
                onClick={handleSubmitHistoryFixerReview}
                disabled={historyFixerReviewRatings.overall === 0 || historyFixerReviewSubmitted}
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {historyFixerReviewSubmitted ? "Submitted" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderHistoryReceiptPage = () => {
    if (!selectedHistoryReceiptEntry) {
      return renderHistoryPage();
    }

    const receiptDate = new Date(
      selectedHistoryReceiptEntry.dateValue || selectedHistoryReceiptEntry.createdAtLabel || Date.now()
    );
    const receiptFileId = String(selectedHistoryReceiptEntry.id || "FIX-882931").replace(/^#/, "");
    const receiptFileName = `Invoice_${receiptFileId}.pdf`;
    const receiptTitle = `Receipt #${receiptFileId}`;
    const displayDateLabel = receiptDate.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const displayTimeLabel =
      selectedHistoryReceiptEntry.createdTimeLabel ||
      receiptDate.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    const paymentMethodLabel =
      selectedHistoryReceiptEntry.paymentMethodLabel === "Card Payment"
        ? "Visa ending in 1234"
        : selectedHistoryReceiptEntry.paymentMethodLabel || "Visa ending in 1234";
    const transactionId =
      selectedHistoryReceiptEntry.transactionId ||
      createReceiptTransactionId(selectedHistoryReceiptEntry.id);
    const subtotalAmount = Number(
      (selectedHistoryReceiptEntry.amount - selectedHistoryReceiptEntry.taxAmount).toFixed(2)
    );
    const laborAmount = Number((selectedHistoryReceiptEntry.serviceFee * 0.82).toFixed(2));
    const supportFeeAmount = Number(
      Math.max(selectedHistoryReceiptEntry.serviceFee - laborAmount, 0).toFixed(2)
    );
    const billedToName = selectedHistoryReceiptEntry.customerName || "Mr. Fixer Customer";
    const billedToAddressLine1 =
      selectedHistoryReceiptEntry.billingAddressLine1 || "Phnom Penh Service Area";
    const billedToAddressLine2 = selectedHistoryReceiptEntry.billingAddressLine2 || "Cambodia";
    const billedToEmail = selectedHistoryReceiptEntry.customerEmail || "customer@mrfixer.com";
    const receiptItems = [
      {
        title: `Standard ${selectedHistoryReceiptEntry.serviceName} Service`,
        description: `Professional labor for your ${selectedHistoryReceiptEntry.category.toLowerCase()} request.`,
        amount: laborAmount,
      },
      {
        title: "Parts & Materials",
        description: "Replacement parts, materials, and tools used during the service.",
        amount: selectedHistoryReceiptEntry.materialsFee,
      },
      {
        title: "Service Coverage Fee",
        description: "Booking coordination, travel support, and service processing.",
        amount: supportFeeAmount,
      },
    ];

    return (
      <motion.div
        key="history-receipt"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -18 }}
        transition={{ duration: 0.25 }}
        className="-m-8 min-h-screen bg-[#f4f2f7]"
      >
        <div className="border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <button
                type="button"
                onClick={() => setCurrentPage("history")}
                className="inline-flex items-center gap-2 font-medium transition hover:text-slate-900"
              >
                <ArrowLeft size={16} />
                Close
              </button>
              <span className="hidden h-5 w-px bg-slate-200 md:block" />
              <span className="truncate font-semibold text-slate-900">{receiptFileName}</span>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
                <button type="button" className="h-7 w-7 rounded-lg text-base font-semibold transition hover:bg-white">
                  -
                </button>
                <span className="min-w-[52px] text-center font-semibold text-slate-900">100%</span>
                <button type="button" className="h-7 w-7 rounded-lg text-base font-semibold transition hover:bg-white">
                  +
                </button>
                <span className="mx-1 hidden h-4 w-px bg-slate-300 md:block" />
                <span className="font-medium">Page 1 / 1</span>
              </div>

              <button
                type="button"
                onClick={() => typeof window !== "undefined" && window.print()}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Download
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 md:px-8 md:py-10">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-[24px] border border-[#e8dcf8] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <div className="h-2 bg-primary" />

            <div className="px-6 py-8 md:px-10 md:py-10">
              <div className="flex flex-col gap-5 border-b border-[#eee7f7] pb-7 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="flex items-center gap-2 text-2xl font-extrabold text-primary md:text-[30px]">
                    <CreditCard size={22} />
                    {receiptTitle}
                  </h1>

                  <div className="mt-4 space-y-2 text-sm text-slate-500">
                    <p className="flex items-center gap-2">
                      <Calendar size={15} className="text-slate-400" />
                      {displayDateLabel}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock3 size={15} className="text-slate-400" />
                      {displayTimeLabel}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#eadcf9] bg-[#f7f2fd] px-5 py-4 text-left md:min-w-[210px]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary/80">
                    Service Performed
                  </p>
                  <p className="mt-2 text-2xl font-bold leading-tight text-slate-900">
                    {selectedHistoryReceiptEntry.serviceName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Expert: {selectedHistoryReceiptEntry.fixerName}
                  </p>
                </div>
              </div>

              <div className="grid gap-8 border-b border-[#eee7f7] py-8 md:grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Billed To
                  </p>
                  <p className="mt-4 text-[28px] font-bold leading-tight text-slate-900">
                    {billedToName}
                  </p>
                  <div className="mt-3 space-y-1.5 text-sm text-slate-500">
                    <p>{billedToAddressLine1}</p>
                    <p>{billedToAddressLine2}</p>
                    <p>{billedToEmail}</p>
                  </div>
                </div>

                <div className="md:pl-12 md:text-left">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Payment Method
                  </p>
                  <div className="mt-4 flex items-start gap-3">
                    <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold leading-tight text-slate-900">
                        {paymentMethodLabel}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Transaction ID: {transactionId}
                      </p>
                      <p className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                        {selectedHistoryReceiptEntry.paymentStatusLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-8">
                <div className="mb-4 grid grid-cols-[minmax(0,1fr)_120px] gap-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  <p>Description</p>
                  <p className="text-right">Amount</p>
                </div>

                <div className="divide-y divide-[#f0ebf7]">
                  {receiptItems.map((item) => (
                    <div
                      key={item.title}
                      className="grid grid-cols-[minmax(0,1fr)_120px] gap-4 py-5"
                    >
                      <div>
                        <p className="text-xl font-bold text-slate-900">{item.title}</p>
                        <p className="mt-1.5 text-sm text-slate-500">{item.description}</p>
                      </div>
                      <p className="text-right text-2xl font-bold text-slate-900">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#eee7f7] pt-7">
                <div className="ml-auto max-w-[260px] space-y-3 text-sm text-slate-500">
                  <div className="flex items-center justify-between gap-3">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Tax (5%)</span>
                    <span>{formatCurrency(selectedHistoryReceiptEntry.taxAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-2 text-slate-900">
                    <span className="text-[30px] font-extrabold">Total Paid</span>
                    <span className="text-[34px] font-extrabold text-primary">
                      {formatCurrency(selectedHistoryReceiptEntry.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-[#eadcf9] bg-[#f6f0fb] px-6 py-5 text-xs text-slate-400 md:flex-row md:items-end md:justify-between md:px-10">
              <div>
                <p className="font-bold uppercase tracking-[0.14em] text-slate-400">
                  Terms & Conditions
                </p>
                <p className="mt-2 max-w-xl leading-6">
                  Payment is due upon successful completion of service. Mr. Fixer provides a
                  service guarantee for booked repairs and replacement work.
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-sm font-bold text-slate-700">Thank you for your business!</p>
                <p className="mt-1">mrfixer.support@service.com</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderBookingsPage = () => {
    if (activeBooking) {
      const ActiveServiceIcon = getCategoryIcon(activeBooking.serviceName);
      const fixerFirstName = activeBooking.providerName?.split(" ")?.[0] || "Your fixer";

      if (activeBooking.stage === "complete") {
        return (
          <motion.div
            key="bookings-active-complete"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.25 }}
            className="max-w-6xl mx-auto"
          >
            <BookingStepper activeStep="complete" />

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
              <div className="mx-auto max-w-4xl">
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 md:h-24 md:w-24">
                    <CheckCircle2 size={36} />
                  </div>

                  <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                    Service Completed!
                  </h2>
                  <p className="mt-3 text-slate-500">
                    Your repair has been successfully finalized by the fixer.
                  </p>
                </div>

                <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50/60 p-5 md:p-6">
                  <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                        Official Receipt
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-slate-900">
                        Order {activeBooking.serviceId}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {activeBooking.createdAtLabel} • {activeBooking.createdTimeLabel}
                      </p>
                    </div>

                    <span className="inline-flex w-fit rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
                      {activeBooking.paymentStatusLabel}
                    </span>
                  </div>

                  <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                    <div className="flex items-center gap-4">
                      <img
                        src={activeBooking.providerImage}
                        alt={activeBooking.providerName}
                        className="h-14 w-14 rounded-2xl object-cover"
                      />

                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          {activeBooking.serviceName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Service Provider: {activeBooking.providerName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-slate-500">
                    <div className="flex items-center justify-between gap-3">
                      <span>Base Service Fee</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(activeBooking.serviceFee)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Materials & Parts</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(activeBooking.materialsFee)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                      <span>Taxes (5%)</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(activeBooking.taxAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-base font-bold text-slate-900">
                      <span>Total Amount Paid</span>
                      <span className="text-primary">
                        {formatCurrency(activeBooking.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50/60 p-5 md:p-6">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Star size={18} className="text-primary" />
                    <h3 className="text-2xl font-bold">Rate Your Experience</h3>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {bookingReviewFields.map((field) => (
                      <div
                        key={field.key}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100"
                      >
                        <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                          {field.label}
                        </span>
                        <ReviewStars
                          value={bookingReviewRatings[field.key]}
                          onChange={(value) =>
                            handleBookingReviewRatingChange(field.key, value)
                          }
                          size={17}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                    <p className="text-sm font-bold text-slate-900">Overall Feedback</p>
                    <div className="mt-3">
                      <ReviewStars
                        value={bookingReviewRatings.overall}
                        onChange={(value) =>
                          handleBookingReviewRatingChange("overall", value)
                        }
                        size={28}
                      />
                    </div>

                    <textarea
                      value={bookingReviewComment}
                      onChange={(event) => {
                        setBookingReviewSubmitted(false);
                        setBookingReviewComment(event.target.value);
                      }}
                      rows={5}
                      placeholder="Please help to share your feedback about our service..."
                      className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={handleSubmitBookingReview}
                      disabled={bookingReviewRatings.overall === 0 || bookingReviewSubmitted}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                      {bookingReviewSubmitted ? "Review Submitted" : "Submit Review"}
                    </button>

                    {bookingReviewSubmitted && (
                      <p className="mt-3 text-sm font-medium text-emerald-600">
                        Thank you! Your rating and comment have been submitted.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      }

      if (activeBooking.stage === "fixing") {
        return (
          <motion.div
            key="bookings-active-fixing"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.25 }}
            className="max-w-6xl mx-auto"
          >
            <BookingStepper activeStep="arrival" />

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  My Bookings
                </h1>
                <p className="mt-3 text-slate-400">
                  Manage and track your service requests.
                </p>
              </div>

              <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-slate-50/80 px-6 py-10 text-center md:px-12 md:py-14">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/18 text-primary md:h-24 md:w-24">
                  <Wrench size={36} />
                </div>

                <h2 className="mt-8 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  {fixerFirstName} is currently fixing your issue
                </h2>

                <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-500">
                  He is actively reviewing the details and working toward a solution. We'll keep you updated on the progress and notify you as soon as everything is resolved. Thank you for your patience and understanding.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary ring-1 ring-primary/15">
                    Fixer Arrived
                  </span>
                  <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                    Work in progress
                  </span>
                  <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                    Started at {activeBooking.startedFixingAtLabel || activeBooking.appointmentTimeLabel}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      }

      return (
        <motion.div
          key="bookings-active"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.25 }}
          className="max-w-6xl mx-auto"
        >
          <BookingStepper activeStep="arrival" />

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                My Bookings
              </h1>
              <p className="mt-3 text-slate-400">
                Manage and track your service requests.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50/60 p-5 md:p-6">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary shadow-sm">
                      <ActiveServiceIcon size={24} />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {activeBooking.serviceName}
                      </h2>
                      <p className="mt-1 text-sm text-slate-400">
                        Service ID: {activeBooking.serviceId}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex w-fit rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-700">
                    {activeBooking.statusLabel}
                  </span>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Assigned Expert
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={activeBooking.providerImage}
                      alt={activeBooking.providerName}
                      className="h-12 w-12 rounded-full object-cover"
                    />

                    <div className="min-w-0">
                      <p className="text-lg font-bold text-slate-900">
                        {activeBooking.providerName}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {activeBooking.providerCompanyName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => activeBooking.providerPhone && (window.location.href = `tel:${activeBooking.providerPhone}`)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-white px-5 py-4 text-sm font-bold text-primary transition-colors hover:bg-primary-light/60"
                  >
                    <Phone size={16} />
                    Call
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      activeBooking.providerEmail &&
                      (window.location.href = `mailto:${activeBooking.providerEmail}?subject=${encodeURIComponent(`Booking ${activeBooking.serviceId}`)}`)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-white px-5 py-4 text-sm font-bold text-primary transition-colors hover:bg-primary-light/60"
                  >
                    <Mail size={16} />
                    Chat
                  </button>
                </div>

                <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                  <div className="relative h-[290px] md:h-[340px]">
                    <iframe
                      title="Confirmed booking tracking map"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(activeBooking.location)}&z=12&output=embed`}
                      className="absolute inset-0 h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/5 via-transparent to-transparent" />

                    <svg
                      viewBox="0 0 100 100"
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M24 72 C 35 75, 47 77, 56 72 S 58 51, 58 41 S 70 31, 80 30"
                        fill="none"
                        stroke="#111111"
                        strokeWidth="0.8"
                        strokeDasharray="1.1 2"
                        strokeLinecap="round"
                      />

                      <g transform="translate(22 69) scale(0.145)">
                        <path
                          d="M0 -16 C-6.4 -16 -11.3 -11.2 -11.3 -5.2 C-11.3 1.4 -6.2 7.3 0 16 C6.2 7.3 11.3 1.4 11.3 -5.2 C11.3 -11.2 6.4 -16 0 -16 Z"
                          fill="#ff0000"
                        />
                        <circle cx="0" cy="-5.6" r="3.1" fill="#ffffff" />
                      </g>

                      <g transform="translate(82 29) scale(0.13)">
                        <path
                          d="M0 -16 C-6.4 -16 -11.3 -11.2 -11.3 -5.2 C-11.3 1.4 -6.2 7.3 0 16 C6.2 7.3 11.3 1.4 11.3 -5.2 C11.3 -11.2 6.4 -16 0 -16 Z"
                          fill="#19e21b"
                        />
                        <circle cx="0" cy="-5.6" r="3.1" fill="#ffffff" />
                      </g>
                    </svg>

                    <div className="absolute bottom-4 left-4 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
                      <p className="text-xs font-semibold text-slate-500">
                        Arriving in {activeBooking.arrivalMinutes} mins
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {activeBooking.distanceLabel.replace("away", "left")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 text-sm text-slate-500 md:grid-cols-3">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Appointment
                    </p>
                    <p className="mt-2 font-semibold text-slate-900">
                      {activeBooking.appointmentDateLabel}
                    </p>
                    <p>{activeBooking.appointmentTimeLabel}</p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Rating
                    </p>
                    <p className="mt-2 font-semibold text-slate-900">
                      {activeBooking.providerRating} ★
                    </p>
                    <p>{activeBooking.reviewCount} verified reviews</p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Total
                    </p>
                    <p className="mt-2 font-semibold text-slate-900">
                      {formatCurrency(activeBooking.total)}
                    </p>
                    <p>Pay after service completion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="bookings"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
        transition={{ duration: 0.25 }}
        className="max-w-6xl mx-auto"
      >
        <BookingStepper activeStep="issue" />

        <div className="bg-white border border-slate-200 rounded-[28px] p-6 md:p-10 shadow-sm">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              What can we help you fix today?
            </h1>
            <p className="mt-3 text-slate-400">
              Select a category that best describes your maintenance or repair need.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-7">
            {bookingCategories.map((service) => (
              <BookingCategoryCard
                key={service.id}
                service={service}
                selected={service.id === selectedCategoryId}
                onSelect={() => handleSelectCategory(service.id)}
              />
            ))}
          </div>

          {!selectedCategoryId && (
            <p className="mt-4 text-sm font-medium text-amber-600">
              Please choose one category before continuing.
            </p>
          )}

          <div className="mt-8">
            <label className="block text-xl font-bold text-slate-900 mb-3">
              What’s the problem?
            </label>
            <textarea
              value={problem}
              onChange={(event) => setProblem(event.target.value)}
              rows={4}
              placeholder="e.g., My kitchen sink is leaking from the base and the wood underneath is damp. It seems to happen only when the faucet is running..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <label className="text-xl font-bold text-slate-900">Photos</label>
              <span className="text-slate-400">(Optional)</span>
            </div>

            <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center cursor-pointer hover:border-primary/40 transition-colors">
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-primary-light text-primary flex items-center justify-center mb-4">
                <Camera size={20} />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-400 mt-2">
                PNG, JPG or WEBP (max. 10MB each)
              </p>

              {photoPreviews.length > 0 && (
                <div className="mt-6 space-y-4 text-left">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-center bg-slate-100 p-4">
                      <img
                        src={photoPreviews[0].previewUrl}
                        alt={photoPreviews[0].file.name}
                        className="max-h-[420px] w-full object-contain"
                      />
                    </div>
                    <div className="px-4 py-3">
                      <p className="truncate text-sm font-medium text-slate-600">
                        {photoPreviews[0].file.name}
                      </p>
                    </div>
                  </div>

                  {photoPreviews.length > 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {photoPreviews.slice(1).map(({ file, previewUrl }) => (
                        <div
                          key={`${file.name}-${file.size}`}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                          <img
                            src={previewUrl}
                            alt={file.name}
                            className="h-40 w-full object-cover"
                          />
                          <div className="px-3 py-2">
                            <p className="truncate text-xs font-medium text-slate-500">
                              {file.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </label>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              How soon do you need help?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {urgencyOptions.map((option) => (
                <UrgencyCard
                  key={option.id}
                  option={option}
                  selected={urgency === option.id}
                  onSelect={() => setUrgency(option.id)}
                />
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-3">
            {bookingError && (
              <p className="text-sm text-rose-500">{bookingError}</p>
            )}
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-white font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Next: Find an Expert
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderBookingConfirmationPage = () => {
    if (!selectedBookingProvider || !selectedBookingEstimate) {
      return renderSpecialistsPage();
    }

    const isBookingSuccessful = bookingRequestStatus === "success";
    const StatusIcon = isBookingSuccessful ? CheckCircle2 : Clock3;

    return (
      <motion.div
        key="booking-confirmation"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
        transition={{ duration: 0.25 }}
        className="mx-auto max-w-6xl"
      >
        <BookingStepper activeStep="price" />

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-slate-50/80 px-6 py-10 text-center md:px-12 md:py-14">
            <div
              className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full md:h-24 md:w-24 ${
                isBookingSuccessful
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-primary/15 text-primary"
              }`}
            >
              <StatusIcon size={36} />
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {isBookingSuccessful ? "Booking Success!" : "Waiting for Confirmation..."}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 md:text-base">
              We are notifying the best experts in{' '}
              <span className="font-semibold text-primary">{bookingRequestLocationLabel}</span>{' '}
              near you.
            </p>

            <div className="mx-auto mt-10 max-w-3xl text-left">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.18em]">
                <span className={isBookingSuccessful ? "text-emerald-600" : "text-primary"}>
                  Request Sent
                </span>
                <span className={isBookingSuccessful ? "text-emerald-600" : "text-primary"}>
                  {bookingRequestProgress}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  className={`h-full rounded-full ${
                    isBookingSuccessful ? "bg-emerald-500" : "bg-primary"
                  }`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${bookingRequestProgress}%` }}
                  transition={{ ease: "easeOut", duration: 0.12 }}
                  style={{ originX: 0 }}
                />
              </div>

              <div
                className={`mt-4 flex items-center justify-center gap-2 text-sm font-medium ${
                  isBookingSuccessful ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {isBookingSuccessful && <CheckCircle2 size={16} />}
                <span>
                  {isBookingSuccessful
                    ? "Success"
                    : "Connecting with nearby professionals..."}
                </span>
              </div>
            </div>

            <div className="mx-auto mt-10 max-w-3xl border-t border-slate-200 pt-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Estimated Wait
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-slate-900">
                <Clock3
                  size={18}
                  className={isBookingSuccessful ? "text-emerald-500" : "text-primary"}
                />
                <span className="text-2xl font-bold">1 second</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {selectedBookingProvider.full_name} • {formatCurrency(selectedBookingEstimate.total)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderBookingAgreementPage = () => {
    if (!selectedBookingProvider || !selectedBookingEstimate) {
      return renderSpecialistsPage();
    }

    const selectedUrgencyLabel =
      urgencyOptions.find((option) => option.id === urgency)?.title || "Normal";
    const selectedServiceName = selectedCategory?.name || "General Repair";
    const providerCompanyName =
      selectedBookingProvider.company_name || `${selectedServiceName} Workshop`;
    const bookingLocationLabel =
      selectedBookingProvider.location ||
      bookingMapQuery ||
      "Location will be shared after confirmation.";
    const reviewCount = selectedBookingProvider.reviewCount ?? 0;
    const expertLaborFee =
      selectedBookingEstimate.distanceFee + selectedBookingEstimate.urgencyFee;
    const serviceCharge = 4.99;
    const appliedDiscount = 4.99;
    const appointmentDate = getBookingAppointmentDate(urgency);

    const appointmentDateLabel = appointmentDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const appointmentTimeLabel = appointmentDate.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return (
      <motion.div
        key="booking-agreement"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
        transition={{ duration: 0.25 }}
        className="mx-auto max-w-5xl"
      >
        <BookingStepper activeStep="price" />

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="border-b border-slate-100 pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-[2rem]">
                Booking Agreement
              </h1>
              <p className="mt-3 text-sm text-slate-500 md:text-base">
                Review fixer proposal. No payment is required right now.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_280px]">
            <div className="space-y-6">
              <div className="rounded-[26px] border border-slate-200 bg-white overflow-hidden">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 text-slate-900 md:px-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <CreditCard size={16} />
                  </div>
                  <h2 className="text-lg font-bold">Booking Review</h2>
                </div>

                <div className="space-y-5 p-5 md:p-6">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
                        <Zap size={18} />
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Selected Service
                        </p>
                        <h3 className="mt-1 text-2xl font-bold text-slate-900">
                          {selectedServiceName}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {problem.trim() || "Review your fixer proposal and service details below."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Confirmed Expert
                    </p>

                    <div className="mt-3 flex items-center gap-3 rounded-2xl bg-slate-100/90 p-3.5">
                      <img
                        src={selectedBookingProvider.profile_img || "/default-user.png"}
                        alt={selectedBookingProvider.full_name}
                        className="h-14 w-14 rounded-full object-cover shadow-sm"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          <span>Confirmed Expert</span>
                          <span className="text-emerald-500">●</span>
                        </div>
                        <h3 className="truncate text-lg font-bold text-slate-900">
                          {providerCompanyName}
                        </h3>
                        <p className="truncate text-sm font-medium text-slate-600">
                          {selectedBookingProvider.full_name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-amber-600">
                            <Star size={13} fill="currentColor" />
                            {selectedBookingProvider.rating}
                          </span>
                          <span>({reviewCount} reviews)</span>
                          <span>{selectedBookingProvider.etaLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Date & Time
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Calendar size={15} className="text-slate-400" />
                        <span>
                          {appointmentDateLabel} • {appointmentTimeLabel}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Location
                      </p>
                      <div className="mt-2 flex items-start gap-2 text-sm font-semibold text-slate-800">
                        <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
                        <span>{bookingLocationLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-white overflow-hidden">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 text-slate-900 md:px-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <CheckCircle2 size={16} />
                  </div>
                  <h2 className="text-lg font-bold">Service Terms & Final Agreement</h2>
                </div>

                <div className="space-y-4 p-5 md:p-6">
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                    <p>By confirming this booking, you agree to the following terms:</p>
                    <p className="mt-3">
                      The expert will arrive within the selected time window based on
                      your {selectedUrgencyLabel.toLowerCase()} request.
                    </p>
                    <p className="mt-3">
                      The final price reflects the service fee and labor estimate
                      agreed during this booking step.
                    </p>
                    <p className="mt-3">
                      Additional materials required during the repair may be billed
                      separately if approved by you.
                    </p>
                    <p className="mt-3">
                      Cancellations close to the appointment time may include a small
                      service fee.
                    </p>
                  </div>

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 text-sm transition-colors ${
                      hasReviewedAgreement
                        ? "border-primary/20 bg-primary-light/60"
                        : "border-slate-200 bg-primary-light/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      checked={hasReviewedAgreement}
                      onChange={(event) => setHasReviewedAgreement(event.target.checked)}
                    />
                    <span className="text-slate-700">
                      I have reviewed the service details and agree to the final
                      price and service terms mentioned above.
                    </span>
                  </label>

                  <div className="flex items-start gap-2 text-sm text-slate-500">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary/70" />
                    <p>Payment will be handled after the service is completed.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)] xl:sticky xl:top-6">
                <div className="border-b border-slate-100 px-5 py-5">
                  <h2 className="text-xl font-bold text-slate-900">Booking Summary</h2>
                </div>

                <div className="space-y-4 px-5 py-5 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <span>Base Service Fee</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(selectedBookingEstimate.baseFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span>Expert Labor (Fixed)</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(expertLaborFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span>Service Charge</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(serviceCharge)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-emerald-600">
                    <span>Applied Discount</span>
                    <span className="font-bold">-{formatCurrency(appliedDiscount)}</span>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Total Amount
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Tax included in final total
                        </p>
                      </div>
                      <p className="text-3xl font-extrabold text-primary">
                        {formatCurrency(selectedBookingEstimate.total)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                  >
                    <CreditCard size={16} />
                    Confirm Booking
                  </button>

                  <p className="text-center text-xs leading-5 text-slate-400">
                    {hasReviewedAgreement
                      ? "Agreement captured. Payment happens after the job is finished."
                      : "No payment required now. Pay directly after the job is finished."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 text-sm md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={() => setCurrentPage("fixer-profile")}
              className="inline-flex items-center gap-2 font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Reject
            </button>

            <div className="inline-flex items-center gap-2 text-slate-400">
              <CheckCircle2 size={14} className="text-slate-400" />
              <span className="text-xs font-medium">Verified Secure Booking</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderServicesPage = () => (
    <motion.div
      key="services"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Service Categories
        </h1>
        <p className="text-slate-500 font-medium">
          Showing service categories in Cambodia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full text-center text-slate-500">
            Loading services…
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full text-center text-slate-500">
            No services found.
          </div>
        ) : (
          services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onViewFixers={() => getProvidersByCategory(service.id, "services")}
            />
          ))
        )}
      </div>
    </motion.div>
  );

  const renderHistoryPage = () => (
    <motion.div
      key="history"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          My Service History
        </h1>
        <p className="mt-2 text-slate-500">
          Keep track of all your completed maintenance and repairs.
        </p>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={historySearchTerm}
              onChange={(event) => setHistorySearchTerm(event.target.value)}
              placeholder="Search by service or fixer name..."
              className="h-12 w-full rounded-2xl bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-primary/30"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row lg:w-auto">
            <div ref={historyDateMenuRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  if (isHistoryDateMenuOpen) {
                    setIsHistoryDateMenuOpen(false);
                    return;
                  }

                  const baseDate = selectedHistoryDate || todayHistoryDate;
                  setPendingHistoryDate(baseDate);
                  setHistoryCalendarMonth(
                    new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
                  );
                  setIsHistoryDateMenuOpen(true);
                  setIsHistoryFilterMenuOpen(false);
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition hover:border-primary/30 hover:text-primary"
              >
                <Calendar size={16} />
                {selectedHistoryDate ? formatHistoryDate(selectedHistoryDate) : "Choose Day"}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isHistoryDateMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isHistoryDateMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 z-20 mt-2 w-[320px] rounded-[24px] border border-slate-200 bg-white p-4 shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Select Date
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {pendingHistoryDate
                            ? formatHistoryDate(pendingHistoryDate)
                            : "Choose a day"}
                        </p>
                      </div>

                      {selectedHistoryDate && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedHistoryDate(null);
                            setPendingHistoryDate(todayHistoryDate);
                            setIsHistoryDateMenuOpen(false);
                          }}
                          className="text-sm font-medium text-primary transition hover:text-primary/80"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setHistoryCalendarMonth(
                            (currentMonth) =>
                              new Date(
                                currentMonth.getFullYear(),
                                currentMonth.getMonth() - 1,
                                1
                              )
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-primary/30 hover:text-primary"
                        aria-label="Previous month"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <p className="text-sm font-semibold text-slate-700">
                        {formatHistoryMonth(historyCalendarMonth)}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setHistoryCalendarMonth(
                            (currentMonth) =>
                              new Date(
                                currentMonth.getFullYear(),
                                currentMonth.getMonth() + 1,
                                1
                              )
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-primary/30 hover:text-primary"
                        aria-label="Next month"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
                      {historyWeekdayLabels.map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>

                    <div className="mt-3 grid grid-cols-7 gap-2">
                      {historyCalendarDays.map((day, index) => {
                        if (!day) {
                          return <div key={`empty-${index}`} className="h-10" />;
                        }

                        const isSelectedDay = pendingHistoryDate
                          ? isSameHistoryDay(day, pendingHistoryDate)
                          : false;
                        const isToday = isSameHistoryDay(day, todayHistoryDate);

                        return (
                          <button
                            key={day.toISOString()}
                            type="button"
                            onClick={() => setPendingHistoryDate(normalizeHistoryDate(day))}
                            className={`flex h-10 items-center justify-center rounded-full text-sm transition ${
                              isSelectedDay
                                ? "bg-primary font-semibold text-white shadow-md"
                                : isToday
                                  ? "bg-primary-light font-semibold text-primary"
                                  : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setPendingHistoryDate(selectedHistoryDate);
                          setIsHistoryDateMenuOpen(false);
                        }}
                        className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (pendingHistoryDate) {
                            setSelectedHistoryDate(normalizeHistoryDate(pendingHistoryDate));
                          }
                          setIsHistoryDateMenuOpen(false);
                        }}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                      >
                        OK
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div ref={historyFilterMenuRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsHistoryFilterMenuOpen((currentValue) => !currentValue);
                  setIsHistoryDateMenuOpen(false);
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition hover:border-primary/30 hover:text-primary"
              >
                <SlidersHorizontal size={16} />
                More Filters
                {activeHistoryPanelFilterCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                    {activeHistoryPanelFilterCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isHistoryFilterMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 z-20 mt-2 w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Status
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {historyStatusFilters.map((option) => {
                          const isSelected = option.id === selectedHistoryStatus;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setSelectedHistoryStatus(option.id)}
                              className={`rounded-full px-3 py-2 text-sm transition ${
                                isSelected
                                  ? "bg-primary text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Amount
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {historyAmountFilters.map((option) => {
                          const isSelected = option.id === selectedHistoryAmountFilter;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setSelectedHistoryAmountFilter(option.id)}
                              className={`rounded-full px-3 py-2 text-sm transition ${
                                isSelected
                                  ? "bg-primary text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHistoryDate(null);
                          setPendingHistoryDate(null);
                          setSelectedHistoryStatus("all");
                          setSelectedHistoryAmountFilter("all");
                        }}
                        className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                      >
                        Reset Filters
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsHistoryFilterMenuOpen(false)}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                      >
                        Done
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>
            Showing <span className="font-semibold text-slate-900">{filteredHistoryEntries.length}</span>
            {" "}service{filteredHistoryEntries.length === 1 ? "" : "s"}
          </span>
          {totalActiveHistoryFilterCount > 0 && (
            <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
              {totalActiveHistoryFilterCount} filter{totalActiveHistoryFilterCount > 1 ? "s" : ""} active
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50/80">
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                <th className="px-5 py-5">Service</th>
                <th className="px-5 py-5">Date</th>
                <th className="px-5 py-5">Fixer</th>
                <th className="px-5 py-5">Amount</th>
                <th className="px-5 py-5">Status</th>
                <th className="px-5 py-5">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredHistoryEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <p className="text-lg font-semibold text-slate-900">No history found</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Try another search term to find a completed service.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredHistoryEntries.map((entry) => {
                  const ServiceIcon = entry.icon;

                  return (
                    <tr key={entry.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${entry.serviceIconClassName}`}
                          >
                            <ServiceIcon size={20} />
                          </div>

                          <div>
                            <p className="text-lg font-bold leading-tight text-slate-900">
                              {entry.serviceName}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">{entry.category}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5 text-sm font-medium text-slate-500">
                        {entry.dateLabel}
                      </td>

                      <td className="px-5 py-5">
                        <button
                          type="button"
                          onClick={() => handleOpenHistoryFixerProfile(entry)}
                          className="flex items-center gap-3 text-left transition hover:opacity-90"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${entry.fixerAvatarClassName}`}
                          >
                            {getInitials(entry.fixerName)}
                          </div>
                          <span className="text-sm font-medium text-slate-700 transition hover:text-primary">
                            {entry.fixerName}
                          </span>
                        </button>
                      </td>

                      <td className="px-5 py-5 text-sm font-bold text-slate-900">
                        {formatCurrency(entry.amount)}
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          {entry.status}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex flex-col gap-2 text-sm font-semibold text-primary">
                          <button
                            type="button"
                            onClick={() => handleOpenHistoryServiceReview(entry)}
                            className="text-left transition hover:text-primary/80"
                          >
                            {historyFixerReviewSubmitted && selectedHistoryFixerEntry?.id === entry.id
                              ? "Reviewed"
                              : "Rate Service"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenHistoryReceipt(entry)}
                            className="text-left transition hover:text-primary/80"
                          >
                            View Receipt
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderSpecialistsPage = () => {
    if (specialistsSource === "bookings") {
      return (
        <motion.div
          key="specialists"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto"
        >
          <BookingStepper activeStep="fixer" />

          <div>
            <div className="relative min-h-[640px] overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-sm">
              <iframe
                title="Nearby fixers map"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  bookingMapQuery
                )}&z=12&output=embed`}
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/12 via-white/10 to-sky-200/20" />

              <div className="absolute left-5 right-5 top-5 z-20 max-w-[330px] space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-4 shadow-lg backdrop-blur">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-slate-900">
                        {bookingNearbyProviders[0]?.location || "Your selected service area"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {selectedCategory
                          ? `${selectedCategory.name} experts available nearby`
                          : "Nearby fixers are ready to help"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm"
                        aria-label="Search location"
                      >
                        <Search size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm"
                        aria-label="View map pin"
                      >
                        <MapPin size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white/95 px-4 py-2 text-sm font-medium text-slate-700 shadow-md backdrop-blur"
                >
                  Layers
                </button>
              </div>

              {bookingNearbyProviders.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                  <div className="rounded-3xl bg-white/95 px-8 py-6 shadow-lg backdrop-blur">
                    <p className="text-lg font-bold text-slate-900">
                      No fixers found yet
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Try another category or check back again in a few minutes.
                    </p>
                  </div>
                </div>
              ) : (
                bookingNearbyProviders.slice(0, 4).map((provider, index) => {
                  const isSelected = selectedBookingProviderIndex === index;

                  return (
                    <button
                      key={`${provider.email || provider.full_name}-${index}`}
                      type="button"
                      onClick={() => handleOpenFixerProfile(index)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform ${
                        isSelected ? "z-20 scale-105" : "z-10 hover:scale-105"
                      }`}
                      style={provider.markerPosition}
                    >
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`h-14 w-14 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg ${
                            isSelected
                              ? "ring-4 ring-primary/30"
                              : "ring-4 ring-primary/15"
                          }`}
                        >
                          <img
                            src={provider.profile_img || "/default-user.png"}
                            alt={provider.full_name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div
                          className={`mt-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-md ${
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-white text-primary"
                          }`}
                        >
                          {isSelected
                            ? "Selected fixer"
                            : index === 0
                              ? "Closest fixer"
                              : provider.distanceLabel}
                        </div>
                        <div
                          className={`mt-2 h-4 w-4 rounded-full border-4 border-white shadow-md ${
                            isSelected ? "bg-emerald-500" : "bg-primary"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })
              )}

              <div className="absolute left-5 right-5 top-32 z-20 md:left-auto md:right-5 md:top-5 md:w-[300px]">
                <div className="rounded-[24px] border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Nearby Fixers
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Recommended experts closest to your request.
                      </p>
                    </div>
                    <span className="rounded-full bg-primary-light px-3 py-1 text-[11px] font-semibold text-primary">
                      {bookingNearbyProviders.length} Online
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {bookingNearbyProviders.length === 0 ? (
                      <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                        No providers found.
                      </div>
                    ) : (
                      bookingNearbyProviders.slice(0, 3).map((provider, index) => {
                        const isSelected = selectedBookingProviderIndex === index;

                        return (
                          <button
                            key={`${provider.email || provider.full_name}-card-${index}`}
                            type="button"
                            onClick={() => handleOpenFixerProfile(index)}
                            className={`w-full rounded-2xl border bg-white p-3 text-left shadow-sm transition-all ${
                              isSelected
                                ? "border-primary ring-2 ring-primary/15 shadow-md"
                                : "border-slate-200 hover:-translate-y-0.5 hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={provider.profile_img || "/default-user.png"}
                                alt={provider.full_name}
                                className="h-14 w-14 rounded-2xl object-cover"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <h3 className="truncate text-base font-bold text-slate-900">
                                      {provider.full_name}
                                    </h3>
                                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                                      <Star size={12} className="text-amber-500" fill="currentColor" />
                                      {provider.rating} ({provider.reviewCount} reviews)
                                    </p>
                                  </div>

                                  {isSelected && (
                                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                      Selected
                                    </span>
                                  )}
                                </div>

                                <p className="mt-2 text-xs font-semibold text-primary">
                                  {provider.distanceLabel}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg">
                Your location
              </div>

              <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-3">
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md"
                  aria-label="Go to current location"
                >
                  <Home size={18} />
                </button>
                <div className="overflow-hidden rounded-xl bg-white shadow-md">
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center border-b border-slate-200 text-xl font-medium text-slate-700"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center text-xl font-medium text-slate-700"
                  >
                    −
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-primary/10 bg-primary-light/60 px-5 py-4">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Professional Guarantee
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    All our fixers are certified and background checked. We provide a 30-day warranty on all service labor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="specialists"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={() => setCurrentPage(specialistsSource)}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary transition-all shadow-sm"
          >
            <ArrowLeft size={24} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Service Providers Near You
            </h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <MapPin size={16} />
              Showing providers in your category
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers.length === 0 ? (
            <div className="col-span-full text-center text-slate-500">
              No providers found.
            </div>
          ) : (
            providers.map((provider, index) => (
              <SpecialistCard key={index} specialist={provider} />
            ))
          )}
        </div>
      </motion.div>
    );
  };

  const renderFixerProfilePage = () => {
    if (!activeFixerProfile) {
      return selectedHistoryFixerEntry ? renderHistoryPage() : renderSpecialistsPage();
    }

    const ratingValue = Number(activeFixerProfile.rating || 0);
    const reviewTotal = Number(activeFixerProfile.reviewCount || 0);
    const profileStatCards = [
      {
        label: "Experience",
        value: activeFixerProfile.experienceLabel,
        icon: Clock3,
        iconClasses: "bg-primary-light text-primary",
      },
      {
        label: "Acceptance Rate",
        value: activeFixerProfile.acceptanceRateLabel,
        icon: CheckCircle2,
        iconClasses: "bg-emerald-50 text-emerald-600",
      },
      {
        label: "Completed Jobs",
        value: activeFixerProfile.completedJobsLabel,
        icon: Users,
        iconClasses: "bg-amber-50 text-amber-600",
      },
    ];

    return (
      <motion.div
        key="fixer-profile"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -18 }}
        transition={{ duration: 0.28 }}
        className="mx-auto max-w-6xl space-y-6"
      >
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setCurrentPage(activeFixerProfile.backPage)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-primary hover:text-primary"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Fixer Profile
            </h1>
            <p className="mt-1 text-sm text-slate-500 md:text-base">
              {activeFixerProfile.subtitle}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 md:px-6 md:py-5">
            <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                  {activeFixerProfile.actionDisabled ? "Completed Service" : "Available Now"}
                </span>
                {activeFixerProfile.summaryLabel && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    {activeFixerProfile.summaryLabel}
                  </span>
                )}
            </div>
          </div>

          <div className="flex flex-col gap-6 p-5 md:p-6 xl:flex-row xl:items-start">
            <div className="flex-1">
              <div className="flex flex-col gap-5 md:flex-row md:items-start">
                <div className="relative w-fit shrink-0">
                  <img
                    src={activeFixerProfile.imageSrc}
                    alt={activeFixerProfile.name}
                    className="h-28 w-28 rounded-[28px] border border-slate-100 object-cover shadow-sm md:h-32 md:w-32"
                  />
                  <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-slate-900 shadow-sm">
                    <Star size={18} fill="currentColor" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                    {activeFixerProfile.name}
                  </h2>
                  <p className="mt-1 text-base font-semibold text-slate-500">
                    {activeFixerProfile.companyName}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-700">
                      <Star size={15} fill="currentColor" className="text-amber-400" />
                      {ratingValue.toFixed(1)}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600">
                      {reviewTotal} verified reviews
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600">
                      <MapPin size={14} className="text-slate-400" />
                      {activeFixerProfile.locationLabel}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {activeFixerProfile.skillLabels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-sm border-t border-slate-200 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {activeFixerProfile.estimateTitle}
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
                {formatCurrency(activeFixerProfile.estimateTotal)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {activeFixerProfile.estimateSubtitle}
              </p>

              <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Clock3 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {activeFixerProfile.etaLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <MapPin size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      Service Area
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 break-words">
                      {activeFixerProfile.locationLabel}
                    </p>
                  </div>
                </div>
              </div>

              {activeFixerProfile.actionDisabled ? (
                <div className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-500">
                  {activeFixerProfile.actionLabel}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleBookSelectedProvider}
                  className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                >
                  {activeFixerProfile.actionLabel}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {profileStatCards.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconClasses}`}
                >
                  <Icon size={20} />
                </div>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Service Area
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    Shop Location & Arrival
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-slate-500 md:text-base">
                    {activeFixerProfile.locationLabel}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                      Arrival
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {activeFixerProfile.etaLabel}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Service
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {activeFixerProfile.summaryLabel || "General Repair"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
                <iframe
                  title="Fixer profile location"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    activeFixerProfile.locationLabel
                  )}&z=13&output=embed`}
                  className="h-[240px] w-full md:h-[300px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    About
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    About {activeFixerProfile.firstName}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-500 md:text-base">
                    {activeFixerProfile.aboutText}
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[24px] bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Email
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-slate-800">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
                        <Mail size={16} />
                      </div>
                      <span className="break-all">{activeFixerProfile.email}</span>
                    </div>
                  </div>

                  <div className="rounded-[24px] bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Phone Number
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-slate-800">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
                        <Phone size={16} />
                      </div>
                      <span>{activeFixerProfile.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Ratings Overview
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    Detailed Ratings
                  </h3>
                </div>

                <div className="rounded-[24px] bg-primary-light/70 px-4 py-3 text-right">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                    Average
                  </p>
                  <div className="mt-1 flex items-center justify-end gap-2 text-slate-900">
                    <Star size={16} fill="currentColor" className="text-amber-500" />
                    <span className="text-lg font-bold">{ratingValue.toFixed(1)}</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{reviewTotal} total</p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {activeFixerProfile.detailedRatings.map((item, index) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-600">{item.label}</span>
                      <span className="font-semibold text-slate-900">
                        {item.value.toFixed(1)} / 5.0
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${Math.min((item.value / 5) * 100, 100)}%` }}
                        transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Customer Feedback
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">Recent Reviews</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {activeFixerProfile.recentReviews.length} total
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {activeFixerProfile.recentReviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-slate-900">No reviews yet</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Reviews for this fixer will appear here when available.
                    </p>
                  </div>
                ) : (
                  activeFixerProfile.recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-[24px] border border-slate-100 bg-slate-50 p-4 shadow-sm shadow-slate-200/40"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-sm font-bold text-primary">
                          {review.name.charAt(0)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">{review.name}</p>
                              <div className="mt-1 flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, starIndex) => {
                                  const isActive = starIndex < review.rating;

                                  return (
                                    <Star
                                      key={`${review.id}-${starIndex}`}
                                      size={13}
                                      className={isActive ? "text-amber-500" : "text-slate-200"}
                                      fill={isActive ? "currentColor" : "none"}
                                    />
                                  );
                                })}
                              </div>
                            </div>

                            <span className="shrink-0 text-xs font-medium text-slate-400">
                              {review.timeLabel}
                            </span>
                          </div>

                          {review.comment && (
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSettingsPage = () => {
    const profileInitials = getInitials(settingsProfile.fullName);
    const inputClassName =
      "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10";
    const isSettingsDirty =
      settingsProfile.fullName !== savedSettingsProfile.fullName ||
      settingsProfile.email !== savedSettingsProfile.email ||
      settingsProfile.phone !== savedSettingsProfile.phone ||
      settingsProfile.address !== savedSettingsProfile.address ||
      settingsAvatarUrl !== savedSettingsAvatarUrl ||
      settingsNotifications.email !== savedSettingsNotifications.email ||
      settingsNotifications.push !== savedSettingsNotifications.push ||
      settingsNotifications.sms !== savedSettingsNotifications.sms ||
      JSON.stringify(settingsAddresses) !== JSON.stringify(savedSettingsAddresses) ||
      JSON.stringify(settingsPaymentMethods) !== JSON.stringify(savedSettingsPaymentMethods);

    const handleDiscardSettings = () => {
      setSettingsProfile(savedSettingsProfile);
      setSettingsNotifications(savedSettingsNotifications);
      setSettingsAddresses(savedSettingsAddresses);
      setSettingsPaymentMethods(savedSettingsPaymentMethods);
      setSettingsAvatarUrl(savedSettingsAvatarUrl);
      setIsSettingsAddressFormOpen(false);
      setEditingSettingsAddressId(null);
      setSettingsAddressForm(initialSettingsAddressForm);
      setIsSettingsPaymentFormOpen(false);
      setSettingsPaymentForm(initialSettingsPaymentForm);
      setIsSettingsPasswordFormOpen(false);
      setSettingsPasswordForm(initialSettingsPasswordForm);
      setSettingsFeedbackMessage("Changes discarded.");
    };

    const handleSaveSettings = () => {
      setSavedSettingsProfile(settingsProfile);
      setSavedSettingsNotifications(settingsNotifications);
      setSavedSettingsAddresses(settingsAddresses);
      setSavedSettingsPaymentMethods(settingsPaymentMethods);
      setSavedSettingsAvatarUrl(settingsAvatarUrl);
      setSettingsFeedbackMessage("Settings saved successfully.");
    };

    const openCreateAddressForm = () => {
      setEditingSettingsAddressId(null);
      setSettingsAddressForm(initialSettingsAddressForm);
      setIsSettingsAddressFormOpen(true);
      setSettingsFeedbackMessage("");
    };

    const handleEditAddress = (address) => {
      setEditingSettingsAddressId(address.id);
      setSettingsAddressForm({
        label: address.label,
        line1: address.line1,
        line2: address.line2,
        accentClassName: address.accentClassName,
      });
      setIsSettingsAddressFormOpen(true);
      setSettingsFeedbackMessage("");
    };

    const handleAddressFormSubmit = () => {
      if (
        !settingsAddressForm.label.trim() ||
        !settingsAddressForm.line1.trim() ||
        !settingsAddressForm.line2.trim()
      ) {
        setSettingsFeedbackMessage("Please complete all address fields.");
        return;
      }

      const nextAddress = {
        id: editingSettingsAddressId || `address-${Date.now()}`,
        label: settingsAddressForm.label.trim(),
        line1: settingsAddressForm.line1.trim(),
        line2: settingsAddressForm.line2.trim(),
        accentClassName: settingsAddressForm.accentClassName,
      };

      setSettingsAddresses((currentValue) => {
        if (editingSettingsAddressId) {
          return currentValue.map((address) =>
            address.id === editingSettingsAddressId ? nextAddress : address
          );
        }

        return [...currentValue, nextAddress];
      });

      setIsSettingsAddressFormOpen(false);
      setEditingSettingsAddressId(null);
      setSettingsAddressForm(initialSettingsAddressForm);
      setSettingsFeedbackMessage(
        editingSettingsAddressId ? "Address updated." : "New address added."
      );
    };

    const handleDeleteAddress = (addressId) => {
      setSettingsAddresses((currentValue) =>
        currentValue.filter((address) => address.id !== addressId)
      );

      if (editingSettingsAddressId === addressId) {
        setEditingSettingsAddressId(null);
        setIsSettingsAddressFormOpen(false);
        setSettingsAddressForm(initialSettingsAddressForm);
      }

      setSettingsFeedbackMessage("Address removed.");
    };

    const handleAvatarUpload = (event) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setSettingsAvatarUrl(String(reader.result || ""));
        setSettingsFeedbackMessage("Profile photo updated.");
      };
      reader.readAsDataURL(file);
    };

    const openPaymentForm = () => {
      setIsSettingsPaymentFormOpen(true);
      setSettingsPaymentForm(initialSettingsPaymentForm);
      setSettingsFeedbackMessage("");
    };

    const handlePaymentFormSubmit = () => {
      const normalizedDigits = settingsPaymentForm.cardNumber.replace(/[^0-9]/g, "");
      const lastFourDigits = normalizedDigits.slice(-4);

      if (!settingsPaymentForm.brand.trim() || lastFourDigits.length < 4) {
        setSettingsFeedbackMessage("Please enter a valid payment method.");
        return;
      }

      if (!settingsPaymentForm.expiry.trim()) {
        setSettingsFeedbackMessage("Please enter the card expiry date.");
        return;
      }

      const nextPaymentMethod = {
        id: `payment-${Date.now()}`,
        brand: settingsPaymentForm.brand.trim().toUpperCase(),
        numberLabel: `•••• •••• •••• ${lastFourDigits}`,
        expiryLabel: `Expires ${settingsPaymentForm.expiry.trim()}`,
        isDefault: settingsPaymentMethods.length === 0,
      };

      setSettingsPaymentMethods((currentValue) => [...currentValue, nextPaymentMethod]);
      setIsSettingsPaymentFormOpen(false);
      setSettingsPaymentForm(initialSettingsPaymentForm);
      setSettingsFeedbackMessage("Payment method added.");
    };

    const handleSetDefaultPaymentMethod = (paymentMethodId) => {
      setSettingsPaymentMethods((currentValue) =>
        currentValue.map((paymentMethod) => ({
          ...paymentMethod,
          isDefault: paymentMethod.id === paymentMethodId,
        }))
      );
      setSettingsFeedbackMessage("Default payment method updated.");
    };

    const handleDeletePaymentMethod = (paymentMethodId) => {
      setSettingsPaymentMethods((currentValue) => {
        const remainingPaymentMethods = currentValue.filter(
          (paymentMethod) => paymentMethod.id !== paymentMethodId
        );

        if (
          remainingPaymentMethods.length > 0 &&
          !remainingPaymentMethods.some((paymentMethod) => paymentMethod.isDefault)
        ) {
          return remainingPaymentMethods.map((paymentMethod, index) => ({
            ...paymentMethod,
            isDefault: index === 0,
          }));
        }

        return remainingPaymentMethods;
      });
      setSettingsFeedbackMessage("Payment method removed.");
    };

    const handleChangePassword = () => {
      if (
        !settingsPasswordForm.currentPassword ||
        !settingsPasswordForm.newPassword ||
        !settingsPasswordForm.confirmPassword
      ) {
        setSettingsFeedbackMessage("Please fill in all password fields.");
        return;
      }

      if (settingsPasswordForm.newPassword.length < 6) {
        setSettingsFeedbackMessage("New password must be at least 6 characters.");
        return;
      }

      if (settingsPasswordForm.newPassword !== settingsPasswordForm.confirmPassword) {
        setSettingsFeedbackMessage("Password confirmation does not match.");
        return;
      }

      setSettingsPasswordChangedLabel("Last changed just now");
      setSettingsPasswordForm(initialSettingsPasswordForm);
      setIsSettingsPasswordFormOpen(false);
      setSettingsFeedbackMessage("Password changed successfully.");
    };

    const renderNotificationToggle = (key, title, description) => {
      const isEnabled = settingsNotifications[key];

      return (
        <div className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSettingsNotifications((currentValue) => ({
                ...currentValue,
                [key]: !currentValue[key],
              }))
            }
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
              isEnabled ? "bg-primary" : "bg-slate-200"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${
                isEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      );
    };

    return (
      <motion.div
        key="settings"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -18 }}
        transition={{ duration: 0.25 }}
        className="mx-auto max-w-5xl"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Settings</h1>
          <p className="mt-2 text-sm text-slate-500 md:text-base">
            Manage your account preferences and information.
          </p>
        </div>

        {settingsFeedbackMessage ? (
          <div className="mb-6 rounded-2xl border border-primary/15 bg-primary-light/50 px-4 py-3 text-sm font-medium text-primary">
            {settingsFeedbackMessage}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <section className="p-6 md:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <User size={16} className="text-primary" />
              Profile Information
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[190px_minmax(0,1fr)]">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-2xl font-bold text-orange-500 ring-4 ring-orange-50">
                    {settingsAvatarUrl ? (
                      <img
                        src={settingsAvatarUrl}
                        alt={settingsProfile.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      profileInitials
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => settingsAvatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20"
                  >
                    <Camera size={14} />
                  </button>
                </div>

                <input
                  ref={settingsAvatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />

                <p className="mt-3 text-[11px] text-slate-400">JPG, PNG up to 2MB</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Full Name
                  </span>
                  <input
                    type="text"
                    value={settingsProfile.fullName}
                    onChange={(event) =>
                      setSettingsProfile((currentValue) => ({
                        ...currentValue,
                        fullName: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>

                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Email Address
                  </span>
                  <input
                    type="email"
                    value={settingsProfile.email}
                    onChange={(event) =>
                      setSettingsProfile((currentValue) => ({
                        ...currentValue,
                        email: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>

                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Phone Number
                  </span>
                  <input
                    type="tel"
                    value={settingsProfile.phone}
                    onChange={(event) =>
                      setSettingsProfile((currentValue) => ({
                        ...currentValue,
                        phone: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Primary Address
                  </span>
                  <input
                    type="text"
                    value={settingsProfile.address}
                    onChange={(event) =>
                      setSettingsProfile((currentValue) => ({
                        ...currentValue,
                        address: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="border-t border-slate-200 p-6 md:p-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MapPin size={16} className="text-primary" />
                Saved Addresses
              </div>
              <button
                type="button"
                onClick={() =>
                  isSettingsAddressFormOpen ? setIsSettingsAddressFormOpen(false) : openCreateAddressForm()
                }
                className="text-xs font-bold text-primary transition hover:text-primary/80"
              >
                {isSettingsAddressFormOpen ? "Cancel" : "Add New"}
              </button>
            </div>

            {isSettingsAddressFormOpen ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Label
                    </span>
                    <input
                      type="text"
                      value={settingsAddressForm.label}
                      onChange={(event) =>
                        setSettingsAddressForm((currentValue) => ({
                          ...currentValue,
                          label: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      placeholder="Home"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Style
                    </span>
                    <select
                      value={settingsAddressForm.accentClassName}
                      onChange={(event) =>
                        setSettingsAddressForm((currentValue) => ({
                          ...currentValue,
                          accentClassName: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    >
                      <option value="from-emerald-50 to-emerald-100 text-emerald-600">
                        Green
                      </option>
                      <option value="from-slate-100 to-slate-200 text-slate-500">
                        Gray
                      </option>
                    </select>
                  </label>

                  <label className="md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Address Line 1
                    </span>
                    <input
                      type="text"
                      value={settingsAddressForm.line1}
                      onChange={(event) =>
                        setSettingsAddressForm((currentValue) => ({
                          ...currentValue,
                          line1: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      placeholder="123 Maple Street, Apt 4D"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Address Line 2
                    </span>
                    <input
                      type="text"
                      value={settingsAddressForm.line2}
                      onChange={(event) =>
                        setSettingsAddressForm((currentValue) => ({
                          ...currentValue,
                          line2: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      placeholder="Springfield, IL 62704"
                    />
                  </label>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsAddressFormOpen(false);
                      setEditingSettingsAddressId(null);
                      setSettingsAddressForm(initialSettingsAddressForm);
                    }}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddressFormSubmit}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90"
                  >
                    {editingSettingsAddressId ? "Update Address" : "Save Address"}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {settingsAddresses.map((address) => (
                <div
                  key={address.id}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${address.accentClassName}`}
                  >
                    <Home size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{address.label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{address.line1}</p>
                    <p className="text-xs leading-5 text-slate-500">{address.line2}</p>
                    <div className="mt-3 flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleEditAddress(address)}
                        className="transition hover:text-primary"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(address.id)}
                        className="transition hover:text-rose-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-slate-200 p-6 md:p-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CreditCard size={16} className="text-primary" />
                Payment Methods
              </div>
              <button
                type="button"
                onClick={() =>
                  isSettingsPaymentFormOpen
                    ? setIsSettingsPaymentFormOpen(false)
                    : openPaymentForm()
                }
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary/90"
              >
                {isSettingsPaymentFormOpen ? "Cancel" : "+ Add New"}
              </button>
            </div>

            {isSettingsPaymentFormOpen ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Brand
                    </span>
                    <select
                      value={settingsPaymentForm.brand}
                      onChange={(event) =>
                        setSettingsPaymentForm((currentValue) => ({
                          ...currentValue,
                          brand: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    >
                      <option value="VISA">VISA</option>
                      <option value="MASTERCARD">MASTERCARD</option>
                    </select>
                  </label>

                  <label>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Card Number
                    </span>
                    <input
                      type="text"
                      value={settingsPaymentForm.cardNumber}
                      onChange={(event) =>
                        setSettingsPaymentForm((currentValue) => ({
                          ...currentValue,
                          cardNumber: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      placeholder="4242"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Expiry
                    </span>
                    <input
                      type="text"
                      value={settingsPaymentForm.expiry}
                      onChange={(event) =>
                        setSettingsPaymentForm((currentValue) => ({
                          ...currentValue,
                          expiry: event.target.value,
                        }))
                      }
                      className={inputClassName}
                      placeholder="12/26"
                    />
                  </label>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsPaymentFormOpen(false);
                      setSettingsPaymentForm(initialSettingsPaymentForm);
                    }}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePaymentFormSubmit}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90"
                  >
                    Save Payment Method
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-5 space-y-3">
              {settingsPaymentMethods.map((paymentMethod) => (
                <div
                  key={paymentMethod.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold tracking-[0.18em] text-slate-400">
                      {paymentMethod.brand}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{paymentMethod.numberLabel}</p>
                      <p className="mt-1 text-xs text-slate-500">{paymentMethod.expiryLabel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {paymentMethod.isDefault ? (
                      <span className="inline-flex w-fit rounded-full bg-slate-200 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultPaymentMethod(paymentMethod.id)}
                        className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary transition hover:text-primary/80"
                      >
                        Make Default
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeletePaymentMethod(paymentMethod.id)}
                      className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 transition hover:text-rose-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-slate-200 p-6 md:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Bell size={16} className="text-primary" />
              Notification Preferences
            </div>

            <div className="mt-5 divide-y divide-slate-100">
              {renderNotificationToggle(
                "email",
                "Email Notifications",
                "Receive booking updates and receipts via email"
              )}
              {renderNotificationToggle(
                "push",
                "Push Notifications",
                "Get real-time updates on your phone"
              )}
              {renderNotificationToggle(
                "sms",
                "SMS Alerts",
                "Quick text messages for immediate actions"
              )}
            </div>
          </section>

          <section className="border-t border-slate-200 p-6 md:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Shield size={16} className="text-primary" />
              Security
            </div>

            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Password</p>
                <p className="mt-1 text-xs text-slate-500">{settingsPasswordChangedLabel}</p>
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsPasswordFormOpen((currentValue) => !currentValue)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-primary hover:text-primary"
              >
                {isSettingsPasswordFormOpen ? "Cancel" : "Change Password"}
              </button>
            </div>

            {isSettingsPasswordFormOpen ? (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Current Password
                  </span>
                  <input
                    type="password"
                    value={settingsPasswordForm.currentPassword}
                    onChange={(event) =>
                      setSettingsPasswordForm((currentValue) => ({
                        ...currentValue,
                        currentPassword: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    New Password
                  </span>
                  <input
                    type="password"
                    value={settingsPasswordForm.newPassword}
                    onChange={(event) =>
                      setSettingsPasswordForm((currentValue) => ({
                        ...currentValue,
                        newPassword: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Confirm Password
                  </span>
                  <input
                    type="password"
                    value={settingsPasswordForm.confirmPassword}
                    onChange={(event) =>
                      setSettingsPasswordForm((currentValue) => ({
                        ...currentValue,
                        confirmPassword: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>
              </div>
            ) : null}

            {isSettingsPasswordFormOpen ? (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90"
                >
                  Update Password
                </button>
              </div>
            ) : null}
          </section>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 md:flex-row md:items-center md:justify-end md:px-8">
            <button
              type="button"
              onClick={handleDiscardSettings}
              disabled={!isSettingsDirty}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={!isSettingsDirty}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderPage = () => {
    if (currentPage === "booking-confirmation") {
      return renderBookingConfirmationPage();
    }
    if (currentPage === "booking-agreement") {
      return renderBookingAgreementPage();
    }
    if (currentPage === "history-review") return renderHistoryReviewPage();
    if (currentPage === "history-receipt") return renderHistoryReceiptPage();
    if (currentPage === "fixer-profile") return renderFixerProfilePage();
    if (currentPage === "specialists") return renderSpecialistsPage();
    if (currentPage === "settings") return renderSettingsPage();
    if (currentPage === "history") return renderHistoryPage();
    if (currentPage === "bookings") return renderBookingsPage();
    return renderServicesPage();
  };

  const sidebarTab =
    currentPage === "fixer-profile"
      ? selectedHistoryFixerEntry
        ? "history"
        : specialistsSource
      : currentPage === "specialists"
      ? specialistsSource
      : currentPage === "booking-confirmation" ||
          currentPage === "booking-agreement"
      ? "bookings"
      : currentPage === "history-review" || currentPage === "history-receipt"
      ? "history"
      : currentPage;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        activeTab={sidebarTab}
        onChange={(tab) => {
          if (
            tab === "services" ||
            tab === "bookings" ||
            tab === "history" ||
            tab === "settings"
          ) {
            setBookingError("");
            setCurrentPage(tab);
          }
        }}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col">
        <Header />

        <div className="p-8">
          <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
        </div>
      </main>
    </div>
  );
}
