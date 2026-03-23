/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Star,
  ChevronDown
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'motion/react';
import httpClient from '@/api/httpClient';
import FixerForm from '../components/FixerFormModal';
import FixerDetail from '../components/FixerDetails';
import Sidebar from '../components/Sidebar';

// Category badge component
const CategoryBadge = ({ category }) => {
  const colors = {
    Electrical: 'bg-purple-100 text-purple-600',
    'Appliance Repair': 'bg-emerald-100 text-emerald-600',
    Plumbing: 'bg-blue-100 text-blue-600',
    HVAC: 'bg-orange-100 text-orange-600',
  };

  return (
    <span
      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
        colors[category] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {category}
    </span>
  );
};

const normalizeFixer = (fixer) => {
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fixer.name || 'Fixer'
  )}&background=E0E7FF&color=1F2937`;
  const categoryLabel = Array.isArray(fixer.categories)
    ? fixer.categories[0] || 'Unassigned'
    : fixer.category || 'Unassigned';

  return {
    ...fixer,
    category: categoryLabel,
    categories: Array.isArray(fixer.categories)
      ? fixer.categories
      : fixer.category
      ? [fixer.category]
      : [],
    categoryIds: Array.isArray(fixer.categoryIds) ? fixer.categoryIds : [],
    fixerId:
      fixer.fixerId ||
      (fixer.providerId
        ? `FX-${String(fixer.providerId).padStart(4, '0')}`
        : `FX-${String(fixer.userId || '0').padStart(4, '0')}`),
    jobs: fixer.totalBookings ?? fixer.jobs ?? 0,
    rating: Number(fixer.rating ?? 0),
    avatar: fixer.avatar || fallbackAvatar,
    companyName: fixer.companyName || '',
    location: fixer.location || '',
    latitude:
      fixer.latitude === null || fixer.latitude === undefined
        ? ''
        : String(fixer.latitude),
    longitude:
      fixer.longitude === null || fixer.longitude === undefined
        ? ''
        : String(fixer.longitude),
    experience: fixer.experience || '',
    bio: fixer.bio || '',
  };
};

export default function App() {
  const [fixers, setFixers] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All category');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedFixer, setSelectedFixer] = useState(null);
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = useMemo(() => {
    const categorySet = new Set(
      fixers.flatMap((f) =>
        Array.isArray(f.categories)
          ? f.categories
          : f.category
          ? [f.category]
          : []
      )
    );
    const dynamic = Array.from(categorySet);
    const fromServer = categoriesData.map((c) => c.name);
    const merged = Array.from(new Set([...dynamic, ...fromServer]));
    return ['All category', ...merged];
  }, [fixers, categoriesData]);

  const filteredFixers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return fixers.filter((fixer) => {
      const matchesSearch =
        !query ||
        fixer.name.toLowerCase().includes(query) ||
        fixer.fixerId.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === 'All category' ||
        fixer.category === categoryFilter ||
        (Array.isArray(fixer.categories) &&
          fixer.categories.includes(categoryFilter));
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter, fixers]);

  const selectedFixerWithIds = useMemo(() => {
    if (!selectedFixer) return null;
    const nameToId = new Map(categoriesData.map((c) => [c.name, c.id]));
    const categoryIds =
      Array.isArray(selectedFixer.categoryIds) && selectedFixer.categoryIds.length
        ? selectedFixer.categoryIds
        : Array.isArray(selectedFixer.categories)
        ? selectedFixer.categories
            .map((name) => nameToId.get(name))
            .filter(Boolean)
        : [];
    return { ...selectedFixer, categoryIds };
  }, [selectedFixer, categoriesData]);

  useEffect(() => {
    let isMounted = true;

    const fetchFixers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await httpClient.get('/admin/fixers');
        const data = response.data?.data || [];
        if (isMounted) {
          setFixers(data.map(normalizeFixer));
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err.response?.data?.message ||
            err.message ||
            'Failed to load fixer list';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFixers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const res = await httpClient.get('/admin/getAllCategories');
        const data = res.data?.data || [];
        if (isMounted) setCategoriesData(data);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddClick = () => {
    setError(null);
    setFormMode('add');
    setSelectedFixer(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (e, fixer) => {
    e.stopPropagation();
    setError(null);
    setFormMode('edit');
    setSelectedFixer(fixer);
    setIsFormOpen(true);
  };

  const handleRowClick = (fixer) => {
    setSelectedFixer(fixer);
    setView('detail');
  };

  const handleSave = (data) => {
    if (formMode === 'edit') {
      return upsertFixer(data);
    } else {
      return createFixer(data);
    }
  };

  const buildFixerFormData = (payload = {}) => {
    const formData = new FormData();
    const textFields = [
      'fullName',
      'email',
      'phone',
      'companyName',
      'location',
      'latitude',
      'longitude',
      'experience',
      'bio',
    ];

    textFields.forEach((field) => {
      const value = payload[field];
      if (value !== undefined && value !== null) {
        formData.append(field, String(value));
      }
    });

    if (Array.isArray(payload.categoryIds)) {
      payload.categoryIds.forEach((id) => {
        formData.append('categoryIds', String(id));
      });
    }

    if (payload.profileImage instanceof File) {
      formData.append('profile_img', payload.profileImage);
    }

    return formData;
  };

  const createFixer = async (payload) => {
    const formData = buildFixerFormData(payload);

    try {
      setLoading(true);
      setError(null);
      const createRes = await httpClient.post('/admin/fixers', formData);
      const generatedPassword = createRes.data?.data?.temporaryPassword;

      const res = await httpClient.get('/admin/fixers');
      const data = res.data?.data || [];
      setFixers(data.map(normalizeFixer));
      setIsFormOpen(false);

      if (generatedPassword) {
        window.alert(
          `Fixer created successfully.\nEmail: ${payload.email}\nTemporary password: ${generatedPassword}`
        );
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to create fixer';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const upsertFixer = async (payload) => {
    if (!selectedFixer?.providerId) return;
    const formData = buildFixerFormData(payload);
    try {
      setLoading(true);
      setError(null);
      await httpClient.put(`/admin/fixers/${selectedFixer.providerId}`, formData);
      // refresh list
      const res = await httpClient.get('/admin/fixers');
      const data = res.data?.data || [];
      setFixers(data.map(normalizeFixer));
      setIsFormOpen(false);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to save fixer';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, fixer) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(
      `Delete fixer "${fixer.name}"? This will remove their services and bookings.`
    );
    if (!confirmDelete) return;
    try {
      setLoading(true);
      await httpClient.delete(`/admin/fixers/${fixer.providerId}`);
      setFixers((prev) =>
        prev.filter((f) => f.providerId !== fixer.providerId)
      );
      if (selectedFixer?.providerId === fixer.providerId) {
        setSelectedFixer(null);
        setView('list');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to delete fixer';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-y-auto text-slate-900">
        <main className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {view === 'list' ? (
              <Motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <header className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight">
                    Fixer Management
                  </h1>
                </header>

                {/* Stats Card */}
                <div className="mb-8">
                  <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 w-64"
                  >
                    <p className="text-slate-400 text-sm font-medium mb-1">
                      Total Fixers
                    </p>
                    <h2 className="text-4xl font-bold">{fixers.length}</h2>
                  </Motion.div>
                </div>

                {/* Search and Action Bar */}
                <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-3xl shadow-sm border border-slate-50">
                  <div className="flex items-center gap-4 flex-1 max-w-5xl">
                    <div className="relative flex-1">
                      <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Search by name or ID"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl text-sm font-medium text-slate-600">
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="bg-transparent outline-none text-slate-700 font-semibold cursor-pointer"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  >
                    <Plus size={18} />
                    Add New Fixer
                  </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Fixer Name
                        </th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Category
                        </th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Rating
                        </th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Jobs
                        </th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-8 py-8 text-center text-slate-500"
                          >
                            Loading fixers...
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-8 py-8 text-center text-red-500 font-semibold"
                          >
                            {error}
                          </td>
                        </tr>
                      ) : filteredFixers.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-8 py-8 text-center text-slate-500"
                          >
                            No fixers found.
                          </td>
                        </tr>
                      ) : (
                        <AnimatePresence>
                          {filteredFixers.map((fixer, index) => (
                            <Motion.tr
                              key={`${fixer.providerId || fixer.userId || index}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleRowClick(fixer)}
                              className="group cursor-pointer hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-none"
                            >
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-4">
                                  <img
                                    src={fixer.avatar}
                                    alt={fixer.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div>
                                    <p className="font-bold text-sm text-slate-800">
                                      {fixer.name}
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium tracking-tight">
                                      ID: {fixer.fixerId}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-4">
                                <CategoryBadge category={fixer.category} />
                              </td>
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-1.5">
                                  <Star
                                    size={14}
                                    className="fill-orange-400 text-orange-400"
                                  />
                                  <span className="text-sm font-bold text-orange-500">
                                    {Number(fixer.rating || 0).toFixed(1)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-8 py-4">
                                <span className="text-sm font-bold text-slate-700">
                                  {fixer.jobs}
                                </span>
                              </td>
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={(e) => handleEditClick(e, fixer)}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={(e) => handleDelete(e, fixer)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors "
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </Motion.tr>
                          ))}
                        </AnimatePresence>
                      )}
                    </tbody>
                  </table>
                </div>
              </Motion.div>
            ) : (
              <FixerDetail
                fixer={selectedFixer}
                onBack={() => setView('list')}
                onEdit={() => {
                  setFormMode('edit');
                  setIsFormOpen(true);
                }}
              />
            )}
          </AnimatePresence>
        </main>

        {/* Form Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <FixerForm
              title={formMode === 'add' ? 'Add New Fixer' : 'Edit fixer'}
              onClose={() => setIsFormOpen(false)}
              onSave={handleSave}
              initialData={selectedFixerWithIds}
              categories={categoriesData}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
