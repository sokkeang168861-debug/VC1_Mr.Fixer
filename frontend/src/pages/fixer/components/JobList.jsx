import React, { useState, useEffect } from 'react';
import {
  Wrench,
  MapPin,
  Loader2,
  Zap,
} from 'lucide-react';
import { motion as Motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { getFixerJobDetailRoute } from '@/config/routes';
import { resolveUploadUrl } from '@/lib/assets';
import httpClient from '../../../api/httpClient';
import useWebSocket from '../../../hooks/useWebSocket';
import { getTokenPayload } from '@/lib/auth';

const JobCard = ({ job }) => {
  const detailUrl = getFixerJobDetailRoute(job.booking_id);
  console.log('JobCard URL for job', job.booking_id, ':', detailUrl);

  return (
  <Motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow mb-4"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex gap-3 items-center">
        <span className="text-[#FF7A00] font-bold text-sm">#JOB-{job.booking_id}</span>
        <span className="text-gray-400 text-sm">• Posted {new Date(job.created_at).toLocaleString()}</span>
      </div>
      <div className="bg-[#FFF5EB] text-[#FF7A00] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
        <MapPin size={12} />
        {job.service_address || 'Near you'}
      </div>
    </div>

    <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">{job.customer_name}</h3>

    <div className="flex flex-col md:flex-row gap-6 mb-6">
      {job.issue_image && (
        <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0 border border-gray-100">
          <img
            src={resolveUploadUrl(job.issue_image)}
            alt="Issue Thumbnail"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
              <Wrench size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Category</p>
              <p className="text-sm font-semibold text-[#1A1A1A]">{job.category_name}</p>
            </div>
          </div>
          {job.urgent_level && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 rounded-lg text-red-400">
                <Zap size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Urgency</p>
                <p className="text-sm font-semibold text-[#1A1A1A] capitalize">{job.urgent_level}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#F8F9FA] rounded-lg p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Issue Description</p>
          <p className="text-sm text-[#4A4A4A] leading-relaxed line-clamp-2">
            {job.issue_description}
          </p>
        </div>
      </div>
    </div>

    <Link
      to={detailUrl}
      className="w-full bg-[#FF7A00] hover:bg-[#E66E00] text-white text-center block font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-200"
    >
      View Detail
    </Link>
  </Motion.div>
  );
};

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user ID from token
  const tokenPayload = getTokenPayload();
  const userId = tokenPayload?.id;

  const { on, off } = useWebSocket(userId);

  // Listen for booking missed events
  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const handleNewBooking = (payload) => {
      const incomingJob = payload?.booking;
      if (!incomingJob?.booking_id) {
        fetchJobs();
        return;
      }

      setJobs((currentJobs) => {
        const withoutDuplicate = currentJobs.filter(
          (job) => job.booking_id !== incomingJob.booking_id
        );
        return [incomingJob, ...withoutDuplicate];
      });
    };

    const handleBookingMissed = (data) => {
      console.log('Booking missed:', data);
      // Refresh the jobs list to remove the missed booking
      fetchJobs();
    };

    on('new_booking', handleNewBooking);
    on('booking_missed', handleBookingMissed);

    return () => {
      off('new_booking', handleNewBooking);
      off('booking_missed', handleBookingMissed);
    };
  }, [off, on, userId]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('Fetching jobs from /fixer/provider/requests...');

      const res = await httpClient.get('/fixer/provider/requests');
      console.log('API response:', res);

      const nextJobs = Array.isArray(res.data?.data) ? res.data.data : [];

      if (nextJobs.length > 0) {
        console.log('Fetched jobs:', nextJobs);
        setJobs(nextJobs);
      } else {
        console.log('No jobs found');
        setJobs([]);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load job requests. Please try again later.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchJobs();
    }
  }, [userId]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1A1A1A] mb-1">Job Acceptance</h1>
          <p className="text-gray-400 font-medium">Manage incoming requests and active assignments</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl text-center">
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <p className="text-gray-400 font-medium">No pending job requests at the moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <JobCard key={job.booking_id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
