const FixerProfileModel = require("../models/fixerProfileModel");
const { toImageDataUrl } = require("../utils/imageDataUrl");

const normalizeCoordinate = (value, fieldName) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    const error = new Error(`${fieldName} must be a valid number`);
    error.status = 400;
    throw error;
  }

  return numericValue;
};

const validateImageUpload = (file, label) => {
  if (!file) {
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error(`${label} must be JPG or PNG`);
    error.status = 400;
    throw error;
  }

  if (file.size > 5 * 1024 * 1024) {
    const error = new Error(`${label} must be 5MB or smaller`);
    error.status = 400;
    throw error;
  }
};

const getFixerProfile = async (db, user) => {
  const fixerId = user?.id;
  const role = String(user?.role || "").toLowerCase();

  if (!fixerId) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  if (role !== "fixer") {
    const error = new Error("Only fixer accounts can access this resource");
    error.status = 403;
    throw error;
  }

  const fixer = await FixerProfileModel.getFixerById(db, fixerId);

  if (!fixer) {
    const error = new Error("Fixer profile not found");
    error.status = 404;
    throw error;
  }

  return {
    id: fixer.id,
    full_name: fixer.full_name || "",
    email: fixer.email || "",
    phone: fixer.phone || "",
    location: fixer.location || "",
    latitude:
      fixer.latitude !== null && fixer.latitude !== undefined
        ? Number(fixer.latitude)
        : null,
    longitude:
      fixer.longitude !== null && fixer.longitude !== undefined
        ? Number(fixer.longitude)
        : null,
    role: fixer.role || "fixer",
    profile_img: toImageDataUrl(fixer.profile_img),
    qr_img: toImageDataUrl(fixer.qr_img),
  };
};

const validateFixerAccess = (user) => {
  const fixerId = user?.id;
  const role = String(user?.role || "").toLowerCase();

  if (!fixerId) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  if (role !== "fixer") {
    const error = new Error("Only fixer accounts can access this resource");
    error.status = 403;
    throw error;
  }

  return fixerId;
};

const updateFixerProfile = async (db, user, data, files = {}) => {
  const fixerId = validateFixerAccess(user);
  const full_name = String(data?.full_name || "").trim();
  const email = String(data?.email || "").trim();
  const phone = String(data?.phone || "").trim();
  const profileFile = files?.profile_img || null;
  const qrFile = files?.qr_img || null;

  if (!full_name || !email || !phone) {
    const error = new Error("Full name, email, and phone are required");
    error.status = 400;
    throw error;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    const error = new Error("Invalid email address");
    error.status = 400;
    throw error;
  }

  const currentFixer = await FixerProfileModel.getFixerById(db, fixerId);
  if (!currentFixer) {
    const error = new Error("Fixer profile not found");
    error.status = 404;
    throw error;
  }

  const existingUserByEmail = await db.query(
    "SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1",
    [email, fixerId]
  );
  const existingEmail = existingUserByEmail[0]?.[0];
  if (existingEmail) {
    const error = new Error("Email already exists");
    error.status = 400;
    throw error;
  }

  validateImageUpload(profileFile, "Profile image");
  validateImageUpload(qrFile, "QR image");

  await FixerProfileModel.updateFixerById(db, fixerId, {
    full_name,
    email,
    phone,
    ...(profileFile ? { profile_img: profileFile.buffer } : {}),
    ...(qrFile ? { qr_img: qrFile.buffer } : {}),
  });

  const updatedFixer = await FixerProfileModel.getFixerById(db, fixerId);

  return {
    message: "Fixer profile updated successfully",
    profile: {
      id: updatedFixer.id,
      full_name: updatedFixer.full_name || "",
      email: updatedFixer.email || "",
      phone: updatedFixer.phone || "",
      role: updatedFixer.role || "fixer",
      profile_img: toImageDataUrl(updatedFixer.profile_img),
      qr_img: toImageDataUrl(updatedFixer.qr_img),
    },
  };
};

const updateFixerLocation = async (db, user, data) => {
  const fixerId = validateFixerAccess(user);
  const rawLocation =
    typeof data?.location === "string" ? data.location.trim() : "";
  const latitude = normalizeCoordinate(data?.latitude, "latitude");
  const longitude = normalizeCoordinate(data?.longitude, "longitude");

  if (!rawLocation && latitude === undefined && longitude === undefined) {
    const error = new Error("Location or coordinates are required");
    error.status = 400;
    throw error;
  }

  if (
    (latitude === undefined && longitude !== undefined) ||
    (latitude !== undefined && longitude === undefined)
  ) {
    const error = new Error("Latitude and longitude must be provided together");
    error.status = 400;
    throw error;
  }

  const fixer = await FixerProfileModel.getFixerById(db, fixerId);
  if (!fixer) {
    const error = new Error("Fixer profile not found");
    error.status = 404;
    throw error;
  }

  if (fixer.service_provider_id) {
    await FixerProfileModel.updateServiceProviderByUserId(db, fixerId, {
      ...(rawLocation ? { location: rawLocation } : {}),
      ...(latitude !== undefined ? { latitude } : {}),
      ...(longitude !== undefined ? { longitude } : {}),
    });
  } else {
    await FixerProfileModel.createServiceProviderByUserId(db, fixerId, {
      location: rawLocation || null,
      latitude,
      longitude,
    });
  }

  const updatedFixer = await FixerProfileModel.getFixerById(db, fixerId);

  return {
    message: "Fixer location updated successfully",
    location: updatedFixer?.location || "",
    latitude:
      updatedFixer?.latitude !== null && updatedFixer?.latitude !== undefined
        ? Number(updatedFixer.latitude)
        : null,
    longitude:
      updatedFixer?.longitude !== null && updatedFixer?.longitude !== undefined
        ? Number(updatedFixer.longitude)
        : null,
  };
};

const updateFixerNotifications = async (db, user, data) => {
  const fixerId = validateFixerAccess(user);

  const payload = {
    email_notifications: Boolean(data?.emailNotifications),
    push_notifications: Boolean(data?.pushNotifications),
    sms_notifications: Boolean(data?.smsNotifications),
  };

  const fixer = await FixerProfileModel.getFixerById(db, fixerId);
  if (!fixer) {
    const error = new Error("Fixer profile not found");
    error.status = 404;
    throw error;
  }

  await FixerProfileModel.updateNotificationPreferences(db, fixerId, payload);

  return {
    message: "Notification preferences updated successfully",
    notifications: {
      emailNotifications: payload.email_notifications,
      pushNotifications: payload.push_notifications,
      smsNotifications: payload.sms_notifications,
    },
  };
};

module.exports = {
  getFixerProfile,
  updateFixerProfile,
  updateFixerLocation,
  updateFixerNotifications,
};
