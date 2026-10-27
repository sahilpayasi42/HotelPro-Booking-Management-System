import mongoose from 'mongoose';

const roomCategorySchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    amenities: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

roomCategorySchema.index({ hotel: 1, name: 1 });

const RoomCategory = mongoose.model('RoomCategory', roomCategorySchema);
export default RoomCategory;
