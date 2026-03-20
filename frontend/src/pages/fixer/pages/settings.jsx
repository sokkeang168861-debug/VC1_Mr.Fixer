import React, { useEffect, useMemo, useState } from 'react';
import { 
  User, 
  MapPin, 
  Bell, 
  Shield, 
  Plus, 
  Camera,
  Pencil,
  X
} from 'lucide-react';
import { Header } from "../components/Header";
import Sidebar from "../components/Sidebar";
import httpClient from "@/api/httpClient";
import defaultProfile from "@/assets/image/default-profile.png";

const Settings = () => {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [selectedProfileFile, setSelectedProfileFile] = useState(null);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    profileImage: ''
  });
  const [originalProfileData, setOriginalProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    profileImage: ''
  });

  const [addresses, setAddresses] = useState([]);
  const [locationInput, setLocationInput] = useState('');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);

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

  useEffect(() => {
    let active = true;

    httpClient
      .get('/fixer/settings/profile')
      .then((res) => {
        if (!active) return;

        const data = res.data || {};
        setProfileData({
          fullName: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          profileImage: data.profile_img || ''
        });
        setOriginalProfileData({
          fullName: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          profileImage: data.profile_img || ''
        });
        setAddresses(
          data.location
            ? [
                {
                  id: 1,
                  type: 'Primary Location',
                  street: data.location
                }
              ]
            : []
        );
        setLocationInput(data.location || '');
        setProfileError('');
      })
      .catch((error) => {
        if (!active) return;
        console.error('Failed to load fixer profile:', error);
        setProfileError(
          error?.response?.data?.message || 'Failed to load fixer profile data.'
        );
      })
      .finally(() => {
        if (active) {
          setLoadingProfile(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleProfileChange = (field, value) => {
    setSaveMessage('');
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setProfileError('Profile image must be JPG or PNG.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Profile image must be 5MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData((prev) => ({
        ...prev,
        profileImage: reader.result
      }));
      setSelectedProfileFile(file);
      setProfileError('');
      setSaveMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setSaveMessage('');
    setProfileError('');
  };

  const handleCancelProfileEdit = () => {
    setProfileData(originalProfileData);
    setSelectedProfileFile(null);
    setIsEditingProfile(false);
    setSaveMessage('');
    setProfileError('');
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setSaveMessage('');
    setProfileError('');

    try {
      const formData = new FormData();
      formData.append('full_name', profileData.fullName.trim());
      formData.append('email', profileData.email.trim());
      formData.append('phone', profileData.phone.trim());
      formData.append('location', String(addresses[0]?.street || '').trim());

      if (selectedProfileFile) {
        formData.append('profile_img', selectedProfileFile);
      }

      const res = await httpClient.put('/fixer/settings/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const updatedProfile = res.data?.profile || {};
      const nextProfileData = {
        fullName: updatedProfile.full_name || '',
        email: updatedProfile.email || '',
        phone: updatedProfile.phone || '',
        profileImage: updatedProfile.profile_img || ''
      };

      setProfileData(nextProfileData);
      setOriginalProfileData(nextProfileData);
      setSelectedProfileFile(null);
      setIsEditingProfile(false);
      setSaveMessage(res.data?.message || 'Profile updated successfully.');
    } catch (error) {
      console.error('Failed to update fixer profile:', error);
      setProfileError(
        error?.response?.data?.message || 'Failed to update fixer profile.'
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const profileInitials = useMemo(() => {
    const name = profileData.fullName.trim();
    if (!name) return 'FX';

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
  }, [profileData.fullName]);

  const handleAddressDelete = (id) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    setLocationInput('');
    setIsEditingLocation(false);
    setSaveMessage('');
  };

  const handleStartLocationEdit = () => {
    setLocationInput(addresses[0]?.street || '');
    setIsEditingLocation(true);
    setProfileError('');
    setSaveMessage('');
  };

  const handleCancelLocationEdit = () => {
    setLocationInput(addresses[0]?.street || '');
    setIsEditingLocation(false);
    setProfileError('');
  };

  const handleSaveLocation = async () => {
    const trimmedLocation = locationInput.trim();

    if (!trimmedLocation) {
      setProfileError('Location is required.');
      return;
    }

    setIsSavingLocation(true);
    setProfileError('');
    setSaveMessage('');

    try {
      const res = await httpClient.put('/fixer/settings/location', {
        location: trimmedLocation
      });

      setAddresses([
        {
          id: 1,
          type: 'Primary Location',
          street: res.data?.location || trimmedLocation
        }
      ]);
      setLocationInput(res.data?.location || trimmedLocation);
      setIsEditingLocation(false);
      setSaveMessage(res.data?.message || 'Location updated successfully.');
    } catch (error) {
      console.error('Failed to update fixer location:', error);
      setProfileError(
        error?.response?.data?.message || 'Failed to update fixer location.'
      );
    } finally {
      setIsSavingLocation(false);
    }
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
        <div className="flex items-center justify-between w-full gap-4">
          <h2 className="text-2xl font-bold text-slate-900">Profile Information</h2>
          <div className="flex items-center gap-3">
            {isEditingProfile ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelProfileEdit}
                  disabled={isSavingProfile}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 font-semibold disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-500 text-white bg-orange-500 hover:bg-orange-600 transition-all duration-200 font-semibold disabled:opacity-60"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEditProfile}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 transition-all duration-200 font-semibold"
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8 mb-8">
        <div className="relative group">
          <div className="w-28 h-28 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center overflow-hidden ring-4 ring-orange-100">
            {profileData.profileImage ? (
              <img
                src={profileData.profileImage}
                alt={profileData.fullName || 'Fixer profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={defaultProfile}
                alt="Default profile"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <label className={`absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg group-hover:shadow-xl transition-all duration-200 border border-orange-200 ${isEditingProfile ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleProfileImageChange}
              disabled={!isEditingProfile}
            />
            <Camera className="w-5 h-5 text-orange-600" />
          </label>
        </div>
        <div>
          <p className="text-sm text-orange-600 font-medium">JPG, PNG up to 5MB</p>
          <p className="text-xs text-orange-400 mt-1">
            {loadingProfile ? 'Loading fixer profile...' : `Profile: ${profileInitials}`}
          </p>
        </div>
      </div>

      {profileError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {profileError}
        </div>
      ) : null}
      {saveMessage ? (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {saveMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-orange-700 mb-2">Full Name</label>
          <input
            type="text"
            value={profileData.fullName}
            onChange={(e) => handleProfileChange('fullName', e.target.value)}
            disabled={loadingProfile || !isEditingProfile}
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
            disabled={loadingProfile || !isEditingProfile}
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
            disabled={loadingProfile || !isEditingProfile}
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
        <button
          type="button"
          onClick={handleStartLocationEdit}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add New
        </button>
      </div>

      <div className="space-y-4">
        {isEditingLocation ? (
          <div className="border border-orange-200 rounded-xl p-6 bg-gradient-to-r from-white to-orange-50">
            <label className="block text-sm font-semibold text-orange-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Enter your location"
              className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-slate-900 placeholder-orange-400"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={handleCancelLocationEdit}
                disabled={isSavingLocation}
                className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200 disabled:opacity-60"
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLocation}
                disabled={isSavingLocation}
                className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all duration-200 disabled:opacity-60"
              >
                {isSavingLocation ? 'Saving...' : 'Save Location'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {addresses.length === 0 ? (
              <div className="border border-dashed border-orange-200 rounded-xl p-6 bg-orange-50/40 text-slate-500">
                No saved location found for this fixer yet.
              </div>
            ) : (
              addresses.map((address) => (
                <div key={address.id} className="border border-orange-200 rounded-xl p-6 hover:border-orange-400 transition-all duration-200 bg-gradient-to-r from-white to-orange-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-3 text-lg">{address.type}</h3>
                      <p className="text-slate-600 leading-relaxed">{address.street}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleStartLocationEdit}
                        className="px-4 py-2 text-sm font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-all duration-200 rounded-lg"
                      >
                        EDIT
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleAddressDelete(address.id)}
                        className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 rounded-lg"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
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
