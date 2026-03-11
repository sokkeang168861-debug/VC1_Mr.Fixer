import { useNavigate } from "react-router-dom";
import httpClient from "../../../api/httpClient";
import React, { useState, useEffect, useMemo } from "react";
import { Sidebar, Header } from "./CustomerNavbar";
import {
  ArrowLeft,
  Bike,
  Calendar,
  Camera,
  Car,
  CheckCircle2,
  Clock3,
  CreditCard,
  Droplets,
  Home,
  Mail,
  MapPin,
  Phone,
  Search,
  Star,
  TriangleAlert,
  Users,
  Wrench,
  X,
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

const initialBookingReviewRatings = {
  quality: 0,
  speed: 0,
  price: 0,
  behavior: 0,
  overall: 0,
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
              onClick={() => setCurrentPage("specialists")}
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
                      onClick={() => setSelectedBookingProviderIndex(index)}
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

              <AnimatePresence>
                {selectedBookingProvider && selectedBookingEstimate && (
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.98 }}
                    className="absolute left-1/2 top-1/2 z-30 w-[calc(100%-2.5rem)] max-w-[330px] -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="flex max-h-[70vh] flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white/95 shadow-2xl backdrop-blur md:max-h-[520px]">
                      <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            Expert Profile
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Selected from nearby fixers
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedBookingProviderIndex(null)}
                          className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Close expert profile"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="space-y-3 overflow-y-auto p-3.5">
                        <div className="flex items-start gap-2.5">
                          <img
                            src={selectedBookingProvider.profile_img || "/default-user.png"}
                            alt={selectedBookingProvider.full_name}
                            className="h-14 w-14 rounded-xl object-cover shadow-sm"
                          />

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-xl font-bold leading-tight text-slate-900">
                              {selectedBookingProvider.full_name}
                            </h3>
                            <p className="mt-0.5 truncate text-xs font-medium text-primary">
                              {selectedBookingProvider.company_name || `${selectedCategory?.name || "General"} Workshop`}
                            </p>

                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                              <span className="flex items-center gap-1 font-bold text-slate-900">
                                <Star size={13} className="text-amber-500" fill="currentColor" />
                                {selectedBookingProvider.rating}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">
                                {selectedBookingProvider.reviewCount} verified reviews
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                                {selectedCategory?.name || "Repair"}
                              </span>
                              <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                                {urgency}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl bg-primary-light/70 p-3.5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                                Estimated Total
                              </p>
                              <div className="mt-2.5 grid grid-cols-3 gap-2 text-[10px] text-slate-500">
                                <div>
                                  <p className="font-semibold uppercase tracking-wide text-slate-400">
                                    Base fee
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-slate-900">
                                    {formatCurrency(selectedBookingEstimate.baseFee)}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-semibold uppercase tracking-wide text-slate-400">
                                    Distance
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-slate-900">
                                    {formatCurrency(selectedBookingEstimate.distanceFee)}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-semibold uppercase tracking-wide text-slate-400">
                                    Urgency
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-slate-900">
                                    {formatCurrency(selectedBookingEstimate.urgencyFee)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-2xl font-extrabold leading-none text-primary">
                                {formatCurrency(selectedBookingEstimate.total)}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-500">
                                Inclusive total
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                Shop Location & Arrival
                              </p>
                              <p className="mt-2 text-sm font-semibold text-slate-900">
                                {selectedBookingProvider.location || "Location available after booking"}
                              </p>
                            </div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600">
                              {selectedBookingProvider.etaLabel}
                            </span>
                          </div>

                          <div className="mt-2.5 overflow-hidden rounded-lg border border-slate-200">
                            <iframe
                              title="Selected fixer location"
                              src={`https://www.google.com/maps?q=${encodeURIComponent(
                                selectedBookingProvider.location || bookingMapQuery
                              )}&z=13&output=embed`}
                              className="h-20 w-full"
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                              Recent Reviews
                            </p>
                            <span className="text-[11px] font-semibold text-primary">
                              See All
                            </span>
                          </div>
                          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                            <p className="text-sm font-bold text-slate-900">Jason M.</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              Very fast and professional service. Arrived quickly and fixed the issue on the first visit.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleBookSelectedProvider}
                          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                        >
                          Book {selectedBookingProvider.full_name} for {formatCurrency(selectedBookingEstimate.total)}
                        </button>

                        <p className="text-center text-[11px] text-slate-400">
                          {urgency === "emergency"
                            ? "Usually responds in under 5 minutes"
                            : urgency === "urgent"
                              ? "Usually responds in under 15 minutes"
                              : "Usually responds in under 30 minutes"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                            onClick={() => setSelectedBookingProviderIndex(index)}
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

  const renderPage = () => {
    if (currentPage === "booking-confirmation") {
      return renderBookingConfirmationPage();
    }
    if (currentPage === "booking-agreement") {
      return renderBookingAgreementPage();
    }
    if (currentPage === "specialists") return renderSpecialistsPage();
    if (currentPage === "bookings") return renderBookingsPage();
    return renderServicesPage();
  };

  const sidebarTab =
    currentPage === "specialists"
      ? specialistsSource
      : currentPage === "booking-confirmation" ||
          currentPage === "booking-agreement"
      ? "bookings"
      : currentPage;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        activeTab={sidebarTab}
        onChange={(tab) => {
          if (tab === "services" || tab === "bookings") {
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
