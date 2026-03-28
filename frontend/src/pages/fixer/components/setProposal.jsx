import { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Trash2,
  Send,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { motion as Motion } from 'motion/react';
import { ROUTES } from '@/config/routes';
import { useNavigate, useParams } from 'react-router-dom';
import httpClient from '../../../api/httpClient';
import { setActiveFixerBookingId } from '@/pages/fixer/lib/activeBooking';

const ServiceEstimate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([
    { id: '1', name: 'Diagnostic Fee', price: 0.00 }
  ]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await httpClient.get(`/fixer/provider/requests/${id}`);
        if (res.data.success) {
          setJob(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching job', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJob();
  }, [id]);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', price: 0 }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const handleSubmit = async () => {
    if (items.some(item => !item.name || item.price <= 0)) {
      alert('Please fill in all item names and prices correctly.');
      return;
    }

    try {
      setSubmitting(true);
      
      console.log('Submitting proposal with items:', items);
      
      const res = await httpClient.post(`/fixer/provider/requests/${id}/accept`, {
        items,
        total,
      });

      if (res.data.success) {
        alert('Proposal submitted successfully!');
        setActiveFixerBookingId(id);
        // Navigate to proposal status or back to jobs
        navigate('/dashboard/fixer/jobs/proposal-status', {
          state: { bookingId: Number(id) },
        });
      }
    } catch (err) {
      console.error('Error submitting proposal', err);
      alert('Failed to submit proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!id || submitting) {
      return;
    }

    const reason = window.prompt('Please enter the reason for rejecting this booking:');

    if (reason === null) {
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      window.alert('Rejection reason is required.');
      return;
    }

    try {
      setSubmitting(true);

      await httpClient.post(`/fixer/provider/requests/${id}/reject`, {
        reason: trimmedReason,
      });

      window.alert('Booking rejected successfully.');
      navigate(ROUTES.dashboardFixerJobs || '/dashboard/fixer/jobs');
    } catch (err) {
      console.error('Error rejecting booking', err);
      window.alert(
        err?.response?.data?.message || 'Failed to reject booking. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-[#1A1A1A]">Set Proposal</h1>
      </div>

      {/* Job Summary Header */}
      {job && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex justify-between items-start">
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
      )}

      {/* Estimate Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-6">Service Estimate</p>

        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 items-end bg-[#F8F9FA] p-4 rounded-xl border border-gray-50">
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2 block">Item Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-100 focus:border-[#FF7A00] outline-none transition-all"
                  placeholder="e.g. Parts, Labor"
                />
              </div>
              <div className="w-32">
                <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2 block">Price ($)</label>
                <input
                  type="number"
                  value={item.price || ''}
                  onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-right focus:ring-2 focus:ring-orange-100 focus:border-[#FF7A00] outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2.5 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          className="flex items-center gap-2 text-[#FF7A00] font-bold text-sm hover:underline"
        >
          <Plus size={18} />
          Add another item
        </button>

        <div className="mt-10 pt-8 border-t border-gray-100 flex justify-between items-center">
          <span className="text-lg font-bold text-[#1A1A1A]">Total Estimate</span>
          <span className="text-3xl font-black text-[#FF7A00]">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold px-10 py-4 rounded-xl transition-all shadow-lg shadow-orange-200 flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          Submit Proposal
        </button>

        <button
          type="button"
          onClick={handleReject}
          disabled={submitting}
          className="font-bold text-red-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </Motion.div>
  );
};

export default ServiceEstimate;
