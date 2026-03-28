import React, { useEffect, useRef, useState } from 'react';
import { Briefcase, X, MapPin, Loader2, QrCode } from 'lucide-react';
import { motion as Motion } from 'motion/react';
import defaultProfile from '@/assets/image/default-profile.png';

const IMAGE_MAX_DIMENSION = 1280;
const IMAGE_QUALITY = 0.82;

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  companyName: '',
  location: '',
  experience: '',
  bio: '',
  categoryIds: [],
};

const getOpenStreetMapEmbedUrl = ({ lat, lng }) => {
  const delta = 0.01;
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
};

const FixerForm = ({ title, onClose, onSave, initialData = {}, categories = [] }) => {
  const [form, setForm] = useState(emptyForm);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [selectedQr, setSelectedQr] = useState(null);
  const [qrPreview, setQrPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState('');
  const fileInputRef = useRef(null);
  const qrInputRef = useRef(null);
  const objectUrlRef = useRef('');
  const qrObjectUrlRef = useRef('');
  const geocodeAbortRef = useRef(null);
  const isEditMode = title.toLowerCase().includes('edit');

  useEffect(() => {
    const next = {
      fullName: initialData?.name || initialData?.fullName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      companyName: initialData?.companyName || '',
      location: initialData?.location || '',
      experience: initialData?.experience || '',
      bio: initialData?.bio || '',
      categoryIds: Array.isArray(initialData?.categoryIds)
        ? initialData.categoryIds
        : [],
    };
    setForm(next);
    setSelectedPhoto(null);
    setSelectedQr(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = '';
    }
    if (qrObjectUrlRef.current) {
      URL.revokeObjectURL(qrObjectUrlRef.current);
      qrObjectUrlRef.current = '';
    }
    setPhotoPreview(initialData?.avatar || '');
    setQrPreview(initialData?.qr || '');
    setMapError('');
    setMapLoading(false);
    setMapCoordinates(
      initialData?.latitude !== null &&
        initialData?.latitude !== undefined &&
        initialData?.longitude !== null &&
        initialData?.longitude !== undefined
        ? {
            lat: Number(initialData.latitude),
            lng: Number(initialData.longitude),
          }
        : null
    );
  }, [initialData]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      if (qrObjectUrlRef.current) {
        URL.revokeObjectURL(qrObjectUrlRef.current);
      }
      if (geocodeAbortRef.current) {
        geocodeAbortRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const address = form.location.trim();

    if (!address) {
      setMapCoordinates(null);
      setMapError('');
      setMapLoading(false);
      if (geocodeAbortRef.current) {
        geocodeAbortRef.current.abort();
        geocodeAbortRef.current = null;
      }
      return;
    }

    const controller = new AbortController();
    geocodeAbortRef.current?.abort();
    geocodeAbortRef.current = controller;

    const timeoutId = window.setTimeout(async () => {
      try {
        setMapLoading(true);
        setMapError('');

        const params = new URLSearchParams({
          format: 'jsonv2',
          q: address,
          limit: '1',
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            headers: {
              Accept: 'application/json',
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error('Unable to preview this address on the map.');
        }

        const results = await response.json();
        const bestMatch = Array.isArray(results) ? results[0] : null;
        const lat = Number(bestMatch?.lat);
        const lng = Number(bestMatch?.lon);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          setMapCoordinates(null);
          setMapError('Address not found on the map yet. Try a more specific address.');
          return;
        }

        setMapCoordinates({
          lat: Number(lat.toFixed(8)),
          lng: Number(lng.toFixed(8)),
        });
      } catch (err) {
        if (err?.name === 'AbortError') return;
        setMapCoordinates(null);
        setMapError(err?.message || 'Unable to preview this address on the map.');
      } finally {
        if (!controller.signal.aborted) {
          setMapLoading(false);
        }
      }
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [form.location]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (id) => {
    setForm((prev) => {
      const exists = prev.categoryIds.includes(id);
      return {
        ...prev,
        categoryIds: exists
          ? prev.categoryIds.filter((c) => c !== id)
          : [...prev.categoryIds, id],
      };
    });
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.fullName || !form.email) {
      setError('Full name and email are required');
      return;
    }

    if (!form.location.trim()) {
      setError('Address is required');
      return;
    }

    if (!mapCoordinates) {
      setError('Please enter an address that can be located on the map before saving');
      return;
    }

    try {
      setSaving(true);
      await onSave({ ...form, profileImage: selectedPhoto, qrImage: selectedQr });
    } catch (err) {
      setError(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (event) => {
    const loadImage = (file) =>
      new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Unable to load image'));
        };
        img.src = url;
      });

    const compressImage = async (file) => {
      const image = await loadImage(file);

      const width = image.width || 0;
      const height = image.height || 0;
      if (!width || !height) return file;

      const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(width, height));
      const nextWidth = Math.max(1, Math.round(width * scale));
      const nextHeight = Math.max(1, Math.round(height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = nextWidth;
      canvas.height = nextHeight;

      const context = canvas.getContext('2d');
      if (!context) return file;

      context.drawImage(image, 0, 0, nextWidth, nextHeight);

      const compressedBlob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', IMAGE_QUALITY)
      );

      if (!compressedBlob) return file;
      if (compressedBlob.size >= file.size) return file;

      const safeName = file.name.replace(/\.[^.]+$/, '') || 'profile';
      return new File([compressedBlob], `${safeName}.jpg`, {
        type: 'image/jpeg',
      });
    };

    const applyPhoto = async () => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      let processed = file;
      try {
        processed = await compressImage(file);
      } catch {
        processed = file;
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const nextPreview = URL.createObjectURL(processed);
      objectUrlRef.current = nextPreview;
      setSelectedPhoto(processed);
      setPhotoPreview(nextPreview);
      setError(null);
    };

    void applyPhoto();
  };

  const handleQrChange = (event) => {
    const applyQr = async () => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setError('Please select a valid QR image file');
        return;
      }

      let processed = file;
      try {
        processed = await (async () => {
          const loadImage = (sourceFile) =>
            new Promise((resolve, reject) => {
              const url = URL.createObjectURL(sourceFile);
              const img = new Image();
              img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
              };
              img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Unable to load image'));
              };
              img.src = url;
            });

          const image = await loadImage(file);
          const width = image.width || 0;
          const height = image.height || 0;
          if (!width || !height) return file;

          const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(width, height));
          const nextWidth = Math.max(1, Math.round(width * scale));
          const nextHeight = Math.max(1, Math.round(height * scale));

          const canvas = document.createElement('canvas');
          canvas.width = nextWidth;
          canvas.height = nextHeight;
          const context = canvas.getContext('2d');
          if (!context) return file;

          context.drawImage(image, 0, 0, nextWidth, nextHeight);

          const compressedBlob = await new Promise((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', IMAGE_QUALITY)
          );

          if (!compressedBlob || compressedBlob.size >= file.size) return file;

          const safeName = file.name.replace(/\.[^.]+$/, '') || 'qr';
          return new File([compressedBlob], `${safeName}.jpg`, {
            type: 'image/jpeg',
          });
        })();
      } catch {
        processed = file;
      }

      if (qrObjectUrlRef.current) {
        URL.revokeObjectURL(qrObjectUrlRef.current);
      }

      const nextPreview = URL.createObjectURL(processed);
      qrObjectUrlRef.current = nextPreview;
      setSelectedQr(processed);
      setQrPreview(nextPreview);
      setError(null);
    };

    void applyQr();
  };

  return (
    <Motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <Motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 md:p-8 relative my-8 max-h-[85vh] overflow-y-auto"
      >

        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Photo Upload Section */}
          <div className="md:col-span-4 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square rounded-3xl border-2 border-dashed border-blue-100 bg-blue-50/30 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-blue-50 transition-colors"
            >
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
                <img
                  src={photoPreview || defaultProfile}
                  alt="Fixer profile preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-blue-600 font-semibold text-sm">
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
              </span>
            </button>

            <input
              ref={qrInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleQrChange}
            />
            <button
              type="button"
              onClick={() => qrInputRef.current?.click()}
              className="w-full rounded-3xl border-2 border-dashed border-emerald-100 bg-emerald-50/30 p-4 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-emerald-50 transition-colors"
            >
              <div className="h-32 w-full rounded-2xl bg-white border border-emerald-100 flex items-center justify-center overflow-hidden">
                {qrPreview ? (
                  <img
                    src={qrPreview}
                    alt="Fixer QR preview"
                    className="h-full w-full object-contain p-3"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <QrCode className="mx-auto h-10 w-10 text-emerald-300" />
                    <div className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
                      Payment QR
                    </div>
                    <div className="mt-2 text-sm">No QR uploaded yet</div>
                  </div>
                )}
              </div>
              <span className="text-emerald-700 font-semibold text-sm">
                {qrPreview ? 'Change QR' : 'Upload QR'}
              </span>
            </button>
          </div>

          {/* Basic Info Fields */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. Michael"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input 
                type="email" 
                placeholder="m.scott@example.com"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
              <input 
                type="text" 
                placeholder="+1 (555) 000-0000"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
              <input 
                type="text" 
                placeholder="e.g.Bike company"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                value={form.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
              />
            </div>
            {!isEditMode ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                New fixer accounts are created with the default password <span className="font-bold">secret123</span>.
              </div>
            ) : null}
          </div>
        </div>

        {/* Professional Details Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={20} className="text-blue-600" />
            <h3 className="font-bold text-lg">Professional Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={form.categoryIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  <div className="w-6 h-6 border-2 border-slate-200 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                  <svg className="absolute w-4 h-4 text-white left-1 opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{cat.name}</span>
              </label>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
              <input 
                type="text" 
                placeholder="e.g. Tuol Kork, Phnom Penh"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">
                The system will automatically convert this address into latitude and longitude before saving.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-blue-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Location Preview</p>
                    <p className="text-xs text-slate-500">
                      Check the map before saving this fixer account.
                    </p>
                  </div>
                </div>
                {mapLoading ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                    <Loader2 size={14} className="animate-spin" />
                    Finding...
                  </span>
                ) : null}
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {mapCoordinates ? (
                  <iframe
                    title="Fixer address preview"
                    src={getOpenStreetMapEmbedUrl(mapCoordinates)}
                    className="h-64 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center px-6 text-center text-sm text-slate-500">
                    {form.location.trim()
                      ? mapError || 'Searching for this address on the map...'
                      : 'Enter an address to preview the saved location on the map.'}
                  </div>
                )}
              </div>

              {mapCoordinates ? (
                <p className="mt-3 text-xs font-medium text-slate-600">
                  Auto-detected coordinates: {mapCoordinates.lat}, {mapCoordinates.lng}
                </p>
              ) : null}
              {mapError ? (
                <p className="mt-3 text-xs font-semibold text-amber-600">{mapError}</p>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Years of Experience</label>
              <input 
                type="text" 
                placeholder="e.g. 5"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                value={form.experience}
                onChange={(e) => updateField('experience', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Professional Bio</label>
              <textarea 
                rows={4}
                placeholder="Briefly describe the fixer's expertise and work history..."
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm resize-none"
                value={form.bio}
                onChange={(e) => updateField('bio', e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-8 flex justify-between gap-3 sticky bottom-0 bg-white pt-4">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors border border-slate-200"
          >
            Cancel
          </button>
          <button 
            disabled={saving}
            onClick={handleSubmit}
            className="px-10 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            {saving ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
          </button>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default FixerForm;
