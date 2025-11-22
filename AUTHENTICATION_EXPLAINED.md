# 🔐 Authentication System Explained

## 📋 Table of Contents
1. [How Authentication Works](#how-authentication-works)
2. [Why We Use Appwrite](#why-we-use-appwrite)
3. [Security Architecture](#security-architecture)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Code Examples](#code-examples)

---

## 🔄 How Authentication Works

### **Complete Authentication Flow**

```
┌─────────────┐
│   Flutter   │ User clicks "Sign in with Google" or enters email/password
│     App     │
└──────┬──────┘
       │
       │ 1. Authentication Request
       ▼
┌─────────────────────┐
│   Appwrite Cloud    │ ← Handles OAuth/Password securely
│  (Authentication)   │   • Validates credentials
└──────┬──────────────┘   • Creates Appwrite session
       │                  • Returns JWT (15 min expiry)
       │ 2. Appwrite JWT
       ▼
┌─────────────┐
│   Flutter   │ Receives Appwrite JWT
│     App     │
└──────┬──────┘
       │
       │ 3. POST /auth/verify { appwriteJwt: "..." }
       ▼
┌────────────────────────┐
│   Your Node.js Backend │
│  (express + postgres)  │
└──────┬─────────────────┘
       │
       │ 4. Verify with Appwrite SDK
       ▼
┌─────────────────────┐
│   Appwrite Cloud    │ Validates JWT signature
│  (Verification)     │ Returns user data (id, email, name)
└──────┬──────────────┘
       │
       │ 5. User data verified
       ▼
┌────────────────────────┐
│   PostgreSQL Database  │
│   (users table)        │
└──────┬─────────────────┘
       │
       │ 6. Create/Update user record
       │    INSERT INTO users (appwrite_id, email, name)
       ▼
┌────────────────────────┐
│   Your Node.js Backend │ Generates custom JWT (7 days)
│  (JWT Generation)      │ Token contains: userId, appwriteId, email
└──────┬─────────────────┘
       │
       │ 7. Response: { token: "backend-jwt", user: {...} }
       ▼
┌─────────────┐
│   Flutter   │ Stores backend JWT locally
│     App     │ Uses for ALL future API calls
└─────────────┘
```

### **Step-by-Step Breakdown**

#### **Step 1-2: User Authentication with Appwrite**
```dart
// Flutter App Code
import 'package:appwrite/appwrite.dart';

// User clicks "Sign in with Google"
Account account = Account(client);

// Appwrite handles OAuth flow
Session session = await account.createOAuth2Session(
  provider: 'google',
  success: 'myapp://success',
  failure: 'myapp://failure',
);

// Get Appwrite JWT
Jwt jwt = await account.createJWT();
String appwriteJwt = jwt.jwt; // 15-minute token
```

**What happens:**
- User authenticates with Google/Email
- Appwrite validates credentials securely
- Returns a short-lived JWT (15 minutes)

---

#### **Step 3-5: Backend Verification**
```javascript
// routes/auth.routes.js
router.post('/verify', async (req, res) => {
  const { appwriteJwt } = req.body;

  // Verify with Appwrite (server-side only!)
  const appwriteUser = await verifyAppwriteSession(appwriteJwt);
  // Returns: { appwriteId, email, name }

  // Now we trust this user is authenticated
});
```

**What happens:**
- Backend receives Appwrite JWT from Flutter
- Backend uses Appwrite SDK + API key to verify JWT
- Appwrite confirms JWT is valid and returns user data
- **Your API key never leaves the server!**

---

#### **Step 6: Create User in PostgreSQL**
```javascript
// Check if user exists
let user = await pool.query(
  'SELECT * FROM users WHERE appwrite_id = $1',
  [appwriteUser.appwriteId]
);

if (user.rows.length === 0) {
  // New user - create in database
  user = await pool.query(
    'INSERT INTO users (appwrite_id, email, name) VALUES ($1, $2, $3)',
    [appwriteUser.appwriteId, appwriteUser.email, appwriteUser.name]
  );
}
```

**What happens:**
- Backend stores user in YOUR database
- You now have full control over user data
- Can add custom fields (preferences, settings, etc.)

---

#### **Step 7: Generate Backend JWT**
```javascript
// Generate custom JWT (7 days)
const backendToken = generateToken({
  userId: user.id,        // PostgreSQL ID
  appwriteId: user.appwrite_id,
  email: user.email,
});

res.json({
  success: true,
  token: backendToken,  // Flutter stores this
  user: { id, email, name }
});
```

**What happens:**
- Backend creates its own JWT (longer-lived, 7 days)
- Contains user data for quick access
- Flutter stores and uses for all API calls

---

#### **Step 8: Protected API Calls**
```javascript
// middleware/auth.js
export const authenticateToken = async (req, res, next) => {
  const token = extractTokenFromHeader(req.headers['authorization']);
  
  // Verify backend JWT
  const decoded = verifyToken(token);
  
  // Confirm user exists in database
  const user = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [decoded.userId]
  );
  
  req.user = user.rows[0]; // Attach to request
  next(); // Allow access to route
};

// Usage in routes
router.get('/nutrition', authenticateToken, async (req, res) => {
  const { userId } = req.user; // Available from middleware
  
  // Get user's nutrition logs
  const logs = await pool.query(
    'SELECT * FROM nutrition_logs WHERE user_id = $1',
    [userId]
  );
  
  res.json({ logs: logs.rows });
});
```

**What happens:**
- Every API call includes: `Authorization: Bearer <backend-jwt>`
- Middleware verifies token signature and expiry
- Middleware loads user from database
- Route handler has access to `req.user`

---

## 🎯 Why We Use Appwrite

### **Problem: OAuth is Complex**

If you implemented Google Sign-In yourself:

```javascript
// WITHOUT APPWRITE - You'd need to do all this:

// 1. Register OAuth app with Google
const googleClientId = 'your-client-id';
const googleClientSecret = 'your-client-secret';
const redirectUri = 'https://yourapp.com/oauth/callback';

// 2. Generate OAuth URL with state/nonce for security
router.get('/auth/google', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const nonce = crypto.randomBytes(16).toString('hex');
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${googleClientId}&` +
    `redirect_uri=${redirectUri}&` +
    `response_type=code&` +
    `scope=openid email profile&` +
    `state=${state}&` +
    `nonce=${nonce}`;
  
  res.redirect(authUrl);
});

// 3. Handle OAuth callback
router.get('/oauth/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Exchange code for token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  
  const { access_token, id_token } = await tokenResponse.json();
  
  // 4. Verify ID token
  const decoded = jwt.decode(id_token);
  // ... validate signature, issuer, audience, expiry
  
  // 5. Get user info
  const userResponse = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  
  const userInfo = await userResponse.json();
  
  // 6. Create user in database
  // ... more code
});

// Now repeat for Apple Sign-In, Facebook, GitHub...
```

### **WITH APPWRITE - Just 3 lines:**

```dart
// Flutter App
Session session = await account.createOAuth2Session(provider: 'google');
Jwt jwt = await account.createJWT();
// Done! Appwrite handled everything securely
```

---

### **Comparison: Appwrite vs Alternatives**

| Feature | **Appwrite** | Custom OAuth | Auth0 | Firebase Auth |
|---------|-------------|--------------|--------|---------------|
| **Google OAuth** | ✅ Built-in | ❌ Complex setup | ✅ Built-in | ✅ Built-in |
| **Email/Password** | ✅ Secure hashing | ❌ You implement | ✅ Built-in | ✅ Built-in |
| **JWT Generation** | ✅ Automatic | ❌ You implement | ✅ Automatic | ✅ Automatic |
| **Security Updates** | ✅ Maintained | ❌ Your responsibility | ✅ Maintained | ✅ Maintained |
| **Free Tier** | ✅ 75k users | ❌ N/A | ⚠️ Limited (7k users) | ⚠️ Limited |
| **Self-Hosted** | ✅ Yes | ❌ N/A | ❌ No | ❌ No |
| **Open Source** | ✅ Yes | ❌ N/A | ❌ No | ❌ No |
| **Data Control** | ✅ Your DB | ✅ Your DB | ❌ Auth0 DB | ❌ Firebase DB |
| **Backend Needed** | ✅ Yours | ✅ Yours | ⚠️ Optional | ⚠️ Optional |
| **Monthly Cost** | 🆓 Free | 💰 Dev time | 💰 $23-228+ | 💰 $25-150+ |

---

### **Why Appwrite is Perfect for Your App**

#### **1. Security Without Complexity**
```javascript
// Appwrite handles:
✅ Password hashing (bcrypt with salt)
✅ OAuth state validation
✅ Token signature verification
✅ CSRF protection
✅ Rate limiting
✅ Session management

// You just call:
const user = await verifyAppwriteSession(jwt);
```

#### **2. Your Backend, Your Rules**
```javascript
// You control the database
await pool.query(`
  INSERT INTO users (appwrite_id, email, name, 
                     preferences, subscription_tier, custom_data)
  VALUES ($1, $2, $3, $4, $5, $6)
`, [appwriteId, email, name, preferences, tier, data]);

// Your business logic
if (user.subscription_tier === 'premium') {
  // Allow AI-powered features
}

// Your relationships
SELECT nutrition_logs.* 
FROM nutrition_logs 
JOIN users ON users.id = nutrition_logs.user_id
WHERE users.id = $1;
```

#### **3. No Vendor Lock-In**
```
If you stop using Appwrite tomorrow:
✅ All user data is in YOUR PostgreSQL database
✅ Switch to Auth0, Firebase, or custom OAuth
✅ Just update /auth/verify endpoint
✅ No data migration needed
```

#### **4. Cost Effective**
```
Appwrite Free Tier:
✅ 75,000 users
✅ Unlimited API calls
✅ All authentication methods
✅ No credit card required

Your actual costs:
💰 $0 (Appwrite)
💰 $7/month (Render PostgreSQL)
💰 $0 (Google Gemini free tier)
────────────────────
💰 $7/month total for 75k users!
```

---

## 🛡️ Security Architecture

### **Two-Token System**

```
┌────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                      │
└────────────────────────────────────────────────────────┘

Layer 1: Appwrite JWT (15 minutes)
────────────────────────────────────
Purpose: Initial authentication only
Issued by: Appwrite Cloud
Used for: POST /auth/verify
Expiry: 15 minutes (short-lived for security)

      ↓ Exchange at /auth/verify

Layer 2: Backend JWT (7 days)
────────────────────────────────────
Purpose: All API calls
Issued by: Your Node.js backend
Used for: /nutrition, /save, /auth/me, etc.
Expiry: 7 days (user convenience)
Refresh: POST /auth/refresh before expiry

      ↓ Include in all requests

Layer 3: Database Verification
────────────────────────────────────
Every request verifies:
✅ JWT signature valid
✅ JWT not expired
✅ User exists in PostgreSQL
✅ User not deleted/banned
```

### **API Key Protection**

```
❌ WRONG - Don't do this:
┌─────────────┐
│   Flutter   │ APPWRITE_API_KEY = "secret123"
│     App     │ ← User can extract from app binary!
└─────────────┘

✅ CORRECT - What you're doing:
┌─────────────┐
│   Flutter   │ Only has appwriteJwt (15 min, revocable)
│     App     │ ← Safe to store
└─────────────┘
       │
       ▼
┌────────────────────────┐
│   Node.js Backend      │ APPWRITE_API_KEY stored here
│  (Secure Server)       │ ← Attackers can't access
└────────────────────────┘
```

### **Attack Scenarios & Protection**

#### **Scenario 1: Stolen JWT**
```javascript
// Attacker steals backend JWT from user's phone

🛡️ Protection:
1. JWT expires after 7 days (limited damage window)
2. User can revoke by logging out and back in
3. JWT contains no sensitive data (only userId, email)
4. HTTPS prevents token interception in transit

// Middleware detects expired tokens
if (jwt.exp < Date.now()) {
  throw new Error('Token expired');
}
```

#### **Scenario 2: Fake JWT**
```javascript
// Attacker creates fake JWT with userId: 123

🛡️ Protection:
1. JWT signed with JWT_SECRET (only backend knows)
2. verifyToken() checks signature
3. If signature invalid → 401 Unauthorized

// Verification
const decoded = jwt.verify(token, JWT_SECRET);
// Throws error if signature doesn't match
```

#### **Scenario 3: Database Breach**
```javascript
// Attacker gets database dump

🛡️ Protection:
1. No passwords stored (Appwrite handles them)
2. Only appwrite_id, email, name in database
3. Can't log in without Appwrite credentials
4. User IDs are sequential (not predictable)

// database.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  appwrite_id TEXT UNIQUE NOT NULL,  -- ← Links to Appwrite
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  -- NO password column!
);
```

#### **Scenario 4: Man-in-the-Middle**
```javascript
// Attacker intercepts network traffic

🛡️ Protection:
1. HTTPS encrypts all traffic
2. Appwrite validates JWT origin
3. CORS blocks unauthorized domains

// server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN, // Only Flutter app
  credentials: true,
}));
```

---

## 📊 Data Flow Diagrams

### **First-Time User Login**

```
                    TIME: 0 seconds
┌─────────────────────────────────────────────┐
│  User opens CalPal app                      │
│  Sees login screen                          │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +2s (user clicks)
┌─────────────────────────────────────────────┐
│  User clicks "Sign in with Google"          │
│  Flutter: account.createOAuth2Session()     │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +3s (redirect to Google)
┌─────────────────────────────────────────────┐
│  📱 Browser opens Google login page         │
│  User enters credentials                    │
│  Grants permissions                         │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +10s (user authenticated)
┌─────────────────────────────────────────────┐
│  🔐 Google validates credentials            │
│  Returns auth code to Appwrite              │
│  Appwrite exchanges code for token          │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +11s (Appwrite session created)
┌─────────────────────────────────────────────┐
│  📲 Flutter receives success callback       │
│  Calls: account.createJWT()                 │
│  Gets: appwriteJwt = "eyJhbGciOi..."        │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +12s (verify with backend)
┌─────────────────────────────────────────────┐
│  🌐 Flutter: POST /auth/verify              │
│  Body: { appwriteJwt: "..." }               │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +12.5s (backend processing)
┌─────────────────────────────────────────────┐
│  🔍 Backend: verifyAppwriteSession()        │
│  Appwrite validates JWT                     │
│  Returns: { id, email, name }               │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +12.7s (database check)
┌─────────────────────────────────────────────┐
│  💾 SELECT * FROM users                     │
│     WHERE appwrite_id = 'user123'           │
│  Result: (empty - new user)                 │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +12.8s (create user)
┌─────────────────────────────────────────────┐
│  💾 INSERT INTO users                       │
│     (appwrite_id, email, name)              │
│     VALUES ('user123', 'john@...', 'John')  │
│  Returns: id=42                             │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +13s (generate backend JWT)
┌─────────────────────────────────────────────┐
│  🎫 generateToken({                         │
│      userId: 42,                            │
│      appwriteId: 'user123',                 │
│      email: 'john@example.com'              │
│    })                                       │
│  Returns: backendJwt (7 day expiry)         │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +13.2s (send response)
┌─────────────────────────────────────────────┐
│  📤 Response: {                             │
│      success: true,                         │
│      token: "eyJhbGciOi...",  ← Backend JWT │
│      user: { id: 42, email, name }          │
│    }                                        │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +13.5s (Flutter stores token)
┌─────────────────────────────────────────────┐
│  💾 Flutter: SharedPreferences              │
│     prefs.setString('jwt', backendJwt)      │
│                                             │
│  ✅ User is now authenticated               │
│  Navigate to home screen                    │
└─────────────────────────────────────────────┘

Total time: ~13.5 seconds from login to authenticated
```

---

### **Returning User (Already Has Backend JWT)**

```
                    TIME: 0 seconds
┌─────────────────────────────────────────────┐
│  User opens CalPal app                      │
│  Flutter: Load stored JWT from disk         │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +0.1s (JWT found)
┌─────────────────────────────────────────────┐
│  🎫 JWT exists and not expired              │
│  Add to API client headers                  │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +0.2s (verify with backend)
┌─────────────────────────────────────────────┐
│  🌐 Flutter: GET /auth/me                   │
│  Headers: Authorization: Bearer <jwt>       │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +0.5s (middleware checks)
┌─────────────────────────────────────────────┐
│  🔍 authenticateToken middleware:           │
│  1. Extract JWT from header                 │
│  2. Verify signature                        │
│  3. Check expiry                            │
│  4. Query database for user                 │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +0.7s (user found)
┌─────────────────────────────────────────────┐
│  💾 SELECT * FROM users WHERE id = 42       │
│  Returns: { id, email, name, ... }          │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +0.8s (send response)
┌─────────────────────────────────────────────┐
│  📤 Response: {                             │
│      success: true,                         │
│      user: { id: 42, email, name }          │
│    }                                        │
└─────────────────────────────────────────────┘
                    ↓
                TIME: +1s (Flutter authenticated)
┌─────────────────────────────────────────────┐
│  ✅ User authenticated                      │
│  Navigate to home screen                    │
│  No login screen shown                      │
└─────────────────────────────────────────────┘

Total time: ~1 second from app open to home screen
```

---

### **API Call with Authentication**

```
User wants to log a meal:
────────────────────────────────────────

Flutter App:
POST /save
Headers: { Authorization: "Bearer eyJhbGci..." }
Body: { 
  date: "2024-01-15",
  meal_type: "lunch",
  food_name: "Grilled Chicken Salad",
  ...
}

       ↓ (Network request)

Express Server (server.js):
app.use(cors({ origin: CORS_ORIGIN }));
app.use('/save', saveNutritionRoutes);

       ↓ (Route matched)

Save Nutrition Route:
router.post('/', authenticateToken, async (req, res) => {
  // authenticateToken middleware runs first
});

       ↓ (Middleware executes)

Authentication Middleware:
1. Extract token from header
   ✅ Token found

2. Verify JWT signature
   ✅ Signature valid

3. Check expiry
   ✅ Not expired (3 days left)

4. Query database
   SELECT * FROM users WHERE id = 42
   ✅ User exists

5. Attach to request
   req.user = { userId: 42, email: "...", ... }

6. Call next()

       ↓ (Middleware passed)

Save Route Handler:
const { userId } = req.user; // ← From middleware
const { date, meal_type, food_name } = req.body;

INSERT INTO nutrition_logs (
  user_id,         ← Uses authenticated user ID
  date,
  meal_type,
  food_name,
  ...
) VALUES ($1, $2, $3, $4, ...);

       ↓ (Database insert)

Response:
{
  success: true,
  message: "Nutrition data saved",
  id: 789
}

       ↓ (Network response)

Flutter App:
✅ Shows success message
✅ Updates UI with new log
```

---

## 💻 Code Examples

### **Full Flutter Integration**

```dart
// lib/services/auth_service.dart
import 'package:appwrite/appwrite.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class AuthService {
  final Client client = Client()
    ..setEndpoint('https://cloud.appwrite.io/v1')
    ..setProject('YOUR_PROJECT_ID');

  late final Account account;

  AuthService() {
    account = Account(client);
  }

  // Step 1: Google Sign-In
  Future<String> signInWithGoogle() async {
    try {
      // Appwrite handles OAuth flow
      await account.createOAuth2Session(
        provider: 'google',
        success: 'myapp://auth/success',
        failure: 'myapp://auth/failure',
      );

      // Get Appwrite JWT
      final jwt = await account.createJWT();
      return jwt.jwt;
    } catch (e) {
      throw Exception('Google sign-in failed: $e');
    }
  }

  // Step 2: Email/Password Sign-In
  Future<String> signInWithEmail(String email, String password) async {
    try {
      await account.createEmailSession(
        email: email,
        password: password,
      );

      final jwt = await account.createJWT();
      return jwt.jwt;
    } catch (e) {
      throw Exception('Email sign-in failed: $e');
    }
  }

  // Step 3: Verify with Backend
  Future<Map<String, dynamic>> verifyWithBackend(String appwriteJwt) async {
    final response = await http.post(
      Uri.parse('https://your-backend.com/auth/verify'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'appwriteJwt': appwriteJwt}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // Store backend JWT
      await _storage.write(key: 'jwt', value: data['token']);
      return data;
    } else {
      throw Exception('Backend verification failed');
    }
  }

  // Complete login flow
  Future<void> login(String email, String password) async {
    // 1. Authenticate with Appwrite
    final appwriteJwt = await signInWithEmail(email, password);
    
    // 2. Verify with backend and get long-lived JWT
    final result = await verifyWithBackend(appwriteJwt);
    
    // 3. Now authenticated!
    print('Logged in as: ${result['user']['email']}');
  }
}
```

### **Making Authenticated API Calls**

```dart
// lib/services/nutrition_service.dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class NutritionService {
  final String baseUrl = 'https://your-backend.com';
  
  // Get stored JWT
  Future<String?> _getToken() async {
    return await _storage.read(key: 'jwt');
  }

  // Save nutrition data
  Future<void> saveNutrition(Map<String, dynamic> data) async {
    final token = await _getToken();
    
    final response = await http.post(
      Uri.parse('$baseUrl/save'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',  // ← Backend JWT
      },
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      print('Nutrition saved!');
    } else if (response.statusCode == 401) {
      // Token expired - refresh or re-login
      throw Exception('Session expired');
    } else {
      throw Exception('Failed to save nutrition');
    }
  }

  // Get user's nutrition logs
  Future<List<dynamic>> getNutritionLogs(String date) async {
    final token = await _getToken();
    
    final response = await http.get(
      Uri.parse('$baseUrl/nutrition?date=$date'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['nutritionData'];
    } else {
      throw Exception('Failed to fetch logs');
    }
  }

  // Refresh token before it expires
  Future<void> refreshToken() async {
    final oldToken = await _getToken();
    
    final response = await http.post(
      Uri.parse('$baseUrl/auth/refresh'),
      headers: {
        'Authorization': 'Bearer $oldToken',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await _storage.write(key: 'jwt', value: data['token']);
    }
  }
}
```

### **Token Refresh Strategy**

```dart
// lib/utils/token_manager.dart
import 'dart:async';
import 'package:jwt_decoder/jwt_decoder.dart';

class TokenManager {
  Timer? _refreshTimer;

  // Start automatic refresh 1 day before expiry
  void startAutoRefresh(String token) {
    final expiryDate = JwtDecoder.getExpirationDate(token);
    final refreshDate = expiryDate.subtract(Duration(days: 1));
    final duration = refreshDate.difference(DateTime.now());

    _refreshTimer?.cancel();
    _refreshTimer = Timer(duration, () async {
      await _nutritionService.refreshToken();
      // Restart timer with new token
      final newToken = await _storage.read(key: 'jwt');
      if (newToken != null) startAutoRefresh(newToken);
    });
  }

  // Check if token is expired
  bool isTokenExpired(String token) {
    return JwtDecoder.isExpired(token);
  }

  void dispose() {
    _refreshTimer?.cancel();
  }
}
```

---

## 🎬 Summary

### **Your Authentication System**

```
┌──────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. User → Appwrite (Google/Email)                       │
│     ✅ Secure OAuth handling                            │
│     ✅ No password management for you                   │
│                                                          │
│  2. Appwrite → Flutter (15-min JWT)                      │
│     ✅ Short-lived for security                         │
│     ✅ Used once for verification                       │
│                                                          │
│  3. Flutter → Your Backend (/auth/verify)                │
│     ✅ Server-side verification only                    │
│     ✅ API key never exposed                            │
│                                                          │
│  4. Backend → PostgreSQL (Create/Update user)            │
│     ✅ Your database, your control                      │
│     ✅ Add custom fields anytime                        │
│                                                          │
│  5. Backend → Flutter (7-day JWT)                        │
│     ✅ Long-lived for convenience                       │
│     ✅ Used for all API calls                           │
│                                                          │
│  6. Future API Calls (Authorization header)              │
│     ✅ Middleware validates every request               │
│     ✅ User data attached to req.user                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### **Why Appwrite is Perfect**

1. **Security**: Enterprise-grade OAuth without complexity
2. **Control**: Your backend, your database, your rules
3. **Cost**: Free for 75k users (vs $228/month for Auth0)
4. **Speed**: 1 second login for returning users
5. **Flexibility**: Add any auth provider, switch anytime
6. **Open Source**: No vendor lock-in, self-hostable

### **Next Steps**

```bash
# 1. Set up Appwrite
Follow: APPWRITE_SETUP.md

# 2. Configure environment
# .env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
JWT_SECRET=your_random_secret_key

# 3. Initialize database
npm run init-db

# 4. Start server
npm start

# 5. Integrate Flutter app
See: FLUTTER_INTEGRATION.md
```

---

## 📚 Additional Resources

- **Setup Guide**: `APPWRITE_SETUP.md`
- **Flutter Integration**: `FLUTTER_INTEGRATION.md`
- **Architecture Details**: `ARCHITECTURE.md`
- **API Documentation**: `API_DOCUMENTATION.md`
- **Quick Reference**: `QUICK_REFERENCE.md`

---

**✨ You now have enterprise-grade authentication that's secure, scalable, and maintainable!**
