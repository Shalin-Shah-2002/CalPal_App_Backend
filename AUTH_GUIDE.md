# 🔐 Appwrite Authentication Integration Guide

## Overview

This backend uses **Appwrite** for authentication (Google Sign-In, Email/Password) and **PostgreSQL** for storing user data. The authentication flow is designed to be secure, scalable, and easy to integrate with Flutter.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                      │
└─────────────────────────────────────────────────────────────┘

Flutter App                 Backend Server              Services
┌──────────┐               ┌──────────────┐           ┌────────────┐
│          │               │              │           │            │
│  Login   │──────────────▶│  Verify JWT  │──────────▶│  Appwrite  │
│  with    │   Appwrite    │              │  Verify   │  Server    │
│ Appwrite │     JWT       │              │           │            │
│          │               │              │           └────────────┘
└──────────┘               │              │
     │                     │  Create/     │           ┌────────────┐
     │                     │  Update      │──────────▶│ PostgreSQL │
     │                     │  User        │  Store    │  Database  │
     │                     │              │  User     │            │
     │                     │              │           └────────────┘
     │◀────────────────────│  Return      │
     │   Backend JWT       │  Custom JWT  │
     │                     │              │
     │                     └──────────────┘
     │                           ▲
     │                           │
     │  Future API Calls         │
     │  with Backend JWT         │
     └───────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Install Dependencies

Already done! The following packages are installed:
- `node-appwrite` - Appwrite SDK for Node.js
- `jsonwebtoken` - JWT generation and verification
- `bcryptjs` - Password hashing (future use)

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Appwrite credentials:

```bash
cp .env.example .env
```

**Required environment variables:**
```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_server_api_key_here

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# CORS (for Flutter)
CORS_ORIGIN=*
```

### 3. Set Up Appwrite Project

1. **Create Appwrite Account**: Go to [https://cloud.appwrite.io](https://cloud.appwrite.io)
2. **Create New Project**: Click "Create Project"
3. **Get Project ID**: Settings > Project ID
4. **Create API Key**:
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Name: "Backend Server Key"
   - Scopes: `users.read`, `sessions.read`
   - Copy the API Key (you won't see it again!)
5. **Enable Auth Methods**:
   - Go to Auth > Settings
   - Enable "Email/Password"
   - Enable "Google OAuth" (add credentials)
6. **Add Platform** (Flutter):
   - Go to Settings > Platforms
   - Add Android/iOS platform
   - Add package name/bundle ID

### 4. Initialize Database

The database will be automatically initialized when you start the server. The `users` table will be created with the following schema:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  appwrite_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 5. Start the Server

```bash
npm start
```

The server will:
- ✅ Connect to PostgreSQL
- ✅ Initialize database tables
- ✅ Start on port 3000 (or PORT from .env)
- ✅ Enable CORS for Flutter

---

## 📡 API Endpoints

### 1. **POST /auth/verify**

Verify Appwrite JWT and get backend JWT.

**Request:**
```json
{
  "appwriteJwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "token": "backend-jwt-token-here",
  "user": {
    "id": 1,
    "appwriteId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-11-10T10:00:00Z"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Authentication failed",
  "message": "Invalid or expired Appwrite session"
}
```

**How it works:**
1. Frontend sends Appwrite JWT from login
2. Backend verifies JWT with Appwrite
3. Backend creates/updates user in PostgreSQL
4. Backend generates custom JWT
5. Frontend stores backend JWT for future API calls

---

### 2. **GET /auth/me**

Get authenticated user data.

**Headers:**
```
Authorization: Bearer <backend-jwt-token>
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "appwriteId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-11-10T10:00:00Z",
    "updatedAt": "2025-11-10T10:00:00Z"
  }
}
```

**Response (Error - No Token):**
```json
{
  "success": false,
  "error": "Authentication required",
  "message": "No token provided"
}
```

**Response (Error - Invalid Token):**
```json
{
  "success": false,
  "error": "Invalid token",
  "message": "Authentication token is invalid."
}
```

---

### 3. **POST /auth/refresh**

Refresh backend JWT token.

**Headers:**
```
Authorization: Bearer <backend-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "new-backend-jwt-token"
}
```

---

### 4. **DELETE /auth/logout**

Logout user (for future session tracking).

**Headers:**
```
Authorization: Bearer <backend-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🔒 Protecting Routes

To protect any route with authentication, use the `authenticateToken` middleware:

```javascript
import { authenticateToken } from './middleware/auth.js';

// Protected route example
router.get('/protected', authenticateToken, (req, res) => {
  // req.user contains authenticated user data
  res.json({
    message: 'This is protected',
    user: req.user
  });
});
```

The middleware attaches the following to `req.user`:
```javascript
{
  userId: 1,
  appwriteId: "64f1a2b3c4d5e6f7g8h9i0j1",
  email: "user@example.com",
  name: "John Doe",
  createdAt: "2025-11-10T10:00:00Z"
}
```

---

## 📱 Flutter Integration

### 1. Install Appwrite SDK in Flutter

```yaml
dependencies:
  appwrite: ^11.0.0
  http: ^1.1.0
```

### 2. Initialize Appwrite

```dart
import 'package:appwrite/appwrite.dart';

final client = Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('your_project_id_here');

final account = Account(client);
```

### 3. Login with Google

```dart
// Google Sign-In
Future<void> loginWithGoogle() async {
  try {
    await account.createOAuth2Session(
      provider: 'google',
    );
    
    // After successful login, get JWT
    final jwt = await account.createJWT();
    
    // Send JWT to backend for verification
    await verifyWithBackend(jwt.jwt);
  } catch (e) {
    print('Login error: $e');
  }
}
```

### 4. Login with Email/Password

```dart
// Email/Password Login
Future<void> loginWithEmail(String email, String password) async {
  try {
    await account.createEmailPasswordSession(
      email: email,
      password: password,
    );
    
    // Get JWT
    final jwt = await account.createJWT();
    
    // Send to backend
    await verifyWithBackend(jwt.jwt);
  } catch (e) {
    print('Login error: $e');
  }
}
```

### 5. Verify with Backend

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> verifyWithBackend(String appwriteJwt) async {
  final response = await http.post(
    Uri.parse('http://localhost:3000/auth/verify'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'appwriteJwt': appwriteJwt}),
  );
  
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    final backendToken = data['token'];
    
    // Store backend token securely (use flutter_secure_storage)
    await secureStorage.write(key: 'backend_token', value: backendToken);
    
    print('Logged in successfully!');
  } else {
    print('Backend verification failed');
  }
}
```

### 6. Make Authenticated API Calls

```dart
Future<Map<String, dynamic>> getMyProfile() async {
  final token = await secureStorage.read(key: 'backend_token');
  
  final response = await http.get(
    Uri.parse('http://localhost:3000/auth/me'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to load profile');
  }
}
```

---

## 🔐 Security Best Practices

### ✅ What's Already Implemented

1. **Server-Side Verification**: Appwrite JWT is verified on the server using Appwrite SDK
2. **Secure API Key Storage**: Appwrite API key is stored in `.env` (never exposed to frontend)
3. **Custom Backend JWT**: Separate JWT for backend API calls
4. **JWT Expiration**: Tokens expire after 7 days (configurable)
5. **CORS Configuration**: Properly configured for Flutter apps
6. **Error Handling**: Comprehensive error messages without exposing sensitive data
7. **SQL Injection Protection**: Using parameterized queries
8. **Password Security**: Ready for bcrypt hashing (when implementing custom auth)

### 🔒 Additional Recommendations

1. **HTTPS Only**: Always use HTTPS in production
2. **Environment Variables**: Use Azure App Settings or similar for production secrets
3. **Rate Limiting**: Add rate limiting to prevent brute force attacks
4. **Token Refresh**: Implement automatic token refresh before expiration
5. **Session Management**: Consider adding session tracking in database
6. **Logging**: Add audit logs for authentication events
7. **CORS Origin**: Set specific origin in production (not `*`)

---

## 🧪 Testing the API

### Using cURL

**1. Verify Authentication (requires real Appwrite JWT):**
```bash
curl -X POST http://localhost:3000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "appwriteJwt": "your_appwrite_jwt_here"
  }'
```

**2. Get User Profile:**
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer your_backend_jwt_here"
```

**3. Refresh Token:**
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Authorization: Bearer your_backend_jwt_here"
```

### Using Postman

1. **Create Collection**: "Calorie Tracker API"
2. **Add Request**: POST `http://localhost:3000/auth/verify`
   - Body: Raw JSON
   - Content: `{"appwriteJwt": "your_jwt"}`
3. **Add Request**: GET `http://localhost:3000/auth/me`
   - Headers: `Authorization: Bearer <token>`

---

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,                    -- Auto-incrementing ID
  appwrite_id TEXT UNIQUE NOT NULL,         -- Appwrite user ID (unique)
  email TEXT UNIQUE NOT NULL,               -- User email (unique)
  name TEXT,                                -- User display name
  created_at TIMESTAMPTZ DEFAULT now(),     -- Account creation timestamp
  updated_at TIMESTAMPTZ DEFAULT now()      -- Last update timestamp
);
```

**Indexes:**
- `idx_users_appwrite_id` - Fast lookups by Appwrite ID
- `idx_users_email` - Fast lookups by email

**Relationships:**
- `nutrition_logs.user_id` → `users.id` (user's nutrition entries)

---

## 🐛 Troubleshooting

### Issue: "JWT_SECRET is not defined"

**Solution:** Add `JWT_SECRET` to your `.env` file:
```bash
# Generate a random secret
openssl rand -base64 64

# Add to .env
JWT_SECRET=<generated_secret>
```

---

### Issue: "Invalid or expired Appwrite session"

**Possible causes:**
1. Appwrite JWT has expired (default 15 minutes)
2. User logged out from Appwrite
3. Wrong Project ID in backend `.env`

**Solution:**
- Re-login in Flutter app to get fresh JWT
- Verify `APPWRITE_PROJECT_ID` matches your project
- Check JWT is being sent correctly

---

### Issue: "User not found in Appwrite"

**Possible causes:**
1. User was deleted from Appwrite
2. Wrong Appwrite API key
3. API key doesn't have `users.read` permission

**Solution:**
- Check user exists in Appwrite Console
- Verify API key has correct scopes
- Regenerate API key if needed

---

### Issue: "CORS error in Flutter"

**Solution:**
```env
# In .env, set:
CORS_ORIGIN=*

# Or for production, specific origin:
CORS_ORIGIN=https://your-flutter-app.com
```

---

## 📚 File Structure

```
backend/
├── config/
│   ├── appwrite.js          ✅ Appwrite client setup
│   ├── database.js          ✅ PostgreSQL connection
│   ├── initDb.js            ✅ Database initialization
│   └── schema.sql           ✅ Database schema (with users table)
├── middleware/
│   └── auth.js              ✅ JWT authentication middleware
├── routes/
│   ├── auth.routes.js       ✅ Authentication endpoints
│   ├── nutrition.routes.js  ✅ Nutrition API
│   └── saveNutrition.routes.js
├── utils/
│   └── jwt.js               ✅ JWT utilities
├── .env.example             ✅ Environment variables template
├── server.js                ✅ Main server file
└── package.json             ✅ Dependencies
```

---

## 🎯 Next Steps

1. **Configure Appwrite**: Set up your Appwrite project and get credentials
2. **Update .env**: Add Appwrite credentials and JWT secret
3. **Test Authentication**: Use Postman or Flutter app to test login flow
4. **Protect Routes**: Add `authenticateToken` middleware to routes that need authentication
5. **Link Nutrition Data**: Update nutrition routes to use `req.user.userId`

---

## 🆘 Need Help?

- **Appwrite Docs**: https://appwrite.io/docs
- **JWT Docs**: https://jwt.io
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## ✨ Features Implemented

✅ Appwrite authentication (Google + Email/Password)  
✅ Server-side JWT verification  
✅ PostgreSQL user management  
✅ Custom backend JWT generation  
✅ Protected routes with middleware  
✅ CORS configuration for Flutter  
✅ Comprehensive error handling  
✅ Environment-based configuration  
✅ Database schema with relationships  
✅ Token refresh endpoint  

---

**Your backend is now ready for secure authentication! 🎉**
