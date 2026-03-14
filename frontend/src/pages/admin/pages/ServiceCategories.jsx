import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import httpClient from '../../../api/httpClient';
import CategoryForm from '../components/CategoryForm';
import CategoryTable from '../components/CategoryTable';
import Sidebar from '../components/Sidebar';

export default function ServiceCategories() {
  const [mode, setMode] = useState('none'); // 'add' | 'edit' | 'none'
  const [categories, setCategories] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await httpClient.get('/admin/getAllCategories');
      setCategories(res.data?.data || []);
      setError('');
    } catch (err) {
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

  const handleClose = () => setMode('none');

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-y-auto text-slate-900">
        <main className="p-8 md:p-12 flex flex-col gap-6">
          <div className="max-w-6xl mx-auto space-y-8 font-sans text-slate-900 w-full">
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

            <CategoryTable
              categories={filteredCategories}
              loading={loading}
              error={error}
              onEdit={handleOpenEdit}
              fetchCategories={fetchCategories}
            />

            {mode !== 'none' && (
              <CategoryForm
                mode={mode}
                categoryData={categoryData}
                setCategoryData={setCategoryData}
                onClose={handleClose}
                fetchCategories={fetchCategories}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}