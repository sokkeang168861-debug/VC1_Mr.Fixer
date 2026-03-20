const FixerProfileService = require("../services/fixerProfileService");

const getFixerProfile = async (req, res) => {
  const db = req.app.get("db");

  try {
    const profile = await FixerProfileService.getFixerProfile(db, req.user);
    res.json(profile);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Failed to load fixer profile",
    });
  }
};

const updateFixerProfile = async (req, res) => {
  const db = req.app.get("db");

  try {
    const result = await FixerProfileService.updateFixerProfile(
      db,
      req.user,
      req.body,
      req.file
    );
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Failed to update fixer profile",
    });
  }
};

const updateFixerLocation = async (req, res) => {
  const db = req.app.get("db");

  try {
    const result = await FixerProfileService.updateFixerLocation(
      db,
      req.user,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Failed to update fixer location",
    });
  }
};

const updateFixerNotifications = async (req, res) => {
  const db = req.app.get("db");

  try {
    const result = await FixerProfileService.updateFixerNotifications(
      db,
      req.user,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Failed to update notification preferences",
    });
  }
};

module.exports = {
  getFixerProfile,
  updateFixerProfile,
  updateFixerLocation,
  updateFixerNotifications,
};
