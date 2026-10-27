import Room from '../models/Room.js';
import RoomCategory from '../models/RoomCategory.js';
import Hotel from '../models/Hotel.js'; // ensure model is registered for populate
import ApiError from '../utils/ApiError.js';
import { findAvailableRooms } from '../services/availability.js';

/**
 * @desc    Get all rooms (with filters & pagination)
 * @route   GET /api/rooms
 * @access  Public
 */
export const getRooms = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.floor) filter.floor = parseInt(req.query.floor);
    if (req.query.minPrice || req.query.maxPrice) {
      filter.pricePerNight = {};
      if (req.query.minPrice) filter.pricePerNight.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.pricePerNight.$lte = parseFloat(req.query.maxPrice);
    }
    if (req.query.search) {
      filter.roomNumber = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.city) {
      const matchingHotels = await Hotel.find({
        city: { $regex: req.query.city.trim(), $options: 'i' },
      }).select('_id');
      const hotelIds = matchingHotels.map((h) => h._id);
      filter.hotel = { $in: hotelIds };
    }

    let sortOption = 'roomNumber';
    if (req.query.sort === 'price_asc') sortOption = 'pricePerNight';
    else if (req.query.sort === 'price_desc') sortOption = '-pricePerNight';
    else if (req.query.sort) sortOption = req.query.sort;

    const [rooms, total] = await Promise.all([
      Room.find(filter)
        .populate('category', 'name basePrice capacity amenities')
        .populate('hotel', 'name city address')
        .skip(skip)
        .limit(limit)
        .sort(sortOption),
      Room.countDocuments(filter),
    ]);

    res.json({
      success: true,
      rooms,
      pagination: { page, pages: Math.ceil(total / limit), total },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single room by ID
 * @route   GET /api/rooms/:id
 * @access  Public
 */
export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('category')
      .populate('hotel', 'name city address amenities');

    if (!room) {
      throw new ApiError(404, 'Room not found');
    }

    res.json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get available rooms for date range
 * @route   GET /api/rooms/available
 * @access  Public
 */
export const getAvailableRooms = async (req, res, next) => {
  try {
    const { checkIn, checkOut, guests, category, city } = req.query;

    if (!checkIn || !checkOut) {
      throw new ApiError(400, 'checkIn and checkOut dates are required');
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new ApiError(400, 'Invalid date format');
    }
    if (checkOutDate <= checkInDate) {
      throw new ApiError(400, 'Check-out must be after check-in');
    }

    const guestsCount = guests ? parseInt(guests) : null;
    const rooms = await findAvailableRooms(
      checkInDate,
      checkOutDate,
      guestsCount,
      category || null,
      null,
      city || null
    );

    res.json({ success: true, rooms, total: rooms.length });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a room (admin)
 * @route   POST /api/rooms
 * @access  Admin
 */
export const createRoom = async (req, res, next) => {
  try {
    const { hotel, category, roomNumber, floor, pricePerNight, status } = req.body;

    // Verify category exists
    const cat = await RoomCategory.findById(category);
    if (!cat) throw new ApiError(404, 'Room category not found');

    // Check for duplicate room number in the same hotel
    const existing = await Room.findOne({ hotel: hotel || cat.hotel, roomNumber });
    if (existing) throw new ApiError(409, `Room ${roomNumber} already exists in this hotel`);

    const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    const room = await Room.create({
      hotel: hotel || cat.hotel,
      category,
      roomNumber,
      floor,
      pricePerNight: pricePerNight || cat.basePrice,
      status: status || 'available',
      images,
    });

    const populated = await Room.findById(room._id).populate('category').populate('hotel', 'name');
    res.status(201).json({ success: true, message: 'Room created', room: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a room (admin)
 * @route   PUT /api/rooms/:id
 * @access  Admin
 */
export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) throw new ApiError(404, 'Room not found');

    const { category, roomNumber, floor, pricePerNight, status } = req.body;

    if (roomNumber && roomNumber !== room.roomNumber) {
      const dup = await Room.findOne({ hotel: room.hotel, roomNumber });
      if (dup) throw new ApiError(409, `Room ${roomNumber} already exists`);
      room.roomNumber = roomNumber;
    }
    if (category) room.category = category;
    if (floor !== undefined) room.floor = floor;
    if (pricePerNight !== undefined) room.pricePerNight = pricePerNight;
    if (status) room.status = status;

    // Append new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/${f.filename}`);
      room.images = [...room.images, ...newImages];
    }

    await room.save();
    const populated = await Room.findById(room._id).populate('category').populate('hotel', 'name');
    res.json({ success: true, message: 'Room updated', room: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a room (admin)
 * @route   DELETE /api/rooms/:id
 * @access  Admin
 */
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) throw new ApiError(404, 'Room not found');

    await room.deleteOne();
    res.json({ success: true, message: 'Room deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update room status (staff/admin)
 * @route   PATCH /api/rooms/:id/status
 * @access  Staff, Admin
 */
export const updateRoomStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['available', 'occupied', 'cleaning', 'maintenance'];
    if (!status || !allowed.includes(status)) {
      throw new ApiError(400, `Status must be one of: ${allowed.join(', ')}`);
    }

    const room = await Room.findById(req.params.id);
    if (!room) throw new ApiError(404, 'Room not found');

    room.status = status;
    await room.save();

    res.json({ success: true, message: `Room status updated to ${status}`, room });
  } catch (error) {
    next(error);
  }
};

// ─── Room Categories ────────────────────────────────────

/**
 * @desc    Get all categories
 * @route   GET /api/rooms/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await RoomCategory.find().populate('hotel', 'name');
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create category (admin)
 * @route   POST /api/rooms/categories
 * @access  Admin
 */
export const createCategory = async (req, res, next) => {
  try {
    const category = await RoomCategory.create(req.body);
    res.status(201).json({ success: true, message: 'Category created', category });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category (admin)
 * @route   PUT /api/rooms/categories/:id
 * @access  Admin
 */
export const updateCategory = async (req, res, next) => {
  try {
    const category = await RoomCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) throw new ApiError(404, 'Category not found');
    res.json({ success: true, message: 'Category updated', category });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category (admin)
 * @route   DELETE /api/rooms/categories/:id
 * @access  Admin
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const roomsUsingCat = await Room.countDocuments({ category: req.params.id });
    if (roomsUsingCat > 0) {
      throw new ApiError(400, `Cannot delete: ${roomsUsingCat} room(s) use this category`);
    }
    const category = await RoomCategory.findByIdAndDelete(req.params.id);
    if (!category) throw new ApiError(404, 'Category not found');
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all distinct hotel locations/cities
 * @route   GET /api/rooms/locations
 * @access  Public
 */
export const getLocations = async (req, res, next) => {
  try {
    const cities = await Hotel.distinct('city');
    res.json({ success: true, cities: cities.filter(Boolean) });
  } catch (error) {
    next(error);
  }
};
