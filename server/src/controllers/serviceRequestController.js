import ServiceRequest from '../models/ServiceRequest.js';
import Booking from '../models/Booking.js';
import ApiError from '../utils/ApiError.js';

/**
 * @desc    Create a service request
 * @route   POST /api/service-requests
 * @access  Guest
 */
export const createServiceRequest = async (req, res, next) => {
  try {
    const { bookingId, type, description } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, 'Booking not found');

    if (booking.guest.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Access denied');
    }

    if (booking.status !== 'checked-in') {
      throw new ApiError(400, 'Service requests can only be made during an active stay');
    }

    const serviceRequest = await ServiceRequest.create({
      booking: bookingId,
      guest: req.user._id,
      type,
      description: description || '',
    });

    res.status(201).json({ success: true, message: 'Service request created', serviceRequest });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get service requests (staff/admin: all; guest: own)
 * @route   GET /api/service-requests
 * @access  Private
 */
export const getServiceRequests = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'guest') {
      filter.guest = req.user._id;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    const serviceRequests = await ServiceRequest.find(filter)
      .populate('guest', 'name email')
      .populate('assignedTo', 'name')
      .populate({
        path: 'booking',
        select: 'checkInDate checkOutDate',
        populate: { path: 'room', select: 'roomNumber' },
      })
      .sort('-createdAt');

    res.json({ success: true, serviceRequests });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update service request status (staff/admin)
 * @route   PATCH /api/service-requests/:id
 * @access  Staff, Admin
 */
export const updateServiceRequest = async (req, res, next) => {
  try {
    const { status, assignedTo } = req.body;

    const sr = await ServiceRequest.findById(req.params.id);
    if (!sr) throw new ApiError(404, 'Service request not found');

    if (status) {
      const allowed = ['pending', 'in-progress', 'completed'];
      if (!allowed.includes(status)) {
        throw new ApiError(400, `Status must be one of: ${allowed.join(', ')}`);
      }
      sr.status = status;
    }
    if (assignedTo) sr.assignedTo = assignedTo;

    await sr.save();

    res.json({ success: true, message: 'Service request updated', serviceRequest: sr });
  } catch (error) {
    next(error);
  }
};
