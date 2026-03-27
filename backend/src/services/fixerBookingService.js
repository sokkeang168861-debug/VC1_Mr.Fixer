const FixerBookingModel = require("../models/fixerBookingModel");
// const bookingTimeoutService = require("./bookingTimeoutService");

function toMoney(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function buildJobOverview(request) {
  if (!request) {
    return null;
  }

  return {
    total_estimated_price: toMoney(
      request.proposal_total ?? request.service_fee
    ),
    issue_description:
      request.issue_description || "No issue description available.",
    booking_reference:
      request.booking_id !== undefined && request.booking_id !== null
        ? String(request.booking_id)
        : "",
    category: request.category_name || "Service Request",
  };
}

class FixerBookingService {
  static normalizeReceiptItem(item, index) {
    const name = typeof item?.name === "string" ? item.name.trim() : "";
    const price = Number(item?.price);

    if (!name) {
      throw {
        status: 400,
        message: `Receipt item ${index + 1} must include a name`,
      };
    }

    if (!Number.isFinite(price) || price < 0) {
      throw {
        status: 400,
        message: `Receipt item ${index + 1} must include a valid price`,
      };
    }

    return {
      name,
      price,
    };
  }

  static async getAllRequests(db, provider_id) {
    const requests = await FixerBookingModel.getAllrequest(db, provider_id);
    return requests;
  }

  static async getRequestById(db, booking_id, provider_id) {
    const request = await FixerBookingModel.getById(db, booking_id, provider_id);

    if (!request) {
      return null;
    }

    return {
      ...request,
      service_fee: toMoney(request.service_fee),
      job_overview: buildJobOverview(request),
    };
  }

  static async acceptAndSetProposal(db, booking_id, provider_id, items, total) {
    const result = await FixerBookingModel.acceptAndSetProposal(
      db,
      booking_id,
      provider_id,
      items,
      total
    );

    // Clear the timeout since the booking was accepted
    // bookingTimeoutService.clearTimeout(booking_id);

    return result;
  }

  static async rejectBooking(db, booking_id, provider_id, reason) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        `UPDATE bookings b
         INNER JOIN services s ON s.id = b.service_id
         INNER JOIN service_providers sp ON sp.id = s.provider_id
         SET b.status = 'fixer_reject', b.cancellation_reason = ?
         WHERE b.id = ? AND sp.user_id = ? AND b.status = 'pending'`,
        [reason || 'Provider rejected the booking', booking_id, provider_id]
      );

      if (result.affectedRows === 0) {
        throw new Error("Booking not found or not owned by provider");
      }

      await connection.commit();

      // Clear the timeout since the booking was rejected
      // bookingTimeoutService.clearTimeout(booking_id);

      return { message: "Booking rejected successfully" };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async markArrived(db, booking_id, provider_id) {
    const result = await FixerBookingModel.markArrived(
      db,
      booking_id,
      provider_id
    );

    if (result.affectedRows === 0) {
      const error = new Error("Booking is not ready to be marked as arrived.");
      error.status = 400;
      throw error;
    }

    return { message: "Booking marked as arrived successfully" };
  }

  static async completeBooking(db, booking_id, provider_id, items, total) {
    const normalizedBookingId = Number(booking_id);

    if (!Number.isInteger(normalizedBookingId) || normalizedBookingId <= 0) {
      throw {
        status: 400,
        message: "Invalid booking id",
      };
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw {
        status: 400,
        message: "At least one receipt item is required",
      };
    }

    const normalizedItems = items.map((item, index) =>
      this.normalizeReceiptItem(item, index)
    );

    const normalizedTotal = Number(total);

    if (!Number.isFinite(normalizedTotal) || normalizedTotal < 0) {
      throw {
        status: 400,
        message: "A valid receipt total is required",
      };
    }

    return await FixerBookingModel.completeBooking(
      db,
      normalizedBookingId,
      provider_id,
      normalizedItems,
      normalizedTotal
    );
  }
}

module.exports = FixerBookingService;
