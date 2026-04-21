import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: { type: Number, required: true, min: 1 },
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Null or empty means all products
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  minPurchaseAmount: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);
