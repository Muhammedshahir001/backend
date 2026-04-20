import Testimonial from '../models/Testimonial.js';

export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const { clientName, reviewMessage, rating, profileImage, role } = req.body;

    if (!clientName || !reviewMessage) {
      return res.status(400).json({ message: 'Client name and review message are required' });
    }

    const testimonial = new Testimonial({
      clientName,
      reviewMessage,
      rating: rating || 5,
      profileImage: profileImage || '',
      role: role || 'Verified Buyer'
    });

    const savedTestimonial = await testimonial.save();
    res.status(201).json(savedTestimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const { clientName, reviewMessage, rating, profileImage, role, isActive } = req.body;

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    if (clientName !== undefined) testimonial.clientName = clientName;
    if (reviewMessage !== undefined) testimonial.reviewMessage = reviewMessage;
    if (rating !== undefined) testimonial.rating = rating;
    if (profileImage !== undefined) testimonial.profileImage = profileImage;
    if (role !== undefined) testimonial.role = role;
    if (isActive !== undefined) testimonial.isActive = isActive;

    const updatedTestimonial = await testimonial.save();
    res.json(updatedTestimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTestimonialsAdmin = async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};