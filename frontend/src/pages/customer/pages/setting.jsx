import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  CreditCard,
  LogOut,
  Pencil,
  Plus,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { resolveUploadUrl } from "@/lib/assets";
import { logoutUser } from "@/lib/session";
import httpClient from "../../../api/httpClient";

const STORAGE_KEY = "customer_settings_v1";
const PROFILE_UPDATED_EVENT = "user-profile-updated";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

const MotionDiv = motion.div;

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-6 py-3">
      <div>
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        {description ? (
          <div className="mt-0.5 text-xs text-slate-500">{description}</div>
        ) : null}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={classNames(
          "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-slate-200"
        )}
      >
        <span
          className={classNames(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}

function Modal({ open, title, children, onClose, footer }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <MotionDiv
            className="fixed inset-0 z-50 bg-slate-900/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <MotionDiv
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
          >
            <div
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div className="text-sm font-bold text-slate-900">{title}</div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="px-6 py-5">{children}</div>
              {footer ? (
                <div className="border-t border-slate-200 bg-slate-50/60 px-6 py-4">
                  {footer}
                </div>
              ) : null}
            </div>
          </MotionDiv>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function SectionCard({ icon: Icon, title, action, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
            {Icon ? React.createElement(Icon, { size: 18 }) : null}
          </div>
          <div className="text-sm font-bold text-slate-900">{title}</div>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}

const DEFAULT_CARDS = [
  {
    id: "visa",
    brand: "VISA",
    last4: "4242",
    exp: "12/26",
    isDefault: true,
  },
];

function loadStoredSettings() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function saveStoredSettings(data) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function broadcastProfileUpdate(profile) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(PROFILE_UPDATED_EVENT, {
      detail: profile,
    })
  );
}

export default function CustomerSettings() {
  const navigate = useNavigate();
  const stored = useMemo(() => loadStoredSettings(), []);

  const [user, setUser] = useState(() =>
    stored?.profile
      ? {
          ...stored.profile,
          role: "customer",
        }
      : null
  );
  const [loadingUser, setLoadingUser] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);

  const [profile, setProfile] = useState(() => ({
    full_name: stored?.profile?.full_name || "",
    email: stored?.profile?.email || "",
    phone: stored?.profile?.phone || "",
  }));

  const [cards, setCards] = useState(() => stored?.cards || DEFAULT_CARDS);
  const [notify, setNotify] = useState(() => ({
    email: stored?.notify?.email ?? true,
    push: stored?.notify?.push ?? true,
    sms: stored?.notify?.sms ?? false,
  }));

  const [dirty, setDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveMessageType, setSaveMessageType] = useState("neutral");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [addCardOpen, setAddCardOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    brand: "VISA",
    last4: "",
    exp: "",
    isDefault: true,
  });

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdStatus, setPwdStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const setFeedback = (message, type = "neutral") => {
    setSaveMessage(message);
    setSaveMessageType(type);
  };

  const buildStoredSettings = (profileValue = profile) => ({
    profile: {
      full_name: profileValue.full_name || "",
      email: profileValue.email || "",
      phone: profileValue.phone || "",
      profile_img: profileValue.profile_img || "",
    },
    cards,
    notify,
  });

  useEffect(() => {
    httpClient
      .get("/user/profile")
      .then((res) => {
        const payload = res.data || null;
        const nextProfile = {
          full_name: payload?.full_name || "",
          email: payload?.email || "",
          phone: payload?.phone || "",
          profile_img: payload?.profile_img || "",
        };

        setUser(payload);
        setProfile(nextProfile);
        saveStoredSettings({
          profile: nextProfile,
          cards: stored?.cards || DEFAULT_CARDS,
          notify: {
            email: stored?.notify?.email ?? true,
            push: stored?.notify?.push ?? true,
            sms: stored?.notify?.sms ?? false,
          },
        });
      })
      .catch((err) => {
        console.error("Failed to load customer profile:", err);
        setUser(null);
        setFeedback(
          err?.response?.data?.message || "Failed to load your profile.",
          "error"
        );
      })
      .finally(() => setLoadingUser(false));
  }, [stored]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const markDirty = () => {
    setDirty(true);
    setSaveMessage("");
    setSaveMessageType("neutral");
  };

  const initials = useMemo(() => {
    const name = profile.full_name || "User";
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "U";
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return `${first}${second}`.toUpperCase();
  }, [profile.full_name]);

  const savedProfileImage = resolveUploadUrl(
    user?.profile_img || stored?.profile?.profile_img || ""
  );

  const onAvatarChange = (file) => {
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setFeedback("Please upload a JPG or PNG image.", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFeedback("Image must be 2MB or smaller.", "error");
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedAvatarFile(file);
    setAvatarPreview(url);
    markDirty();
  };

  const discardChanges = () => {
    const local = loadStoredSettings();
    const nextProfile = {
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    };

    setFeedback("", "neutral");
    setDirty(false);
    setSelectedAvatarFile(null);
    setAvatarPreview("");
    setCards(local?.cards || DEFAULT_CARDS);
    setNotify({
      email: local?.notify?.email ?? true,
      push: local?.notify?.push ?? true,
      sms: local?.notify?.sms ?? false,
    });
    setProfile(nextProfile);
    setIsEditingProfile(false);
  };

  const saveChanges = async () => {
    const trimmedProfile = {
      full_name: String(profile.full_name || "").trim(),
      email: String(profile.email || "").trim(),
      phone: String(profile.phone || "").trim(),
    };

    if (!trimmedProfile.full_name || !trimmedProfile.email || !trimmedProfile.phone) {
      setFeedback("Full name, email, and phone are required.", "error");
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedProfile.email)) {
      setFeedback("Please enter a valid email address.", "error");
      return;
    }

    if (!user?.id) {
      setFeedback("Customer profile is not loaded yet.", "error");
      return;
    }

    const profileChanged =
      trimmedProfile.full_name !== (user?.full_name || "") ||
      trimmedProfile.email !== (user?.email || "") ||
      trimmedProfile.phone !== (user?.phone || "");
    const profileImageChanged = Boolean(selectedAvatarFile);
    const shouldUpdateProfile = profileChanged || profileImageChanged;

    setSaveMessage("");
    setSaveMessageType("neutral");
    setSavingProfile(true);

    try {
      let nextUser = user;

      if (shouldUpdateProfile) {
        const formData = new FormData();
        formData.append("full_name", trimmedProfile.full_name);
        formData.append("email", trimmedProfile.email);
        formData.append("phone", trimmedProfile.phone);

        if (selectedAvatarFile) {
          formData.append("profile_img", selectedAvatarFile);
        }

        const res = await httpClient.put("/user/profile", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        const updatedProfile = res?.data?.profile || trimmedProfile;

        nextUser = {
          ...user,
          ...updatedProfile,
        };

        setUser(nextUser);
        setProfile({
          full_name: updatedProfile.full_name || "",
          email: updatedProfile.email || "",
          phone: updatedProfile.phone || "",
        });
        setAvatarPreview("");
        setSelectedAvatarFile(null);
        setIsEditingProfile(false);
        broadcastProfileUpdate(nextUser);
      } else {
        setProfile(trimmedProfile);
      }

      saveStoredSettings(
        buildStoredSettings({
          full_name: nextUser?.full_name || trimmedProfile.full_name,
          email: nextUser?.email || trimmedProfile.email,
          phone: nextUser?.phone || trimmedProfile.phone,
          profile_img: nextUser?.profile_img || "",
        })
      );

      setDirty(false);
      setFeedback(
        shouldUpdateProfile
          ? "Profile updated successfully."
          : "Settings saved successfully.",
        "success"
      );
    } catch (err) {
      console.error("Failed to update customer profile:", err);
      setFeedback(
        err?.response?.data?.message || "Failed to save your profile.",
        "error"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser({ navigate, redirectTo: ROUTES.home });
  };

  const normalizeExp = (value) => {
    const v = String(value || "").trim();
    const cleaned = v.replace(/[^\d/]/g, "");
    const parts = cleaned.split("/").filter(Boolean);

    if (parts.length === 1 && parts[0].length >= 3) {
      const mm = parts[0].slice(0, 2);
      const yy = parts[0].slice(2, 4);
      return yy ? `${mm}/${yy}` : mm;
    }

    if (parts.length >= 2) {
      return `${parts[0].slice(0, 2)}/${parts[1].slice(0, 2)}`;
    }

    return cleaned.slice(0, 5);
  };

  const submitNewCard = () => {
    const last4 = String(newCard.last4 || "").replace(/\D/g, "").slice(-4);
    const exp = normalizeExp(newCard.exp);

    if (last4.length !== 4) {
      setFeedback("Please enter the last 4 digits.", "error");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) {
      setFeedback("Expiry must be in MM/YY format.", "error");
      return;
    }

    setCards((prev) => {
      const next = [
        ...prev.map((c) =>
          newCard.isDefault ? { ...c, isDefault: false } : c
        ),
        {
          id: `${Date.now()}`,
          brand: newCard.brand,
          last4,
          exp,
          isDefault: !!newCard.isDefault || prev.length === 0,
        },
      ];

      if (!next.some((c) => c.isDefault)) {
        next[0] = { ...next[0], isDefault: true };
      }

      return next;
    });

    setNewCard({ brand: "VISA", last4: "", exp: "", isDefault: true });
    setAddCardOpen(false);
    markDirty();
  };

  const submitChangePassword = async () => {
    setPwdStatus({ loading: true, error: "", success: "" });

    const currentPassword = pwd.currentPassword.trim();
    const newPassword = pwd.newPassword.trim();
    const confirmPassword = pwd.confirmPassword.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdStatus({
        loading: false,
        error: "All password fields are required.",
        success: "",
      });
      return;
    }

    if (newPassword.length < 6) {
      setPwdStatus({
        loading: false,
        error: "New password must be at least 6 characters.",
        success: "",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdStatus({
        loading: false,
        error: "New password and confirmation do not match.",
        success: "",
      });
      return;
    }

    try {
      await httpClient.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setPwdStatus({
        loading: false,
        error: "",
        success: "Password updated.",
      });
      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setChangePasswordOpen(false), 600);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to change password.";
      setPwdStatus({ loading: false, error: message, success: "" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Settings</h1>
        <p className="font-medium text-slate-500">
          Manage your account preferences and information.
        </p>
      </div>

      <div className="space-y-6">
        <SectionCard
          icon={User}
          title="Profile Information"
          action={
            isEditingProfile ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={discardChanges}
                  disabled={loadingUser || savingProfile}
                  className={classNames(
                    "inline-flex h-9 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition",
                    loadingUser || savingProfile
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Pencil size={16} />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveChanges}
                  disabled={loadingUser || savingProfile || !dirty}
                  className={classNames(
                    "inline-flex h-9 items-center rounded-xl px-4 text-sm font-semibold transition",
                    loadingUser || savingProfile || !dirty
                      ? "cursor-not-allowed bg-slate-200 text-slate-500"
                      : "bg-primary text-white hover:bg-primary-hover"
                  )}
                >
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFeedback("", "neutral");
                  setIsEditingProfile(true);
                }}
                disabled={loadingUser || savingProfile}
                className={classNames(
                  "inline-flex h-9 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition",
                  loadingUser || savingProfile
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-primary text-white hover:bg-primary-hover"
                )}
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            )
          }
        >
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex w-full flex-col items-center md:w-56 md:items-start">
              <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-orange-100 text-2xl font-extrabold text-slate-800">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                    />
                  ) : savedProfileImage ? (
                    <img
                      src={savedProfileImage}
                      alt={profile.full_name || "Customer profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <label
                  className={classNames(
                    "absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/20 transition",
                    isEditingProfile
                      ? "cursor-pointer bg-primary hover:bg-primary-hover"
                      : "cursor-not-allowed bg-slate-300"
                  )}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg"
                    onChange={(e) => onAvatarChange(e.target.files?.[0])}
                    disabled={!isEditingProfile}
                  />
                  <Plus size={18} />
                </label>
              </div>
              <div className="mt-3 text-xs text-slate-500">JPG, PNG up to 2MB</div>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Full Name
                </label>
                <input
                  value={profile.full_name}
                  onChange={(e) => {
                    setProfile((prev) => ({ ...prev, full_name: e.target.value }));
                    markDirty();
                  }}
                  placeholder={loadingUser ? "Loading..." : "Full name"}
                  disabled={loadingUser || savingProfile || !isEditingProfile}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Email Address
                </label>
                <input
                  value={profile.email}
                  onChange={(e) => {
                    setProfile((prev) => ({ ...prev, email: e.target.value }));
                    markDirty();
                  }}
                  placeholder="email@example.com"
                  disabled={loadingUser || savingProfile || !isEditingProfile}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Phone Number
                </label>
                <input
                  value={profile.phone}
                  onChange={(e) => {
                    setProfile((prev) => ({ ...prev, phone: e.target.value }));
                    markDirty();
                  }}
                  placeholder="+855 ..."
                  disabled={loadingUser || savingProfile || !isEditingProfile}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Shield} title="Security">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <div className="text-sm font-bold text-slate-900">Password</div>
              <div className="mt-0.5 text-xs text-slate-500">
                Change your account password.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPwdStatus({ loading: false, error: "", success: "" });
                setChangePasswordOpen(true);
              }}
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Change Password
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <div className="text-sm font-bold text-slate-900">Logout</div>
              <div className="mt-0.5 text-xs text-slate-500">
                Sign out of your account on this device.
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </SectionCard>

        <div className="flex items-center justify-between gap-4 pt-2">
          <div
            className={classNames(
              "text-sm",
              saveMessageType === "error"
                ? "text-red-600"
                : saveMessageType === "success"
                  ? "text-green-600"
                  : "text-slate-500"
            )}
          >
            {saveMessage || null}
          </div>
          <div className="flex items-center gap-3">
          </div>
        </div>
      </div>

      <Modal
        open={changePasswordOpen}
        title="Change Password"
        onClose={() => setChangePasswordOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              onClick={() => setChangePasswordOpen(false)}
              disabled={pwdStatus.loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className={classNames(
                "h-10 rounded-xl px-4 text-sm font-semibold transition",
                pwdStatus.loading
                  ? "cursor-not-allowed bg-slate-200 text-slate-500"
                  : "bg-primary text-white hover:bg-primary-hover"
              )}
              onClick={submitChangePassword}
              disabled={pwdStatus.loading}
            >
              {pwdStatus.loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {pwdStatus.error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {pwdStatus.error}
            </div>
          ) : null}
          {pwdStatus.success ? (
            <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
              {pwdStatus.success}
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Current password
            </label>
            <input
              type="password"
              value={pwd.currentPassword}
              onChange={(e) =>
                setPwd((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Current password"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              New password
            </label>
            <input
              type="password"
              value={pwd.newPassword}
              onChange={(e) =>
                setPwd((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Confirm new password
            </label>
            <input
              type="password"
              value={pwd.confirmPassword}
              onChange={(e) =>
                setPwd((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Repeat new password"
            />
          </div>

          <div className="text-xs text-slate-500">
            You will stay signed in, but you may need to log in again when your
            token expires.
          </div>
        </div>
      </Modal>

      <Modal
        open={addCardOpen}
        title="Add Payment Method"
        onClose={() => setAddCardOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              onClick={() => setAddCardOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
              onClick={submitNewCard}
            >
              Add
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Card brand
            </label>
            <select
              value={newCard.brand}
              onChange={(e) =>
                setNewCard((prev) => ({ ...prev, brand: e.target.value }))
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option value="VISA">VISA</option>
              <option value="MASTERCARD">MASTERCARD</option>
              <option value="AMEX">AMEX</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Last 4 digits
              </label>
              <input
                value={newCard.last4}
                inputMode="numeric"
                onChange={(e) =>
                  setNewCard((prev) => ({ ...prev, last4: e.target.value }))
                }
                placeholder="4242"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Expiry (MM/YY)
              </label>
              <input
                value={newCard.exp}
                onChange={(e) =>
                  setNewCard((prev) => ({
                    ...prev,
                    exp: normalizeExp(e.target.value),
                  }))
                }
                placeholder="12/26"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>

          <label className="flex select-none items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={newCard.isDefault}
              onChange={(e) =>
                setNewCard((prev) => ({ ...prev, isDefault: e.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            Set as default
          </label>

          <div className="text-xs text-slate-500">
            This is stored locally for now (no real payment processing yet).
          </div>
        </div>
      </Modal>
    </div>
  );
}
