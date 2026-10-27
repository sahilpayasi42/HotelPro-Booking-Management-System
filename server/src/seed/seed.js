import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import RoomCategory from '../models/RoomCategory.js';
import Room from '../models/Room.js';
import Staff from '../models/Staff.js';
import env from '../config/env.js';

const seed = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Hotel.deleteMany({}),
      RoomCategory.deleteMany({}),
      Room.deleteMany({}),
      Staff.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // ─── Create Hotel ──────────────────────────────────────
    const hotel = await Hotel.create({
      name: 'HotelPro Grand',
      address: '123 Main Street',
      city: 'Mumbai',
      description: 'A premium luxury hotel in the heart of Mumbai.',
      amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Parking', 'Bar'],
      contact: {
        phone: '+91-22-12345678',
        email: 'info@hotelprogrand.com',
        website: 'https://hotelprogrand.com',
      },
    });
    console.log('Created hotel:', hotel.name);

    // ─── Create Users ──────────────────────────────────────
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hotelpro.com',
      passwordHash: 'admin123',
      phone: '+91-9000000001',
      role: 'admin',
    });

    const staffUser = await User.create({
      name: 'Reception Staff',
      email: 'staff@hotelpro.com',
      passwordHash: 'staff123',
      phone: '+91-9000000002',
      role: 'staff',
    });

    const guest = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'guest123',
      phone: '+91-9000000003',
      role: 'guest',
    });

    console.log('Created users (1 admin, 1 staff, 1 guest)');

    // ─── Create Staff record ───────────────────────────────
    await Staff.create({
      user: staffUser._id,
      hotel: hotel._id,
      department: 'reception',
      shift: 'morning',
    });
    console.log('Created staff record');

    // ─── Create Room Categories ────────────────────────────
    const standard = await RoomCategory.create({
      hotel: hotel._id,
      name: 'Standard',
      basePrice: 2500,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'AC', 'Attached Bathroom'],
    });

    const deluxe = await RoomCategory.create({
      hotel: hotel._id,
      name: 'Deluxe',
      basePrice: 4500,
      capacity: 3,
      amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'City View', 'Attached Bathroom'],
    });

    const suite = await RoomCategory.create({
      hotel: hotel._id,
      name: 'Suite',
      basePrice: 8000,
      capacity: 4,
      amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Sea View', 'Living Room', 'Jacuzzi', 'Attached Bathroom'],
    });

    const presidential = await RoomCategory.create({
      hotel: hotel._id,
      name: 'Presidential Suite',
      basePrice: 15000,
      capacity: 6,
      amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Panoramic View', 'Living Room', 'Dining Room', 'Jacuzzi', 'Private Terrace', 'Butler Service'],
    });

    console.log('Created 4 room categories');

    // ─── Create Rooms (~15 total) ──────────────────────────
    const rooms = [];

    // Standard rooms: 101-106 (6 rooms)
    for (let i = 1; i <= 6; i++) {
      rooms.push({
        hotel: hotel._id,
        category: standard._id,
        roomNumber: `10${i}`,
        floor: 1,
        status: 'available',
        pricePerNight: standard.basePrice,
      });
    }

    // Deluxe rooms: 201-205 (5 rooms)
    for (let i = 1; i <= 5; i++) {
      rooms.push({
        hotel: hotel._id,
        category: deluxe._id,
        roomNumber: `20${i}`,
        floor: 2,
        status: 'available',
        pricePerNight: deluxe.basePrice,
      });
    }

    // Suites: 301-303 (3 rooms)
    for (let i = 1; i <= 3; i++) {
      rooms.push({
        hotel: hotel._id,
        category: suite._id,
        roomNumber: `30${i}`,
        floor: 3,
        status: 'available',
        pricePerNight: suite.basePrice,
      });
    }

    // Presidential: 401 (1 room)
    rooms.push({
      hotel: hotel._id,
      category: presidential._id,
      roomNumber: '401',
      floor: 4,
      status: 'available',
      pricePerNight: presidential.basePrice,
    });

    await Room.insertMany(rooms);
    console.log(`Created ${rooms.length} rooms`);

    // ─── Summary ───────────────────────────────────────────
    console.log('\n✅ Seed complete!');
    console.log('─────────────────────────────────');
    console.log('Login credentials (dev only):');
    console.log('  Admin:  admin@hotelpro.com  / admin123');
    console.log('  Staff:  staff@hotelpro.com  / staff123');
    console.log('  Guest:  john@example.com    / guest123');
    console.log('─────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
