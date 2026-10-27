import { Router } from 'express';
import { body } from 'express-validator';
import User from '../models/User.js';
import Staff from '../models/Staff.js';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Payment from '../models/Payment.js';
import Hotel from '../models/Hotel.js';
import auth from '../middleware/auth.js';
import role from '../middleware/role.js';
import validate from '../middleware/validate.js';

const router = Router();

// ─── Hotels ─────────────────────────────────────────────

/**
 * @desc    Get all hotels (admin)
 * @route   GET /api/admin/hotels
 */
router.get('/hotels', auth, role('admin'), async (req, res, next) => {
  try {
    const hotels = await Hotel.find().select('name city address').sort('name');
    res.json({ success: true, hotels });
  } catch (error) {
    next(error);
  }
});

// ─── Users ──────────────────────────────────────────────

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/admin/users
 */
router.get('/users', auth, role('admin'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort('-createdAt'),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, users, pagination: { page, pages: Math.ceil(total / limit), total } });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Toggle user active status
 * @route   PATCH /api/admin/users/:id/toggle
 */
router.patch('/users/:id/toggle', auth, role('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    next(error);
  }
});

// ─── Staff CRUD ─────────────────────────────────────────

/**
 * @desc    Get all staff
 * @route   GET /api/admin/staff
 */
router.get('/staff', auth, role('admin'), async (req, res, next) => {
  try {
    const staffList = await Staff.find()
      .populate('user', 'name email phone isActive')
      .populate('hotel', 'name');
    res.json({ success: true, staff: staffList });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Create staff member (creates User + Staff record)
 * @route   POST /api/admin/staff
 */
router.post(
  '/staff',
  auth,
  role('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ characters'),
    body('department').isIn(['reception', 'housekeeping', 'manager']).withMessage('Invalid department'),
    body('hotel').notEmpty().withMessage('Hotel ID is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, phone, department, shift, hotel } = req.body;

      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ success: false, message: 'Email already in use' });

      const user = await User.create({
        name,
        email,
        passwordHash: password,
        phone: phone || '',
        role: 'staff',
      });

      const staff = await Staff.create({
        user: user._id,
        hotel,
        department,
        shift: shift || 'morning',
      });

      const populated = await Staff.findById(staff._id)
        .populate('user', 'name email phone')
        .populate('hotel', 'name');

      res.status(201).json({ success: true, message: 'Staff member created', staff: populated });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @desc    Update staff
 * @route   PUT /api/admin/staff/:id
 */
router.put('/staff/:id', auth, role('admin'), async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });

    if (req.body.department) staff.department = req.body.department;
    if (req.body.shift) staff.shift = req.body.shift;
    await staff.save();

    const populated = await Staff.findById(staff._id)
      .populate('user', 'name email phone')
      .populate('hotel', 'name');

    res.json({ success: true, message: 'Staff updated', staff: populated });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Delete staff
 * @route   DELETE /api/admin/staff/:id
 */
router.delete('/staff/:id', auth, role('admin'), async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });

    // Deactivate the user account too
    await User.findByIdAndUpdate(staff.user, { isActive: false, role: 'guest' });
    await staff.deleteOne();

    res.json({ success: true, message: 'Staff removed' });
  } catch (error) {
    next(error);
  }
});

// ─── Stats & Reports ────────────────────────────────────

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 */
router.get('/stats', auth, role('admin'), async (req, res, next) => {
  try {
    const [totalUsers, totalRooms, totalBookings, revenueAgg, occupiedRooms] = await Promise.all([
      User.countDocuments(),
      Room.countDocuments(),
      Booking.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'captured' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
      Room.countDocuments({ status: 'occupied' }),
    ]);

    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalRooms,
        totalBookings,
        totalRevenue: revenueAgg[0]?.totalRevenue || 0,
        occupiedRooms,
        occupancyRate: parseFloat(occupancyRate),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Get reports (booking/revenue by month)
 * @route   GET /api/admin/reports
 */
router.get('/reports', auth, role('admin'), async (req, res, next) => {
  try {
    // Bookings by month (last 12 months)
    const bookingsByMonth = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Revenue by category
    const revenueByCategory = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $lookup: { from: 'rooms', localField: 'room', foreignField: '_id', as: 'roomData' } },
      { $unwind: '$roomData' },
      { $lookup: { from: 'roomcategories', localField: 'roomData.category', foreignField: '_id', as: 'catData' } },
      { $unwind: '$catData' },
      {
        $group: {
          _id: '$catData.name',
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
        },
      },
    ]);

    // Booking status distribution
    const statusDistribution = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      reports: {
        bookingsByMonth: bookingsByMonth.map((b) => ({
          month: `${b._id.year}-${String(b._id.month).padStart(2, '0')}`,
          count: b.count,
          revenue: b.revenue,
        })),
        revenueByCategory,
        statusDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
