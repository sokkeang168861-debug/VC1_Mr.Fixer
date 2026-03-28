import React, { useEffect, useState } from 'react';
import { Wrench, MapPin, Loader2 } from 'lucide-react';
import { motion as Motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { getFixerJobDetailRoute } from '@/config/routes';
import { resolveUploadUrl } from '@/lib/assets';
import defaultProfile from '@/assets/image/default-profile.png';
import httpClient from '../../../api/httpClient';
import { createAppSocket } from '@/lib/socket';

const ACTIVE_JOB_STATUSES = ['pending', 'fixer_accept', 'customer_accept', 'arrived'];

const STATUS_STYLES = {
  pending: {
    label: 'Pending Request',
    className: 'bg-amber-50 text-amber-700',
  },
  fixer_accept: {
    label: 'Proposal Sent',
    className: 'bg-sky-50 text-sky-700',
  },
  customer_accept: {
    label: 'Customer Accepted',
    className: 'bg-emerald-50 text-emerald-700',
  },
  arrived: {
    label: 'Arrived',
    className: 'bg-violet-50 text-violet-700',
  },
};

function getInitials(name = '') {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join('') || 'CU';
}

const JobCard = ({ job }) => {
  const detailUrl = getFixerJobDetailRoute(job.booking_id);
  const normalizedStatus = String(job.status || 'pending').toLowerCase();
  const statusMeta = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.pending;
  const customerName = job.customer_name || 'Customer User';
  const customerProfileImg = resolveUploadUrl(job.customer_profile_img || job.customerProfileImg || '');
  const categoryImage = resolveUploadUrl(job.category_image || job.categoryImage || '');

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#FF7A00]">#JOB-{job.booking_id}</span>
          <span className="text-sm text-gray-400">
            Posted {new Date(job.created_at).toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1 rounded-full bg-[#FFF5EB] px-3 py-1 text-xs font-semibold text-[#FF7A00]">
            <MapPin size={12} />
            {job.service_address || 'Near you'}
          </div>
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusMeta.className}`}>
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-100 text-lg font-bold text-[#FF7A00]">
          {customerProfileImg ? (
            <img
              src={customerProfileImg}
              alt={customerName}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = defaultProfile;
              }}
              referrerPolicy="no-referrer"
            />
          ) : (
            getInitials(customerName)
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">Customer</p>
          <h3 className="truncate text-xl font-bold text-[#1A1A1A]">{customerName}</h3>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-6 md:flex-row">
        {job.issue_image ? (
          <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl border border-gray-100 md:w-48">
            <img
              src={resolveUploadUrl(job.issue_image)}
              alt="Issue Thumbnail"
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50 text-gray-400">
                {categoryImage ? (
                  <img
                    src={categoryImage}
                    alt={job.category_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Wrench size={18} />
                )}
              </div>
              <div>
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Category
                </p>
                <p className="text-sm font-semibold text-[#1A1A1A]">{job.category_name}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-[#F8F9FA] p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Issue Description
            </p>
            <p className="line-clamp-2 text-sm leading-relaxed text-[#4A4A4A]">
              {job.issue_description}
            </p>
          </div>
        </div>
      </div>

      <Link
        to={detailUrl}
        className="block w-full rounded-xl bg-[#FF7A00] py-3.5 text-center font-bold text-white shadow-lg shadow-orange-200 transition-colors hover:bg-[#E66E00]"
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

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await httpClient.get('/fixer/provider/requests');
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    const socket = createAppSocket();

    socket.on('booking:new', (newBooking) => {
      console.log('New booking received via socket:', newBooking);
      const normalizedStatus = String(newBooking.status || 'pending').toLowerCase();

      if (!ACTIVE_JOB_STATUSES.includes(normalizedStatus)) {
        return;
      }

      setJobs((prevJobs) => {
        const nextBookingId = newBooking.booking_id || newBooking.id;
        const filteredJobs = prevJobs.filter((job) => job.booking_id !== nextBookingId);
        return [{ ...newBooking, booking_id: nextBookingId }, ...filteredJobs];
      });
    });

    socket.on('booking:updated', (updatedBooking) => {
      console.log('Booking updated via socket:', updatedBooking);
      const normalizedStatus = String(updatedBooking.status || '').toLowerCase();
      const updatedBookingId = updatedBooking.booking_id || updatedBooking.id;

      if (!ACTIVE_JOB_STATUSES.includes(normalizedStatus)) {
        setJobs((prevJobs) => prevJobs.filter((job) => job.booking_id !== updatedBookingId));
        return;
      }

      setJobs((prevJobs) => {
        const existingJob = prevJobs.find((job) => job.booking_id === updatedBookingId);

        if (!existingJob) {
          return [{ ...updatedBooking, booking_id: updatedBookingId }, ...prevJobs];
        }

        return prevJobs.map((job) =>
          job.booking_id === updatedBookingId
            ? { ...job, ...updatedBooking, booking_id: updatedBookingId }
            : job
        );
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 text-3xl font-black text-[#1A1A1A]">Job Acceptance</h1>
          <p className="font-medium text-gray-400">Manage incoming requests and active assignments</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
          <p className="font-medium text-gray-400">No pending or active fixer jobs at the moment.</p>
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
