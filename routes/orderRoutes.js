import express from 'express';
import { createRazorpayOrder, placeOrder, getUserOrders, getAllOrders, getOrderById, updateOrderStatus } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';

const router = express.Router();

router.get('/debug/all', async (req, res) => {
  const orders = await Order.find({});
  res.json(orders);
});

import User from '../models/User.js';
router.get('/debug/users', async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

router.get('/config/razorpay', (req, res) => res.json({ keyId: process.env.RAZORPAY_KEY_ID }));
router.post('/razorpay', protect, createRazorpayOrder);
router.route('/').post(protect, placeOrder).get(protect, admin, getAllOrders);
router.route('/myorders').get(protect, getUserOrders);
router.route('/:id').get(protect, admin, getOrderById);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router;
