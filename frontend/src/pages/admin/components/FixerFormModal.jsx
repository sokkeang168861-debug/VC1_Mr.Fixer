import React, { useEffect, useRef, useState } from 'react';
import { User, Briefcase, X } from 'lucide-react';
import { motion as Motion } from 'motion/react';

const IMAGE_MAX_DIMENSION = 1280;
const IMAGE_QUALITY = 0.82;

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  companyName: '',
  latitude: '',
  longitude: '',
  location: '',
  experience: '',
  bio: '',
  categoryIds: [],
};

const FixerForm = ({ title, onClose, onSave, initialData = {}, categories = [] }) => {
  const [form, setForm] = useState(emptyForm);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef('');

  useEffect(() => {
    const next = {
      fullName: initialData?.name || initialData?.fullName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      companyName: initialData?.companyName || '',
      latitude:
        initialData?.latitude === null || initialData?.latitude === undefined
          ? ''
          : String(initialData.latitude),
      longitude:
        initialData?.longitude === null || initialData?.longitude === undefined
          ? ''
          : String(initialData.longitude),
      location: initialData?.location || '',
      experience: initialData?.experience || '',
      bio: initialData?.bio || '',
      categoryIds: Array.isArray(initialData?.categoryIds)
        ? initialData.categoryIds
        : [],
    };
    setForm(next);
    setSelectedPhoto(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = '';
    }
    setPhotoPreview(initialData?.avatar || '');
  }, [initialData]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

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

    if (form.latitude === '' || form.longitude === '') {
      setError('Latitude and longitude are required');
      return;
    }

    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError('Latitude and longitude must be valid numbers');
      return;
    }

    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    try {
      setSaving(true);
      await onSave({ ...form, profileImage: selectedPhoto });
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
        <button 
          onClick={onClose}
          className="absolute right-8 top-8 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Photo Upload Section */}
          <div className="md:col-span-4">
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
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Fixer profile preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User size={40} />
                )}
              </div>
              <span className="text-blue-600 font-semibold text-sm">Upload Photo</span>
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Company name</label>
              <input 
                type="text" 
                placeholder="e.g.Bike company"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                value={form.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
              />
            </div>
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Latitude</label>
              <input 
                type="number"
                step="any"
                placeholder="e.g. 11.5564"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                value={form.latitude}
                onChange={(e) => updateField('latitude', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Longitude</label>
              <input 
                type="number"
                step="any"
                placeholder="e.g. 104.9282"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                value={form.longitude}
                onChange={(e) => updateField('longitude', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Location Label (optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Tuol Kork, Phnom Penh"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
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
        <div className="mt-8 flex justify-end gap-3 sticky bottom-0 bg-white pt-4">
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
            {saving ? 'Saving...' : title.toLowerCase().includes('edit') ? 'Update' : 'Save'}
          </button>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default FixerForm;
