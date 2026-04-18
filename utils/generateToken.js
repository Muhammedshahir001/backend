import jwt from 'jsonwebtoken';

/**
 * Generates a JSON Web Token for the user.
 * Senior Dev Concept: Centralized token generation with longer expiration 
 * for better e-commerce UX (90 days).
 */
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'heedy_luxury_secret_production_key_2026', 
    { expiresIn: '90d' }
  );
};

export default generateToken;
