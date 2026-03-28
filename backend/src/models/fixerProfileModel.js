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
        u.qr_img,
        sp.id AS service_provider_id,
        sp.location,
        sp.latitude,
        sp.longitude
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

    if (Object.prototype.hasOwnProperty.call(payload, "qr_img")) {
      fields.push("qr_img = ?");
      values.push(payload.qr_img);
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

    if (Object.prototype.hasOwnProperty.call(payload, "latitude")) {
      fields.push("latitude = ?");
      values.push(payload.latitude);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "longitude")) {
      fields.push("longitude = ?");
      values.push(payload.longitude);
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
      `INSERT INTO service_providers (user_id, location, latitude, longitude)
       VALUES (?, ?, ?, ?)`,
      [
        fixerId,
        payload.location || null,
        payload.latitude ?? null,
        payload.longitude ?? null,
      ]
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
