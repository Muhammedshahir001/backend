import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import generateToken from '../utils/generateToken.js';

const getTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Token generation moved to utils/generateToken.js

export const registerUser = async (req, res) => {
  const { name, email, password, phone, addresses } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      addresses: Array.isArray(addresses) ? addresses : [],
      otp,
      otpExpiry,
      authProvider: 'local'
    });

    if (user) {
      if(process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await getTransporter().sendMail({
          from: `"Heedy Luxury Cosmetics" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: 'Welcome to Heedy - Verification OTP',
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
              <h2 style="color: #000; text-align: center;">Welcome to Heedy</h2>
              <p>Thank you for choosing Heedy Luxury Cosmetics. To complete your registration, please use the following OTP code:</p>
              <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #000;">${otp}</h1>
              </div>
              <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #777; text-align: center;">&copy; 2026 Heedy Luxury Cosmetics. All rights reserved.</p>
            </div>
          `
        }).then(() => console.log(`OTP email sent successfully to ${user.email}`))
        .catch(err => {
          console.error('Mail sending failed detailed error:', err);
        });
      } else {
         console.log(`[Mock] OTP for ${user.email} is ${otp} (Email credentials missing)`);
      }
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        message: 'Verify OTP sent to email'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });
    if (user.otp !== otp || user.otpExpiry < Date.now()) return res.status(400).json({ message: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      if (!user.isVerified) return res.status(401).json({ message: 'Verify your email first' });
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password. If you used Google, please continue with Google.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const googleAuth = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({ message: 'Unable to fetch Google account email' });
    }

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      const tempPassword = await bcrypt.hash(`${payload.sub}${Date.now()}`, 10);
      user = await User.create({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        password: tempPassword,
        googleId: payload.sub,
        authProvider: 'google',
        isVerified: true,
        avatar: payload.picture
      });
    } else {
      let shouldSave = false;
      if (!user.googleId) {
        user.googleId = payload.sub;
        shouldSave = true;
      }
      if (user.authProvider !== 'google') {
        user.authProvider = 'google';
        shouldSave = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        shouldSave = true;
      }
      if (payload.picture && user.avatar !== payload.picture) {
        user.avatar = payload.picture;
        shouldSave = true;
      }
      if (shouldSave) {
        await user.save();
      }
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      addresses: user.addresses,
      token: generateToken(user._id)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Check if email/password matches environment variables (Direct Admin Access)
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      // Find or Create a persistent Admin user in DB if env match is found
      let adminUser = await User.findOne({ email, role: 'admin' });
      if (!adminUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        adminUser = await User.create({
          name: 'System Admin',
          email,
          password: hashedPassword,
          phone: '0000000000',
          role: 'admin',
          isVerified: true,
          authProvider: 'local'
        });
      }
      return res.json({
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        token: generateToken(adminUser._id)
      });
    }

    // 2. Check Database for Admin role (Scalable Admin Access)
    const user = await User.findOne({ email, role: 'admin' });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid Admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    if(process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await getTransporter().sendMail({
        from: `"Heedy Luxury Cosmetics" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Heedy - Your New OTP',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
              <h2 style="color: #000; text-align: center;">New Security Code</h2>
              <p>You requested a new verification code. Please use the following OTP to continue:</p>
              <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #000;">${otp}</h1>
              </div>
              <p>This code will expire in 10 minutes.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #777; text-align: center;">&copy; 2026 Heedy Luxury Cosmetics. All rights reserved.</p>
            </div>
          `
      }).then(() => console.log(`Resend OTP email sent successfully to ${user.email}`))
      .catch(err => console.log('Mail error:', err));
    } else {
       console.log(`[Mock] New OTP for ${user.email} is ${otp}`);
    }

    res.json({ message: 'New OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const addAddress = async (req, res) => {
  const { street, city, state, zipCode, country } = req.body;
  console.log('Adding address for user:', req.user?._id);
  console.log('Address data:', req.body);
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { addresses: { street, city, state, zipCode, country } } },
      { new: true }
    ).select('-password');

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        token: req.headers.authorization.split(' ')[1] 
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
