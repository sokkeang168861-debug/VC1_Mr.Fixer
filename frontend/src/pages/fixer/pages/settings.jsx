import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Shield, 
  Camera,
  Pencil,
  QrCode,
  Mail
} from 'lucide-react';
import { Header } from "../components/Header";
import Sidebar from "../components/Sidebar";
import httpClient from "@/api/httpClient";
import { ROUTES } from "@/config/routes";
import { getTokenPayload } from "@/lib/auth";
import { logoutUser } from "@/lib/session";
import defaultProfile from "@/assets/image/default-profile.png";

const FIXER_SETTINGS_STORAGE_KEY = 'fixer_settings_local';

const loadLocalFixerSettings = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(FIXER_SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveLocalFixerSettings = (data) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FIXER_SETTINGS_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('fixer-settings-updated'));
};

const buildAddressList = (location) => {
  return location
    ? [
        {
          id: 1,
          type: 'Primary Location',
          street: location
        }
      ]
    : [];
};

const buildStoredSettings = ({ profile, location }) => ({
  profile,
  location,
});

const getOpenStreetMapEmbedUrl = ({ lat, lng }) => {
  const delta = 0.01;
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
};

const geocodeAddressPreview = async (address) => {
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: String(address).trim(),
    limit: '1',
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to preview map location');
  }

  const results = await response.json();
  const bestMatch = Array.isArray(results) ? results[0] : null;
  const latitude = Number(bestMatch?.lat);
  const longitude = Number(bestMatch?.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    lat: Number(latitude.toFixed(8)),
    lng: Number(longitude.toFixed(8)),
  };
};

const Settings = () => {
  const navigate = useNavigate();
  const locationInputRef = useRef(null);
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
    companyName: '',
    bio: '',
    experience: '',
    profileImage: '',
    qrImage: '',
    categories: []
  });
  const [originalProfileData, setOriginalProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    bio: '',
    experience: '',
    profileImage: '',
    qrImage: '',
    categories: []
  });
  const [selectedQrFile, setSelectedQrFile] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [locationInput, setLocationInput] = useState('');
  const [locationCoordinates, setLocationCoordinates] = useState(null);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [loadingLocationPreview, setLoadingLocationPreview] = useState(false);
  const [locationPreviewError, setLocationPreviewError] = useState('');

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showAdminContacts, setShowAdminContacts] = useState(false);
  const [loadingAdminContacts, setLoadingAdminContacts] = useState(false);
  const [adminContacts, setAdminContacts] = useState([]);
  const [adminContactsError, setAdminContactsError] = useState('');

  useEffect(() => {
    const localSettings = loadLocalFixerSettings();
    const tokenPayload = getTokenPayload();
    const fallbackProfile = {
      fullName: localSettings?.profile?.fullName || tokenPayload?.full_name || '',
      email: localSettings?.profile?.email || tokenPayload?.email || '',
      phone: localSettings?.profile?.phone || '',
      companyName: localSettings?.profile?.companyName || '',
      bio: localSettings?.profile?.bio || '',
      experience: localSettings?.profile?.experience || '',
      profileImage: '',
      qrImage: localSettings?.profile?.qrImage || '',
      categories: Array.isArray(localSettings?.profile?.categories)
        ? localSettings.profile.categories
        : []
    };

    setProfileData({
      ...fallbackProfile
    });
    setOriginalProfileData({
      ...fallbackProfile
    });
    setAddresses(buildAddressList(localSettings?.location || ''));
    setLocationInput(localSettings?.location || '');
    setProfileError('');
    httpClient
      .get('/fixer/settings/profile')
      .then((res) => {
        const data = res.data || {};
        const nextProfile = {
          fullName: data.full_name || fallbackProfile.fullName,
          email: data.email || fallbackProfile.email,
          phone: data.phone || fallbackProfile.phone,
          companyName: data.company_name || fallbackProfile.companyName,
          bio: data.bio || fallbackProfile.bio,
          experience:
            data.experience !== null && data.experience !== undefined
              ? String(data.experience)
              : fallbackProfile.experience,
          profileImage: data.profile_img || '',
          qrImage:
            Object.prototype.hasOwnProperty.call(data, 'qr')
              ? (data.qr || '')
              : fallbackProfile.qrImage || '',
          categories: Array.isArray(data.categories)
            ? data.categories
            : fallbackProfile.categories
        };

        setProfileData(nextProfile);
        setOriginalProfileData(nextProfile);
        setAddresses(buildAddressList(data.location || localSettings?.location || ''));
        setLocationInput(data.location || localSettings?.location || '');
        setLocationCoordinates(
          data.latitude !== null &&
            data.latitude !== undefined &&
            data.longitude !== null &&
            data.longitude !== undefined
            ? {
                lat: Number(data.latitude),
                lng: Number(data.longitude),
              }
            : null
        );
        saveLocalFixerSettings(
          buildStoredSettings({
            profile: nextProfile,
            location: data.location || localSettings?.location || ''
          })
        );
      })
      .catch((error) => {
        console.error('Failed to load fixer profile:', error);
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  }, []);

  useEffect(() => {
    if (isEditingLocation) {
      locationInputRef.current?.focus();
    }
  }, [isEditingLocation]);

  useEffect(() => {
    if (!isEditingLocation) {
      setLoadingLocationPreview(false);
      setLocationPreviewError('');
      return undefined;
    }

    const trimmedLocation = locationInput.trim();
    if (!trimmedLocation) {
      setLocationCoordinates(null);
      setLoadingLocationPreview(false);
      setLocationPreviewError('');
      return undefined;
    }

    let isMounted = true;
    const timeoutId = window.setTimeout(async () => {
      try {
        setLoadingLocationPreview(true);
        setLocationPreviewError('');
        const previewCoordinates = await geocodeAddressPreview(trimmedLocation);

        if (!isMounted) {
          return;
        }

        if (!previewCoordinates) {
          setLocationCoordinates(null);
          setLocationPreviewError('Map preview not found for this address yet.');
          return;
        }

        setLocationCoordinates(previewCoordinates);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error('Failed to preview fixer location:', error);
        setLocationCoordinates(null);
        setLocationPreviewError('Unable to preview this address on the map.');
      } finally {
        if (isMounted) {
          setLoadingLocationPreview(false);
        }
      }
    }, 500);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [isEditingLocation, locationInput]);

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

  const handleQrImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setProfileError('QR image must be JPG or PNG.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('QR image must be 5MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData((prev) => ({
        ...prev,
        qrImage: reader.result
      }));
      setSelectedQrFile(file);
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
    setSelectedQrFile(null);
    setIsEditingProfile(false);
    setSaveMessage('');
    setProfileError('');
  };

  const handleSaveProfile = async () => {
    return handleSaveProfileWithLocation(addresses[0]?.street || '');
  };

  const handleSaveProfileWithLocation = async (locationValue) => {
    setIsSavingProfile(true);
    setSaveMessage('');
    setProfileError('');

    try {
      const formData = new FormData();
      formData.append('full_name', profileData.fullName.trim());
      formData.append('email', profileData.email.trim());
      formData.append('phone', profileData.phone.trim());
      formData.append('company_name', profileData.companyName.trim());
      formData.append('bio', profileData.bio.trim());
      formData.append('experience', profileData.experience.trim());

      if (selectedProfileFile) {
        formData.append('profile_img', selectedProfileFile);
      }

      if (selectedQrFile) {
        formData.append('qr', selectedQrFile);
      }

      const res = await httpClient.put('/fixer/settings/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const updatedProfile = res.data?.profile || {};
      const nextProfileData = {
        fullName: updatedProfile.full_name || profileData.fullName,
        email: updatedProfile.email || profileData.email,
        phone: updatedProfile.phone || profileData.phone,
        companyName: updatedProfile.company_name || profileData.companyName,
        bio: updatedProfile.bio || profileData.bio,
        experience:
          updatedProfile.experience !== null && updatedProfile.experience !== undefined
            ? String(updatedProfile.experience)
            : profileData.experience,
        profileImage:
          Object.prototype.hasOwnProperty.call(updatedProfile, 'profile_img')
            ? (updatedProfile.profile_img || '')
            : profileData.profileImage,
        qrImage:
          Object.prototype.hasOwnProperty.call(updatedProfile, 'qr')
            ? (updatedProfile.qr || '')
            : profileData.qrImage,
        categories: Array.isArray(updatedProfile.categories)
          ? updatedProfile.categories
          : profileData.categories
      };

      setProfileData(nextProfileData);
      setOriginalProfileData(nextProfileData);
      setSelectedProfileFile(null);
      setSelectedQrFile(null);
      setIsEditingProfile(false);
      saveLocalFixerSettings(
        buildStoredSettings({
          profile: nextProfileData,
          location: locationValue
        })
      );
      setSaveMessage(res.data?.message || 'Profile updated successfully.');
      return true;
    } catch (error) {
      console.error('Failed to update fixer profile:', error);

      const nextProfileData = {
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        companyName: profileData.companyName,
        bio: profileData.bio,
        experience: profileData.experience,
        profileImage: profileData.profileImage,
        qrImage: profileData.qrImage,
        categories: profileData.categories
      };

      setOriginalProfileData(nextProfileData);
      setSelectedProfileFile(null);
      setSelectedQrFile(null);
      setIsEditingProfile(false);
      saveLocalFixerSettings(
        buildStoredSettings({
          profile: nextProfileData,
          location: locationValue
        })
      );
      setProfileError(
        error?.response?.data?.message || 'Failed to update database. Saved locally instead.'
      );
      return false;
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
    setLocationCoordinates(null);
    setIsEditingLocation(false);
    setSaveMessage('');
    saveLocalFixerSettings(
      buildStoredSettings({
        profile: originalProfileData,
        location: ''
      })
    );
  };

  const handleStartLocationEdit = (location = addresses[0]?.street || '') => {
    setLocationInput(location);
    setIsEditingLocation(true);
    setProfileError('');
    setSaveMessage('');
    setLocationPreviewError('');
  };

  const handleCancelLocationEdit = () => {
    setLocationInput(addresses[0]?.street || '');
    setLocationPreviewError('');
    setIsEditingLocation(false);
    setProfileError('');
  };

  const handleSaveLocation = async () => {
    const trimmedLocation = locationInput.trim();

    if (!trimmedLocation) {
      setProfileError('Location is required.');
      return false;
    }

    setIsSavingLocation(true);
    setProfileError('');
    setSaveMessage('');

    try {
      const res = await httpClient.put('/fixer/settings/location', {
        location: trimmedLocation
      });

      const savedLocation = res.data?.location || trimmedLocation;
      setAddresses(buildAddressList(savedLocation));
      setLocationInput(savedLocation);
      setLocationCoordinates(
        res.data?.latitude !== null &&
          res.data?.latitude !== undefined &&
          res.data?.longitude !== null &&
          res.data?.longitude !== undefined
          ? {
              lat: Number(res.data.latitude),
              lng: Number(res.data.longitude),
            }
          : null
      );
      setIsEditingLocation(false);
      saveLocalFixerSettings(
        buildStoredSettings({
          profile: originalProfileData,
          location: savedLocation
        })
      );
      setSaveMessage(res.data?.message || 'Location updated successfully.');
      return true;
    } catch (error) {
      console.error('Failed to update fixer location:', error);
      setAddresses(buildAddressList(trimmedLocation));
      setLocationInput(trimmedLocation);
      setIsEditingLocation(false);
      saveLocalFixerSettings(
        buildStoredSettings({
          profile: originalProfileData,
          location: trimmedLocation
        })
      );
      setProfileError(
        error?.response?.data?.message || 'Failed to update database. Location saved locally instead.'
      );
      return false;
    } finally {
      setIsSavingLocation(false);
    }
  };

  const handlePasswordFieldChange = (field, value) => {
    setPasswordMessage('');
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordMessage('');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleChangePassword = async () => {
    const currentPassword = passwordForm.currentPassword.trim();
    const newPassword = passwordForm.newPassword.trim();
    const confirmPassword = passwordForm.confirmPassword.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage('All password fields are required.');
      return false;
    }

    if (newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('New password and confirm password do not match.');
      return false;
    }

    setIsSavingPassword(true);
    setPasswordMessage('');

    try {
      const res = await httpClient.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      setPasswordMessage(res.data?.message || 'Password updated successfully.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      return true;
    } catch (error) {
      setPasswordMessage(
        error?.response?.data?.message || 'Failed to change password.'
      );
      return false;
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser({ navigate, redirectTo: ROUTES.home });
  };

  const handleToggleAdminContacts = async () => {
    if (showAdminContacts) {
      setShowAdminContacts(false);
      return;
    }

    setShowAdminContacts(true);

    if (adminContacts.length > 0 || loadingAdminContacts) {
      return;
    }

    try {
      setLoadingAdminContacts(true);
      setAdminContactsError('');
      const res = await httpClient.get('/fixer/settings/admin-contacts');
      setAdminContacts(Array.isArray(res.data?.contacts) ? res.data.contacts : []);
    } catch (error) {
      console.error('Failed to load admin contacts:', error);
      setAdminContactsError(
        error?.response?.data?.message || 'Failed to load admin emails.'
      );
    } finally {
      setLoadingAdminContacts(false);
    }
  };

  const handleDiscardAllChanges = () => {
    setSaveMessage('');
    setProfileError('');

    if (isEditingProfile) {
      handleCancelProfileEdit();
    }

    if (isEditingLocation) {
      handleCancelLocationEdit();
    }

    if (isChangingPassword) {
      handleCancelPasswordChange();
    }

    if (!isEditingProfile && !isEditingLocation && !isChangingPassword) {
      setSaveMessage('No pending changes to discard.');
    }
  };

  const handleSaveAllChanges = async () => {
    setSaveMessage('');
    setProfileError('');

    if (!isEditingProfile && !isEditingLocation && !isChangingPassword) {
      setSaveMessage('All changes are already saved.');
      return;
    }

    const nextLocation = isEditingLocation
      ? locationInput.trim()
      : (addresses[0]?.street || '');

    const locationSaved = isEditingLocation ? await handleSaveLocation() : true;
    if (!locationSaved) {
      return;
    }

    if (isEditingProfile) {
      await handleSaveProfileWithLocation(nextLocation);
    }

    if (isChangingPassword) {
      await handleChangePassword();
    }
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
        <div className="flex-1">
          <p className="text-xs text-orange-400 mt-1">
            {loadingProfile ? 'Loading fixer profile...' : `Profile: ${profileInitials}`}
          </p>
          {!loadingProfile && profileData.fullName ? (
            <p className="text-sm font-semibold text-slate-900 mt-2">{profileData.fullName}</p>
          ) : null}
          {!loadingProfile && profileData.email ? (
            <p className="text-xs text-slate-500 mt-1">{profileData.email}</p>
          ) : null}
        </div>
        <div className="w-full max-w-[220px]">
          <p className="mb-2 text-sm font-semibold text-orange-700">Payment QR</p>
          <label className={`block rounded-2xl border border-orange-200 bg-orange-50/50 p-4 transition-all ${isEditingProfile ? 'cursor-pointer hover:border-orange-300' : 'cursor-not-allowed opacity-80'}`}>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleQrImageChange}
              disabled={!isEditingProfile}
            />
            <div className="h-36 overflow-hidden rounded-xl bg-white flex items-center justify-center">
              {profileData.qrImage ? (
                <img
                  src={profileData.qrImage}
                  alt="Fixer QR"
                  className="w-full h-full object-contain p-3"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <QrCode className="mx-auto h-10 w-10" />
                  <p className="mt-2 text-xs font-medium">Upload QR image</p>
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {isEditingProfile ? 'Click to change QR' : 'QR preview'}
            </p>
          </label>
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
        <div>
          <label className="block text-sm font-semibold text-orange-700 mb-2">Company Name</label>
          <input
            type="text"
            value={profileData.companyName}
            onChange={(e) => handleProfileChange('companyName', e.target.value)}
            disabled={loadingProfile || !isEditingProfile}
            className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-slate-900 placeholder-orange-400"
            placeholder="Enter your company name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-orange-700 mb-2">Experience (Years)</label>
          <input
            type="number"
            min="0"
            value={profileData.experience}
            onChange={(e) => handleProfileChange('experience', e.target.value)}
            disabled={loadingProfile || !isEditingProfile}
            className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-slate-900 placeholder-orange-400"
            placeholder="Enter years of experience"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-orange-700 mb-2">Bio</label>
          <textarea
            value={profileData.bio}
            onChange={(e) => handleProfileChange('bio', e.target.value)}
            disabled={loadingProfile || !isEditingProfile}
            rows={4}
            className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-slate-900 placeholder-orange-400 resize-y"
            placeholder="Tell customers about your services and experience"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-orange-700 mb-2">Your Services</label>
          <div className="min-h-[58px] w-full rounded-xl border border-orange-300 bg-orange-50/40 px-4 py-3">
            {Array.isArray(profileData.categories) && profileData.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileData.categories.map((category) => (
                  <span
                    key={category.id || category.name}
                    className="inline-flex items-center rounded-full border border-orange-200 bg-white px-3 py-1 text-sm font-semibold text-orange-700"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No service categories assigned yet.
              </p>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            These categories are assigned to your fixer account. Please contact the admin if you want to change them.
          </p>
          <button
            type="button"
            onClick={handleToggleAdminContacts}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50 transition-all duration-200"
          >
            <Mail className="h-4 w-4" />
            {showAdminContacts ? 'Hide Admin Emails' : 'View Admin Emails'}
          </button>
          {showAdminContacts ? (
            <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50/40 p-4">
              {loadingAdminContacts ? (
                <p className="text-sm text-slate-500">Loading admin emails...</p>
              ) : adminContactsError ? (
                <p className="text-sm text-rose-600">{adminContactsError}</p>
              ) : adminContacts.length > 0 ? (
                <div className="space-y-2">
                  {adminContacts.map((contact) => (
                    <div
                      key={contact.id || contact.email}
                      className="rounded-lg border border-orange-100 bg-white px-3 py-2"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {contact.full_name || 'Admin'}
                      </p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sm text-orange-700 hover:underline"
                      >
                        {contact.email}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No admin emails found.</p>
              )}
            </div>
          ) : null}
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
        <div className="flex items-center gap-3">
          {isEditingLocation ? (
            <>
              <button
                type="button"
                onClick={handleCancelLocationEdit}
                disabled={isSavingLocation}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 font-semibold disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLocation}
                disabled={isSavingLocation}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500 text-white bg-blue-500 hover:bg-blue-600 transition-all duration-200 font-semibold disabled:opacity-60"
              >
                {isSavingLocation ? 'Saving...' : 'Save Location'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleStartLocationEdit()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all duration-200 font-semibold"
            >
              <Pencil className="w-4 h-4" />
              Edit Location
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isEditingLocation ? (
          <div className="border border-orange-200 rounded-xl p-6 bg-gradient-to-r from-white to-orange-50">
            <label className="block text-sm font-semibold text-orange-700 mb-2">
              Location
            </label>
            <input
              ref={locationInputRef}
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Enter your location"
              className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-slate-900 placeholder-orange-400"
            />
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
                  </div>
                </div>
              ))
            )}
          </>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Location Preview</p>
            <p className="text-xs text-slate-500">
              {isEditingLocation
                ? 'The map updates while you type the address.'
                : 'Saved fixer location preview.'}
            </p>
          </div>

          <div className="h-72 bg-slate-100">
            {locationCoordinates ? (
              <iframe
                title="Fixer location preview map"
                src={getOpenStreetMapEmbedUrl(locationCoordinates)}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
                {loadingLocationPreview
                  ? 'Finding this address on the map...'
                  : locationPreviewError || 'Enter an address to preview its map location.'}
              </div>
            )}
          </div>
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
            <p className="text-sm text-orange-600">Change your password securely with hashed storage.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsChangingPassword(true);
              setPasswordMessage('');
            }}
            className="px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 rounded-xl hover:from-orange-200 hover:to-orange-300 transition-all duration-200 font-semibold border border-orange-300"
          >
            Change Password
          </button>
        </div>

        {isChangingPassword ? (
          <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-white to-orange-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-orange-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-slate-900"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-orange-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-slate-900"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-orange-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-slate-900"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            {passwordMessage ? (
              <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                passwordMessage.toLowerCase().includes('success') || passwordMessage.toLowerCase().includes('updated')
                  ? 'border border-green-200 bg-green-50 text-green-700'
                  : 'border border-red-200 bg-red-50 text-red-700'
              }`}>
                {passwordMessage}
              </div>
            ) : null}

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelPasswordChange}
                disabled={isSavingPassword}
                className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={isSavingPassword}
                className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all duration-200 disabled:opacity-60"
              >
                {isSavingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-red-50 to-white border border-red-200">
          <div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Logout</h3>
            <p className="text-sm text-red-500">Sign out from your fixer account on this device.</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <Header className="fixed top-0 left-0 right-0 z-50" />

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
              {renderSecuritySection()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
