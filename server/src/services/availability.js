import Booking from '../models/Booking.js';

/**
 * Check whether a room is available for the given date range.
 * A room is unavailable if a non-cancelled booking overlaps:
 *   existing.checkInDate < requested.checkOutDate AND
 *   existing.checkOutDate > requested.checkInDate
 *
 * @param {ObjectId} roomId
 * @param {Date} checkIn
 * @param {Date} checkOut
 * @param {ObjectId|null} excludeBookingId  — exclude this booking (for updates)
 * @returns {Promise<boolean>}
 */
export const isRoomAvailable = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
  const query = {
    room: roomId,
    status: { $nin: ['cancelled', 'refunded'] },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.findOne(query);
  return !conflict;
};

/**
 * Find all available rooms for a date range, optional category & guest count.
 */
export const findAvailableRooms = async (checkIn, checkOut, guestsCount, categoryId, hotelId, city = null) => {
  const Room = (await import('../models/Room.js')).default;
  const Hotel = (await import('../models/Hotel.js')).default;

  const roomQuery = {};
  if (hotelId) roomQuery.hotel = hotelId;
  if (categoryId) roomQuery.category = categoryId;
  // Only consider rooms that are not under maintenance
  roomQuery.status = { $in: ['available', 'occupied', 'cleaning'] };

  if (city) {
    const matchingHotels = await Hotel.find({
      city: { $regex: city.trim(), $options: 'i' },
    }).select('_id');
    const hotelIds = matchingHotels.map((h) => h._id);
    roomQuery.hotel = { $in: hotelIds };
  }

  const rooms = await Room.find(roomQuery)
    .populate('category')
    .populate('hotel', 'name city address')
    .lean();

  // Filter out rooms with conflicting bookings
  const available = [];
  for (const room of rooms) {
    if (guestsCount && room.category && room.category.capacity < guestsCount) {
      continue;
    }
    const ok = await isRoomAvailable(room._id, checkIn, checkOut);
    if (ok) {
      available.push(room);
    }
  }

  return available;
};
