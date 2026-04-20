import express from 'express';
import {
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getAllTestimonialsAdmin
} from '../controllers/testimonialController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllTestimonials);
router.get('/admin', protect, admin, getAllTestimonialsAdmin);
router.get('/:id', getTestimonialById);
router.post('/', protect, admin, createTestimonial);
router.put('/:id', protect, admin, updateTestimonial);
router.delete('/:id', protect, admin, deleteTestimonial);

export default router;