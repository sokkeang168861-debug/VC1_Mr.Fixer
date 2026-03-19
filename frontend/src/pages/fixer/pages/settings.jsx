import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Bell, 
  Shield, 
  Plus, 
  Camera
} from 'lucide-react';
import { Header } from "../components/Header";
import Sidebar from "../components/Sidebar";

const Settings = () => {
  const [profileData, setProfileData] = useState({
    fullName: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 000-0000'
  });

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      street: '123 Maple Street, Apt 4B',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      isDefault: true
    },
    {
      id: 2,
      type: 'Office',
      street: '888 Business Plaza, Suite 200',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      isDefault: false
    }
  ]);

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: false
  });

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressDelete = (id) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const handleNotificationChange = (field) => {
    setNotifications(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSecurityChange = (field) => {
    setSecurity(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(prev => prev.map(addr => addr.id === id ? { ...addr, isDefault: true } : { ...addr, isDefault: false }));
  };

  const renderProfileSection = () => (
    <div className="bg-white rounded-2xl shadow-xl border-orange-200 p-8 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl">
          <User className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Profile Information</h2>
      </div>

      <div className="flex items-center gap-8 mb-8">
        <div className="relative group">
          <div className="w-28 h-28 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center overflow-hidden ring-4 ring-orange-100">
            <User className="w-14 h-14 text-orange-400" />
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg group-hover:shadow-xl transition-all duration-200 border border-orange-200">
            <Camera className="w-5 h-5 text-orange-600" />
          </button>
        </div>
        <div>
          <p className="text-sm text-orange-600 font-medium">JPG, PNG up to 5MB</p>
          <p className="text-xs text-orange-400 mt-1">Click camera to upload</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-orange-700 mb-2">Full Name</label>
          <input
            type="text"
            value={profileData.fullName}
            onChange={(e) => handleProfileChange('fullName', e.target.value)}
            className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-slate-900 placeholder-orange-400"
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-orange-700 mb-2">Email Address</label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => handleProfileChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-slate-900 placeholder-orange-400"
            placeholder="Enter your email address"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-orange-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => handleProfileChange('phone', e.target.value)}
            className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-slate-900 placeholder-orange-400"
            placeholder="Enter your phone number"
          />
        </div>
      </div>
    </div>
  );

  const renderAddressesSection = () => (
    <div className="bg-white rounded-2xl shadow-xl border-orange-200 p-8 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Saved Addresses</h2>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl">
          <Plus className="w-5 h-5" />
          Add New
        </button>
      </div>

      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className="border border-orange-200 rounded-xl p-6 hover:border-orange-400 transition-all duration-200 bg-gradient-to-r from-white to-orange-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-3 text-lg">{address.type}</h3>
                <p className="text-slate-600 leading-relaxed">{address.street}, {address.city}, {address.state} {address.zipCode}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-sm font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-all duration-200 rounded-lg">
                  EDIT
                </button>
                <button 
                  onClick={() => handleAddressDelete(address.id)}
                  className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 rounded-lg"
                >
                  DELETE
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="bg-white rounded-2xl shadow-xl border-orange-200 p-8 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Notification Preferences</h2>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-white border border-orange-200">
          <div>
            <p className="font-bold text-slate-900 text-lg">Email Notifications</p>
            <p className="text-sm text-orange-600 mt-1">Receive updates and alerts via email</p>
          </div>
          <button
            onClick={() => handleNotificationChange('emailNotifications')}
            className={`relative inline-flex h-7 w-13 items-center rounded-full transition-all duration-300 ${
              notifications.emailNotifications ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-orange-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                notifications.emailNotifications ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-white border border-orange-200">
          <div>
            <p className="font-bold text-slate-900 text-lg">Push Notifications</p>
            <p className="text-sm text-orange-600 mt-1">Get real-time updates on your device</p>
          </div>
          <button
            onClick={() => handleNotificationChange('pushNotifications')}
            className={`relative inline-flex h-7 w-13 items-center rounded-full transition-all duration-300 ${
              notifications.pushNotifications ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-orange-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                notifications.pushNotifications ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-white border border-orange-200">
          <div>
            <p className="font-bold text-slate-900 text-lg">SMS Alerts</p>
            <p className="text-sm text-orange-600 mt-1">Receive text messages for important updates</p>
          </div>
          <button
            onClick={() => handleNotificationChange('smsNotifications')}
            className={`relative inline-flex h-7 w-13 items-center rounded-full transition-all duration-300 ${
              notifications.smsNotifications ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-orange-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                notifications.smsNotifications ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="bg-white rounded-2xl shadow-xl border-orange-200 p-8 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-xl">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Security</h2>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-orange-50 to-white border border-orange-200">
          <div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Password</h3>
            <p className="text-sm text-orange-600">Last changed 3 months ago</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 rounded-xl hover:from-orange-200 hover:to-orange-300 transition-all duration-200 font-semibold border border-orange-300">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <Header className="fixed top-0 left-0 right-0 h-20 z-50" />

      {/* Page body */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)] bg-white shadow-md" />

        {/* Main content */}
        <main className="ml-64 mt-16 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen w-full">
          <div className="px-12 py-12">
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-slate-900 mb-3">Settings</h1>
              <p className="text-lg text-slate-600">Manage your account preferences and information.</p>
            </div>

            <div className="space-y-8">
              {renderProfileSection()}
              {renderAddressesSection()}
              {renderNotificationsSection()}
              {renderSecuritySection()}
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-8 border-t border-orange-200">
                <button className="px-8 py-3 border-2 border-orange-300 text-orange-700 rounded-xl hover:bg-orange-50 transition-all duration-200 font-semibold">
                  Discard
                </button>
                <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;