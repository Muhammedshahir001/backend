import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: 'i' } } : {};
    const category = req.query.category ? { category: req.query.category } : {};
    
    const products = await Product.find({ ...keyword, ...category }).populate('category', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, images, category, variants, rating, reviewsCount, offer, features } = req.body;
    const product = new Product({
      name, description, images, category, variants, rating, reviewsCount, offer, features
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, description, images, category, variants, rating, reviewsCount, offer, features } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.images = images || product.images;
      product.category = category || product.category;
      product.variants = variants || product.variants;
      product.rating = rating !== undefined ? rating : product.rating;
      product.reviewsCount = reviewsCount !== undefined ? reviewsCount : product.reviewsCount;
      product.offer = offer !== undefined ? offer : product.offer;
      product.features = features !== undefined ? features : product.features;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
