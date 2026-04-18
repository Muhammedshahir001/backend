import express from 'express';
import { registerUser, verifyOTP, loginUser, googleAuth, resendOTP, addAddress, loginAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);
router.post('/admin-login', loginAdmin);
router.post('/google', googleAuth);
router.post('/resend-otp', resendOTP);
router.post('/address', protect, addAddress);

export default router;
