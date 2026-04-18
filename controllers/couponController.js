import Coupon from '../models/Coupon.js';

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, categoryId, expiryDate } = req.body;
    const couponExists = await Coupon.findOne({ code });
    if (couponExists) return res.status(400).json({ message: 'Coupon code already exists' });

    const coupon = await Coupon.create({ 
      code, 
      discountType: discountType || 'percentage', 
      discountValue, 
      categoryId: categoryId || null, 
      expiryDate 
    });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, categoryId, expiryDate, isActive } = req.body;
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      coupon.code = code || coupon.code;
      coupon.discountType = discountType || coupon.discountType;
      coupon.discountValue = discountValue || coupon.discountValue;
      coupon.categoryId = categoryId !== undefined ? categoryId : coupon.categoryId;
      coupon.expiryDate = expiryDate || coupon.expiryDate;
      coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;
      const updatedCoupon = await coupon.save();
      res.json(updatedCoupon);
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      await coupon.deleteOne();
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code, isActive: true, expiryDate: { $gt: new Date() } });
    if (coupon) {
      res.json(coupon);
    } else {
      res.status(400).json({ message: 'Invalid or expired coupon code' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
