const FixerProfileModel = require("../models/fixerProfileModel");

const toBase64Image = (buffer) => {
  return buffer && Buffer.isBuffer(buffer)
    ? `data:image/jpeg;base64,${buffer.toString("base64")}`
    : null;
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
    role: fixer.role || "fixer",
    profile_img: toBase64Image(fixer.profile_img),
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

const updateFixerProfile = async (db, user, data, file) => {
  const fixerId = validateFixerAccess(user);
  const full_name = String(data?.full_name || "").trim();
  const email = String(data?.email || "").trim();
  const phone = String(data?.phone || "").trim();

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

  if (file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("Profile image must be JPG or PNG");
      error.status = 400;
      throw error;
    }

    if (file.size > 5 * 1024 * 1024) {
      const error = new Error("Profile image must be 5MB or smaller");
      error.status = 400;
      throw error;
    }
  }

  await FixerProfileModel.updateFixerById(db, fixerId, {
    full_name,
    email,
    phone,
    ...(file ? { profile_img: file.buffer } : {}),
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
      profile_img: toBase64Image(updatedFixer.profile_img),
    },
  };
};

const updateFixerLocation = async (db, user, data) => {
  const fixerId = validateFixerAccess(user);
  const location = String(data?.location || "").trim();

  if (!location) {
    const error = new Error("Location is required");
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
      location,
    });
  } else {
    await FixerProfileModel.createServiceProviderByUserId(db, fixerId, {
      location,
    });
  }

  const updatedFixer = await FixerProfileModel.getFixerById(db, fixerId);

  return {
    message: "Fixer location updated successfully",
    location: updatedFixer?.location || "",
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
