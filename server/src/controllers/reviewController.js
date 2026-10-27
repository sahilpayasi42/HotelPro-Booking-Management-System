import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import ApiError from '../utils/ApiError.js';

/**
 * @desc    Create a review for a booking
 * @route   POST /api/reviews
 * @access  Guest
 */
export const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, 'Booking not found');

    if (booking.guest.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only review your own bookings');
    }

    if (booking.status !== 'checked-out') {
      throw new ApiError(400, 'You can only review after checkout');
    }

    // Check if already reviewed
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) throw new ApiError(409, 'You have already reviewed this booking');

    const review = await Review.create({
      booking: bookingId,
      guest: req.user._id,
      room: booking.room,
      rating,
      comment: comment || '',
    });

    res.status(201).json({ success: true, message: 'Review submitted', review });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews for a room
 * @route   GET /api/rooms/:id/reviews
 * @access  Public
 */
export const getRoomReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ room: req.params.id })
      .populate('guest', 'name avatar')
      .sort('-createdAt');

    const avg =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    res.json({ success: true, reviews, averageRating: parseFloat(avg), total: reviews.length });
  } catch (error) {
    next(error);
  }
};
