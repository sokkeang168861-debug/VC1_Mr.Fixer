import React, { useMemo, useState } from 'react';
import { Search, Edit2, Trash2, Users as UsersIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import UserForm from '../components/UserForm';

const initialUsers = [
  {
    id: 'u1',
    name: 'Elena Rodriguez',
    email: 'elena.rod@example.com',
    bookings: 24,
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Elena+Rodriguez&background=f0f4ff&color=0f172a',
  },
  {
    id: 'u2',
    name: 'Marcus Chen',
    email: 'm.chen@service.org',
    bookings: 8,
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Marcus+Chen&background=fef2e5&color=0f172a',
  },
  {
    id: 'u3',
    name: 'David Smith',
    email: 'david.s@mailbox.net',
    bookings: 42,
    status: 'suspended',
    avatar: 'https://ui-avatars.com/api/?name=David+Smith&background=e5edff&color=0f172a',
  },
  {
    id: 'u4',
    name: 'Sarah Wilson',
    email: 'swilson@fixerapp.com',
    bookings: 12,
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=dff7f0&color=0f172a',
  },
  {
    id: 'u5',
    name: 'Marcus Chen',
    email: 'm.chen@service.org',
    bookings: 8,
    status: 'suspended',
    avatar: 'https://ui-avatars.com/api/?name=Marcus+Chen&background=fef2e5&color=0f172a',
  },
  {
    id: 'u6',
    name: 'David Smith',
    email: 'david.s@mailbox.net',
    bookings: 42,
    status: 'suspended',
    avatar: 'https://ui-avatars.com/api/?name=David+Smith&background=e5edff&color=0f172a',
  },
  {
    id: 'u7',
    name: 'Sarah Wilson',
    email: 'swilson@fixerapp.com',
    bookings: 12,
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=dff7f0&color=0f172a',
  },
];

const StatusBadge = ({ status }) => {
  const isActive = status === 'active';
  const classes = isActive
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-rose-100 text-rose-600';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${classes}`}>
      {isActive ? 'Active' : 'Suspended'}
    </span>
  );
};

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState(null);

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [search, users]);

  const handleDelete = (id) => {
    const confirmed = window.confirm('Delete this user permanently? This action cannot be undone.');
    if (!confirmed) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleSave = (data) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === data.id ? { ...u, ...data } : u))
    );
    setEditingUser(null);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />

      <div className="flex-1 ml-64 overflow-y-auto text-slate-900">
        <main className="p-8">
          <div className="max-w-7xl w-full mx-auto space-y-8">
            <header className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold">Users</h1>
              <p className="text-slate-500">
                You can manage users, verify details, and monitor activity.
              </p>
            </header>

            <section className="flex flex-wrap gap-4">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm w-full sm:w-72">
                <div className="flex items-center gap-4">
                  
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Total Users
                    </p>
                    <p className="text-3xl font-bold text-slate-900">1,248</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 " size={18} />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500/20 text-sm placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-6 py-4">User Name</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4 text-center w-32">Total Bookings</th>
                      <th className="px-6 py-4 text-center w-32">Status</th>
                      <th className="px-6 py-4 text-center w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-6 py-5 align-middle">
                          <div className="flex items-center gap-4">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-semibold text-sm">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600 align-middle">{user.email}</td>
                        <td className="px-6 py-5 text-center text-sm font-semibold text-slate-800 align-middle">
                          {user.bookings}
                        </td>
                        <td className="px-6 py-5 text-center align-middle">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-6 py-5 align-middle">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-2 text-[#1D75F7] hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-[#E53935] hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td className="px-6 py-6 text-center text-slate-500 text-sm" colSpan={5}>
                          No users match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>

      {editingUser && (
        <UserForm
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
