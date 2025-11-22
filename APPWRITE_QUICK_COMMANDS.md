# ⚡ Appwrite Setup - Quick Commands

## 🎯 Step-by-Step Commands

### **1. Generate JWT Secret**
```bash
# Run this command to generate a secure random secret:
openssl rand -base64 64

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Copy the output and paste it as JWT_SECRET in .env file
```

### **2. Update .env File**
```bash
# Open .env file in VS Code
code .env

# Or use nano
nano .env
```

**Add these lines to your .env:**
```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=<paste_from_appwrite_console>
APPWRITE_API_KEY=<paste_from_appwrite_console>

# JWT Configuration
JWT_SECRET=<paste_generated_secret>
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=*
```

### **3. Install Dependencies** (if needed)
```bash
npm install node-appwrite jsonwebtoken bcryptjs
```

### **4. Start Server**
```bash
npm start
```

### **5. Test Health Endpoint**
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "Connected",
  "appwrite": "Configured"
}
```

---

## 🌐 Appwrite Console URLs

### **Main Console**
```
https://cloud.appwrite.io/console
```

### **Get Project ID**
```
Console → Your Project → Settings → Project ID
```

### **Create API Key**
```
Console → Your Project → Settings → API Keys → Create API Key
```

Required scopes:
- ✅ `sessions.read`
- ✅ `users.read`

### **Enable Authentication**
```
Console → Your Project → Auth → Settings
```

Enable:
- ✅ Email/Password
- ✅ Google OAuth (optional)

### **Add Platform**
```
Console → Your Project → Settings → Platforms → Add Platform
```

---

## 📋 Configuration Checklist

```
□ 1. Created Appwrite account at cloud.appwrite.io
□ 2. Created new project "CalPal"
□ 3. Copied Project ID from Settings
□ 4. Created API Key with scopes: sessions.read, users.read
□ 5. Copied API Key (shown only once!)
□ 6. Generated JWT_SECRET using openssl command
□ 7. Updated .env file with all values
□ 8. Enabled Email/Password authentication
□ 9. (Optional) Enabled Google OAuth
□ 10. Added Flutter platform
□ 11. Ran: npm start
□ 12. Tested: curl http://localhost:3000/health
```

---

## 🔍 Verify Your Configuration

### **Check .env File**
```bash
cat .env | grep -E "APPWRITE|JWT"
```

Should show:
```
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=67abc...
APPWRITE_API_KEY=standard_abc...
JWT_SECRET=Kx8fJ2nP9mL4...
JWT_EXPIRES_IN=7d
```

### **Test Server Start**
```bash
npm start
```

Look for these messages:
```
✅ Connected to PostgreSQL database
🔐 Appwrite client initialized
🚀 Node.js server running on http://localhost:3000
```

### **Test API Endpoints**
```bash
# Health check
curl http://localhost:3000/health

# CORS check
curl -I http://localhost:3000/auth/verify
```

---

## 🆘 Quick Troubleshooting

### **Problem: "JWT_SECRET is not defined"**
```bash
# Solution: Generate and add to .env
openssl rand -base64 64

# Then add to .env:
# JWT_SECRET=<generated_secret>
```

### **Problem: "Cannot find module 'node-appwrite'"**
```bash
# Solution: Install dependencies
npm install node-appwrite jsonwebtoken bcryptjs
```

### **Problem: Server won't start**
```bash
# Check for syntax errors
npm run lint

# Check if port 3000 is in use
lsof -i :3000

# Try different port in .env
echo "PORT=3001" >> .env
```

### **Problem: "Invalid Appwrite credentials"**
```bash
# Solution: Verify in Appwrite Console
# 1. Check Project ID matches
# 2. Check API Key is correct
# 3. Make sure API Key has required scopes:
#    - sessions.read
#    - users.read
```

---

## 🎯 What to Get from Appwrite Console

### **Project ID**
Location: `Console → CalPal → Settings`

Example format:
```
67abc123def456789
```

Copy and paste as:
```env
APPWRITE_PROJECT_ID=67abc123def456789
```

### **API Key**
Location: `Console → CalPal → Settings → API Keys`

Example format:
```
standard_abc123def456ghi789jkl012mno345pqr678stu901
```

⚠️ **Shown only once! Copy immediately!**

Copy and paste as:
```env
APPWRITE_API_KEY=standard_abc123def456ghi789jkl012mno345pqr678stu901
```

### **Scopes for API Key**
When creating API key, check these:
- ✅ Auth → `sessions.read`
- ✅ Users → `users.read`

---

## 📱 Next: Flutter Integration

After backend is configured:

```bash
# View Flutter integration guide
cat FLUTTER_INTEGRATION.md

# Or open in VS Code
code FLUTTER_INTEGRATION.md
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `APPWRITE_SETUP_VISUAL.md` | **Visual step-by-step guide** |
| `APPWRITE_SETUP.md` | Original setup documentation |
| `AUTHENTICATION_EXPLAINED.md` | How auth works + why Appwrite |
| `FLUTTER_INTEGRATION.md` | Flutter code examples |
| `QUICK_REFERENCE.md` | API reference |

---

## ⚡ TL;DR - Minimum Steps

```bash
# 1. Go to cloud.appwrite.io and create account
# 2. Create project "CalPal"
# 3. Get Project ID from Settings
# 4. Create API Key with sessions.read + users.read
# 5. Generate JWT secret:
openssl rand -base64 64

# 6. Update .env with values from steps 3, 4, 5
# 7. Start server:
npm start

# 8. Test:
curl http://localhost:3000/health
```

**That's it!** ✅

---

**Need detailed instructions?** → Open `APPWRITE_SETUP_VISUAL.md`
