import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  variant: {
    ml: String
  }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Returned', 'Cancelled'], 
    default: 'Pending' 
  },
  paymentMethod: { type: String, required: true },
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
