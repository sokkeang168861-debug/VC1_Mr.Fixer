import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Wrench,
  MapPin,
  Zap,
  CheckCircle2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { motion as Motion } from 'motion/react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import httpClient from '../../../api/httpClient';
import { getFixerProposalRoute } from '@/config/routes';
import { setActiveFixerBookingId } from '@/pages/fixer/lib/activeBooking';
import { resolveUploadUrl } from '@/lib/assets';

const defaultCenter = {
  lat: 11.5564, // Phnom Penh default
  lng: 104.9282
};

async function geocodeAddress(address) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: address,
    limit: '1',
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Geocoding failed');
  }

  const results = await response.json();
  const match = Array.isArray(results) ? results[0] : null;

  if (!match) {
    return null;
  }

  return {
    lat: Number(match.lat),
    lng: Number(match.lon),
  };
}

function getOpenStreetMapEmbedUrl({ lat, lng }) {
  const delta = 0.01;
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
}

const JobDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState('');

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    try {
      setRejecting(true);
      const res = await httpClient.post(`/fixer/provider/requests/${id}/reject`, {
        reason: rejectReason.trim()
      });

      if (res.data.success) {
        alert('Job request rejected successfully.');
        navigate('/dashboard/fixer/jobs');
      } else {
        alert('Failed to reject job request. Please try again.');
      }
    } catch (err) {
      console.error('Error rejecting job:', err);
      alert('Failed to reject job request. Please try again.');
    } finally {
      setRejecting(false);
      setShowRejectModal(false);
      setRejectReason('');
    }
  };

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await httpClient.get(`/fixer/provider/requests/${id}`);
        const jobData = res.data?.success ? res.data.data : null;

        if (jobData) {
          setJob(jobData);
        } else {
          setError('Job not found');
          setJob(null);
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.response?.data?.message || 'Failed to load job details');
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchJobDetail();
  }, [id]);

  useEffect(() => {
    if (!job) {
      return;
    }

    const normalizedStatus = String(job.status || '').toLowerCase();
    setActiveFixerBookingId(job.booking_id);

    if (normalizedStatus === 'fixer_accept') {
      navigate('/dashboard/fixer/jobs/proposal-status', {
        replace: true,
        state: { bookingId: job.booking_id },
      });
      return;
    }

    if (normalizedStatus === 'customer_accept') {
      navigate('/dashboard/fixer/jobs/heading-to-customer', {
        replace: true,
        state: { bookingId: job.booking_id },
      });
      return;
    }

    if (normalizedStatus === 'arrived') {
      navigate('/dashboard/fixer/jobs/arrived-status', {
        replace: true,
        state: { bookingId: job.booking_id },
      });
      return;
    }

    if (job.latitude && job.longitude) {
      setMapCenter({
        lat: Number(job.latitude),
        lng: Number(job.longitude)
      });
      setMapError('');
      return;
    }

    if (!job.service_address) {
      return;
    }

    let cancelled = false;

    const resolveMapCenter = async () => {
      try {
        setMapLoading(true);
        setMapError('');
        const resolvedCenter = await geocodeAddress(job.service_address);

        if (!cancelled && resolvedCenter) {
          setMapCenter(resolvedCenter);
          return;
        }

        if (!cancelled) {
          setMapError('Unable to locate this address on the map.');
        }
      } catch {
        if (!cancelled) {
          setMapError('Unable to load the map for this address.');
        }
      } finally {
        if (!cancelled) {
          setMapLoading(false);
        }
      }
    };

    resolveMapCenter();

    return () => {
      cancelled = true;
    };
  }, [job, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl inline-block">
          {error || 'Job not found'}
        </div>
        <div className="mt-4">
          <button
          onClick={() => navigate(-1)}
          className="text-primary font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-[#1A1A1A]">Job Details #{job.booking_id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Job Info Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 flex justify-between items-start">
              <div className="flex gap-4">
                <div className="p-3 bg-[#FFF5EB] text-[#FF7A00] rounded-xl">
                  <Wrench size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1A1A1A]">{job.category_name}</h2>
                  <p className="text-sm text-gray-400 font-medium">Request ID: #JOB-{job.booking_id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Requested On</p>
                <p className="text-sm font-bold text-[#1A1A1A]">{new Date(job.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="p-6 space-y-8">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-4">What's the problem?</p>
                <div className="bg-[#F8F9FA] rounded-xl p-6">
                  <p className="text-sm text-[#4A4A4A] leading-relaxed">
                    {job.issue_description}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-4">Attached Photos ({job.images ? job.images.length : 0})</p>
                {job.images && job.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {job.images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                        <img
                          src={resolveUploadUrl(img)}
                          alt={`Job Issue ${i + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                    <p className="text-gray-400 font-medium">No photos attached by customer.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to={getFixerProposalRoute(id)}
              className="flex-1 max-w-60 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} />
              Accept & Set Proposal
            </Link>
            <button
              onClick={() => setShowRejectModal(true)}
              className="text-red-500 font-bold hover:text-red-600 px-8 py-4 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Urgency Level */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-4">Urgency Level</p>
            <div className="bg-[#FFF9F0] border border-[#FFE8CC] rounded-xl p-4 flex gap-4">
              <div className="w-12 h-12 bg-[#FF7A00] rounded-full flex items-center justify-center text-white shrink-0">
                <Zap size={24} fill="currentColor" />
              </div>
              <div>
                <h3 className="font-bold text-[#FF7A00] capitalize">{job.urgent_level}</h3>
                <p className="text-xs text-[#8B5E3C] leading-tight mt-1">
                  {job.urgent_level === 'urgent' ? 'Needs attention within 24 hours' : 'Standard priority service'}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-48 bg-gray-100 relative">
              {mapError ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 p-4 text-center">
                  <AlertTriangle className="text-red-500 mb-2" size={24} />
                  <p className="text-xs text-red-600 font-bold">{mapError}</p>
                </div>
              ) : mapLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                  <Loader2 className="animate-spin text-slate-300" size={24} />
                </div>
              ) : (
                <iframe
                  title={`Booking ${job.booking_id} location`}
                  src={getOpenStreetMapEmbedUrl(mapCenter)}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </div>
            <div className="p-6">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-4">Service Location</p>
              <div className="flex gap-3">
                <div className="text-[#FF7A00] shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A]">{job.service_address}</h3>
                  <p className="text-xs text-gray-400 mt-1">Customer: {job.customer_name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Reject Job Request</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this job request:</p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={rejecting}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {rejecting ? <Loader2 size={16} className="animate-spin" /> : null}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </Motion.div>
  );
};

export default JobDetails;
