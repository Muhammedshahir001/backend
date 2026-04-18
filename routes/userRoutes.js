import express from 'express';
import { addAddress, deleteAddress, updateAddress, getUserProfile, getUsers, toggleUserStatus } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getUsers);
router.put('/:id/status', protect, admin, toggleUserStatus);
router.get('/profile', protect, getUserProfile);
router.post('/address', protect, addAddress);
router.put('/address/:addressId', protect, updateAddress);
router.delete('/address/:addressId', protect, deleteAddress);

export default router;
