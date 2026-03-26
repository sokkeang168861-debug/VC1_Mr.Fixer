import React from 'react';
import {
  Star,
  MapPin,
  Mail,
  Phone,
  Clock,
  ShieldCheck,
  Store,
  ChevronRight
} from 'lucide-react';
import { motion as Motion } from 'motion/react';

const FixerProfile = ({
  onBack,
  name = 'Marcus Chen',
  avatar = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
  primaryCategory = 'Plumbing',
}) => {

  const stats = [
    { label: 'Experience', value: '5 Years' },
    { label: 'Acceptance Rate', value: '98%' },
    { label: 'Completed Jobs', value: '150+' },
  ];

  const detailedRatings = [
    { label: 'Quality of Work', score: 4.8 },
    { label: 'Speed of Service', score: 4.2 },
    { label: 'Price Fairness', score: 4.5 },
    { label: 'Professional Behavior', score: 4.9 },
  ];

  const reviews = [
    {
      id: '1',
      author: 'Sarah Williams',
      initials: 'SW',
      date: '2 days ago',
      rating: 5,
      comment:
        '"Marcus was incredibly professional. He fixed the leak in my kitchen quickly and even checked my other pipes for potential issues. Highly recommend!"'
    },
    {
      id: '2',
      author: 'James Lee',
      initials: 'JL',
      date: 'Oct 12, 2023',
      rating: 5,
      comment:
        '"Excellent electrical work on our renovation. Very knowledgeable."'
    }
  ];

  const firstName = (name || '').trim().split(/\s+/)[0] || 'Fixer';

  return (
    <Motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-6xl mx-auto pb-12"
    >

      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-6 relative overflow-hidden">

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute right-8 top-8 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Back
            </button>
          )}

          <div className="relative">
            <div className="w-32 h-40 rounded-2xl overflow-hidden shadow-lg">
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            </div>

            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1">

            <div className="flex justify-between items-start mb-4">

              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-1">{name}</h1>

                <div className="flex items-center gap-2 text-purple-600 font-medium mb-3">
                  <Store className="w-4 h-4" />
                  <span className="text-sm">The Master Workshop</span>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-5 h-5 text-orange-400 fill-orange-400" />
                  <span className="font-bold text-slate-900">4.8</span>
                  <span className="text-slate-400 text-sm ml-1">
                    • 89 Verified Reviews
                  </span>
                </div>

                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">
                    {primaryCategory}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">
                    Electrical
                  </span>
                </div>

              </div>

              <button className="bg-[#7C3AED] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#6D28D9]">
                Book Service
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center"
          >
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}

      </div>

      {/* Shop Location & Arrival */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            Shop Location &amp; Arrival
          </p>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <Clock className="h-4 w-4" />
            18 min ETA
          </span>
        </div>

        <div className="relative h-52 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm sm:h-64">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200" />
          <div className="absolute inset-0 opacity-60">
            <div className="h-full w-full bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.9),rgba(255,255,255,0))]" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 shadow-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="mt-4 w-[340px] max-w-[90vw] rounded-full bg-white/90 px-5 py-3 text-center text-[11px] font-bold text-slate-800 shadow-xl backdrop-blur">
                Street 271, Phnom Penh, Cambodia
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="p-8">
          <h2 className="text-lg font-bold text-slate-900">About {firstName}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Expert technician specialized in modern home systems. I pride myself on clean work environments
            and transparent pricing. Every job comes with a 1-year labor warranty. Fluent in English and Mandarin.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 border-t border-slate-100 p-8 sm:grid-cols-2">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Mail className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Email
              </p>
              <p className="text-sm font-semibold text-slate-800">m.chen@masterworkshop.com</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Phone className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Phone Number
              </p>
              <p className="text-sm font-semibold text-slate-800">+1 (555) 012-3456</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Reviews (Wide) */}
      <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            Recent Reviews
          </p>
        </div>

        <div className="divide-y divide-slate-100 p-6">
          {reviews.map((review) => (
            <div key={review.id} className="py-6 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm font-bold text-slate-900">{review.author}</p>
                  <p className="mt-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Verified Visit • {review.date}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < review.rating ? 'text-orange-400 fill-orange-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-500">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Detailed Ratings</h2>

          <div className="space-y-6">
            {detailedRatings.map((rating) => (
              <div key={rating.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-600">{rating.label}</span>
                  <span className="font-bold text-slate-900">{rating.score} / 5.0</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${(rating.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Reviews</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              42 Total
            </span>
          </div>

          <div className="p-6 space-y-6">
            {reviews.map((review) => (
              <div key={`mini-${review.id}`} className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-600">
                  {review.initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className="truncate text-sm font-bold text-slate-900">{review.author}</p>
                    <span className="text-xs text-slate-400">{review.date}</span>
                  </div>
                  <div className="mt-1 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < review.rating ? 'text-orange-400 fill-orange-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {review.comment.replace(/(^"|"$)/g, '')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full border-t border-slate-100 bg-white px-6 py-4 text-xs font-extrabold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
            View All Reviews
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>
      </div>

    </Motion.div>
  );
};

export default FixerProfile;
