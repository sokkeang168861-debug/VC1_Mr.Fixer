import React, { useRef, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Upload, Image as ImageIcon, X } from 'lucide-react';
import httpClient from '../../../api/httpClient';

export default function CategoryForm({ mode, categoryData, setCategoryData, onClose, fetchCategories }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setCategoryData({ ...categoryData, image: file, imageUrl: URL.createObjectURL(file) });
  };

  const removeImage = () => {
    setCategoryData({ ...categoryData, image: null, imageUrl: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', categoryData.name);
      formData.append('description', categoryData.description);
      if (categoryData.image) formData.append('image', categoryData.image);

      const url = mode === 'add' ? '/admin/createCategory' : `/admin/updateCategory/${categoryData.id}`;
      if (mode === 'add') await httpClient.post(url, formData);
      else await httpClient.put(url, formData);

      await fetchCategories();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
        <Motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
        >
          <form onSubmit={handleSubmit}>
            <div className="p-8 pb-4 flex justify-between items-start">
              <div className="space-y-4">
                <button type="button" onClick={onClose} className="text-blue-500 hover:text-blue-600">
                  <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold text-slate-900">{mode === 'add' ? 'Add New Category' : 'Edit Category'}</h1>
              </div>
            </div>

            <div className="px-8 py-4 space-y-6">
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-800">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                  placeholder="e.g. Car Repair"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-800">Category Image</label>
                <div className="flex items-center space-x-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all group overflow-hidden"
                  >
                    {categoryData.imageUrl ? (
                      <>
                        <img src={categoryData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload className="text-white" size={20} />
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="text-slate-300 group-hover:text-slate-400" size={24} />
                        <span className="text-[10px] text-slate-400 mt-1 font-medium">Upload</span>
                      </>
                    )}
                  </div>
                  {categoryData.imageUrl && (
                    <button type="button" onClick={removeImage} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                      <X size={20} />
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-800">Description</label>
                <textarea
                  required
                  value={categoryData.description}
                  onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                  placeholder="Describe the service..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="p-8 pt-4 flex items-center justify-end space-x-6 border-t border-slate-50 mt-4">
              <button type="button" onClick={onClose} className="text-slate-500 font-bold hover:text-slate-700">Cancel</button>
              <button
                disabled={submitting}
                className="px-8 py-3 bg-[#1D80E7] text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
              >
                {submitting ? 'Processing...' : mode === 'add' ? 'Add Category' : 'Update'}
              </button>
            </div>
          </form>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
}
