const bcrypt = require("bcrypt");

class ProviderBooking {
static async getAllrequest(db, current_provider_id) {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT 
        b.id as booking_id,
        sc.name AS category_name,
        b.issue_description,
        b.service_address,
        b.urgent_level,
        b.created_at,
        u.full_name AS customer_name,
        sp.location AS provider_location,
        MIN(ii.image) AS issue_image
      FROM bookings b
      INNER JOIN users u ON u.id = b.customer_id
      INNER JOIN services s ON s.id = b.service_id
      INNER JOIN service_categories sc ON sc.id = s.category_id
      INNER JOIN service_providers sp ON sp.id = s.provider_id
      LEFT JOIN issue_img ii ON ii.booking_id = b.id
      WHERE b.status = 'pending'
      AND sp.user_id = ?
      GROUP BY b.id
      ORDER BY b.id DESC
      LIMIT 50`,
      [current_provider_id],
      (err, results) => {
        if (err) reject(err);
        else {
          // Convert blobs to base64 strings if they exist
          const formatted = results.map(row => {
            if (row.issue_image && Buffer.isBuffer(row.issue_image)) {
              row.issue_image = `data:image/jpeg;base64,${row.issue_image.toString('base64')}`;
            }
            return row;
          });
          resolve(formatted);
        }
      }
    );
  });
}

static async getById(db, booking_id, provider_id) {
  return new Promise((resolve, reject) => {
    // First, get the booking details
    db.query(
      `SELECT 
        b.id as booking_id,
        sc.name AS category_name,
        b.issue_description,
        b.service_address,
        b.urgent_level,
        b.created_at,
        u.full_name AS customer_name,
        u.phone AS customer_phone,
        u.email AS customer_email,
        sp.location AS provider_location
      FROM bookings b
      INNER JOIN users u ON u.id = b.customer_id
      INNER JOIN services s ON s.id = b.service_id
      INNER JOIN service_categories sc ON sc.id = s.category_id
      INNER JOIN service_providers sp ON sp.id = s.provider_id
      WHERE b.id = ? AND sp.user_id = ?`,
      [booking_id, provider_id],
      (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null);

        const booking = results[0];

        // Second, get all images for this booking
        db.query(
          `SELECT image FROM issue_img WHERE booking_id = ?`,
          [booking_id],
          (err, imageResults) => {
            if (err) return reject(err);
            // Convert binary blobs to base64 strings
            booking.images = imageResults.map(row => {
              if (row.image && Buffer.isBuffer(row.image)) {
                return `data:image/jpeg;base64,${row.image.toString('base64')}`;
              }
              return null;
            }).filter(img => img !== null);
            resolve(booking);
          }
        );
      }
    );
  });
}

static async acceptAndSetProposal(db, booking_id, provider_id, items, total) {
  return new Promise((resolve, reject) => {
    db.beginTransaction(async (err) => {
      if (err) return reject(err);

      try {
        // 1. Update booking status and service_fee
        const updateQuery = `
          UPDATE bookings b
          INNER JOIN services s ON s.id = b.service_id
          SET b.status = 'fixer_accept', b.service_fee = ?
          WHERE b.id = ? AND s.provider_id = ?
        `;
        
        await new Promise((res, rej) => {
          db.query(updateQuery, [total, booking_id, provider_id], (err, result) => {
            if (err) rej(err);
            else if (result.affectedRows === 0) rej(new Error("Booking not found or not owned by provider"));
            else res(result);
          });
        });

        // 2. Insert proposal items
        if (items && items.length > 0) {
          const insertItemsQuery = `INSERT INTO proposal_price (booking_id, name, price) VALUES ?`;
          const values = items.map(item => [booking_id, item.name, item.price]);
          
          await new Promise((res, rej) => {
            db.query(insertItemsQuery, [values], (err, result) => {
              if (err) rej(err);
              else res(result);
            });
          });
        }

        db.commit((err) => {
          if (err) return db.rollback(() => reject(err));
          resolve({ success: true });
        });
      } catch (error) {
        db.rollback(() => reject(error));
      }
    });
  });
}

}

module.exports = ProviderBooking;