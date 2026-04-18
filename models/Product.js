import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  offer: { type: String },
  features: { type: String },
  variants: [{
    ml: { type: String, required: true }, // e.g., "100ml", "200ml"
    actualPrice: { type: Number, required: true },
    offerPrice: { type: Number },
    stock: { type: Number, required: true, default: 0 }
  }]
}, { timestamps: true });

// Virtual to get a base price from the first variant if needed
productSchema.virtual('price').get(function() {
  if (this.variants && this.variants.length > 0) {
    return this.variants[0].offerPrice || this.variants[0].actualPrice;
  }
  return 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);
