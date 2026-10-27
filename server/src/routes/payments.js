import { Router } from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import role from '../middleware/role.js';
import validate from '../middleware/validate.js';
import { createPaymentOrder, verifyPayment, getPayments } from '../controllers/paymentController.js';

const router = Router();

// Guest: create Razorpay order
router.post(
  '/order',
  auth,
  [body('bookingId').notEmpty().withMessage('Booking ID is required')],
  validate,
  createPaymentOrder
);

// Guest: verify payment
router.post(
  '/verify',
  auth,
  [
    body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
    body('razorpay_signature').notEmpty().withMessage('Signature is required'),
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
  ],
  validate,
  verifyPayment
);

// Admin: list all payments
router.get('/', auth, role('admin'), getPayments);

export default router;
