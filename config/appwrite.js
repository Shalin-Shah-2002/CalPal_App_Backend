import { Client, Users, Account } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Appwrite Admin Client (Server-Side Only)
 * Uses API key for server-to-server authentication
 * NEVER expose this to the frontend!
 */
export const createAdminClient = () => {
  const client = new Client();
  
  client
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); // Server API Key - NEVER share with frontend

  return {
    client,
    users: new Users(client),
  };
};

/**
 * Create session client to verify JWT from frontend
 * This uses the JWT provided by the user to verify their session
 */
export const createSessionClient = (jwtToken) => {
  const client = new Client();
  
  client
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setJWT(jwtToken); // Use the JWT from frontend

  return {
    client,
    account: new Account(client),
  };
};

/**
 * Verify Appwrite user session using JWT
 * @param {string} jwtToken - JWT token from Appwrite frontend SDK
 * @returns {Promise<Object>} - User data if valid, throws error otherwise
 */
export const verifyAppwriteSession = async (jwtToken) => {
  try {
    const { account } = createSessionClient(jwtToken);
    
    // Get current user account - this will fail if JWT is invalid
    const user = await account.get();
    
    return {
      appwriteId: user.$id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerification,
      createdAt: user.$createdAt,
    };
  } catch (error) {
    console.error('❌ Appwrite session verification failed:', error.message);
    throw new Error('Invalid or expired Appwrite session');
  }
};

/**
 * Get user by Appwrite ID using Admin API (for additional verification)
 * @param {string} appwriteId - Appwrite user ID
 * @returns {Promise<Object>} - User data
 */
export const getAppwriteUserById = async (appwriteId) => {
  try {
    const { users } = createAdminClient();
    const user = await users.get(appwriteId);
    
    return {
      appwriteId: user.$id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerification,
      createdAt: user.$createdAt,
    };
  } catch (error) {
    console.error('❌ Failed to get Appwrite user:', error.message);
    throw new Error('User not found in Appwrite');
  }
};

export default {
  createAdminClient,
  createSessionClient,
  verifyAppwriteSession,
  getAppwriteUserById,
};
