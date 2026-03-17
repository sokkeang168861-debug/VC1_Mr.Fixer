import React, { useState } from 'react';
import { 
  Star,
  Calendar,
  Hash,
  ShieldCheck,
  History,
  CheckCircle2,
  Check
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'motion/react';

const RatingForm = ({
  onBack,
  onSubmit,
  serviceName,
  fixerName,
  fixerAvatar,
  date,
  orderId
}) => {

  const [ratings, setRatings] = useState({
    quality: 0,
    speed: 0,
    price: 0,
    behavior: 0,
    overall: 0
  });

  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    { id: 'quality', label: 'QUALITY' },
    { id: 'speed', label: 'SPEED' },
    { id: 'price', label: 'PRICE' },
    { id: 'behavior', label: 'BEHAVIOR' },
  ];

  const handleRating = (category, value) => {
    setRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);

    if (onSubmit) {
      onSubmit();
    }
  };

  const initials = (name) => {
    if (!name) return 'FX';
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('');
  };

  return (
    <AnimatePresence mode="wait">

      {!isSubmitted ? (

        <Motion.div
          key="form"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
        >

          {/* Header */}
          <div className="bg-slate-50 p-4 border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {serviceName}
                </h1>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  {date && (
                    <span className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Completed on {date}
                    </span>
                  )}
                  {orderId && (
                    <span className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-slate-400" />
                      Order ID: {orderId}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full sm:w-auto">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <div className="relative">
                    {fixerAvatar ? (
                      <img
                        src={fixerAvatar}
                        alt={fixerName}
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-purple-200"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 ring-2 ring-purple-200">
                        {initials(fixerName)}
                      </div>
                    )}

                    <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-emerald-500 p-1 text-white">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="leading-tight">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600">
                      Your Fixer
                    </p>
                    <p className="text-base font-bold text-slate-900">
                      {fixerName}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified Pro Plumber
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Content */}
          <div className="p-5">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Rating</h2>

            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Detail Rating
            </p>

            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
                    {cat.label}
                  </span>

                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(cat.id, star)}
                        className="p-0.5"
                        aria-label={`${cat.label} ${star} stars`}
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= ratings[cat.id]
                              ? 'text-orange-400 fill-orange-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="my-4 border-t border-slate-100" />

            <div>
              <p className="text-sm font-bold text-slate-900 mb-2">
                Overall Feedback:
              </p>

              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating('overall', star)}
                    className="p-0.5"
                    aria-label={`Overall ${star} stars`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= ratings.overall
                          ? 'text-orange-400 fill-orange-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                placeholder={`Share your general experience working with ${
                  (fixerName || 'your fixer').split(' ')[0]
                }...`}
                className="w-full min-h-24 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 resize-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t bg-white p-5 sm:p-6">
            <button
              onClick={handleSubmit}
              className="w-full rounded-2xl bg-purple-600 py-4 text-sm font-extrabold tracking-widest text-white hover:bg-purple-700"
            >
              SUBMIT
            </button>
          </div>

        </Motion.div>

      ) : (

        <div className="flex min-h-[calc(100vh-260px)] w-full items-center justify-center px-4">
          <Motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl min-h-80 rounded-2xl bg-white p-8 text-center shadow-xl flex flex-col items-center justify-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600">
              <Check className="h-6 w-6 text-white" />
            </div>

            <h2 className="mb-3 text-2xl font-extrabold text-slate-900 text-center">
              Thank You for Your Feedback!
            </h2>

            <p className="mb-6 text-lg leading-relaxed text-slate-600 text-center">
              Your review for{' '}
              <span className="font-extrabold text-purple-600">{fixerName}</span> has
              been shared with the community.
            </p>

            <button
              onClick={onBack}
              className="mx-auto flex min-w-48 items-center justify-center gap-2 rounded-2xl border border-purple-200 px-6 py-2.5 text-sm font-bold text-purple-700 hover:bg-purple-50"
            >
              <History className="h-4 w-4" />
              Go to History
            </button>
          </Motion.div>
        </div>

      )}

    </AnimatePresence>
  );
};

export default RatingForm;
