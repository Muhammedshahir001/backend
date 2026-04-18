import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import sendEmail from '../utils/sendEmail.js';
import Razorpay from 'razorpay';
dotenv.config();

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const createRazorpayOrder = async (req, res) => {
  const razorpayInstance = getRazorpayInstance();
  if (!razorpayInstance) return res.status(500).json({ message: 'Razorpay not configured on server' });

  const { amount } = req.body;
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: 'Invalid amount received', amount });
  }

  try {
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };
    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Razorpay Error', error: error.message });
  }
};

export const placeOrder = async (req, res) => {
  try {
    const { products, totalAmount, paymentMethod, paymentDetails, shippingAddress } = req.body;

    if (products && products.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (paymentMethod === 'razorpay' && paymentDetails) {
      const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(paymentDetails.razorpayOrderId + "|" + paymentDetails.razorpayPaymentId)
        .digest('hex');

      if (generatedSignature !== paymentDetails.razorpaySignature) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }
    }

    const order = new Order({
      user: req.user._id,
      products,
      totalAmount,
      paymentMethod,
      paymentDetails,
      shippingAddress
    });

    const createdOrder = await order.save();

    // Clear user's cart after successful order
    try {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    } catch (cartError) {
      console.error('Failed to clear cart after order:', cartError);
    }

    // Send Confirmation Email
    try {
      const productList = products.map(p => `<li>${p.name} (x${p.quantity}) - ₹${p.price}</li>`).join('');
      const emailHtml = `
        <h1>Order Confirmation</h1>
        <p>Thank you for your order, ${req.user.name}!</p>
        <p>Order ID: ${createdOrder._id}</p>
        <p>Total Amount: ₹${totalAmount}</p>
        <h3>Ordered Products:</h3>
        <ul>${productList}</ul>
        <p>Delivery Status: ${createdOrder.status}</p>
        <p>Shipping Address: ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.zipCode}</p>
      `;

      await sendEmail({
        email: req.user.email,
        subject: `Heedy - Order Confirmation #${createdOrder._id.toString().substring(0, 8)}`,
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Order validation failed', details: error.errors });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email phone');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'id name email phone');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      const oldStatus = order.status;
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();

      // Send status update email
      if (oldStatus !== updatedOrder.status) {
        try {
          const productList = updatedOrder.products.map(p => `<li>${p.name} (x${p.quantity}) - ₹${p.price}</li>`).join('');
          const emailHtml = `
            <h1>Order Status Update</h1>
            <p>Hello ${order.user.name},</p>
            <p>Your order #${order._id.toString().substring(0, 8)} status has been updated to: <strong>${updatedOrder.status}</strong></p>
            <h3>Order Details:</h3>
            <ul>${productList}</ul>
            <p>Total Amount: ₹${updatedOrder.totalAmount}</p>
            <p>Thank you for shopping with Heedy!</p>
          `;

          await sendEmail({
            email: order.user.email,
            subject: `Heedy - Order #${order._id.toString().substring(0, 8)} Status Update: ${updatedOrder.status}`,
            html: emailHtml
          });
        } catch (emailError) {
          console.error('Status update email failed:', emailError);
        }
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
