import React, { useEffect, useState } from 'react';
import { LoaderCircle, MapPin, ShieldCheck, Star } from 'lucide-react';
import ExpertProfileModal from './ExpertProfileModal';
import httpClient from '@/api/httpClient';
import defaultProfile from '@/assets/image/default-profile.png';

const FindFixer = ({ bookingDraft, onBook, submitting = false, error = '' }) => {
  const [fixers, setFixers] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(bookingDraft?.categoryId));
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!bookingDraft?.categoryId) {
      return;
    }

    httpClient
      .get(`/user/providersEachCategory/${bookingDraft.categoryId}`, {
        params: {
          latitude: bookingDraft.latitude,
          longitude: bookingDraft.longitude,
        },
      })
      .then((res) => {
        const providers = Array.isArray(res.data) ? res.data : [];
        setFixers(providers.map((provider, index) => ({
          id: provider.provider_id ?? provider.service_id ?? index,
          service_id: provider.service_id,
          provider_id: provider.provider_id,
          name: provider.full_name,
          image: provider.profile_img || defaultProfile,
          companyName: provider.company_name || 'Mr. Fixer Partner',
          location: provider.location || 'Location unavailable',
          phone: provider.phone,
          email: provider.email,
          distanceKm: provider.distance_km,
          rating: 5,
          reviews: 0,
        })));
      })
      .catch((err) => {
        console.error(err);
        setFixers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [bookingDraft?.categoryId, bookingDraft?.latitude, bookingDraft?.longitude]);

  const handleExpertClick = (expert) => {
    setSelectedExpert(expert);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[32px] overflow-hidden border border-slate-200 shadow-sm bg-white">
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">Choose a fixer</h2>
          <p className="text-sm text-slate-500 mt-2">Select an available provider for the category you chose in step 1.</p>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-slate-500">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              <span>Loading nearby fixers...</span>
            </div>
          )}

          {!loading && fixers.length === 0 && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-slate-500">
              No fixer is available for this category right now.
            </div>
          )}

          {!loading && fixers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fixers.map((fixer) => (
                <button
                  key={`${fixer.service_id}-${fixer.provider_id}`}
                  type="button"
                  onClick={() => handleExpertClick(fixer)}
                  className="rounded-3xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-violet-300 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={fixer.image}
                      alt={fixer.name}
                      className="h-16 w-16 rounded-2xl object-cover"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-bold text-slate-800">{fixer.name}</h3>
                        <div className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-orange-500">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="text-xs font-bold">{fixer.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm font-medium text-violet-600">{fixer.companyName}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{fixer.location}</span>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-violet-500">
                        {fixer.distanceKm} km away
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="bg-violet-50 border border-violet-100 rounded-3xl p-6 flex items-start gap-4">
        <div className="p-3 bg-violet-100 rounded-xl text-violet-600">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-1">Professional Guarantee</h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            Booking this fixer creates the job in the system immediately. You can continue the rest of the flow after the request is saved.
          </p>
        </div>
      </div>

      <ExpertProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expert={selectedExpert}
        onBook={() => {
          if (!selectedExpert || submitting) {
            return;
          }
          onBook?.(selectedExpert);
        }}
      />
    </div>
  );
};

export default FindFixer;

