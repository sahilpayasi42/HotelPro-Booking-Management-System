import { Router } from 'express';
import { query, body, param } from 'express-validator';
import auth from '../middleware/auth.js';
import role from '../middleware/role.js';
import validate from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import {
  getRooms,
  getRoomById,
  getAvailableRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getLocations,
} from '../controllers/roomController.js';
import { getRoomReviews } from '../controllers/reviewController.js';

const router = Router();

// ─── Public ─────────────────────────────────────────────
router.get(
  '/available',
  [
    query('checkIn').notEmpty().withMessage('checkIn is required'),
    query('checkOut').notEmpty().withMessage('checkOut is required'),
  ],
  validate,
  getAvailableRooms
);

router.get('/categories', getCategories);
router.get('/locations', getLocations);
router.get('/', getRooms);
router.get('/:id', getRoomById);
router.get('/:id/reviews', getRoomReviews);

// ─── Admin: Categories ──────────────────────────────────
router.post(
  '/categories',
  auth,
  role('admin'),
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be >= 0'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be >= 1'),
    body('hotel').notEmpty().withMessage('Hotel ID is required'),
  ],
  validate,
  createCategory
);

router.put('/categories/:id', auth, role('admin'), updateCategory);
router.delete('/categories/:id', auth, role('admin'), deleteCategory);

// ─── Admin: Rooms CRUD ─────────────────────────────────
router.post(
  '/',
  auth,
  role('admin'),
  upload.array('images', 5),
  [
    body('category').notEmpty().withMessage('Category is required'),
    body('roomNumber').trim().notEmpty().withMessage('Room number is required'),
    body('floor').isInt({ min: 0 }).withMessage('Floor is required'),
  ],
  validate,
  createRoom
);

router.put('/:id', auth, role('admin'), upload.array('images', 5), updateRoom);
router.delete('/:id', auth, role('admin'), deleteRoom);

// ─── Staff/Admin: Room status ───────────────────────────
router.patch(
  '/:id/status',
  auth,
  role('staff', 'admin'),
  [body('status').notEmpty().withMessage('Status is required')],
  validate,
  updateRoomStatus
);

export default router;
