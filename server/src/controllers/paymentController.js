import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import { createOrder, verifySignature } from '../services/payment.js';
import { isRoomAvailable } from '../services/availability.js';
import { sendBookingConfirmation } from '../services/email.js';

/**
 * @desc    Create Razorpay order for a booking
 * @route   POST /api/payments/order
 * @access  Guest
 */
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) throw new ApiError(404, 'Booking not found');

    if (booking.guest.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Access denied');
    }
    if (booking.status !== 'pending') {
      throw new ApiError(400, `Cannot pay for a booking with status '${booking.status}'`);
    }

    // Re-check availability before payment (double-booking prevention — second check)
    const available = await isRoomAvailable(booking.room._id, booking.checkInDate, booking.checkOutDate, booking._id);
    if (!available) {
      booking.status = 'cancelled';
      await booking.save();
      throw new ApiError(409, 'Room is no longer available for selected dates. Booking cancelled.');
    }

    const receipt = `booking_${booking._id}`;
    const order = await createOrder(booking.totalAmount, receipt);

    // Save the payment record in "created" state
    await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: booking.totalAmount,
      gateway: 'razorpay',
      gatewayOrderId: order.id,
      status: 'created',
      invoiceNumber: `INV-${Date.now()}`,
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      bookingId: booking._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payments/verify
 * @access  Guest
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new ApiError(400, 'Missing payment verification fields');
    }

    // Verify signature
    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      throw new ApiError(400, 'Payment verification failed: invalid signature');
    }

    // Find the payment record
    const payment = await Payment.findOne({ gatewayOrderId: razorpay_order_id });
    if (!payment) throw new ApiError(404, 'Payment record not found');

    // Prevent duplicate verification
    if (payment.status === 'captured') {
      return res.json({ success: true, message: 'Payment already verified' });
    }

    // Update payment
    payment.gatewayPaymentId = razorpay_payment_id;
    payment.status = 'captured';
    await payment.save();

    // Update booking status to confirmed
    const booking = await Booking.findById(payment.booking).populate('guest', 'name email');
    if (booking && booking.status === 'pending') {
      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';
      await booking.save();

      // Send email notification
      if (booking.guest) {
        await sendBookingConfirmation(booking.guest, booking);
      }

      // In-app notification
      await Notification.create({
        user: booking.guest._id,
        message: `Your booking ${booking._id} is confirmed! Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}`,
        type: 'booking',
      });
    }

    res.json({
      success: true,
      message: 'Payment verified. Booking confirmed!',
      payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all payments (admin)
 * @route   GET /api/payments
 * @access  Admin
 */
export const getPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('user', 'name email')
        .populate({
          path: 'booking',
          select: 'checkInDate checkOutDate status totalAmount',
          populate: { path: 'room', select: 'roomNumber' },
        })
        .skip(skip)
        .limit(limit)
        .sort('-createdAt'),
      Payment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      payments,
      pagination: { page, pages: Math.ceil(total / limit), total },
    });
  } catch (error) {
    next(error);
  }
};
