import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
}).then(async () => {
  console.log('Connected to DB');
  const orders = await Order.find({});
  console.log('All Orders:', JSON.stringify(orders, null, 2));
  process.exit();
}).catch(err => {
  console.error('DB Error:', err);
  process.exit(1);
});
