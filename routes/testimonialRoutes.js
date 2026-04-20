import express from 'express';
import {
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getAllTestimonialsAdmin
} from '../controllers/testimonialController.js';

const router = express.Router();

router.get('/', getAllTestimonials);
router.get('/admin', getAllTestimonialsAdmin);
router.get('/:id', getTestimonialById);
router.post('/', createTestimonial);
router.put('/:id', updateTestimonial);
router.delete('/:id', deleteTestimonial);

export default router;