import Coupon from '../models/Coupon.js';

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true, expiryDate: { $gt: new Date() } }).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, productIds, usageLimit, minPurchaseAmount, expiryDate } = req.body;
    const couponExists = await Coupon.findOne({ code });
    if (couponExists) return res.status(400).json({ message: 'Coupon code already exists' });

    const coupon = await Coupon.create({ 
      code, 
      discountType: discountType || 'percentage', 
      discountValue, 
      productIds: productIds || [], 
      usageLimit: (usageLimit === "" || usageLimit === undefined) ? null : usageLimit,
      minPurchaseAmount: (minPurchaseAmount === "" || minPurchaseAmount === undefined) ? 0 : minPurchaseAmount,
      expiryDate 
    });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, productIds, usageLimit, minPurchaseAmount, expiryDate, isActive } = req.body;
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      coupon.code = code || coupon.code;
      coupon.discountType = discountType || coupon.discountType;
      coupon.discountValue = discountValue || coupon.discountValue;
      coupon.productIds = productIds !== undefined ? productIds : coupon.productIds;
      coupon.usageLimit = (usageLimit === "" || usageLimit === undefined) ? null : usageLimit;
      coupon.minPurchaseAmount = (minPurchaseAmount === "" || minPurchaseAmount === undefined) ? 0 : minPurchaseAmount;
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
    const { code, cartItems } = req.body;
    const coupon = await Coupon.findOne({ code, isActive: true, expiryDate: { $gt: new Date() } });
    
    if (!coupon) {
      return res.status(400).json({ message: 'Invalid or expired coupon code' });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // If productIds is empty, it applies to all products
    const isGlobal = coupon.productIds.length === 0;
    
    let eligibleItems = [];
    let eligibleTotal = 0;

    if (isGlobal) {
      eligibleItems = cartItems.map(item => item.product || item._id);
      eligibleTotal = cartItems.reduce((sum, item) => sum + (item.offerPrice || item.price) * item.quantity, 0);
    } else {
      cartItems.forEach(item => {
        const productId = item.product?._id || item.product || item._id;
        if (coupon.productIds.includes(productId)) {
          eligibleItems.push(productId);
          eligibleTotal += (item.offerPrice || item.price) * item.quantity;
        }
      });
    }

    if (eligibleItems.length === 0) {
      return res.status(400).json({ message: 'Coupon not applicable to any items in your cart' });
    }

    if (eligibleTotal < coupon.minPurchaseAmount) {
      return res.status(400).json({ 
        message: `Minimum purchase amount for this coupon is ₹${coupon.minPurchaseAmount}. Current eligible total: ₹${eligibleTotal}` 
      });
    }

    res.json({
      coupon,
      eligibleItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
