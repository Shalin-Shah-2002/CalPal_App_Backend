# Azure Manual Deployment - Quick Visual Checklist

## 🎯 Overview

This is a quick reference checklist for deploying to Azure Portal manually. For detailed instructions, see `AZURE_MANUAL_DEPLOYMENT.md`.

---

## ✅ Deployment Checklist

### Phase 1: Setup (10 minutes)
- [ ] Login to https://portal.azure.com
- [ ] Navigate to Resource Groups
- [ ] Create resource group: `calorie-app-rg`
- [ ] Select region: Southeast Asia
- [ ] Verify resource group is created

### Phase 2: Container Registry (15 minutes)
- [ ] Create Container Registry
  - [ ] Name: `calpalregistry`
  - [ ] SKU: Basic
  - [ ] Location: Southeast Asia
- [ ] Enable Admin User in Access Keys
- [ ] Copy ACR credentials (username & password)
- [ ] Open Terminal/Command Prompt on your computer
- [ ] Login: `docker login calpalregistry.azurecr.io`
- [ ] Tag image: `docker tag calorie-tracking-backend:latest calpalregistry.azurecr.io/calorie-tracking-backend:latest`
- [ ] Push image: `docker push calpalregistry.azurecr.io/calorie-tracking-backend:latest`
- [ ] Verify image in Portal: Repositories → calorie-tracking-backend → latest

### Phase 3: Container App (20 minutes)
- [ ] Create Container App
- [ ] Create new environment: `calorie-app-env`
- [ ] Configure container:
  - [ ] Name: `calorie-backend-app`
  - [ ] Image source: Azure Container Registry
  - [ ] Registry: calpalregistry
  - [ ] Image: calorie-tracking-backend
  - [ ] Tag: latest
  - [ ] CPU: 0.5 cores
  - [ ] Memory: 1 GB
- [ ] Add environment variables:
  - [ ] `DATABASE_URL` (Secret)
  - [ ] `GEMINI_API_KEY` (Secret)
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000`
- [ ] Configure Ingress:
  - [ ] Enabled: Yes
  - [ ] Traffic: Accepting from anywhere
  - [ ] Target port: 3000
- [ ] Configure Scaling:
  - [ ] Min replicas: 1
  - [ ] Max replicas: 3
- [ ] Review and Create
- [ ] Wait for deployment (5-10 minutes)

### Phase 4: Verification (5 minutes)
- [ ] Get Application URL from Overview page
- [ ] Test endpoints:
  - [ ] `/health` - Should return `{"status":"OK"}`
  - [ ] `/save` - Should return nutrition logs
  - [ ] `/nutrition` (POST) - Should return nutrition data
- [ ] Check logs in Log Stream
- [ ] Verify database connection in logs

---

## 📍 Navigation Quick Reference

### Finding Resources in Azure Portal

```
Home → Resource Groups → calorie-app-rg
├── Container Registry (calpalregistry)
│   ├── Access Keys ← Enable admin user
│   └── Repositories ← View Docker images
│
└── Container App (calorie-backend-app)
    ├── Overview ← Get Application URL
    ├── Containers ← View/Edit config
    ├── Ingress ← Configure access
    ├── Scale ← Configure replicas
    ├── Environment variables ← Manage secrets
    └── Log stream ← View real-time logs
```

---

## 🔑 Key Information to Save

### ACR Credentials
```
Login Server: calpalregistry.azurecr.io
Username: calpalregistry
Password: [copy from Portal → Access Keys]
```

### Environment Variables
```
DATABASE_URL=postgresql://...
GEMINI_API_KEY=AIzaSy...
NODE_ENV=production
PORT=3000
```

### Application URL
```
https://calorie-backend-app.RANDOM.southeastasia.azurecontainerapps.io
```

---

## 🎨 Visual Flow

```
┌──────────────────────────────────────────────┐
│  Step 1: Create Resource Group               │
│  Portal → Resource Groups → Create           │
│  Name: calorie-app-rg                       │
│  Region: Southeast Asia                      │
└──────────────────┬───────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  Step 2: Create Container Registry           │
│  Portal → Container Registry → Create        │
│  Name: calpalregistry                        │
│  Enable Admin User                           │
└──────────────────┬───────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  Step 3: Push Docker Image (from computer)   │
│  docker login calpalregistry.azurecr.io     │
│  docker tag ... calpalregistry.azurecr.io/..│
│  docker push calpalregistry.azurecr.io/...  │
└──────────────────┬───────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  Step 4: Create Container App                │
│  Portal → Container Apps → Create            │
│  • Select ACR image                          │
│  • Add environment variables                 │
│  • Enable ingress on port 3000              │
│  • Set scaling 1-3 replicas                 │
└──────────────────┬───────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│  Step 5: Test Application                    │
│  • Copy Application URL                      │
│  • Test /health endpoint                     │
│  • View logs                                 │
│  • Verify functionality                      │
└──────────────────────────────────────────────┘
```

---

## 🖱️ Click-by-Click for Container App Creation

### Page 1: Basics
1. **Subscription:** Azure for Students ✓
2. **Resource group:** calorie-app-rg ✓
3. **Container app name:** calorie-backend-app ✓
4. **Region:** Southeast Asia ✓
5. **Container Apps Environment:** Click "Create new"
   - **Name:** calorie-app-env
   - Click **OK**
6. Click **Next: Container →**

### Page 2: Container
1. **Use quickstart image:** Uncheck ✗
2. **Name:** calorie-backend-app
3. **Image source:** Azure Container Registry ⚪
4. **Registry:** calpalregistry (dropdown)
5. **Image:** calorie-tracking-backend (dropdown)
6. **Image tag:** latest (dropdown)
7. **CPU and Memory:** 0.5 CPU, 1 Gi memory
8. **Environment variables section:**
   - Click **+ Add**
   - Name: `DATABASE_URL` | Source: Manual entry | Value: [paste] | Secret: ☑
   - Click **+ Add**
   - Name: `GEMINI_API_KEY` | Source: Manual entry | Value: [paste] | Secret: ☑
   - Click **+ Add**
   - Name: `NODE_ENV` | Source: Manual entry | Value: `production` | Secret: ☐
   - Click **+ Add**
   - Name: `PORT` | Source: Manual entry | Value: `3000` | Secret: ☐
9. Click **Next: Ingress →**

### Page 3: Ingress
1. **Ingress:** Enabled ⚪
2. **Ingress traffic:** Accepting traffic from anywhere ⚪
3. **Ingress type:** HTTP ⚪
4. **Target port:** 3000
5. Click **Next: Scaling →** (or skip tags)

### Page 4: Scaling
1. **Min replicas:** 1
2. **Max replicas:** 3
3. Click **Review + create →**

### Page 5: Review
1. Verify all settings
2. Click **Create** button
3. Wait 5-10 minutes ⏱️
4. Click **Go to resource**

---

## 🔍 Common Portal Locations

| What You Need | Where to Find It |
|---------------|------------------|
| **Application URL** | Container App → Overview → Right side panel |
| **Container Logs** | Container App → Monitoring → Log stream |
| **Environment Variables** | Container App → Settings → Containers → Edit and deploy |
| **ACR Password** | Container Registry → Settings → Access keys → Click 👁️ |
| **Cost Information** | Cost Management + Billing → Cost analysis |
| **Scaling Settings** | Container App → Application → Scale |
| **Image Versions** | Container Registry → Services → Repositories |
| **Ingress Settings** | Container App → Settings → Ingress |

---

## ⚡ Quick Actions

### Restart Application
```
Container App → Overview → Top bar → Restart button
```

### Scale to Zero (Pause)
```
Container App → Application → Scale
Set: Min replicas = 0, Max replicas = 0
Save
```

### Update Environment Variable
```
Container App → Settings → Containers
Edit and deploy → Edit variables → Create
```

### View Real-time Logs
```
Container App → Monitoring → Log stream
Toggle: Console logs, System logs, Application logs
```

### Check Costs
```
Home → Cost Management + Billing → Cost analysis
Filter: Resource group = calorie-app-rg
```

---

## 🆘 Troubleshooting Quick Fixes

| Problem | Quick Fix Location |
|---------|-------------------|
| **App not starting** | Log stream → Check error messages |
| **Can't access URL** | Ingress → Verify "Enabled" and port 3000 |
| **Old code running** | Overview → Restart button |
| **High costs** | Scale → Set min replicas to 0 |
| **Environment variable wrong** | Containers → Edit and deploy → Fix variable |
| **Image not found** | Verify image pushed: ACR → Repositories |

---

## 📱 Mobile Tip

You can manage Azure resources from your phone!

**Download Azure Mobile App:**
- iOS: https://apps.apple.com/app/microsoft-azure/id1219013620
- Android: https://play.google.com/store/apps/details?id=com.microsoft.azure

**Features:**
- View resources
- Check costs
- View logs
- Restart apps
- Get alerts

---

## 💰 Cost Control

### Daily Checks
```
1. Home → Cost Management
2. Check: Today's cost
3. Review: Past 7 days trend
4. Action: Scale down if needed
```

### Weekly Tasks
```
1. Review usage patterns
2. Scale to zero during off-hours
3. Delete unused resources
4. Check for unused images in ACR
```

### Set Budget Alert
```
1. Cost Management → Budgets → Create
2. Amount: $20/month
3. Alert at: 80% ($16)
4. Email: Your email
```

---

## 🎓 Learning Path

After deployment, explore:

1. **Week 1:** Basic monitoring and logs
2. **Week 2:** Scaling and performance
3. **Week 3:** Security and secrets
4. **Week 4:** CI/CD automation
5. **Week 5:** Custom domains
6. **Week 6:** Application Insights

---

## 📞 Support Contacts

| Need Help With | Resource |
|----------------|----------|
| **Azure Portal** | Click "?" icon (top-right) |
| **Billing Questions** | Cost Management + Billing → Support |
| **Technical Issues** | Support + troubleshooting (search in portal) |
| **Community Help** | https://learn.microsoft.com/answers/ |
| **Documentation** | https://learn.microsoft.com/azure/ |

---

## ✨ Pro Tips

1. **Bookmark Your Resource Group** - Right-click → Add to favorites
2. **Use Search** - Press "/" to search anything in Azure Portal
3. **Pin Resources** - Pin frequently used resources to dashboard
4. **Enable Dark Mode** - Settings → Appearance → Dark theme
5. **Keyboard Shortcuts** - Press "?" to see all shortcuts
6. **Cloud Shell** - Click ">_" icon for built-in terminal (if needed later)

---

**Ready to Deploy? Open:** `AZURE_MANUAL_DEPLOYMENT.md` for detailed step-by-step instructions!

**Current Status:** ✅ You already have app deployed at:
```
https://calorie-backend-app.delightfulsky-0b892125.southeastasia.azurecontainerapps.io
```
