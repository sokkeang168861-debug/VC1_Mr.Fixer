const User = require('../models/userModel');

class AdminUsersService {
  static async getAdminUsers(db) {
    // Return only customer users (admin route for user management)
    return await User.getAllUsers(db);
  }

  static async getCustomerById(db, id) {
    const customer = await User.getCustomerById(db, id);
    if (!customer) {
      const error = new Error("Customer not found");
      error.status = 404;
      throw error;
    }
    return customer;
  }
}

module.exports = AdminUsersService;