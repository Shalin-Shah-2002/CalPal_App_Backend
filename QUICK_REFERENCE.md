# 🎯 Quick Reference Card

## 🚀 Start Server
```bash
npm start
```

## 🔐 Environment Variables Required
```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=<your_project_id>
APPWRITE_API_KEY=<your_api_key>
JWT_SECRET=<random_64_char_string>
DATABASE_URL=<your_postgres_url>
```

## 📡 API Endpoints

### Authentication
```bash
# Verify Appwrite JWT → Get Backend JWT
POST /auth/verify
Body: { "appwriteJwt": "..." }

# Get current user
GET /auth/me
Header: Authorization: Bearer <token>

# Refresh token
POST /auth/refresh
Header: Authorization: Bearer <token>

# Logout
DELETE /auth/logout
Header: Authorization: Bearer <token>
```

### Health Check
```bash
GET /health
```

## 🔑 Generate JWT Secret
```bash
openssl rand -base64 64
```

## 🧪 Test API
```bash
# Health check
curl http://localhost:3000/health

# Verify (need real JWT from Appwrite)
curl -X POST http://localhost:3000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"appwriteJwt": "YOUR_JWT"}'

# Get user (need backend JWT)
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_BACKEND_JWT"
```

## 🛡️ Protecting Routes
```javascript
import { authenticateToken } from './middleware/auth.js';

router.get('/protected', authenticateToken, (req, res) => {
  // req.user contains: userId, appwriteId, email, name
  res.json({ user: req.user });
});
```

## 📱 Flutter Integration
```dart
// 1. Login with Appwrite
final jwt = await account.createJWT();

// 2. Verify with backend
final response = await http.post(
  Uri.parse('http://localhost:3000/auth/verify'),
  body: jsonEncode({'appwriteJwt': jwt.jwt}),
);

// 3. Store backend token
final backendToken = jsonDecode(response.body)['token'];
await secureStorage.write(key: 'token', value: backendToken);

// 4. Use token for API calls
await http.get(
  Uri.parse('http://localhost:3000/auth/me'),
  headers: {'Authorization': 'Bearer $backendToken'},
);
```

## 🗄️ Database Schema
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  appwrite_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Nutrition logs (linked to users)
ALTER TABLE nutrition_logs 
ADD COLUMN user_id INTEGER REFERENCES users(id);
```

## 📚 Documentation
- `AUTH_GUIDE.md` - Complete authentication guide
- `FLUTTER_INTEGRATION.md` - Flutter code examples
- `APPWRITE_SETUP.md` - Setup instructions
- `ARCHITECTURE.md` - System architecture
- `IMPLEMENTATION_COMPLETE.md` - Summary

## 🔧 Appwrite Setup Checklist
- [ ] Create account at https://cloud.appwrite.io
- [ ] Create project
- [ ] Get Project ID
- [ ] Create API Key (scopes: users.read, sessions.read)
- [ ] Enable Email/Password auth
- [ ] Enable Google OAuth
- [ ] Add Flutter platform

## ⚠️ Common Errors

### "JWT_SECRET is not defined"
Add `JWT_SECRET=...` to `.env`

### "Invalid Appwrite session"
- Check Project ID matches
- Check API Key is correct
- JWT might be expired (15 min)

### "CORS error"
Set `CORS_ORIGIN=*` in `.env`

## 🎯 Next Steps
1. Configure Appwrite (5 min)
2. Update `.env` (2 min)
3. Test backend (3 min)
4. Integrate Flutter app

---

**Need help? Check the documentation files above!** 📖
