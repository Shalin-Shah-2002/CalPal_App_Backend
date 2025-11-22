# 📱 Flutter + Appwrite + Backend Integration - Visual Guide

## 🎯 Complete Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     COMPLETE AUTH FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

Step 1: User Opens App
┌────────────────┐
│  Flutter App   │
│  Login Screen  │
└────────────────┘
        │
        ↓
Step 2: User Clicks "Sign in with Google" or "Email/Password"
┌────────────────┐
│   Appwrite     │  ← Google OAuth / Email Login
│  Authentication│
└────────────────┘
        │
        ↓
Step 3: Appwrite Returns Session (JWT)
┌────────────────┐
│  Flutter App   │
│  Has JWT Token │
└────────────────┘
        │
        ↓
Step 4: Send JWT to Backend for Verification
┌────────────────┐       POST /auth/verify        ┌──────────────┐
│  Flutter App   │─────────────────────────────────▶│   Backend    │
│                │    { appwriteJwt: "..." }       │   Server     │
└────────────────┘                                 └──────────────┘
                                                          │
                                                          ↓
Step 5: Backend Verifies with Appwrite
                                                   ┌──────────────┐
                                                   │   Appwrite   │
                                                   │   Verify JWT │
                                                   └──────────────┘
                                                          │
                                                          ↓
Step 6: Backend Creates/Updates User in PostgreSQL
                                                   ┌──────────────┐
                                                   │  PostgreSQL  │
                                                   │  User Stored │
                                                   └──────────────┘
                                                          │
                                                          ↓
Step 7: Backend Returns Custom JWT
┌────────────────┐       Backend JWT Token        ┌──────────────┐
│  Flutter App   │◀─────────────────────────────────│   Backend    │
│  Store Token   │    { token: "...", user: {} }   │              │
└────────────────┘                                 └──────────────┘
        │
        ↓
Step 8: All Future API Calls Use Backend JWT
┌────────────────┐       Authorization Header     ┌──────────────┐
│  Flutter App   │─────────────────────────────────▶│   Backend    │
│  API Requests  │    Bearer <backend-jwt>         │   API Routes │
└────────────────┘                                 └──────────────┘
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FLUTTER APP                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Login     │  │   Profile   │  │  Nutrition  │           │
│  │   Screen    │  │   Screen    │  │   Tracker   │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│         │                │                  │                  │
│         └────────────────┴──────────────────┘                  │
│                          │                                     │
│                ┌─────────▼─────────┐                          │
│                │   Auth Service    │                          │
│                │  (Token Manager)  │                          │
│                └─────────┬─────────┘                          │
│                          │                                     │
└──────────────────────────┼─────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ↓                  ↓                  ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Appwrite    │  │    Backend    │  │  PostgreSQL   │
│ (Auth Only)   │  │    Server     │  │  (User Data)  │
│               │  │               │  │               │
│ • Google Auth │  │ • Verify JWT  │  │ • users       │
│ • Email/Pass  │  │ • Create User │  │ • nutrition   │
│ • JWT Tokens  │  │ • API Routes  │  │ • logs        │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## 📋 Flutter Implementation Checklist

### Phase 1: Setup Dependencies

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  
  # Appwrite SDK
  appwrite: ^11.0.0
  
  # HTTP client
  http: ^1.1.0
  
  # Secure storage for tokens
  flutter_secure_storage: ^9.0.0
  
  # State management (optional)
  provider: ^6.1.1
```

### Phase 2: Configure Appwrite

```dart
// lib/config/appwrite_config.dart

import 'package:appwrite/appwrite.dart';

class AppwriteConfig {
  static const String endpoint = 'https://cloud.appwrite.io/v1';
  static const String projectId = 'your_project_id_here';
  
  static Client client = Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setSelfSigned(status: true); // Only for localhost testing
  
  static Account account = Account(client);
}
```

### Phase 3: Configure Backend API

```dart
// lib/config/api_config.dart

class ApiConfig {
  // For local testing
  static const String baseUrl = 'http://localhost:3000';
  
  // For production (update this with your Azure URL)
  // static const String baseUrl = 'https://your-app.azure.com';
  
  static const String authVerifyEndpoint = '/auth/verify';
  static const String authMeEndpoint = '/auth/me';
  static const String authRefreshEndpoint = '/auth/refresh';
}
```

### Phase 4: Create Auth Service

```dart
// lib/services/auth_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/appwrite_config.dart';
import '../config/api_config.dart';

class AuthService {
  final _secureStorage = const FlutterSecureStorage();
  
  // Google Sign-In
  Future<Map<String, dynamic>> signInWithGoogle() async {
    try {
      // 1. Login with Appwrite
      await AppwriteConfig.account.createOAuth2Session(
        provider: 'google',
      );
      
      // 2. Get JWT from Appwrite
      final jwt = await AppwriteConfig.account.createJWT();
      
      // 3. Verify with backend
      return await _verifyWithBackend(jwt.jwt);
    } catch (e) {
      throw Exception('Google sign-in failed: $e');
    }
  }
  
  // Email/Password Sign-In
  Future<Map<String, dynamic>> signInWithEmail(
    String email,
    String password,
  ) async {
    try {
      // 1. Login with Appwrite
      await AppwriteConfig.account.createEmailPasswordSession(
        email: email,
        password: password,
      );
      
      // 2. Get JWT from Appwrite
      final jwt = await AppwriteConfig.account.createJWT();
      
      // 3. Verify with backend
      return await _verifyWithBackend(jwt.jwt);
    } catch (e) {
      throw Exception('Email sign-in failed: $e');
    }
  }
  
  // Email/Password Sign-Up
  Future<Map<String, dynamic>> signUpWithEmail(
    String email,
    String password,
    String name,
  ) async {
    try {
      // 1. Create account in Appwrite
      await AppwriteConfig.account.create(
        userId: 'unique()',
        email: email,
        password: password,
        name: name,
      );
      
      // 2. Login after signup
      return await signInWithEmail(email, password);
    } catch (e) {
      throw Exception('Sign-up failed: $e');
    }
  }
  
  // Verify with Backend (Private Method)
  Future<Map<String, dynamic>> _verifyWithBackend(String appwriteJwt) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.authVerifyEndpoint}'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'appwriteJwt': appwriteJwt}),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      
      // Store backend token securely
      await _secureStorage.write(
        key: 'backend_token',
        value: data['token'],
      );
      
      // Store user data
      await _secureStorage.write(
        key: 'user_data',
        value: jsonEncode(data['user']),
      );
      
      return data;
    } else {
      throw Exception('Backend verification failed');
    }
  }
  
  // Get Current User Profile
  Future<Map<String, dynamic>> getCurrentUser() async {
    final token = await _secureStorage.read(key: 'backend_token');
    
    if (token == null) {
      throw Exception('Not authenticated');
    }
    
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}${ApiConfig.authMeEndpoint}'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get user profile');
    }
  }
  
  // Check if User is Authenticated
  Future<bool> isAuthenticated() async {
    final token = await _secureStorage.read(key: 'backend_token');
    return token != null;
  }
  
  // Logout
  Future<void> logout() async {
    try {
      // 1. Logout from Appwrite
      await AppwriteConfig.account.deleteSession(sessionId: 'current');
    } catch (e) {
      // Ignore Appwrite logout errors
    }
    
    // 2. Clear stored tokens
    await _secureStorage.delete(key: 'backend_token');
    await _secureStorage.delete(key: 'user_data');
  }
  
  // Get Stored Backend Token
  Future<String?> getBackendToken() async {
    return await _secureStorage.read(key: 'backend_token');
  }
}
```

### Phase 5: Create Login Screen

```dart
// lib/screens/login_screen.dart

import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _authService = AuthService();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _signInWithGoogle() async {
    setState(() => _isLoading = true);
    
    try {
      final result = await _authService.signInWithGoogle();
      
      if (mounted) {
        // Navigate to home screen
        Navigator.pushReplacementNamed(context, '/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Login failed: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _signInWithEmail() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    setState(() => _isLoading = true);
    
    try {
      final result = await _authService.signInWithEmail(
        _emailController.text,
        _passwordController.text,
      );
      
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Login failed: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(
                labelText: 'Password',
                border: OutlineInputBorder(),
              ),
              obscureText: true,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _signInWithEmail,
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Sign In with Email'),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _signInWithGoogle,
              icon: const Icon(Icons.login),
              label: const Text('Sign In with Google'),
            ),
          ],
        ),
      ),
    );
  }
}
```

### Phase 6: Create API Client for Protected Routes

```dart
// lib/services/api_client.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import './auth_service.dart';

class ApiClient {
  final _authService = AuthService();

  // Generic GET request with authentication
  Future<Map<String, dynamic>> get(String endpoint) async {
    final token = await _authService.getBackendToken();
    
    if (token == null) {
      throw Exception('Not authenticated');
    }

    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      throw Exception('Unauthorized - please login again');
    } else {
      throw Exception('Request failed: ${response.statusCode}');
    }
  }

  // Generic POST request with authentication
  Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    final token = await _authService.getBackendToken();
    
    if (token == null) {
      throw Exception('Not authenticated');
    }

    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      throw Exception('Unauthorized - please login again');
    } else {
      throw Exception('Request failed: ${response.statusCode}');
    }
  }

  // Example: Get nutrition data
  Future<Map<String, dynamic>> getNutritionData(String foodName) async {
    return await get('/nutrition?food=$foodName');
  }

  // Example: Save nutrition log
  Future<Map<String, dynamic>> saveNutritionLog(
    Map<String, dynamic> data,
  ) async {
    return await post('/save/nutrition', data);
  }
}
```

---

## 🔄 Token Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOKEN LIFECYCLE                              │
└─────────────────────────────────────────────────────────────────┘

Initial Login:
─────────────
Flutter App               Appwrite                Backend
    │                        │                       │
    ├──Login Request────────▶│                       │
    │                        │                       │
    │◀─Appwrite JWT──────────┤                       │
    │   (15 min TTL)         │                       │
    │                        │                       │
    ├──Verify JWT────────────┼──────────────────────▶│
    │                        │                       │
    │                        │◀──Verify with Appwrite│
    │                        │                       │
    │◀─Backend JWT────────────────────────────────────┤
    │   (7 days TTL)         │                       │
    │                        │                       │


Daily Usage:
────────────
Flutter App                                      Backend
    │                                               │
    │  All API calls use Backend JWT                │
    ├──GET /auth/me (Bearer <backend-jwt>)────────▶│
    │                                               │
    │◀─User Data─────────────────────────────────────┤
    │                                               │
    ├──GET /nutrition (Bearer <backend-jwt>)───────▶│
    │                                               │
    │◀─Nutrition Data────────────────────────────────┤
    │                                               │


Token Expired:
──────────────
Flutter App               Appwrite                Backend
    │                        │                       │
    ├──API Request (expired)────────────────────────▶│
    │                        │                       │
    │◀─401 Unauthorized───────────────────────────────┤
    │                        │                       │
    │  Re-authenticate:      │                       │
    ├──Login Request────────▶│                       │
    │◀─New Appwrite JWT──────┤                       │
    ├──Verify JWT────────────┼──────────────────────▶│
    │◀─New Backend JWT────────────────────────────────┤
    │                        │                       │
    │  Retry original request                        │
    ├──API Request (new token)──────────────────────▶│
    │◀─Success────────────────────────────────────────┤
```

---

## 📱 Complete Example App Structure

```
lib/
├── main.dart
├── config/
│   ├── appwrite_config.dart     # Appwrite setup
│   └── api_config.dart          # Backend API URLs
├── services/
│   ├── auth_service.dart        # Authentication logic
│   └── api_client.dart          # API requests with auth
├── screens/
│   ├── login_screen.dart        # Login UI
│   ├── signup_screen.dart       # Sign-up UI
│   ├── home_screen.dart         # Main app screen
│   └── profile_screen.dart      # User profile
└── models/
    └── user.dart                # User data model
```

---

## ✅ Testing Checklist

### Backend Testing:

```bash
# 1. Start backend server
npm start

# 2. Check health
curl http://localhost:3000/health

# 3. Test with mock JWT (you'll need real Appwrite JWT)
curl -X POST http://localhost:3000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"appwriteJwt": "YOUR_JWT_HERE"}'
```

### Flutter Testing:

```dart
// Test authentication flow
void main() async {
  final authService = AuthService();
  
  // 1. Sign up
  await authService.signUpWithEmail(
    'test@example.com',
    'password123',
    'Test User',
  );
  
  // 2. Login
  final result = await authService.signInWithEmail(
    'test@example.com',
    'password123',
  );
  
  print('Login success: ${result['user']}');
  
  // 3. Get profile
  final user = await authService.getCurrentUser();
  print('User profile: $user');
}
```

---

## 🎉 You're All Set!

Your authentication system is ready:

✅ Appwrite handles user authentication  
✅ Backend verifies and manages user data  
✅ Flutter app integrates both seamlessly  
✅ Secure token management  
✅ Ready for production deployment  

**Next Steps:**
1. Configure Appwrite project
2. Update `.env` with credentials
3. Test authentication flow
4. Integrate with your Flutter app
5. Deploy to Azure!
