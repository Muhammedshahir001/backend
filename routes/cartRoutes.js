import express from 'express';
import { getCart, addToCart, removeFromCart, updateCartQuantity, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCart)
  .post(protect, addToCart)
  .put(protect, updateCartQuantity)
  .delete(protect, clearCart);

router.route('/:itemId')
  .delete(protect, removeFromCart);

export default router;
