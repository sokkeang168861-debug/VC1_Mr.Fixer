import React, { useEffect, useRef, useState } from 'react';
import {
  Car,
  Bike,
  Settings,
  Refrigerator,
  Droplets,
  Zap,
  Camera,
  Calendar,
  AlertCircle,
  ArrowRight,
  Wrench,
  X,
  MapPin,
  LoaderCircle,
} from 'lucide-react';
import httpClient from '@/api/httpClient';

function createPhotoItems(files = []) {
  return files.map((file) => ({
    file,
    previewUrl: URL.createObjectURL(file),
  }));
}

async function reverseGeocode(latitude, longitude) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(latitude),
    lon: String(longitude),
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Reverse geocoding failed');
  }

  const data = await response.json();
  return data.display_name || '';
}

const urgencyOptions = [
  { id: 'low', icon: Calendar, label: 'Normal', desc: 'Within a few days. Best for minor fixes.', color: 'violet' },
  { id: 'medium', icon: Zap, label: 'Urgent', desc: 'Within 24 hours. Needs quick attention.', color: 'orange' },
  { id: 'high', icon: AlertCircle, label: 'Emergency', desc: 'ASAP. For critical issues or safety risks.', color: 'red' },
];

const BookingForm = ({ onNext, initialData }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialData?.categoryId ?? null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [issueDescription, setIssueDescription] = useState(initialData?.issueDescription ?? '');
  const [serviceAddress, setServiceAddress] = useState(initialData?.serviceAddress ?? '');
  const [latitude, setLatitude] = useState(initialData?.latitude ?? '');
  const [longitude, setLongitude] = useState(initialData?.longitude ?? '');
  const [urgency, setUrgency] = useState(initialData?.urgentLevel ?? 'low');
  const [photos, setPhotos] = useState(() => createPhotoItems(initialData?.photoFiles ?? []));
  const [photoError, setPhotoError] = useState('');
  const [formError, setFormError] = useState('');
  const [locating, setLocating] = useState(false);
  const fileInputRef = useRef(null);
  const photosRef = useRef([]);
  const shouldUseHorizontalCategoryScroll = categories.length > 3;
  const isFormComplete =
    Boolean(selectedCategory) &&
    Boolean(issueDescription.trim()) &&
    latitude !== '' &&
    longitude !== '' &&
    Boolean(serviceAddress.trim());

  useEffect(() => {
    httpClient
      .get('/user/allCategories')
      .then((res) => {
        const nextCategories = Array.isArray(res.data?.data) ? res.data.data : [];
        setCategories(nextCategories);
        setSelectedCategory((current) => current ?? initialData?.categoryId ?? nextCategories[0]?.id ?? null);
      })
      .catch((err) => {
        console.error(err);
        setCategories([]);
      })
      .finally(() => {
        setLoadingCategories(false);
      });
  }, [initialData?.categoryId]);

  const getCategoryIcon = (name = '') => {
    const normalizedName = name.toLowerCase();

    if (normalizedName.includes('car')) return Car;
    if (normalizedName.includes('motor') || normalizedName.includes('bike')) return Bike;
    if (normalizedName.includes('bicycle')) return Settings;
    if (normalizedName.includes('appliance') || normalizedName.includes('fridge') || normalizedName.includes('washer')) return Refrigerator;
    if (normalizedName.includes('plumb') || normalizedName.includes('water')) return Droplets;
    if (normalizedName.includes('elect')) return Zap;

    return Wrench;
  };

  const handlePhotoChange = (event) => {
    const nextFiles = Array.from(event.target.files || []);

    if (!nextFiles.length) {
      return;
    }

    setPhotos((current) => {
      const remainingSlots = 3 - current.length;

      if (remainingSlots <= 0) {
        setPhotoError('You can upload up to 3 photos only.');
        return current;
      }

      const acceptedFiles = createPhotoItems(nextFiles.slice(0, remainingSlots));

      if (nextFiles.length > remainingSlots) {
        setPhotoError('Only the first 3 photos were kept.');
      } else {
        setPhotoError('');
      }

      return [...current, ...acceptedFiles];
    });

    event.target.value = '';
  };

  const removePhoto = (indexToRemove) => {
    setPhotos((current) => {
      const target = current[indexToRemove];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((_, index) => index !== indexToRemove);
    });
    setPhotoError('');
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setFormError('Geolocation is not supported in this browser.');
      return;
    }

    setLocating(true);
    setFormError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLatitude = String(position.coords.latitude);
        const nextLongitude = String(position.coords.longitude);

        try {
          const detectedAddress = await reverseGeocode(nextLatitude, nextLongitude);

          if (!detectedAddress) {
            throw new Error('Address not found');
          }

          setLatitude(nextLatitude);
          setLongitude(nextLongitude);
          setServiceAddress(detectedAddress);
          setFormError('');
        } catch (error) {
          console.error(error);
          setFormError('Unable to detect your address from the current location.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setFormError('Unable to get your current location.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = () => {
    if (!selectedCategory) {
      setFormError('Please select a category.');
      return;
    }

    if (!issueDescription.trim()) {
      setFormError('Please describe the problem.');
      return;
    }

    if (latitude === '' || longitude === '') {
      setFormError('Please provide your location.');
      return;
    }

    if (!serviceAddress.trim()) {
      setFormError('Please use your current location to detect the service address.');
      return;
    }

    setFormError('');

    onNext?.({
      categoryId: Number(selectedCategory),
      categoryName: categories.find((category) => category.id === selectedCategory)?.name || '',
      categoryImage: categories.find((category) => category.id === selectedCategory)?.imageUrl || '',
      issueDescription: issueDescription.trim(),
      serviceAddress: serviceAddress.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      urgentLevel: urgency,
      photoFiles: photos.map((photo) => photo.file),
    });
  };

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-10 mb-20">
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">What can we help you fix today?</h1>
        <p className="text-slate-500">Select a category, describe the issue, and add your location before choosing a fixer.</p>
      </section>

      <div
        className={`mb-12 ${
          shouldUseHorizontalCategoryScroll
            ? 'flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]'
            : 'grid grid-cols-1 md:grid-cols-3 gap-4'
        }`}
      >
        {loadingCategories && (
          <p className="text-sm text-slate-500">Loading categories...</p>
        )}

        {!loadingCategories && categories.map((cat) => {
          const Icon = getCategoryIcon(cat.name);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 p-8 transition-all duration-200 group ${
                shouldUseHorizontalCategoryScroll ? 'w-[17rem] min-w-[17rem]' : ''
              } ${
                selectedCategory === cat.id
                  ? 'border-violet-500 bg-violet-50/30'
                  : 'border-gray-100 hover:border-violet-200'
              }`}
            >
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-16 h-16 mb-4 rounded-2xl object-cover"
                />
              ) : (
                <Icon className={`w-8 h-8 mb-4 transition-colors ${
                  selectedCategory === cat.id ? 'text-violet-600' : 'text-slate-400 group-hover:text-violet-400'
                }`} />
              )}
              <h3 className="font-bold text-slate-800 mb-1">{cat.name}</h3>
              <p className="text-xs text-slate-400 text-center">{cat.description}</p>
            </button>
          );
        })}

        {!loadingCategories && categories.length === 0 && (
          <p className="text-sm text-slate-500">No categories available.</p>
        )}
      </div>

      <section className="mb-12">
        <h2 className="text-lg font-bold text-slate-800 mb-4">What&apos;s the problem?</h2>
        <textarea
          value={issueDescription}
          onChange={(event) => setIssueDescription(event.target.value)}
          placeholder="e.g., My kitchen sink is leaking from the base and the wood underneath is damp. It seems to happen only when the faucet is running..."
          className="w-full h-32 p-6 rounded-2xl bg-slate-50/50 border border-slate-100 text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
        />
      </section>

      <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Service address</h2>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 text-slate-700 min-h-16 flex items-center">
            {serviceAddress ? (
              <span>{serviceAddress}</span>
            ) : (
              <span className="text-slate-400">Use current location to detect your service address</span>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-3 font-semibold text-violet-700 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {locating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            {locating ? 'Getting location...' : 'Use current location'}
          </button>
          {latitude !== '' && longitude !== '' && (
            <p className="mt-3 text-xs text-slate-400">
              Coordinates captured and will be saved with the booking.
            </p>
          )}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Photos <span className="font-normal text-slate-400">(Optional)</span></h2>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={handlePhotoChange}
        />
        {photos.length < 3 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center bg-slate-50/30 hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 mb-4 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            {photos.length === 0 ? (
              <>
                <p className="font-bold text-slate-800 mb-1">Click to upload photos</p>
                <p className="text-xs text-slate-400">PNG, JPG or WEBP, up to 3 photos total</p>
              </>
            ) : (
              <p className="text-sm font-medium text-slate-500">Add more photos</p>
            )}
          </button>
        )}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>{photos.length}/3 photos selected</span>
          {photoError && <span className="text-red-500">{photoError}</span>}
        </div>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {photos.map((photo, index) => (
              <div key={`${photo.file.name}-${index}`} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <img
                  src={photo.previewUrl}
                  alt={photo.file.name}
                  className="aspect-square w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-bold text-slate-800 mb-4">How soon do you need help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {urgencyOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setUrgency(opt.id)}
              className={`flex flex-col p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                urgency === opt.id
                  ? 'border-violet-500 bg-violet-50/30'
                  : 'border-gray-100 hover:border-violet-200'
              }`}
            >
              <opt.icon className={`w-5 h-5 mb-4 ${
                opt.color === 'violet' ? 'text-violet-500' :
                opt.color === 'orange' ? 'text-orange-500' : 'text-red-500'
              }`} />
              <h3 className="font-bold text-slate-800 mb-2">{opt.label}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {formError && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
          {formError}
        </div>
      )}

      <div className="flex justify-center pt-6 border-t border-slate-50">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isFormComplete}
          className={`flex items-center gap-2 rounded-2xl px-12 py-4 font-bold transition-all ${
            isFormComplete
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 hover:bg-violet-700 hover:shadow-violet-300 active:scale-95'
              : 'cursor-not-allowed bg-slate-200 text-slate-400 shadow-none'
          }`}
        >
          Next: Find an Expert
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BookingForm;
