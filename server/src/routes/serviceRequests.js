import { Router } from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import role from '../middleware/role.js';
import validate from '../middleware/validate.js';
import {
  createServiceRequest,
  getServiceRequests,
  updateServiceRequest,
} from '../controllers/serviceRequestController.js';

const router = Router();

// Guest: create
router.post(
  '/',
  auth,
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('type').isIn(['housekeeping', 'food', 'other']).withMessage('Type must be housekeeping, food, or other'),
  ],
  validate,
  createServiceRequest
);

// All authenticated: list (filtered by role in controller)
router.get('/', auth, getServiceRequests);

// Staff/Admin: update status
router.patch('/:id', auth, role('staff', 'admin'), updateServiceRequest);

export default router;
