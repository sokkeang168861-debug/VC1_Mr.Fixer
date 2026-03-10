import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wrench,
  DollarSign,
  MapPin,
  ChevronLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Zap,
  TrendingUp
} from "lucide-react";

import Sidebar from "./Sidebar";
import Header from "./Header";

/* ---------------- TYPES ---------------- */

const VIEW = {
  LIST: "LIST",
  DETAIL: "DETAIL",
  PROPOSAL: "PROPOSAL"
};

/* ---------------- MOCK DATA ---------------- */

const MOCK_JOBS = [
  {
    id: "#JOB-8842",
    poster: "Michael Richardson",
    category: "Plumbing Repair",
    earnings: "$85.00",
    distance: "1.2 km away",
    postedAt: "5 mins ago",
    description:
      "Kitchen sink is leaking significantly from the main pipe underneath.",
    urgency: "Urgent",
    urgencyDesc: "Needs attention within 24 hours",
    location: "842 Maplewood Avenue",
    locationDetail: "Suite 4B",
    photos: [
      "https://picsum.photos/seed/plumbing1/400/400",
      "https://picsum.photos/seed/plumbing2/400/400"
    ]
  }
];

/* ---------------- JOB LIST ---------------- */

function JobListView({ onSelectJob }) {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {MOCK_JOBS.map((job) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-xl font-bold mb-4">{job.poster}</h3>

          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <Wrench className="w-4 h-4 mr-2" />
              {job.category}
            </div>

            <div className="text-green-600 font-bold">{job.earnings}</div>
          </div>

          <p className="text-gray-600 mb-4">{job.description}</p>

          <button
            onClick={() => onSelectJob(job)}
            className="btn-primary w-full"
          >
            View Detail
          </button>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------- JOB DETAIL ---------------- */

function JobDetailView({ job, onBack, onAccept }) {
  return (
    <div className="max-w-5xl mx-auto py-8">

      <button onClick={onBack} className="flex items-center mb-6">
        <ChevronLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="card p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">{job.poster}</h2>

        <p className="text-gray-600 mb-6">{job.description}</p>

        <div className="grid grid-cols-3 gap-4">
          {job.photos.map((photo, i) => (
            <img
              key={i}
              src={photo}
              className="rounded-lg object-cover"
            />
          ))}
        </div>
      </div>

      <button onClick={onAccept} className="btn-primary">
        <CheckCircle2 className="w-5 h-5 mr-2" />
        Accept Job
      </button>
    </div>
  );
}

/* ---------------- PROPOSAL ---------------- */

function ProposalView({ job, onBack }) {
  const [items, setItems] = useState([
    { id: 1, name: "Diagnostic Fee", price: "45" }
  ]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: "", price: "0" }]);
  };

  const removeItem = (id) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const total = items.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  return (
    <div className="max-w-4xl mx-auto py-8">

      <div className="card p-6 mb-6">
        <h3 className="font-bold mb-4">Service Estimate</h3>

        {items.map((item) => (
          <div key={item.id} className="flex gap-4 mb-4">

            <input
              value={item.name}
              placeholder="Item name"
              className="input"
              onChange={(e) =>
                setItems(
                  items.map((i) =>
                    i.id === item.id
                      ? { ...i, name: e.target.value }
                      : i
                  )
                )
              }
            />

            <input
              type="number"
              value={item.price}
              className="input"
              onChange={(e) =>
                setItems(
                  items.map((i) =>
                    i.id === item.id
                      ? { ...i, price: e.target.value }
                      : i
                  )
                )
              }
            />

            <button onClick={() => removeItem(item.id)}>
              <Trash2 />
            </button>

          </div>
        ))}

        <button onClick={addItem} className="flex items-center text-primary">
          <Plus className="mr-2" />
          Add Item
        </button>

        <div className="mt-6 font-bold text-xl">
          Total: ${total.toFixed(2)}
        </div>
      </div>

      <button onClick={onBack} className="btn-outline">
        Back
      </button>
    </div>
  );
}

/* ---------------- MAIN PAGE ---------------- */

export default function Job() {

  const [viewState, setViewState] = useState(VIEW.LIST);
  const [selectedJob, setSelectedJob] = useState(null);

  const displayName = useMemo(() => {
    const token = localStorage.getItem("token");

    if (!token) return "Fixer";

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.email?.split("@")[0] || "Fixer";
    } catch {
      return "Fixer";
    }
  }, []);

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setViewState(VIEW.DETAIL);
  };

  const handleAccept = () => setViewState(VIEW.PROPOSAL);

  const handleBack = () => {
    if (viewState === VIEW.PROPOSAL) {
      setViewState(VIEW.DETAIL);
    } else {
      setViewState(VIEW.LIST);
      setSelectedJob(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Header name={displayName} />

        <main className="flex-1 p-8 overflow-y-auto">

          <AnimatePresence mode="wait">

            {viewState === VIEW.LIST && (
              <JobListView onSelectJob={handleSelectJob} />
            )}

            {viewState === VIEW.DETAIL && selectedJob && (
              <JobDetailView
                job={selectedJob}
                onBack={handleBack}
                onAccept={handleAccept}
              />
            )}

            {viewState === VIEW.PROPOSAL && selectedJob && (
              <ProposalView
                job={selectedJob}
                onBack={handleBack}
              />
            )}

          </AnimatePresence>

        </main>

      </div>

    </div>
  );
}