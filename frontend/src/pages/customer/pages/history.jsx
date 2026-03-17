import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Search,
  Filter,
  ChevronDown,
  Droplets,
  Car,
  Zap,
  Refrigerator,
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

import FixerProfile from '../components/FixerProfile';
import RatingForm from '../components/RatingForm';
import ReceiptView from '../components/ReceiptView';
import CustomDatePicker from '../components/CustomDatePicker';
import { Header, Sidebar } from '../components/navbar';
import httpClient from '../../../api/httpClient';

const HISTORY_DATA = [
  {
    id: '1',
    service: 'Kitchen Sink Leak',
    category: 'Plumbing',
    date: 'Oct 24, 2023',
    fixer: {
      name: 'Marcus Chen',
      avatar:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    },
    amount: 120.0,
    status: 'Completed',
    icon: <Droplets className="w-5 h-5 text-blue-500" />,
    iconBg: 'bg-blue-50',
    orderId: '#F-92831',
  },
  {
    id: '2',
    service: 'Brake Pad Change',
    category: 'Car Repair',
    date: 'Oct 12, 2023',
    fixer: { name: 'Sarah W.', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    amount: 245.5,
    status: 'Completed',
    icon: <Car className="w-5 h-5 text-orange-500" />,
    iconBg: 'bg-orange-50',
    orderId: '#F-92832',
  },
  {
    id: '3',
    service: 'Light Fixture Install',
    category: 'Electrical',
    date: 'Sep 28, 2023',
    fixer: { name: 'James T.', avatar: 'https://i.pravatar.cc/150?u=james' },
    amount: 85.0,
    status: 'Completed',
    icon: <Zap className="w-5 h-5 text-yellow-500" />,
    iconBg: 'bg-yellow-50',
    orderId: '#F-92833',
  },
  {
    id: '4',
    service: 'Fridge Maintenance',
    category: 'Home Appliances',
    date: 'Aug 15, 2023',
    fixer: { name: 'Emily L.', avatar: 'https://i.pravatar.cc/150?u=emily' },
    amount: 150.0,
    status: 'Completed',
    icon: <Refrigerator className="w-5 h-5 text-purple-500" />,
    iconBg: 'bg-purple-50',
    orderId: '#F-92834',
  },
];

export default function App() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Last 30 Days');
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [currentView, setCurrentView] = useState('history');
  const [selectedService, setSelectedService] = useState(null);

  const handleRateService = (service) => {
    setSelectedService(service);
    setCurrentView('rating');
  };

  const handleViewReceipt = (service) => {
    setSelectedService(service);
    setCurrentView('receipt');
  };

  const handleViewFixerProfile = (service) => {
    setSelectedService(service);
    setCurrentView('profile');
  };

  const filteredData = HISTORY_DATA.filter((item) => {
    const matchesSearch =
      item.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fixer.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' ||
      item.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'All Status' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSidebarChange = (tab) => {
    setShowFilterPopover(false);
    setShowDatePicker(false);

    if (tab === 'services') {
      navigate('/dashboard/customer');
      return;
    }

    if (tab === 'bookings') {
      navigate('/dashboard/customer/orders');
      return;
    }

    if (tab === 'settings') {
      navigate('/dashboard/customer/settings');
      return;
    }

    // history
    setCurrentView('history');
  };

  const handleLogout = async () => {
    try {
      await httpClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }

    localStorage.removeItem('token');

    if (httpClient && httpClient.defaults?.headers) {
      delete httpClient.defaults.headers.common?.['Authorization'];
    }

    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar
          activeTab="history"
          onChange={handleSidebarChange}
          onLogout={handleLogout}
          sticky={false}
          scrollNav={false}
        />

        <main className="flex-1 min-h-0 overflow-y-auto p-10">
          <AnimatePresence>

              {currentView === 'history' && (
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mx-auto max-w-6xl">
                    <div className="mb-2">
                      <h1 className="text-3xl font-bold">My Service History</h1>
                      <p className="text-sm text-slate-500">
                        Keep track of all your completed maintenance and repairs.
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search by service or fixer name..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowDatePicker(true)}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-purple-200 hover:text-purple-700"
                          >
                            <Calendar className="h-4 w-4" />
                            {dateFilter}
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          </button>

                          <div className="relative">
                            <button
                              onClick={() => setShowFilterPopover((v) => !v)}
                              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-purple-200 hover:text-purple-700"
                            >
                              <Filter className="h-4 w-4" />
                              More Filters
                            </button>

                            {showFilterPopover && (
                              <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                                <div className="mb-3 space-y-1">
                                  <label className="text-xs font-semibold text-slate-500">
                                    Category
                                  </label>
                                  <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                                  >
                                    {['All Categories', 'Plumbing', 'Car Repair', 'Electrical', 'Home Appliances'].map((option) => (
                                      <option key={option}>{option}</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-slate-500">
                                    Status
                                  </label>
                                  <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                                  >
                                    {['All Status', 'Completed', 'In Progress'].map((option) => (
                                      <option key={option}>{option}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200">
                        <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <span className="col-span-4">Service</span>
                          <span className="col-span-2">Date</span>
                          <span className="col-span-2">Fixer</span>
                          <span className="col-span-2">Amount</span>
                          <span className="col-span-2 text-right">Actions</span>
                        </div>

                        <div>
                          {filteredData.map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-12 items-center px-4 py-4 border-b last:border-none border-slate-100"
                            >
                              <div className="col-span-4 flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${item.iconBg}`}>{item.icon}</div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">{item.service}</p>
                                  <p className="text-xs text-slate-500">{item.category}</p>
                                </div>
                              </div>

                              <div className="col-span-2 text-sm text-slate-700">{item.date}</div>

                              <div className="col-span-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                <img src={item.fixer.avatar} className="w-8 h-8 rounded-full" />
                                <button
                                  type="button"
                                  onClick={() => handleViewFixerProfile(item)}
                                  className="text-left hover:text-purple-700"
                                >
                                  {item.fixer.name}
                                </button>
                              </div>

                              <div className="col-span-2 text-sm font-bold text-slate-900">
                                ${item.amount.toFixed(2)}
                              </div>

                              <div className="col-span-2 flex items-center justify-end gap-3 text-sm font-semibold text-purple-600">
                                <button onClick={() => handleRateService(item)} className="hover:text-purple-700">
                                  Rate Service
                                </button>
                                <button onClick={() => handleViewReceipt(item)} className="hover:text-purple-700">
                                  View Receipt
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Motion.div>
              )}

              {currentView === 'profile' && selectedService && (
                <FixerProfile
                  onBack={() => setCurrentView('history')}
                  name={selectedService.fixer.name}
                  avatar={selectedService.fixer.avatar}
                  primaryCategory={selectedService.category}
                />
              )}

              {currentView === 'rating' && selectedService && (
                <RatingForm
                  onBack={() => setCurrentView('history')}
                  serviceName={selectedService.service}
                  fixerName={selectedService.fixer.name}
                  fixerAvatar={selectedService.fixer.avatar}
                  date={selectedService.date}
                  orderId={selectedService.orderId}
                />
              )}

              {currentView === 'receipt' && (
                <ReceiptView onClose={() => setCurrentView('history')} />
              )}

              {showDatePicker && (
                <CustomDatePicker
                  onClose={() => setShowDatePicker(false)}
                  onSelect={(date) => {
                    setDateFilter(date.toLocaleDateString());
                    setShowDatePicker(false);
                  }}
                />
              )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
