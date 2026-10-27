import { Router } from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createReview } from '../controllers/reviewController.js';

const router = Router();

router.post(
  '/',
  auth,
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').optional().trim(),
  ],
  validate,
  createReview
);

export default router;
