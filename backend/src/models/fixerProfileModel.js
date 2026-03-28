const { toImageDataUrl } = require("../utils/imageDataUrl");

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
        sp.company_name,
        sp.bio,
        sp.experience,
        sp.qr,
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

    if (Object.prototype.hasOwnProperty.call(payload, "company_name")) {
      fields.push("company_name = ?");
      values.push(payload.company_name);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "bio")) {
      fields.push("bio = ?");
      values.push(payload.bio);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "experience")) {
      fields.push("experience = ?");
      values.push(payload.experience);
    }

    if (Object.prototype.hasOwnProperty.call(payload, "qr")) {
      fields.push("qr = ?");
      values.push(payload.qr);
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
      `INSERT INTO service_providers (
        user_id,
        company_name,
        bio,
        experience,
        qr,
        location,
        latitude,
        longitude
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fixerId,
        payload.company_name || null,
        payload.bio || null,
        payload.experience ?? null,
        payload.qr ?? null,
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

  static serializeFixerProfile(row) {
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      full_name: row.full_name || "",
      email: row.email || "",
      phone: row.phone || "",
      role: row.role || "fixer",
      profile_img: toImageDataUrl(row.profile_img),
      company_name: row.company_name || "",
      bio: row.bio || "",
      experience:
        row.experience !== null && row.experience !== undefined
          ? Number(row.experience)
          : null,
      qr: toImageDataUrl(row.qr),
      location: row.location || "",
      latitude:
        row.latitude !== null && row.latitude !== undefined
          ? Number(row.latitude)
          : null,
      longitude:
        row.longitude !== null && row.longitude !== undefined
          ? Number(row.longitude)
          : null,
      service_provider_id: row.service_provider_id || null,
    };
  }
}

module.exports = FixerProfileModel;
