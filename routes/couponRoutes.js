import express from 'express';
import { getCoupons, getActiveCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/active', getActiveCoupons);

router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

router.post('/validate', protect, validateCoupon);

router.route('/:id')
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

export default router;
