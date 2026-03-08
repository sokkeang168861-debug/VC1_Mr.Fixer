/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Search,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import httpClient from '../../../api/httpClient';

export default function ServiceCategories() {
  const [mode, setMode] = useState('none'); // 'add' | 'edit' | 'none'
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [categoryData, setCategoryData] = useState({
    id: null,
    name: '',
    description: '',
    image: null,
    imageUrl: '',
  });

  const fileInputRef = useRef(null);

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await httpClient.get('/admin/getAllCategories');
      console.log('Categories API Response:', res.data);
      setCategories(res.data?.data || []);
      setError('');
    } catch (err) {
      console.error('Fetch Categories Error:', err);
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleOpenAdd = () => {
    setCategoryData({ id: null, name: '', description: '', image: null, imageUrl: '' });
    setMode('add');
  };

  const handleOpenEdit = (category) => {
    setCategoryData({
      id: category.id,
      name: category.name,
      description: category.description,
      image: null,
      imageUrl: category.imageUrl || '',
    });
    setMode('edit');
  };

  const handleClose = () => {
    setMode('none');
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCategoryData({ ...categoryData, image: file, imageUrl: url });
    }
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
      if (categoryData.image) {
        formData.append('image', categoryData.image);
      }

      if (mode === 'add') {
        await httpClient.post('/admin/createCategory', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await httpClient.put(`/admin/updateCategory/${categoryData.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      await fetchCategories();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await httpClient.delete(`/admin/deleteCategory/${id}`);
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">Service Categories</h1>
            <p className="text-slate-400">Manage all available service categories for the platform.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-6 py-3 bg-[#1D80E7] text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={20} />
            <span>Add New Category</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search categories"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300"
          />
        </div>

        {error && !mode !== 'none' && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading categories...</div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden">
                          {category.imageUrl ? (
                            <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="text-slate-300" size={20} />
                          )}
                        </div>
                        <span className="font-bold text-slate-700">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                        {category.description}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleOpenEdit(category)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCategories.length === 0 && (
              <div className="p-20 text-center space-y-3">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                  <Search size={32} />
                </div>
                <p className="text-slate-400 font-medium">No categories found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {mode !== 'none' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
            >
              <form onSubmit={handleSubmit}>
                <div className="p-8 pb-4 flex justify-between items-start">
                  <div className="space-y-4">
                    <button 
                      type="button"
                      onClick={handleClose}
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900">
                      {mode === 'add' ? 'Add New Category' : 'Edit Category'}
                    </h1>
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 text-slate-700"
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 text-slate-700 resize-none"
                    />
                  </div>
                </div>

                <div className="p-8 pt-4 flex items-center justify-end space-x-6 border-t border-slate-50 mt-4">
                  <button type="button" onClick={handleClose} className="text-slate-500 font-bold hover:text-slate-700 transition-colors">
                    Cancel
                  </button>
                  <button
                    disabled={submitting}
                    className="px-8 py-3 bg-[#1D80E7] text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? 'Processing...' : mode === 'add' ? 'Add Category' : 'Update'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
