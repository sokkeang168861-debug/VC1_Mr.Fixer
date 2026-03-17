/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Wrench,
  ArrowRightLeft,
  LogOut,
  Search,
  Plus,
  Edit2,
  Trash2,
  Star,
  ChevronDown
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'motion/react';
import FixerForm from '../components/FixerFormModal';
import FixerDetail from '../components/FixerDetails';
import Sidebar from '../components/Sidebar';

// Sample data
const fixersData = [
  { id: '1', name: 'Elena Rodriguez', fixerId: 'FX-4510', category: 'Electrical', rating: 4.8, jobs: 215, avatar: 'https://i.pravatar.cc/150?u=elena' },
  { id: '2', name: 'Sophie Müller', fixerId: 'FX-1029', category: 'Appliance Repair', rating: 4.5, jobs: 24, avatar: 'https://i.pravatar.cc/150?u=sophie' },
  { id: '3', name: 'Marcus Thompson', fixerId: 'FX-8821', category: 'Plumbing', rating: 4.9, jobs: 342, avatar: 'https://i.pravatar.cc/150?u=marcus' },
  { id: '4', name: 'Sophie Müller', fixerId: 'FX-1029', category: 'Appliance Repair', rating: 4.5, jobs: 24, avatar: 'https://i.pravatar.cc/150?u=sophie2' },
  { id: '5', name: 'Sophie Müller', fixerId: 'FX-1029', category: 'Appliance Repair', rating: 4.5, jobs: 24, avatar: 'https://i.pravatar.cc/150?u=sophie3' },
  { id: '6', name: 'David Chen', fixerId: 'FX-9923', category: 'HVAC', rating: 5.0, jobs: 78, avatar: 'https://i.pravatar.cc/150?u=david' },
  { id: '7', name: 'Sophie Müller', fixerId: 'FX-1029', category: 'Appliance Repair', rating: 4.5, jobs: 24, avatar: 'https://i.pravatar.cc/150?u=sophie4' },
  { id: '8', name: 'Marcus Thompson', fixerId: 'FX-8821', category: 'Plumbing', rating: 4.9, jobs: 342, avatar: 'https://i.pravatar.cc/150?u=marcus2' },
];

// Category badge component
const CategoryBadge = ({ category }) => {
  const colors = {
    'Electrical': 'bg-purple-100 text-purple-600',
    'Appliance Repair': 'bg-emerald-100 text-emerald-600',
    'Plumbing': 'bg-blue-100 text-blue-600',
    'HVAC': 'bg-orange-100 text-orange-600',
  };

  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${colors[category] || 'bg-slate-100 text-slate-600'}`}>
      {category}
    </span>
  );
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedFixer, setSelectedFixer] = useState(null);
  const [view, setView] = useState('list');

  const handleAddClick = () => {
    setFormMode('add');
    setSelectedFixer(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (e, fixer) => {
    e.stopPropagation();
    setFormMode('edit');
    setSelectedFixer(fixer);
    setIsFormOpen(true);
  };

  const handleRowClick = (fixer) => {
    setSelectedFixer(fixer);
    setView('detail');
  };

  const handleSave = (data) => {
    console.log('Saving fixer data:', data);
    setIsFormOpen(false);
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
                  <h1 className="text-3xl font-bold tracking-tight">Fixer Management</h1>
                </header>

                {/* Stats Card */}
                <div className="mb-8">
                  <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 w-64"
                  >
                    <p className="text-slate-400 text-sm font-medium mb-1">Total Fixers</p>
                    <h2 className="text-4xl font-bold">1,240</h2>
                  </Motion.div>
                </div>

                {/* Search and Action Bar */}
                <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-3xl shadow-sm border border-slate-50">
                  <div className="flex items-center gap-4 flex-1 max-w-2xl">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search by name"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                        Category
                        <ChevronDown size={16} />
                      </button>
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
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fixer Name</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rating</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jobs</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {fixersData.map((fixer, index) => (
                          <Motion.tr
                            key={fixer.id + index}
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
                                  <p className="font-bold text-sm text-slate-800">{fixer.name}</p>
                                  <p className="text-xs text-slate-400 font-medium tracking-tight">ID: {fixer.fixerId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                              <CategoryBadge category={fixer.category} />
                            </td>
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-1.5">
                                <Star size={14} className="fill-orange-400 text-orange-400" />
                                <span className="text-sm font-bold text-orange-500">{fixer.rating.toFixed(1)}</span>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                              <span className="text-sm font-bold text-slate-700">{fixer.jobs}</span>
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
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </Motion.tr>
                        ))}
                      </AnimatePresence>
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
              initialData={selectedFixer}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
