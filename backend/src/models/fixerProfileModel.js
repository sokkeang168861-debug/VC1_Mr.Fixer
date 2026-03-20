class FixerProfileModel {
  static async getFixerById(db, fixerId) {
    const [rows] = await db.query(
      `SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.role,
        u.profile_img,
        sp.id AS service_provider_id,
        sp.location
       FROM users u
       LEFT JOIN service_providers sp ON sp.user_id = u.id
       WHERE u.id = ? AND LOWER(u.role) = 'fixer'
       LIMIT 1`,
      [fixerId]
    );

    return rows[0] || null;
  }

  static async updateFixerById(db, fixerId, payload) {
    const fields = [];
    const values = [];

    if (Object.prototype.hasOwnProperty.call(payload, "full_name")) {
      fields.push("full_name = ?");
      values.push(payload.full_name);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "email")) {
      fields.push("email = ?");
      values.push(payload.email);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "phone")) {
      fields.push("phone = ?");
      values.push(payload.phone);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "profile_img")) {
      fields.push("profile_img = ?");
      values.push(payload.profile_img);
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(fixerId);

    const [result] = await db.query(
      `UPDATE users
       SET ${fields.join(", ")}
       WHERE id = ? AND LOWER(role) = 'fixer'`,
      values
    );

    return result;
  }

  static async updateServiceProviderByUserId(db, fixerId, payload) {
    const fields = [];
    const values = [];

    if (Object.prototype.hasOwnProperty.call(payload, "location")) {
      fields.push("location = ?");
      values.push(payload.location);
    }

    if (fields.length === 0) {
      return null;
    }

    values.push(fixerId);

    const [result] = await db.query(
      `UPDATE service_providers
       SET ${fields.join(", ")}
       WHERE user_id = ?`,
      values
    );

    return result;
  }

  static async createServiceProviderByUserId(db, fixerId, payload) {
    const [result] = await db.query(
      `INSERT INTO service_providers (user_id, location)
       VALUES (?, ?)`,
      [fixerId, payload.location]
    );

    return result;
  }

  static async updateNotificationPreferences(db, fixerId, payload) {
    const [result] = await db.query(
      `UPDATE users
       SET email_notifications = ?,
           push_notifications = ?,
           sms_notifications = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND LOWER(role) = 'fixer'`,
      [
        payload.email_notifications,
        payload.push_notifications,
        payload.sms_notifications,
        fixerId,
      ]
    );

    return result;
  }
}

module.exports = FixerProfileModel;
