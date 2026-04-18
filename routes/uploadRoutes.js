import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/single', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: req.file.path });
});

router.post('/multiple', protect, admin, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
     return res.status(400).json({ message: 'No files uploaded' });
  }
  const urls = req.files.map(file => file.path);
  res.status(200).json({ urls });
});

export default router;
