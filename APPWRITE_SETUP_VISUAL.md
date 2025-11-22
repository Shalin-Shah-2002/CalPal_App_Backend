# 🚀 Appwrite Setup - Visual Step-by-Step Guide

## 📋 Overview

This guide will walk you through setting up Appwrite Cloud for your CalPal backend in **10 minutes**.

```
┌─────────────────────────────────────────────────────────┐
│           WHAT YOU'LL ACCOMPLISH                        │
├─────────────────────────────────────────────────────────┤
│  ✅ Create Appwrite Cloud account (FREE)                │
│  ✅ Set up authentication project                       │
│  ✅ Get API credentials                                 │
│  ✅ Configure your backend                              │
│  ✅ Test the integration                                │
└─────────────────────────────────────────────────────────┘
```

---

## 📍 Step 1: Create Appwrite Account

### **Go to Appwrite Cloud**
🔗 https://cloud.appwrite.io

<img width="800" alt="Appwrite Homepage" src="https://appwrite.io/images/hero.png">

### **Click "Get Started" or "Sign Up"**

You can sign up with:
- 🔵 GitHub account (recommended)
- 📧 Email address
- 🔷 GitLab account

```
┌──────────────────────────────────────┐
│   Welcome to Appwrite Cloud! 🎉     │
│                                      │
│   [Sign up with GitHub]              │
│   [Sign up with Email]               │
│   [Sign up with GitLab]              │
│                                      │
│   Already have account? Sign in →    │
└──────────────────────────────────────┘
```

**💡 Tip**: Using GitHub is fastest!

---

## 📍 Step 2: Create a New Project

### **Once logged in, you'll see the Console**

```
┌────────────────────────────────────────────────────────┐
│  Appwrite Console                              [User]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│   Your Projects                                        │
│   ┌──────────────────────────────────────┐            │
│   │   📦 No projects yet                 │            │
│   │                                      │            │
│   │   [+ Create Project]                 │            │
│   └──────────────────────────────────────┘            │
└────────────────────────────────────────────────────────┘
```

### **Click "+ Create Project"**

Fill in:
- **Project Name**: `CalPal` (or any name you like)
- **Project ID**: Auto-generated (you can customize)
- **Region**: Choose closest to you (e.g., US, EU, Asia)

```
┌────────────────────────────────────────┐
│   Create New Project                   │
├────────────────────────────────────────┤
│                                        │
│   Project Name:                        │
│   [CalPal                     ]        │
│                                        │
│   Project ID: (auto-generated)         │
│   [calpal-12345               ]        │
│                                        │
│   Region:                              │
│   [🇺🇸 United States (NYC)    ▼]       │
│                                        │
│   [Cancel]        [Create Project]     │
└────────────────────────────────────────┘
```

### **Click "Create Project"** ✅

---

## 📍 Step 3: Get Your Project ID

### **After creating, you'll see your project dashboard**

```
┌────────────────────────────────────────────────────────┐
│  CalPal                  🔍 Search    Settings  [User] │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📊 Overview    👤 Auth    💾 Databases    ⚙️ Settings │
│                                                        │
│  ┌───────────────────────┐  ┌──────────────────────┐  │
│  │  Project Details      │  │  Quick Stats         │  │
│  │                       │  │  Users: 0            │  │
│  │  Project ID:          │  │  Sessions: 0         │  │
│  │  calpal-12345    [📋] │  │  Storage: 0 MB       │  │
│  └───────────────────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### **Copy Your Project ID**

1. Look for **"Project ID"** in the Overview or Settings
2. Click the **📋 copy icon** next to it
3. **Save it** - you'll need it for `.env` file

```
Your Project ID looks like:
67abc123def456789
or
calpal-12345
```

**⚠️ Important**: Keep this somewhere safe!

---

## 📍 Step 4: Create API Key for Backend

### **Navigate to Settings → API Keys**

```
┌────────────────────────────────────────────────────────┐
│  CalPal > Settings > API Keys                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  API Keys allow server-side access to your project    │
│                                                        │
│  ┌──────────────────────────────────────┐             │
│  │  No API keys yet                     │             │
│  │                                      │             │
│  │  [+ Create API Key]                  │             │
│  └──────────────────────────────────────┘             │
└────────────────────────────────────────────────────────┘
```

### **Click "+ Create API Key"**

Fill in the form:

```
┌──────────────────────────────────────────────────────┐
│   Create API Key                                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│   Name:                                              │
│   [Backend Server                        ]           │
│                                                      │
│   Expiration: (optional)                             │
│   [Never expire                          ▼]          │
│                                                      │
│   Scopes: Select the permissions                     │
│   ┌────────────────────────────────────┐             │
│   │ 🔍 Search scopes...                │             │
│   │                                    │             │
│   │ Auth                               │             │
│   │ ☑ sessions.read                    │  ← CHECK   │
│   │ ☐ sessions.write                   │             │
│   │                                    │             │
│   │ Users                              │             │
│   │ ☑ users.read                       │  ← CHECK   │
│   │ ☐ users.write                      │             │
│   │ ☐ users.delete                     │             │
│   │                                    │             │
│   │ ℹ️ Select only needed permissions  │             │
│   └────────────────────────────────────┘             │
│                                                      │
│   [Cancel]                [Create API Key]           │
└──────────────────────────────────────────────────────┘
```

### **Required Scopes** (check these boxes):
- ✅ `sessions.read` - To verify user sessions
- ✅ `users.read` - To get user information

**💡 Tip**: Don't give more permissions than needed for security!

### **Click "Create API Key"**

---

## 📍 Step 5: Copy Your API Key

### **⚠️ CRITICAL: This is shown only ONCE!**

```
┌──────────────────────────────────────────────────────┐
│   ✅ API Key Created Successfully                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│   Your API Key (shown only once):                    │
│   ┌────────────────────────────────────────────┐    │
│   │ standard_abc123def456ghi789jkl012mno345    │    │
│   │                                   [📋 Copy]│    │
│   └────────────────────────────────────────────┘    │
│                                                      │
│   ⚠️ Save this API key now!                          │
│   You won't be able to see it again.                │
│                                                      │
│   [I've saved it]                                    │
└──────────────────────────────────────────────────────┘
```

### **Copy and Save the API Key**
1. Click **📋 Copy**
2. Paste it in a safe place (text file, password manager)
3. You'll add it to `.env` file next

**⚠️ WARNING**: If you lose this, you'll need to create a new API key!

---

## 📍 Step 6: Enable Authentication Methods

### **Navigate to Auth → Settings**

```
┌────────────────────────────────────────────────────────┐
│  CalPal > Auth > Settings                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Authentication Methods                                │
│                                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │  Email/Password           [Toggle: OFF] →    │     │
│  ├──────────────────────────────────────────────┤     │
│  │  Magic URL                [Toggle: OFF]      │     │
│  ├──────────────────────────────────────────────┤     │
│  │  Google OAuth             [Toggle: OFF] →    │     │
│  ├──────────────────────────────────────────────┤     │
│  │  Apple                    [Toggle: OFF]      │     │
│  ├──────────────────────────────────────────────┤     │
│  │  GitHub                   [Toggle: OFF]      │     │
│  └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘
```

### **Enable Email/Password**

1. Find **"Email/Password"** row
2. Click the toggle to turn it **ON** (blue)
3. Configuration appears:

```
┌──────────────────────────────────────────────────────┐
│  Email/Password Authentication                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Status: [Enabled ●]                                 │
│                                                      │
│  ☑ Require email verification                        │
│  ☐ Allow password recovery                           │
│  ☐ Disallow personal data in passwords               │
│                                                      │
│  [Update]                                            │
└──────────────────────────────────────────────────────┘
```

4. Click **"Update"** to save

### **Enable Google OAuth** (Optional but Recommended)

1. Find **"Google OAuth"** row
2. Click the toggle to turn it **ON**
3. You'll need Google OAuth credentials:

```
┌──────────────────────────────────────────────────────┐
│  Google OAuth Configuration                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  To enable Google sign-in, you need:                 │
│                                                      │
│  1. Go to Google Cloud Console                       │
│     https://console.cloud.google.com                 │
│                                                      │
│  2. Create OAuth 2.0 credentials                     │
│                                                      │
│  3. Enter them below:                                │
│                                                      │
│  Client ID:                                          │
│  [_________________________________]                 │
│                                                      │
│  Client Secret:                                      │
│  [_________________________________]                 │
│                                                      │
│  [Save]                                              │
└──────────────────────────────────────────────────────┘
```

**For Google OAuth setup, see**: [Google OAuth Setup Guide](#google-oauth-setup-optional)

---

## 📍 Step 7: Configure Your Backend

### **Update `.env` File**

Open your `.env` file and add these lines:

```bash
# Navigate to your project folder
cd "/Users/shalinshah/Developer-Shalin /Node-Js-Practice/Calorie Tracking Backend"

# Open .env file in editor
code .env
# or
nano .env
```

### **Add Appwrite Configuration**

```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=paste_your_project_id_here
APPWRITE_API_KEY=paste_your_api_key_here

# JWT Configuration (for backend tokens)
JWT_SECRET=paste_random_secret_here
JWT_EXPIRES_IN=7d
```

### **Generate JWT Secret**

Run one of these commands to generate a secure random secret:

**Option 1: Using OpenSSL (Mac/Linux)**
```bash
openssl rand -base64 64
```

**Option 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Option 3: Online Generator**
- Go to: https://randomkeygen.com
- Copy a "Fort Knox Password"

**Example output:**
```
Kx8fJ2nP9mL4vB7cQ6wE5rY3tU1iO0pA8sD9fG2hJ4kL6mN5bV7cX9zQ3wE5rT7yU1i
```

### **Your Complete `.env` Should Look Like:**

```env
# Node Environment
NODE_ENV=development
PORT=3000

# PostgreSQL Database (existing)
DATABASE_URL=postgresql://calorie_tracker_db_zy08_user:gVPB633ZcnHN17wkg4MBzdU4g4AjaCVp@dpg-d42vo8a4d50c73a657ag-a.oregon-postgres.render.com/calorie_tracker_db_zy08

# Gemini API (existing)
GEMINI_API_KEY=AIzaSyAef3w5OLc57oY31tmb_KWXGPJ4QnpcM-I

# Appwrite Configuration (NEW)
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=67abc123def456789
APPWRITE_API_KEY=standard_abc123def456ghi789jkl012mno345

# JWT Configuration (NEW)
JWT_SECRET=Kx8fJ2nP9mL4vB7cQ6wE5rY3tU1iO0pA8sD9fG2hJ4kL6mN5bV7cX9zQ3wE5rT7yU1i
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=*
```

### **Save the file** (Ctrl+S or Cmd+S)

---

## 📍 Step 8: Test Your Setup

### **Start Your Backend Server**

```bash
npm start
```

### **Expected Output:**

```
✅ Connected to PostgreSQL database
📊 Database connection test successful
🔐 Appwrite client initialized
✅ Database tables verified
🚀 Node.js server running on http://localhost:3000

Available endpoints:
  - GET  /health
  - POST /auth/verify
  - GET  /auth/me
  - POST /auth/refresh
  - DELETE /auth/logout
  - GET  /nutrition
  - POST /save
```

### **Test Health Endpoint**

Open a new terminal and run:

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-15T12:34:56.789Z",
  "uptime": 123.456,
  "database": "Connected",
  "appwrite": "Configured"
}
```

✅ **Success!** Your backend is now configured with Appwrite!

---

## 📍 Step 9: Add Flutter Platform (for Mobile App)

### **Navigate to Settings → Platforms**

```
┌────────────────────────────────────────────────────────┐
│  CalPal > Settings > Platforms                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Add platforms to enable client-side SDKs              │
│                                                        │
│  [+ Add Platform]                                      │
└────────────────────────────────────────────────────────┘
```

### **Click "+ Add Platform"**

Choose your platform:

```
┌──────────────────────────────────────┐
│   Select Platform                    │
├──────────────────────────────────────┤
│                                      │
│   📱 Flutter (Android)               │
│   📱 Flutter (iOS)                   │
│   📱 Flutter (Web)                   │
│   🌐 Web                             │
│   📱 Android (Native)                │
│   🍎 iOS (Native)                    │
│                                      │
│   [Select]                           │
└──────────────────────────────────────┘
```

### **For Flutter Android:**

```
┌──────────────────────────────────────┐
│   Add Flutter Android Platform       │
├──────────────────────────────────────┤
│                                      │
│   Name:                              │
│   [CalPal Android          ]         │
│                                      │
│   Package Name:                      │
│   [com.example.calpal      ]         │
│                                      │
│   [Cancel]        [Create]           │
└──────────────────────────────────────┘
```

**Package Name**: Use your Flutter app's package name from `android/app/build.gradle`

### **For Flutter iOS:**

```
┌──────────────────────────────────────┐
│   Add Flutter iOS Platform           │
├──────────────────────────────────────┤
│                                      │
│   Name:                              │
│   [CalPal iOS              ]         │
│                                      │
│   Bundle ID:                         │
│   [com.example.calpal      ]         │
│                                      │
│   [Cancel]        [Create]           │
└──────────────────────────────────────┘
```

**Bundle ID**: Use your Flutter app's bundle ID from `ios/Runner.xcodeproj`

---

## 🎯 Quick Configuration Checklist

```
Setup Checklist:
├─ [✓] 1. Created Appwrite account
├─ [✓] 2. Created "CalPal" project
├─ [✓] 3. Copied Project ID → .env
├─ [✓] 4. Created API Key with scopes:
│         • sessions.read ✓
│         • users.read ✓
├─ [✓] 5. Copied API Key → .env
├─ [✓] 6. Enabled Email/Password auth
├─ [✓] 7. (Optional) Enabled Google OAuth
├─ [✓] 8. Generated JWT_SECRET → .env
├─ [✓] 9. Started backend server
├─ [✓] 10. Tested /health endpoint
└─ [✓] 11. Added Flutter platform
```

---

## 🔧 Configuration Summary

### **What You've Set Up:**

| Component | Purpose | Status |
|-----------|---------|--------|
| **Appwrite Project** | Authentication service | ✅ Created |
| **Project ID** | Identifies your project | ✅ In .env |
| **API Key** | Backend server access | ✅ In .env |
| **Email/Password** | Login method | ✅ Enabled |
| **Google OAuth** | Social login | ⏸️ Optional |
| **JWT Secret** | Backend token signing | ✅ Generated |
| **Backend Server** | Your Node.js API | ✅ Running |
| **Flutter Platform** | Mobile app access | ✅ Added |

---

## 🧪 Testing Authentication (End-to-End)

### **Test Flow:**

```
1. Flutter App → Appwrite: Login with email/password
   Result: Get Appwrite JWT (15-min token)

2. Flutter App → Your Backend: POST /auth/verify
   Body: { "appwriteJwt": "..." }
   Result: Get backend JWT (7-day token)

3. Flutter App → Your Backend: GET /auth/me
   Headers: { "Authorization": "Bearer <backend-jwt>" }
   Result: Get user profile
```

### **Manual Test (Using cURL):**

You can't test the full flow without a Flutter app, but you can test the health check:

```bash
# Test 1: Health check
curl http://localhost:3000/health

# Test 2: Check CORS
curl -H "Origin: http://localhost" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3000/auth/verify
```

---

## 🎓 Next Steps

### **For Backend:**
✅ Appwrite is configured!

Now you can:
1. Protect existing routes with authentication
2. Link nutrition data to users
3. Deploy to production

### **For Flutter App:**
📱 **Follow the Flutter Integration Guide:**

```bash
# Read the guide
cat FLUTTER_INTEGRATION.md

# Or open in VS Code
code FLUTTER_INTEGRATION.md
```

The guide includes:
- Installing Appwrite SDK in Flutter
- Creating login screens
- Implementing authentication flow
- Making authenticated API calls

---

## 🆘 Troubleshooting

### **Issue 1: "Cannot find module 'node-appwrite'"**

**Solution:**
```bash
npm install node-appwrite jsonwebtoken bcryptjs
```

### **Issue 2: "JWT_SECRET is not defined"**

**Solution:** Make sure `.env` file has:
```env
JWT_SECRET=your_random_secret_here
```

Then restart server:
```bash
npm start
```

### **Issue 3: "Invalid or expired Appwrite session"**

**Causes:**
- Wrong `APPWRITE_PROJECT_ID` in `.env`
- Wrong `APPWRITE_API_KEY` in `.env`
- Token expired (Appwrite JWTs last 15 minutes)

**Solution:**
1. Double-check Project ID and API Key in `.env`
2. Make sure they match your Appwrite Console
3. Restart server after changing `.env`

### **Issue 4: "Failed to connect to Appwrite"**

**Solution:**
- Check internet connection
- Verify `APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1`
- Check if Appwrite is blocked by firewall/VPN

### **Issue 5: CORS errors from Flutter**

**Solution:**
In `.env` file:
```env
CORS_ORIGIN=*
```

For production, change to your app's domain:
```env
CORS_ORIGIN=https://yourapp.com
```

---

## 📚 Additional Resources

### **Documentation Files:**
- `APPWRITE_SETUP.md` - Original setup guide
- `AUTHENTICATION_EXPLAINED.md` - How authentication works
- `FLUTTER_INTEGRATION.md` - Flutter code examples
- `AUTH_GUIDE.md` - Complete auth documentation
- `API_DOCUMENTATION.md` - API endpoints reference

### **Appwrite Resources:**
- 📖 [Appwrite Docs](https://appwrite.io/docs)
- 🎓 [Appwrite Tutorials](https://appwrite.io/docs/tutorials)
- 💬 [Appwrite Discord](https://appwrite.io/discord)
- 🐛 [Appwrite GitHub](https://github.com/appwrite/appwrite)

### **Flutter + Appwrite:**
- 📱 [Flutter SDK Docs](https://appwrite.io/docs/sdks#client)
- 🎥 [Video Tutorials](https://www.youtube.com/c/Appwrite)

---

## 🎉 Congratulations!

You've successfully set up Appwrite for your CalPal backend! 🚀

```
✅ Appwrite Cloud account created
✅ Project configured
✅ Authentication enabled
✅ Backend connected
✅ Ready for Flutter integration

Your backend now supports:
- 📧 Email/Password login
- 🔐 Google OAuth (optional)
- 🎫 JWT token authentication
- 👤 User management
- 💾 PostgreSQL user data
```

**Next:** Build your Flutter app and integrate authentication!

---

## 📞 Need Help?

If you get stuck:
1. Check the troubleshooting section above
2. Review `AUTHENTICATION_EXPLAINED.md` for flow details
3. Read `FLUTTER_INTEGRATION.md` for Flutter code
4. Check Appwrite Console for errors
5. Verify `.env` configuration

**Happy coding!** 💻✨
