import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  ChevronLeft,
  CheckCircle2
} from "lucide-react";

import Sidebar from "./Sidebar";
import Header from "./Header";

const VIEW = {
  LIST: "LIST",
  DETAIL: "DETAIL"
};

const JOBS = [
  {
    id: "#FIX-99201",
    name: "Michael Richardson",
    category: "Plumbing Repair",
    earnings: "$85.00",
    distance: "1.2 km away",
    posted: "5 mins ago",
    description:
      "My kitchen sink is leaking from the base and the wood underneath is damp. It seems to happen only when the faucet is running.",
    location: "842 Maplewood Avenue",
    location2: "Suite 4B, Brooklyn, NY 11211",
    urgency: "Urgent",
    photos: [
      "https://picsum.photos/400/300?1",
      "https://picsum.photos/400/300?2",
      "https://picsum.photos/400/300?3"
    ]
  }
];

function JobList({ select }) {
  return (
    <div className="max-w-5xl mx-auto space-y-6 py-8">

      <h1 className="text-2xl font-semibold">
        Job Acceptance
      </h1>

      {JOBS.map((job) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow border"
        >

          <div className="flex justify-between mb-2 text-sm">
            <div>
              <span className="text-orange-500 font-semibold">
                {job.id}
              </span>
              <span className="text-gray-400 ml-2">
                • Posted {job.posted}
              </span>
            </div>

            <div className="bg-orange-50 text-orange-500 px-3 py-1 rounded-full">
              {job.distance}
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">
            {job.name}
          </h2>

          <div className="flex justify-between mb-4">

            <div className="flex items-center text-gray-600 text-sm">
              <Wrench className="w-4 h-4 mr-2" />
              {job.category}
            </div>

            <div className="text-green-600 font-semibold">
              {job.earnings}
            </div>

          </div>

          <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-600 mb-4">
            {job.description}
          </div>

          <button
            onClick={() => select(job)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg"
          >
            View Detail
          </button>

        </motion.div>
      ))}

    </div>
  );
}

function JobDetail({ job, back }) {
  return (
    <div className="max-w-7xl mx-auto py-8">

      <button
        onClick={back}
        className="flex items-center text-gray-600 mb-6"
      >
        <ChevronLeft className="mr-2" />
        Job Details
      </button>

      <div className="grid grid-cols-3 gap-6">

        {/* LEFT */}

        <div className="col-span-2 space-y-6">

          <div className="bg-white p-6 rounded-xl shadow">

            <div className="flex justify-between mb-6">

              <div className="flex items-center gap-3">

                <div className="bg-blue-100 p-3 rounded-lg">
                  <Wrench className="text-blue-600"/>
                </div>

                <div>
                  <h2 className="font-semibold text-lg">
                    Plumbing Issue
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Request ID: {job.id}
                  </p>
                </div>

              </div>

              <div className="text-sm text-gray-400">
                Oct 2, 2023 • 10:30 AM
              </div>

            </div>

            <div className="mb-6">

              <p className="text-sm text-gray-400 mb-2">
                WHAT'S THE PROBLEM?
              </p>

              <div className="bg-gray-50 p-4 rounded-lg border">
                {job.description}
              </div>

            </div>

            <div>

              <p className="text-sm text-gray-400 mb-3">
                ATTACHED PHOTOS
              </p>

              <div className="grid grid-cols-3 gap-4">

                {job.photos.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    className="rounded-lg h-40 w-full object-cover"
                  />
                ))}

              </div>

            </div>

          </div>

          <div className="bg-white p-6 rounded-xl shadow flex justify-between">

            <button className="bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center">
              <CheckCircle2 className="mr-2"/>
              Accept Job
            </button>

            <button className="text-red-500">
              Reject
            </button>

          </div>

        </div>

        {/* RIGHT */}

        <div className="space-y-6">

          <div className="bg-white p-6 rounded-xl shadow">

            <p className="text-sm text-gray-400 mb-3">
              URGENCY LEVEL
            </p>

            <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700">
              <strong>Urgent</strong>
              <p className="text-sm">
                Needs attention within 24 hours
              </p>
            </div>

          </div>

          <div className="bg-white h-48 rounded-xl shadow flex items-center justify-center text-gray-400">
            Map Preview
          </div>

          <div className="bg-white p-6 rounded-xl shadow">

            <p className="text-sm text-gray-400 mb-3">
              SERVICE LOCATION
            </p>

            <p className="font-semibold">
              {job.location}
            </p>

            <p className="text-gray-500 text-sm">
              {job.location2}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default function Job() {

  const [view, setView] = useState(VIEW.LIST);
  const [selected, setSelected] = useState(null);

  const openDetail = (job) => {
    setSelected(job);
    setView(VIEW.DETAIL);
  };

  const back = () => {
    setView(VIEW.LIST);
  };

  return (
    <div className="flex h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Header name="John Fixer"/>

        <main className="flex-1 p-8 overflow-y-auto">

          {view === VIEW.LIST && (
            <JobList select={openDetail}/>
          )}

          {view === VIEW.DETAIL && (
            <JobDetail job={selected} back={back}/>
          )}

        </main>

      </div>

    </div>
  );
}