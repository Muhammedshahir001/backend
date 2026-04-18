import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function requiredPassword() { return this.authProvider !== 'google'; } },
  phone: { type: String, trim: true, required: function requiredPhone() { return this.authProvider !== 'google'; } },
  googleId: { type: String, unique: true, sparse: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  avatar: { type: String },
  otp: { type: String },
  otpExpiry: { type: Date },
  addresses: [{
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
