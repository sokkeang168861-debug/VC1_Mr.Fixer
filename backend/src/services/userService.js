const User = require("../models/userModel");
const { toImageDataUrl } = require("../utils/imageDataUrl");

const formatProfile = (user) => ({
  id: user.id,
  full_name: user.full_name || "",
  email: user.email || "",
  phone: user.phone || "",
  role: user.role || "",
  profile_img: toImageDataUrl(user.profile_img),
});

const requireAuthenticatedUser = (user) => {
  const userId = user?.id;

  if (!userId) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  return userId;
};

const requireCustomerAccess = (user) => {
  const userId = requireAuthenticatedUser(user);
  const role = String(user?.role || "").toLowerCase();

  if (role !== "customer") {
    const error = new Error("Only customer accounts can access this resource");
    error.status = 403;
    throw error;
  }

  return userId;
};

const getCurrentUser = async (db, user) => {
  const userId = requireAuthenticatedUser(user);
  const currentUser = await User.findById(db, userId);

  if (!currentUser) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return formatProfile(currentUser);
};

const getCustomerProfile = async (db, user) => {
  const userId = requireCustomerAccess(user);
  const customer = await User.findCustomerProfileById(db, userId);

  if (!customer) {
    const error = new Error("Customer profile not found");
    error.status = 404;
    throw error;
  }

  return formatProfile(customer);
};

const getCustomerLocation = async (db, user) => {
  const userId = requireCustomerAccess(user);
  const customer = await User.findCustomerProfileById(db, userId);

  if (!customer) {
    const error = new Error("Customer profile not found");
    error.status = 404;
    throw error;
  }

  const serviceProvider = await User.findServiceProviderLocationByUserId(db, userId);

  return {
    location: serviceProvider?.location || "",
  };
};

const updateCustomerProfile = async (db, user, data, file) => {
  const userId = requireCustomerAccess(user);
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

  const customer = await User.findCustomerProfileById(db, userId);
  if (!customer) {
    const error = new Error("Customer profile not found");
    error.status = 404;
    throw error;
  }

  const existingEmail = await User.findByEmailExcludingId(db, email, userId);
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

    if (file.size > 2 * 1024 * 1024) {
      const error = new Error("Profile image must be 2MB or smaller");
      error.status = 400;
      throw error;
    }
  }

  await User.updateCustomerProfileById(db, userId, {
    full_name,
    email,
    phone,
    ...(file ? { profile_img: file.buffer } : {}),
  });

  const updatedCustomer = await User.findCustomerProfileById(db, userId);

  return {
    message: "Customer profile updated successfully",
    profile: formatProfile(updatedCustomer),
  };
};

const updateCustomerLocation = async (db, user, data) => {
  const userId = requireCustomerAccess(user);
  const location = String(data?.location || "").trim();

  if (!location) {
    const error = new Error("Location is required");
    error.status = 400;
    throw error;
  }

  const customer = await User.findCustomerProfileById(db, userId);
  if (!customer) {
    const error = new Error("Customer profile not found");
    error.status = 404;
    throw error;
  }

  const serviceProvider = await User.findServiceProviderLocationByUserId(db, userId);

  if (serviceProvider) {
    await User.updateServiceProviderLocationByUserId(db, userId, location);
  } else {
    await User.createServiceProviderLocationByUserId(db, userId, location);
  }

  return {
    message: "Customer location updated successfully",
    location,
  };
};

module.exports = {
  getCurrentUser,
  getCustomerProfile,
  getCustomerLocation,
  updateCustomerProfile,
  updateCustomerLocation,
};
