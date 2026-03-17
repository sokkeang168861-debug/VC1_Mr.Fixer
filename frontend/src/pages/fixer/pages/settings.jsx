import React, { useState } from 'react';
import { Header } from "../components/Header";
import Sidebar from "../components/Sidebar";

const Settings = () => {
  const [profileData, setProfileData] = useState({
    fullName: 'John Doe',
    email: 'johndoe@example.com',
    phone: '+1 234 567 8900'
  });

  const [addresses, setAddresses] = useState([
    { id: 1, type: 'Home', address: '123 Main St, Apt 4B, New York, NY 10001' },
    { id: 2, type: 'Office', address: '456 Business Ave, Floor 12, New York, NY 10002' }
  ]);

  const [paymentMethods] = useState([
    { id: 1, type: 'VISA', lastFour: '4242', expiry: '12/25' }
  ]);

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true
  });

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (type) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleDeleteAddress = (id) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <Header className="fixed top-0 left-0 right-0 h-20 z-50" />

      {/* Page body */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)] bg-white shadow-md" />
        {/* Main content */}
        <main className="ml-64 mt-16 p-8 bg-[#f4f5f7] min-h-screen w-full">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <button className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium">Change Photo</button>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => handleProfileChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
                <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">Add New</button>
              </div>
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div key={address.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{address.type}</p>
                        <p className="text-sm text-gray-600">{address.address}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-sm text-gray-600 hover:text-gray-900">Edit</button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
                <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">Add New</button>
              </div>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{method.type} •••• {method.lastFour}</p>
                        <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                      </div>
                    </div>
                    <button className="text-sm text-gray-600 hover:text-gray-900">Edit</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates and alerts via email</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('email')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.email ? 'bg-orange-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('push')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.push ? 'bg-orange-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.push ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">SMS Alerts</p>
                    <p className="text-sm text-gray-600">Receive important updates via SMS</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('sms')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.sms ? 'bg-orange-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.sms ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Password</p>
                  <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                </div>
                <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">Change Password</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Discard
              </button>
              <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                Save Changes
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;