import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import pool from '../config/database.js';

/**
 * Middleware to authenticate requests using custom backend JWT
 * Verifies JWT token and attaches user data to req.user
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No token provided',
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Fetch user from database to ensure they still exist
    const result = await pool.query(
      'SELECT id, appwrite_id, email, name, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'User not found',
      });
    }

    // Attach user data to request
    req.user = {
      userId: result.rows[0].id,
      appwriteId: result.rows[0].appwrite_id,
      email: result.rows[0].email,
      name: result.rows[0].name,
      createdAt: result.rows[0].created_at,
    };

    next();
  } catch (error) {
    console.error('❌ Authentication error:', error.message);

    if (error.message === 'Token has expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Your session has expired. Please login again.',
      });
    }

    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Authentication token is invalid.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'Failed to authenticate request',
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user data if token is valid, but doesn't block request if token is missing
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      
      const result = await pool.query(
        'SELECT id, appwrite_id, email, name, created_at FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length > 0) {
        req.user = {
          userId: result.rows[0].id,
          appwriteId: result.rows[0].appwrite_id,
          email: result.rows[0].email,
          name: result.rows[0].name,
          createdAt: result.rows[0].created_at,
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we just continue without user data
    next();
  }
};

export default {
  authenticateToken,
  optionalAuth,
};
