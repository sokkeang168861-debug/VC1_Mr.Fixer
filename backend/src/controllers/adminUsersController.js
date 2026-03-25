const AdminUsersService = require("../services/adminUsersService");

const getAllUsers = async (req, res) => {
  const db = req.app.get("db");
  try {
    const users = await AdminUsersService.getAdminUsers(db);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllCustomers = async (req, res) => {
  const db = req.app.get("db");
  try {
    const customers = await AdminUsersService.getAllCustomers(db);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerById = async (req, res) => {
  const db = req.app.get("db");
  try {
    const { id } = req.params;
    if (!id || !/^\d+$/.test(id)) {
      return res.status(400).json({ message: "A valid customer ID is required" });
    }

    const customer = await AdminUsersService.getCustomerById(db, Number(id));
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  const db = req.app.get("db");
  try {
    const { id } = req.params;
    const updatedCustomer = await AdminUsersService.updateCustomer(
      db,
      Number(id),
      req.body
    );
    res.json({
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  const db = req.app.get("db");
  try {
    const { id } = req.params;
    const result = await AdminUsersService.deleteCustomer(db, Number(id));
    res.json({
      success: true,
      message: "Customer deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
