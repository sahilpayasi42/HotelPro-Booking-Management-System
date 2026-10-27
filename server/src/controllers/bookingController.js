import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import { isRoomAvailable } from '../services/availability.js';
import { sendBookingConfirmation } from '../services/email.js';

/**
 * Calculate number of nights between two dates.
 */
const calcNights = (checkIn, checkOut) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((checkOut - checkIn) / msPerDay);
};

/**
 * @desc    Create a booking
 * @route   POST /api/bookings
 * @access  Guest
 */
export const createBooking = async (req, res, next) => {
  try {
    const { roomId, checkInDate, checkOutDate, guests } = req.body;

    const room = await Room.findById(roomId).populate('category');
    if (!room) throw new ApiError(404, 'Room not found');
    if (room.status === 'maintenance') throw new ApiError(400, 'Room is under maintenance');

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new ApiError(400, 'Invalid date format');
    }
    if (checkOut <= checkIn) {
      throw new ApiError(400, 'Check-out date must be after check-in date');
    }
    if (checkIn < new Date(new Date().toDateString())) {
      throw new ApiError(400, 'Check-in date cannot be in the past');
    }

    // Validate guest count against room capacity
    if (room.category && guests > room.category.capacity) {
      throw new ApiError(400, `Room capacity is ${room.category.capacity} guests`);
    }

    // Check availability (double-booking prevention — first check)
    const available = await isRoomAvailable(room._id, checkIn, checkOut);
    if (!available) {
      throw new ApiError(409, 'Room is not available for the selected dates');
    }

    // Server-side price calculation
    const nights = calcNights(checkIn, checkOut);
    if (nights < 1) throw new ApiError(400, 'Minimum 1 night required');
    const totalAmount = nights * room.pricePerNight;

    const booking = await Booking.create({
      guest: req.user._id,
      room: room._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests,
      totalAmount,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    const populated = await Booking.findById(booking._id)
      .populate('room', 'roomNumber pricePerNight')
      .populate('guest', 'name email');

    res.status(201).json({
      success: true,
      message: 'Booking created. Please proceed to payment.',
      booking: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's bookings
 * @route   GET /api/bookings/my
 * @access  Guest
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate({
        path: 'room',
        select: 'roomNumber pricePerNight images status',
        populate: { path: 'category', select: 'name' },
      })
      .sort('-createdAt');

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings (admin/staff)
 * @route   GET /api/bookings
 * @access  Admin, Staff
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.guest) filter.guest = req.query.guest;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('guest', 'name email phone')
        .populate({
          path: 'room',
          select: 'roomNumber pricePerNight',
          populate: { path: 'category', select: 'name' },
        })
        .skip(skip)
        .limit(limit)
        .sort('-createdAt'),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      bookings,
      pagination: { page, pages: Math.ceil(total / limit), total },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Owner / Admin / Staff
 */
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guest', 'name email phone')
      .populate({
        path: 'room',
        populate: { path: 'category' },
      });

    if (!booking) throw new ApiError(404, 'Booking not found');

    // Guests can only view their own bookings
    if (req.user.role === 'guest' && booking.guest._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Access denied');
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request cancellation
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Guest (own booking)
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, 'Booking not found');

    if (booking.guest.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only cancel your own bookings');
    }

    const cancellable = ['pending', 'confirmed'];
    if (!cancellable.includes(booking.status)) {
      throw new ApiError(400, `Cannot cancel a booking with status '${booking.status}'`);
    }

    booking.status = booking.status === 'pending' ? 'cancelled' : 'cancel-requested';
    booking.cancellationReason = req.body.reason || '';
    await booking.save();

    await Notification.create({
      user: req.user._id,
      message: `Your booking ${booking._id} cancellation ${booking.status === 'cancelled' ? 'processed' : 'requested'}.`,
      type: 'cancellation',
    });

    res.json({ success: true, message: `Booking ${booking.status}`, booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a cancellation or directly cancel (admin/staff)
 * @route   PATCH /api/bookings/:id/approve
 * @access  Admin, Staff
 */
export const approveBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, 'Booking not found');

    const { action } = req.body; // 'confirm' | 'cancel' | 'refund'

    if (action === 'confirm' && booking.status === 'pending') {
      booking.status = 'confirmed';
    } else if (action === 'cancel' && ['cancel-requested', 'pending', 'confirmed'].includes(booking.status)) {
      booking.status = 'cancelled';
    } else if (action === 'refund' && ['cancelled'].includes(booking.status)) {
      booking.status = 'refunded';
      booking.paymentStatus = 'refunded';
    } else {
      throw new ApiError(400, `Invalid action '${action}' for status '${booking.status}'`);
    }

    await booking.save();

    await Notification.create({
      user: booking.guest,
      message: `Your booking ${booking._id} has been ${booking.status}.`,
      type: booking.status === 'refunded' ? 'payment' : 'booking',
    });

    res.json({ success: true, message: `Booking ${booking.status}`, booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check in a guest
 * @route   PATCH /api/bookings/:id/check-in
 * @access  Staff, Admin
 */
export const checkIn = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) throw new ApiError(404, 'Booking not found');

    if (booking.status !== 'confirmed') {
      throw new ApiError(400, `Cannot check in: booking status is '${booking.status}'`);
    }

    booking.status = 'checked-in';
    booking.checkedInAt = new Date();
    await booking.save();

    // Update room status to occupied
    await Room.findByIdAndUpdate(booking.room._id, { status: 'occupied' });

    await Notification.create({
      user: booking.guest,
      message: `You have been checked in. Welcome!`,
      type: 'check-in',
    });

    res.json({ success: true, message: 'Guest checked in', booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check out a guest
 * @route   PATCH /api/bookings/:id/check-out
 * @access  Staff, Admin
 */
export const checkOut = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) throw new ApiError(404, 'Booking not found');

    if (booking.status !== 'checked-in') {
      throw new ApiError(400, `Cannot check out: booking status is '${booking.status}'`);
    }

    booking.status = 'checked-out';
    booking.checkedOutAt = new Date();
    await booking.save();

    // Set room to cleaning
    await Room.findByIdAndUpdate(booking.room._id, { status: 'cleaning' });

    await Notification.create({
      user: booking.guest,
      message: `You have been checked out. Thank you for staying with us!`,
      type: 'check-out',
    });

    res.json({ success: true, message: 'Guest checked out', booking });
  } catch (error) {
    next(error);
  }
};
