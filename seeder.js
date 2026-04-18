import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';

dotenv.config();

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeder');
    
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();

    const createdUsers = await User.insertMany([
      { name: 'Admin User', email: 'admin@lumiere.com', password: await bcrypt.hash('123456', 10), role: 'admin' },
      { name: 'John Customer', email: 'john@example.com', password: await bcrypt.hash('123456', 10), role: 'user' }
    ]);

    const createdCategories = await Category.insertMany([
      { name: 'Skincare', description: 'Premium skincare' },
      { name: 'Face', description: 'Luxury foundations and creams' },
      { name: 'Body', description: 'Radiant body lotions' }
    ]);

    const products = [
      {
        name: 'Luminous Sunscreen SPF 50',
        price: 45.00,
        description: 'Our award-winning luxury sunscreen providing ultimate hydration and protection against UVA/UVB.',
        images: ['/hero/slide1.png'],
        category: createdCategories[0]._id,
        stock: 50,
        variants: [{ color: 'Universal Glow' }, { color: 'Tinted Radiance' }, { color: 'Matte Finish' }]
      },
      {
        name: 'Oceanic Purity Mineral Defense',
        price: 65.00,
        description: 'Mineral-based barrier cream infused with ultra-hydrating sea-kelp extracts. Perfect for sensitive skin.',
        images: ['/hero/slide2.png'],
        category: createdCategories[0]._id,
        stock: 20,
        variants: [{ color: 'Standard' }]
      },
      {
        name: 'Dynamic Hydration Spray',
        price: 35.00,
        description: 'Instant invisible water-weight sunscreen spray. Effortless application that melts into your natural tone.',
        images: ['/hero/slide3.png'],
        category: createdCategories[1]._id,
        stock: 100,
        variants: [{ color: 'Standard' }]
      }
    ];

    await Product.insertMany(products);
    console.log('Dummy Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
