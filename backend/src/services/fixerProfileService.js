const FixerProfileModel = require("../models/fixerProfileModel");
const FixerManagementService = require("./fixerManagementService");
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

  return FixerProfileModel.serializeFixerProfile(fixer);
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

const updateFixerProfile = async (db, user, data, file) => {
  const fixerId = validateFixerAccess(user);
  const full_name = String(data?.full_name || "").trim();
  const email = String(data?.email || "").trim();
  const phone = String(data?.phone || "").trim();
  const company_name = String(data?.company_name || "").trim();
  const bio = String(data?.bio || "").trim();
  const experienceRaw = String(data?.experience || "").trim();
  const experience =
    experienceRaw === "" ? null : Number.parseInt(experienceRaw, 10);
  const profileImageFile = file?.profile_img || null;
  const qrFile = file?.qr || null;

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

  if (experienceRaw !== "" && (!Number.isFinite(experience) || experience < 0)) {
    const error = new Error("Experience must be a valid non-negative number");
    error.status = 400;
    throw error;
  }

  if (profileImageFile) {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(profileImageFile.mimetype)) {
      const error = new Error("Profile image must be JPG or PNG");
      error.status = 400;
      throw error;
    }

    if (profileImageFile.size > 5 * 1024 * 1024) {
      const error = new Error("Profile image must be 5MB or smaller");
      error.status = 400;
      throw error;
    }
  }

  if (qrFile) {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(qrFile.mimetype)) {
      const error = new Error("QR image must be JPG or PNG");
      error.status = 400;
      throw error;
    }

    if (qrFile.size > 5 * 1024 * 1024) {
      const error = new Error("QR image must be 5MB or smaller");
      error.status = 400;
      throw error;
    }
  }

  const providerPayload = {
    company_name: company_name || null,
    bio: bio || null,
    experience,
    ...(qrFile ? { qr: qrFile.buffer } : {}),
  };

  await FixerProfileModel.updateFixerById(db, fixerId, {
    full_name,
    email,
    phone,
    ...(profileImageFile ? { profile_img: profileImageFile.buffer } : {}),
  });

  if (currentFixer.service_provider_id) {
    await FixerProfileModel.updateServiceProviderByUserId(db, fixerId, providerPayload);
  } else {
    await FixerProfileModel.createServiceProviderByUserId(db, fixerId, providerPayload);
  }

  const updatedFixer = await FixerProfileModel.getFixerById(db, fixerId);
  const serializedFixer = FixerProfileModel.serializeFixerProfile(updatedFixer);

  return {
    message: "Fixer profile updated successfully",
    profile: serializedFixer,
  };
};

const updateFixerLocation = async (db, user, data) => {
  const fixerId = validateFixerAccess(user);
  const rawLocation =
    typeof data?.location === "string" ? data.location.trim() : "";
  const providedLatitude = normalizeCoordinate(data?.latitude, "latitude");
  const providedLongitude = normalizeCoordinate(data?.longitude, "longitude");

  if (
    !rawLocation &&
    providedLatitude === undefined &&
    providedLongitude === undefined
  ) {
    const error = new Error("Location or coordinates are required");
    error.status = 400;
    throw error;
  }

  if (
    (providedLatitude === undefined && providedLongitude !== undefined) ||
    (providedLatitude !== undefined && providedLongitude === undefined)
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

  let latitude = providedLatitude;
  let longitude = providedLongitude;

  if (
    rawLocation &&
    providedLatitude === undefined &&
    providedLongitude === undefined
  ) {
    const coordinates = await FixerManagementService.resolveCoordinates(
      {},
      rawLocation
    );

    if (coordinates.latitude === null || coordinates.longitude === null) {
      const error = new Error(
        "Unable to detect latitude and longitude from that address. Please enter a more specific location."
      );
      error.status = 400;
      throw error;
    }

    latitude = coordinates.latitude;
    longitude = coordinates.longitude;
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
