import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel reference is required'],
    },
    department: {
      type: String,
      enum: ['reception', 'housekeeping', 'manager'],
      required: [true, 'Department is required'],
    },
    shift: {
      type: String,
      enum: ['morning', 'afternoon', 'night'],
      default: 'morning',
    },
  },
  { timestamps: true }
);

staffSchema.index({ user: 1, hotel: 1 });

const Staff = mongoose.model('Staff', staffSchema);
export default Staff;
