import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Pencil, Search, ShieldCheck, Trash2, UserCircle2, Users, X } from 'lucide-react';
import httpClient from '../../../api/httpClient';

const STORAGE_KEY = 'admin-user-management-overrides';
const CACHE_KEY = 'admin-user-management-cache';
const DELETED_KEY = 'admin-user-management-deleted';
const STATUS_OPTIONS = ['active', 'suspended'];
const INPUT_CLASS = 'h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';
const SELECT_CLASS = `${INPUT_CLASS} appearance-none`;

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const normalizeStatus = (user) => {
  const explicitStatus = String(user?.status || user?.account_status || '').trim().toLowerCase();
  if (explicitStatus === 'suspended' || explicitStatus === 'inactive') return 'suspended';
  if (explicitStatus === 'active') return 'active';

  const activeValue = user?.is_active ?? user?.active;
  if (activeValue === false || activeValue === 0 || activeValue === '0') return 'suspended';
  return 'active';
};

const normalizeTotalBookings = (user) => {
  const rawValue = user?.total_bookings
    ?? user?.totalBookings
    ?? user?.bookings_count
    ?? user?.bookingCount
    ?? user?.total_jobs
    ?? user?.jobs
    ?? 0;

  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
};

const normalizeUser = (user) => ({
  id: user?.id,
  fullName: String(user?.full_name || user?.fullName || '').trim(),
  email: String(user?.email || '').trim(),
  phone: String(user?.phone || '').trim(),
  totalBookings: normalizeTotalBookings(user),
  status: normalizeStatus(user),
});

const mergeWithOverrides = (baseUsers, overrides) => baseUsers.map((user) => ({
  ...user,
  ...(overrides[String(user.id)] || {}),
}));

const filterDeletedUsers = (baseUsers, deletedUserIds) => {
  const deletedSet = new Set(
    (Array.isArray(deletedUserIds) ? deletedUserIds : []).map((id) => String(id))
  );

  return baseUsers.filter((user) => !deletedSet.has(String(user.id)));
};

const sortUsers = (left, right) => Number(right.id || 0) - Number(left.id || 0);

const buildInitials = (fullName) => fullName
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase() || '')
  .join('') || 'U';

const getStatusClasses = (status) => (
  status === 'active'
    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
    : 'bg-rose-50 text-rose-600 border border-rose-100'
);

const emptyForm = {
  id: '',
  fullName: '',
  email: '',
  phone: '',
  totalBookings: 0,
  status: 'active',
};

function StatCard({ title, value, icon, iconBg }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-slate-700" style={{ backgroundColor: iconBg }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await httpClient.get('/user');
        const apiUsers = Array.isArray(res.data) ? res.data.map(normalizeUser).sort(sortUsers) : [];
        const overrides = readStorage(STORAGE_KEY, {});
        const deletedUserIds = readStorage(DELETED_KEY, []);
        const mergedUsers = filterDeletedUsers(mergeWithOverrides(apiUsers, overrides), deletedUserIds).sort(sortUsers);
        setUsers(mergedUsers);
        writeStorage(CACHE_KEY, mergedUsers);
        setError('');
      } catch (err) {
        const cachedUsers = readStorage(CACHE_KEY, []);
        const deletedUserIds = readStorage(DELETED_KEY, []);

        if (cachedUsers.length > 0) {
          setUsers(filterDeletedUsers(cachedUsers.map(normalizeUser), deletedUserIds).sort(sortUsers));
          setError('Failed to refresh users. Showing your saved admin frontend data.');
        } else {
          setUsers([]);
          setError(err.response?.data?.message || 'Failed to load users');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timeoutId = window.setTimeout(() => setSuccessMessage(''), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => [user.fullName, user.email, user.phone, user.totalBookings, user.status]
      .some((value) => String(value || '').toLowerCase().includes(query)));
  }, [users, searchQuery]);

  const stats = useMemo(() => ({
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.status === 'active').length,
    suspendedUsers: users.filter((user) => user.status === 'suspended').length,
  }), [users]);

  const handleOpenEdit = (user) => {
    setEditingUser(user.id);
    setFormData({ ...emptyForm, ...user });
    setFormError('');
    setSuccessMessage('');
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setFormError('');
  };

  const handleSave = (event) => {
    event.preventDefault();

    const normalizedUser = {
      id: formData.id,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      totalBookings: Math.max(0, Number(formData.totalBookings || 0)),
      status: formData.status === 'suspended' ? 'suspended' : 'active',
    };

    if (!normalizedUser.fullName || !normalizedUser.email || !normalizedUser.phone) {
      setFormError('Please complete full name, email, and phone number.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedUser.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const nextUsers = users.map((user) => (String(user.id) === String(normalizedUser.id) ? { ...user, ...normalizedUser } : user));
    const nextOverrides = {
      ...readStorage(STORAGE_KEY, {}),
      [String(normalizedUser.id)]: normalizedUser,
    };

    const sortedUsers = [...nextUsers].sort(sortUsers);

    setUsers(sortedUsers);
    writeStorage(STORAGE_KEY, nextOverrides);
    writeStorage(CACHE_KEY, sortedUsers);
    setSuccessMessage('User details updated successfully.');
    handleCloseModal();
  };

  const handleDelete = (userId) => {
    const userToDelete = users.find((user) => String(user.id) === String(userId));
    if (!userToDelete) return;

    const shouldDelete = window.confirm(`Delete ${userToDelete.fullName || 'this user'}?`);
    if (!shouldDelete) return;

    const nextUsers = users.filter((user) => String(user.id) !== String(userId));
    const nextOverrides = { ...readStorage(STORAGE_KEY, {}) };
    delete nextOverrides[String(userId)];

    const nextDeletedUserIds = Array.from(
      new Set([...readStorage(DELETED_KEY, []), String(userId)])
    );

    const sortedUsers = [...nextUsers].sort(sortUsers);

    setUsers(sortedUsers);
    writeStorage(STORAGE_KEY, nextOverrides);
    writeStorage(DELETED_KEY, nextDeletedUserIds);
    writeStorage(CACHE_KEY, sortedUsers);

    if (String(editingUser) === String(userId)) {
      handleCloseModal();
    }

    setSuccessMessage('User deleted successfully.');
  };

  return (
    <div className="space-y-8 font-sans text-slate-900">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-400">Manage users and update their account details from the admin dashboard.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Users" value={loading ? '...' : stats.totalUsers} icon={<Users size={22} />} iconBg="#dbeafe" />
        <StatCard title="Active Users" value={loading ? '...' : stats.activeUsers} icon={<CheckCircle2 size={22} />} iconBg="#dcfce7" />
        <StatCard title="Suspended Users" value={loading ? '...' : stats.suspendedUsers} icon={<ShieldCheck size={22} />} iconBg="#fee2e2" />
      </div>

      <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search users by name, email, bookings, phone, or status"
            className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        {error ? <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div> : null}
        {successMessage ? <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{successMessage}</div> : null}

        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">User Name</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Email Address</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Total Bookings</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Status</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                          {user.fullName ? buildInitials(user.fullName) : <UserCircle2 size={22} />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.fullName || 'Unknown user'}</p>
                          <p className="text-xs text-slate-400">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-sm font-semibold text-slate-600">{user.email || '-'}</td>
                    <td className="px-4 py-5 text-sm font-bold text-slate-900">{user.totalBookings}</td>
                    <td className="px-4 py-5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-blue-500 transition-all hover:bg-blue-50 hover:text-blue-600"
                          aria-label={`Edit ${user.fullName}`}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-red-500 transition-all hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${user.fullName}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 ? (
              <div className="py-20 text-center text-slate-400">No users found for your search.</div>
            ) : null}
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingUser !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
            >
              <form onSubmit={handleSave}>
                <div className="flex items-start justify-between border-b border-slate-100 px-8 py-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Edit User</h2>
                    <p className="mt-1 text-sm text-slate-400">Update the user details below.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6 px-8 py-7">
                  {formError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</div> : null}

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-bold text-slate-700">Full Name</span>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(event) => setFormData((current) => ({ ...current, fullName: event.target.value }))}
                        placeholder="Enter full name"
                        className={INPUT_CLASS}
                      />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-bold text-slate-700">Email</span>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                        placeholder="user@example.com"
                        className={INPUT_CLASS}
                      />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-bold text-slate-700">Phone Number</span>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
                        placeholder="+855 12 345 678"
                        className={INPUT_CLASS}
                      />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-bold text-slate-700">Status</span>
                      <select
                        value={formData.status}
                        onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}
                        className={SELECT_CLASS}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-8 py-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#1D80E7] px-5 text-sm font-bold text-white transition-all hover:bg-blue-600"
                  >
                    Save Changes
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