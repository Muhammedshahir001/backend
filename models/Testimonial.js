import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters']
  },
  reviewMessage: {
    type: String,
    required: [true, 'Review message is required'],
    trim: true,
    maxlength: [1000, 'Review message cannot exceed 1000 characters']
  },
  rating: {
    type: Number,
    default: 5,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  profileImage: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: 'Verified Buyer',
    trim: true,
    maxlength: [50, 'Role cannot exceed 50 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

testimonialSchema.index({ isActive: 1 });
testimonialSchema.index({ createdAt: -1 });

testimonialSchema.set('toJSON', { virtuals: true });
testimonialSchema.set('toObject', { virtuals: true });

export default mongoose.model('Testimonial', testimonialSchema);