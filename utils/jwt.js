import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // Default 7 days

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

/**
 * Generate a custom backend JWT token
 * @param {Object} payload - User data to encode in JWT
 * @param {number} payload.userId - PostgreSQL user ID
 * @param {string} payload.appwriteId - Appwrite user ID
 * @param {string} payload.email - User email
 * @returns {string} - JWT token
 */
export const generateToken = (payload) => {
  try {
    const token = jwt.sign(
      {
        userId: payload.userId,
        appwriteId: payload.appwriteId,
        email: payload.email,
        iat: Math.floor(Date.now() / 1000), // Issued at
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'calorie-backend',
        audience: 'calorie-app',
      }
    );

    return token;
  } catch (error) {
    console.error('❌ Error generating JWT:', error.message);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded payload
 * @throws {Error} - If token is invalid or expired
 */
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'calorie-backend',
      audience: 'calorie-app',
    });

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      console.error('❌ Error verifying JWT:', error.message);
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Decode JWT without verification (for debugging only)
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded payload or null
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('❌ Error decoding JWT:', error.message);
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Token or null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  // Check for "Bearer <token>" format
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  // If it's just the token without "Bearer"
  return authHeader;
};

export default {
  generateToken,
  verifyToken,
  decodeToken,
  extractTokenFromHeader,
};
