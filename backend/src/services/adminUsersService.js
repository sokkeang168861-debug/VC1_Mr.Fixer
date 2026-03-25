const User = require('../models/userModel');

class AdminUsersService {
  static formatUser(user) {
    return {
      id: Number(user.id),
      customerId: Number(user.customer_id || user.id),
      fullName: user.full_name || "Unknown User",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "",
      isActive: Boolean(user.is_active),
      status: String(user.status || "Active").toLowerCase(),
      totalBookings: Number(user.total_bookings || 0),
      createdAt: user.created_at || null,
      avatar:
        user.profile_img && Buffer.isBuffer(user.profile_img)
          ? `data:image/jpeg;base64,${user.profile_img.toString("base64")}`
          : null,
    };
  }

  static async getAdminUsers(db) {
    // Return only customer users (admin route for user management)
    const users = await User.getAllUsers(db);
    return users.map((user) => this.formatUser(user));
  }

  static async getCustomerById(db, id) {
    const customer = await User.getCustomerById(db, id);
    if (!customer) {
      const error = new Error("Customer not found");
      error.status = 404;
      throw error;
    }
    return this.formatUser(customer);
  }

  static toOptionalString(value) {
    if (value === undefined || value === null) return null;
    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
  }

  static async updateCustomer(db, id, payload = {}) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      const error = new Error("A valid customer ID is required");
      error.status = 400;
      throw error;
    }

    const fullName = this.toOptionalString(payload.fullName ?? payload.name);
    const email = this.toOptionalString(payload.email)?.toLowerCase() || null;
    const phone = this.toOptionalString(payload.phone);
    const normalizedStatus = this.toOptionalString(payload.status)?.toLowerCase();

    if (!fullName || !email) {
      const error = new Error("Full name and email are required");
      error.status = 400;
      throw error;
    }

    let isActive;
    if (normalizedStatus === "active") {
      isActive = 1;
    } else if (normalizedStatus === "suspended") {
      isActive = 0;
    } else {
      const error = new Error("Status must be active or suspended");
      error.status = 400;
      throw error;
    }

    const existingCustomer = await User.getCustomerById(db, numericId);
    if (!existingCustomer) {
      const error = new Error("Customer not found");
      error.status = 404;
      throw error;
    }

    const duplicateEmail = await User.findByEmailExcludingId(db, email, numericId);
    if (duplicateEmail) {
      const error = new Error("Email already exists");
      error.status = 400;
      throw error;
    }

    await User.updateCustomerProfileById(db, numericId, {
      full_name: fullName,
      email,
      phone,
      is_active: isActive,
    });

    const updatedCustomer = await User.getCustomerById(db, numericId);

    return this.formatUser(updatedCustomer);
  }

  static async deleteCustomer(db, id) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      const error = new Error("A valid customer ID is required");
      error.status = 400;
      throw error;
    }

    const result = await User.deleteCustomerById(db, numericId);

    if (!result?.found) {
      const error = new Error("Customer not found");
      error.status = 404;
      throw error;
    }

    return {
      success: true,
      id: numericId,
      deletedBookings: Array.isArray(result.deletedBookingIds)
        ? result.deletedBookingIds.length
        : 0,
    };
  }
}

module.exports = AdminUsersService;
