import express from 'express';
import { verifyAppwriteSession } from '../config/appwrite.js';
import { generateToken } from '../utils/jwt.js';
import { authenticateToken } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

/**
 * POST /auth/verify
 * Verify Appwrite JWT and create/update user in PostgreSQL
 * Returns custom backend JWT for future API calls
 * 
 * Request Body:
 * {
 *   "appwriteJwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "token": "backend-jwt-token",
 *   "user": { ... }
 * }
 */
router.post('/verify', async (req, res) => {
  try {
    const { appwriteJwt } = req.body;

    // Validate request
    if (!appwriteJwt) {
      return res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'appwriteJwt is required',
      });
    }

    // Verify Appwrite session
    console.log('🔐 Verifying Appwrite session...');
    const appwriteUser = await verifyAppwriteSession(appwriteJwt);
    console.log('✅ Appwrite session verified for user:', appwriteUser.email);

    // Check if user exists in PostgreSQL
    let userResult = await pool.query(
      'SELECT id, appwrite_id, email, name, created_at FROM users WHERE appwrite_id = $1',
      [appwriteUser.appwriteId]
    );

    let user;

    if (userResult.rows.length === 0) {
      // Create new user in PostgreSQL
      console.log('📝 Creating new user in PostgreSQL...');
      const insertResult = await pool.query(
        `INSERT INTO users (appwrite_id, email, name) 
         VALUES ($1, $2, $3) 
         RETURNING id, appwrite_id, email, name, created_at`,
        [appwriteUser.appwriteId, appwriteUser.email, appwriteUser.name]
      );
      user = insertResult.rows[0];
      console.log('✅ New user created with ID:', user.id);
    } else {
      // Update existing user (in case name or email changed in Appwrite)
      console.log('🔄 Updating existing user in PostgreSQL...');
      const updateResult = await pool.query(
        `UPDATE users 
         SET email = $1, name = $2, updated_at = now()
         WHERE appwrite_id = $3
         RETURNING id, appwrite_id, email, name, created_at`,
        [appwriteUser.email, appwriteUser.name, appwriteUser.appwriteId]
      );
      user = updateResult.rows[0];
      console.log('✅ User updated with ID:', user.id);
    }

    // Generate custom backend JWT
    const backendToken = generateToken({
      userId: user.id,
      appwriteId: user.appwrite_id,
      email: user.email,
    });

    // Return success response
    res.json({
      success: true,
      message: 'Authentication successful',
      token: backendToken,
      user: {
        id: user.id,
        appwriteId: user.appwrite_id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('❌ Auth verification error:', error.message);

    if (error.message === 'Invalid or expired Appwrite session') {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid or expired Appwrite session',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to verify authentication',
    });
  }
});

/**
 * GET /auth/me
 * Get authenticated user data
 * Requires valid backend JWT in Authorization header
 * 
 * Headers:
 * Authorization: Bearer <backend-jwt-token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "user": { ... }
 * }
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // req.user is populated by authenticateToken middleware
    const { userId } = req.user;

    // Fetch complete user data from database
    const result = await pool.query(
      'SELECT id, appwrite_id, email, name, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User does not exist',
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        appwriteId: user.appwrite_id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching user data:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to fetch user data',
    });
  }
});

/**
 * POST /auth/refresh
 * Refresh backend JWT token
 * Requires valid backend JWT in Authorization header
 * 
 * Response:
 * {
 *   "success": true,
 *   "token": "new-backend-jwt-token"
 * }
 */
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const { userId, appwriteId, email } = req.user;

    // Generate new token
    const newToken = generateToken({
      userId,
      appwriteId,
      email,
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
    });
  } catch (error) {
    console.error('❌ Token refresh error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to refresh token',
    });
  }
});

/**
 * DELETE /auth/logout
 * Logout user (optional - mainly for future rate limiting or session tracking)
 * Requires valid backend JWT
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Logged out successfully"
 * }
 */
router.delete('/logout', authenticateToken, async (req, res) => {
  try {
    // For now, just return success
    // In the future, you could implement token blacklisting or session tracking
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('❌ Logout error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to logout',
    });
  }
});

export default router;
