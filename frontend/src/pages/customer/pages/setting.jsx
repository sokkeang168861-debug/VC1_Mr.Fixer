import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  CreditCard,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import httpClient from "../../../api/httpClient";

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
          <div className="text-xs text-slate-500 mt-0.5">{description}</div>
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
            "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow",
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
            className="fixed inset-0 bg-slate-900/40 z-50"
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
              className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900">{title}</div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="px-6 py-5">{children}</div>
              {footer ? (
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/60">
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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
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

const DEFAULT_ADDRESSES = [
  {
    id: "home",
    label: "Home",
    line1: "123 Maple Street, Apt 4B",
    line2: "Phnom Penh, Cambodia",
  },
  {
    id: "office",
    label: "Office",
    line1: "88 Business Plaza, Suite 200",
    line2: "Phnom Penh, Cambodia",
  },
];

const DEFAULT_CARDS = [
  {
    id: "visa",
    brand: "VISA",
    last4: "4242",
    exp: "12/26",
    isDefault: true,
  },
];

const STORAGE_KEY = "customer_settings_v1";

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

export default function CustomerSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [avatarPreview, setAvatarPreview] = useState("");

  const stored = useMemo(() => loadStoredSettings(), []);

  const [profile, setProfile] = useState(() => ({
    full_name: "",
    email: "",
    phone: stored?.profile?.phone || "",
  }));

  const [addresses, setAddresses] = useState(
    () => stored?.addresses || DEFAULT_ADDRESSES
  );
  const [cards, setCards] = useState(() => stored?.cards || DEFAULT_CARDS);

  const [notify, setNotify] = useState(() => ({
    email: stored?.notify?.email ?? true,
    push: stored?.notify?.push ?? true,
    sms: stored?.notify?.sms ?? false,
  }));

  const [dirty, setDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    line1: "",
    line2: "",
  });

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

  useEffect(() => {
    httpClient
      .get("/user/currentUser")
      .then((res) => {
        const payload = res.data || null;
        setUser(payload);
        setProfile((prev) => ({
          ...prev,
          full_name: payload?.full_name || "",
          email: payload?.email || "",
        }));
      })
      .catch((err) => {
        console.error(err);
        setUser(null);
      })
      .finally(() => setLoadingUser(false));
  }, []);

  const markDirty = () => {
    setDirty(true);
    setSaveMessage("");
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const initials = useMemo(() => {
    const name = profile.full_name || "User";
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "U";
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return `${first}${second}`.toUpperCase();
  }, [profile.full_name]);

  const onAvatarChange = (file) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setSaveMessage("Please upload a JPG or PNG image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSaveMessage("Image must be 2MB or smaller.");
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    markDirty();
  };

  const discardChanges = () => {
    setSaveMessage("");
    setDirty(false);
    setAvatarPreview("");

    const s = loadStoredSettings();
    setAddresses(s?.addresses || DEFAULT_ADDRESSES);
    setCards(s?.cards || DEFAULT_CARDS);
    setNotify({
      email: s?.notify?.email ?? true,
      push: s?.notify?.push ?? true,
      sms: s?.notify?.sms ?? false,
    });
    setProfile({
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone: s?.profile?.phone || "",
    });
  };

  const saveChanges = async () => {
    setSaveMessage("");

    // No profile update endpoints exist yet; keep this extensible for later.
    saveStoredSettings({
      profile: { phone: profile.phone },
      addresses,
      cards,
      notify,
    });
    setDirty(false);
    setSaveMessage("Saved.");
  };

  const handleLogout = async () => {
    try {
      await httpClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.removeItem("token");

    if (httpClient && httpClient.defaults?.headers) {
      delete httpClient.defaults.headers.common?.["Authorization"];
    }

    navigate("/");
  };

  const deleteAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    markDirty();
  };

  const submitNewAddress = () => {
    if (!newAddress.label.trim() || !newAddress.line1.trim()) {
      setSaveMessage("Address label and line 1 are required.");
      return;
    }

    setAddresses((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        label: newAddress.label.trim(),
        line1: newAddress.line1.trim(),
        line2: newAddress.line2.trim(),
      },
    ]);
    setNewAddress({ label: "", line1: "", line2: "" });
    setAddAddressOpen(false);
    markDirty();
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
    if (parts.length >= 2) return `${parts[0].slice(0, 2)}/${parts[1].slice(0, 2)}`;
    return cleaned.slice(0, 5);
  };

  const submitNewCard = () => {
    const last4 = String(newCard.last4 || "").replace(/\D/g, "").slice(-4);
    const exp = normalizeExp(newCard.exp);

    if (last4.length !== 4) {
      setSaveMessage("Please enter the last 4 digits.");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) {
      setSaveMessage("Expiry must be in MM/YY format.");
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

  const setDefaultCard = (id) => {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
    markDirty();
  };

  const deleteCard = (id) => {
    setCards((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length > 0 && !next.some((c) => c.isDefault)) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500 font-medium">
          Manage your account preferences and information.
        </p>
      </div>

      <div className="space-y-6">
        <SectionCard icon={User} title="Profile Information">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-56 flex flex-col items-center md:items-start">
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl bg-orange-100 border border-slate-200 flex items-center justify-center overflow-hidden text-slate-800 font-extrabold text-2xl">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary-hover transition">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg"
                    onChange={(e) => onAvatarChange(e.target.files?.[0])}
                  />
                  <Plus size={18} />
                </label>
              </div>
              <div className="text-xs text-slate-500 mt-3">
                JPG, PNG up to 2MB
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  value={profile.full_name}
                  onChange={(e) => {
                    setProfile((p) => ({ ...p, full_name: e.target.value }));
                    markDirty();
                  }}
                  placeholder={loadingUser ? "Loading..." : "Full name"}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  value={profile.email}
                  onChange={(e) => {
                    setProfile((p) => ({ ...p, email: e.target.value }));
                    markDirty();
                  }}
                  placeholder="email@example.com"
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  value={profile.phone}
                  onChange={(e) => {
                    setProfile((p) => ({ ...p, phone: e.target.value }));
                    markDirty();
                  }}
                  placeholder="+855 ..."
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={MapPin}
          title="Saved Addresses"
          action={
            <button
              type="button"
              onClick={() => setAddAddressOpen(true)}
              className="text-sm font-semibold text-primary hover:text-primary-dark transition"
            >
              Add New
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="border border-slate-200 rounded-2xl p-4 bg-white hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {addr.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {addr.line1}
                      <br />
                      {addr.line2}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-slate-500 hover:text-slate-900 transition"
                      onClick={() => {
                        setSaveMessage("Edit address coming soon.");
                      }}
                      aria-label="Edit address"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="text-slate-500 hover:text-red-600 transition"
                      onClick={() => deleteAddress(addr.id)}
                      aria-label="Delete address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          icon={CreditCard}
          title="Payment Methods"
          action={
            <button
              type="button"
              onClick={() => setAddCardOpen(true)}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition shadow-sm shadow-primary/20"
            >
              <Plus size={16} />
              Add New
            </button>
          }
        >
          <div className="space-y-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="border border-slate-200 rounded-2xl p-4 bg-white flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-500">
                    {card.brand}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      •••• •••• •••• {card.last4}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Expires {card.exp}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {card.isDefault ? (
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      DEFAULT
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDefaultCard(card.id)}
                      className="text-xs font-semibold text-primary hover:text-primary-dark transition"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    type="button"
                    className="text-slate-500 hover:text-red-600 transition"
                    onClick={() => deleteCard(card.id)}
                    aria-label="Delete card"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={Bell} title="Notification Preferences">
          <div className="divide-y divide-slate-100">
            <Toggle
              checked={notify.email}
              onChange={(v) => {
                setNotify((n) => ({ ...n, email: v }));
                markDirty();
              }}
              label="Email Notifications"
              description="Receive booking updates and receipts via email"
            />
            <Toggle
              checked={notify.push}
              onChange={(v) => {
                setNotify((n) => ({ ...n, push: v }));
                markDirty();
              }}
              label="Push Notifications"
              description="Get real-time updates on your phone"
            />
            <Toggle
              checked={notify.sms}
              onChange={(v) => {
                setNotify((n) => ({ ...n, sms: v }));
                markDirty();
              }}
              label="SMS Alerts"
              description="Quick text messages for immediate actions"
            />
          </div>
        </SectionCard>

        <SectionCard icon={Shield} title="Security">
          <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 bg-white">
            <div>
              <div className="text-sm font-bold text-slate-900">Password</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Change your account password.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPwdStatus({ loading: false, error: "", success: "" });
                setChangePasswordOpen(true);
              }}
              className="h-10 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
            >
              Change Password
            </button>
          </div>

          <div className="mt-4 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 bg-white">
            <div>
              <div className="text-sm font-bold text-slate-900">Logout</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Sign out of your account on this device.
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm font-semibold hover:bg-red-100 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </SectionCard>

        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="text-sm text-slate-500">
            {saveMessage ? saveMessage : null}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={discardChanges}
              disabled={!dirty}
              className={classNames(
                "h-11 px-5 rounded-xl text-sm font-semibold transition",
                dirty
                  ? "text-slate-700 hover:bg-slate-100"
                  : "text-slate-400 cursor-not-allowed"
              )}
            >
              Discard
            </button>
            <button
              type="button"
              onClick={saveChanges}
              disabled={!dirty}
              className={classNames(
                "h-11 px-6 rounded-xl text-sm font-semibold transition shadow-sm",
                dirty
                  ? "bg-primary text-white hover:bg-primary-hover shadow-primary/20"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
              )}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={addAddressOpen}
        title="Add Address"
        onClose={() => setAddAddressOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="h-10 px-4 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              onClick={() => setAddAddressOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition"
              onClick={submitNewAddress}
            >
              Add
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Label
            </label>
            <input
              value={newAddress.label}
              onChange={(e) =>
                setNewAddress((a) => ({ ...a, label: e.target.value }))
              }
              placeholder="Home, Office..."
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Address line 1
            </label>
            <input
              value={newAddress.line1}
              onChange={(e) =>
                setNewAddress((a) => ({ ...a, line1: e.target.value }))
              }
              placeholder="Street, number, building..."
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Address line 2 (optional)
            </label>
            <input
              value={newAddress.line2}
              onChange={(e) =>
                setNewAddress((a) => ({ ...a, line2: e.target.value }))
              }
              placeholder="City, province..."
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={changePasswordOpen}
        title="Change Password"
        onClose={() => setChangePasswordOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="h-10 px-4 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              onClick={() => setChangePasswordOpen(false)}
              disabled={pwdStatus.loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className={classNames(
                "h-10 px-4 rounded-xl text-sm font-semibold transition",
                pwdStatus.loading
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
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
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {pwdStatus.error}
            </div>
          ) : null}
          {pwdStatus.success ? (
            <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              {pwdStatus.success}
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Current password
            </label>
            <input
              type="password"
              value={pwd.currentPassword}
              onChange={(e) =>
                setPwd((p) => ({ ...p, currentPassword: e.target.value }))
              }
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              New password
            </label>
            <input
              type="password"
              value={pwd.newPassword}
              onChange={(e) =>
                setPwd((p) => ({ ...p, newPassword: e.target.value }))
              }
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              value={pwd.confirmPassword}
              onChange={(e) =>
                setPwd((p) => ({ ...p, confirmPassword: e.target.value }))
              }
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
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
              className="h-10 px-4 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              onClick={() => setAddCardOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition"
              onClick={submitNewCard}
            >
              Add
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Card brand
            </label>
            <select
              value={newCard.brand}
              onChange={(e) => setNewCard((c) => ({ ...c, brand: e.target.value }))}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
            >
              <option value="VISA">VISA</option>
              <option value="MASTERCARD">MASTERCARD</option>
              <option value="AMEX">AMEX</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Last 4 digits
              </label>
              <input
                value={newCard.last4}
                inputMode="numeric"
                onChange={(e) =>
                  setNewCard((c) => ({ ...c, last4: e.target.value }))
                }
                placeholder="4242"
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Expiry (MM/YY)
              </label>
              <input
                value={newCard.exp}
                onChange={(e) =>
                  setNewCard((c) => ({ ...c, exp: normalizeExp(e.target.value) }))
                }
                placeholder="12/26"
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 select-none">
            <input
              type="checkbox"
              checked={newCard.isDefault}
              onChange={(e) =>
                setNewCard((c) => ({ ...c, isDefault: e.target.checked }))
              }
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
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
