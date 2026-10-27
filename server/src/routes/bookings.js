import { Router } from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import role from '../middleware/role.js';
import validate from '../middleware/validate.js';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
  approveBooking,
  checkIn,
  checkOut,
} from '../controllers/bookingController.js';

const router = Router();

// Guest: create booking
router.post(
  '/',
  auth,
  [
    body('roomId').notEmpty().withMessage('Room ID is required'),
    body('checkInDate').notEmpty().withMessage('Check-in date is required'),
    body('checkOutDate').notEmpty().withMessage('Check-out date is required'),
    body('guests').isInt({ min: 1 }).withMessage('At least 1 guest is required'),
  ],
  validate,
  createBooking
);

// Guest: my bookings
router.get('/my', auth, getMyBookings);

// Admin/Staff: all bookings
router.get('/', auth, role('admin', 'staff'), getAllBookings);

// Any authenticated: get by ID (ownership enforced in controller)
router.get('/:id', auth, getBookingById);

// Guest: cancel own booking
router.patch('/:id/cancel', auth, cancelBooking);

// Admin/Staff: approve/cancel/refund
router.patch('/:id/approve', auth, role('admin', 'staff'), approveBooking);

// Staff/Admin: check-in
router.patch('/:id/check-in', auth, role('staff', 'admin'), checkIn);

// Staff/Admin: check-out
router.patch('/:id/check-out', auth, role('staff', 'admin'), checkOut);

export default router;
