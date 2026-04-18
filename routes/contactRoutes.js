import express from 'express';
import { submitContact, getContacts, getContactById } from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(submitContact).get(protect, admin, getContacts);
router.route('/:id').get(protect, admin, getContactById);

export default router;
