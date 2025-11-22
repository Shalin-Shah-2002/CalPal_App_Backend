# Code Updates and Azure Deployment - Complete Guide

---

## 🔧 Recent Database Schema Updates (Nov 22, 2025)

### Issue Fixed: Database Initialization Errors

**Problems Encountered:**
1. ❌ `column "user_id" does not exist` error on local and Render deployments
2. ❌ `trigger "update_users_updated_at" already exists` error on Render

**Root Cause:**
- Schema file (`config/schema.sql`) wasn't idempotent
- Running initialization multiple times or on existing databases would fail
- `CREATE TABLE IF NOT EXISTS` doesn't add missing columns to existing tables
- Trigger creation would fail if trigger already existed

**Solutions Applied:**

✅ **Added idempotent column creation:**
```sql
-- Ensures user_id exists on existing tables
ALTER TABLE nutrition_logs
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
```

✅ **Added idempotent trigger creation:**
```sql
-- Drop trigger if it exists before creating
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Benefits:**
- ✅ Schema can be run multiple times safely
- ✅ Works on fresh databases and existing databases
- ✅ No manual migrations needed for missing columns/triggers
- ✅ Deployments to Render/Azure succeed consistently

**Migration Recommendations for Production:**
- Always back up database before running schema updates
- Test schema changes on staging environment first
- Consider using migration tools (e.g., node-pg-migrate, Flyway) for complex databases
- Document each schema version in a migrations table

**Verified Working:**
- ✅ Local development (tested Nov 22, 2025)
- ✅ Render deployment (live at https://calpal-app-backend.onrender.com)
- ✅ Ready for Azure Container Apps deployment

---

## ❓ Will My Code Update Automatically in Azure?

**Short Answer:** **NO** - By default, code updates are **NOT automatic**.

**What Happens:**
- You change code on your computer ✏️
- Azure keeps running the **old version** 🔄
- You must **manually deploy** the update 🚀

---

## 🔄 Two Ways to Update Your Azure Deployment

### Option 1: Manual Update (What You Do Now)
### Option 2: Automatic Update (CI/CD with GitHub Actions)

---

## 📋 Option 1: Manual Update Process

Every time you change your code, you need to:

### Step 1: Make Code Changes Locally

```bash
# Example: Edit your code
nano server.js
# or
code routes/nutrition.routes.js
```

### Step 2: Test Locally

```bash
# Build new Docker image
docker build -t calorie-tracking-backend:latest .

# Run locally to test
docker run -d -p 3000:3000 --env-file .env calorie-tracking-backend:latest

# Test your changes
curl http://localhost:3000/health
```

### Step 3: Push to Azure Container Registry

```bash
# Tag for ACR
docker tag calorie-tracking-backend:latest calpalregistry.azurecr.io/calorie-tracking-backend:latest

# Push to ACR
docker push calpalregistry.azurecr.io/calorie-tracking-backend:latest
```

⏱️ **Time:** 5-10 minutes (depending on internet speed)

### Step 4: Update Azure Container App

**Option A - Using Azure CLI:**
```bash
az containerapp update \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --image calpalregistry.azurecr.io/calorie-tracking-backend:latest
```

**Option B - Using Azure Portal:**
1. Go to https://portal.azure.com
2. Navigate to your Container App
3. Click **"Containers"** (left sidebar)
4. Click **"Edit and deploy"**
5. Click **"Create"** (it will pull the latest image)

**Option C - Simple Restart:**
```bash
az containerapp restart \
  --name calorie-backend-app \
  --resource-group calorie-app-rg
```

Or in Portal: Overview → **"Restart"** button

### Step 5: Verify Update

```bash
# Test the updated app
curl https://calorie-backend-app.delightfulsky-0b892125.southeastasia.azurecontainerapps.io/health

# Check logs
az containerapp logs show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --tail 50
```

---

## 🤖 Option 2: Automatic Deployment (CI/CD)

Set this up **ONCE**, then every time you push code to GitHub, it **automatically** deploys to Azure!

### What is CI/CD?

**CI/CD** = Continuous Integration / Continuous Deployment
- **CI:** Automatically test your code when you push
- **CD:** Automatically deploy to Azure when tests pass

### How It Works

```
Your Computer          GitHub              Azure
    ↓                    ↓                   ↓
1. Edit code      →  2. Push to     →   3. Auto-deploy
2. git commit        GitHub repo         to Azure
3. git push          (GitHub Actions)    (No manual work!)
```

### Benefits

✅ **No manual steps** - Just push to GitHub  
✅ **Always up-to-date** - Latest code is always live  
✅ **Automatic testing** - Catches errors before deployment  
✅ **Version history** - Easy rollback if something breaks  
✅ **Team collaboration** - Multiple developers can deploy  

---

## 🚀 Setting Up Automatic Deployment (GitHub Actions)

### Prerequisites

- ✅ GitHub account
- ✅ Code pushed to GitHub repository
- ✅ Azure subscription

### Step 1: Create Azure Service Principal

This gives GitHub permission to deploy to your Azure account.

```bash
# Create service principal
az ad sp create-for-rbac \
  --name "github-actions-calpal" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/calorie-app-rg \
  --sdk-auth
```

**Replace `YOUR_SUBSCRIPTION_ID` with:**
```bash
az account show --query id -o tsv
```

**Output will look like:**
```json
{
  "clientId": "xxxx-xxxx-xxxx-xxxx",
  "clientSecret": "xxxx-xxxx-xxxx-xxxx",
  "subscriptionId": "xxxx-xxxx-xxxx-xxxx",
  "tenantId": "xxxx-xxxx-xxxx-xxxx",
  ...
}
```

**📋 COPY THIS ENTIRE JSON OUTPUT!**

### Step 2: Add Secret to GitHub

1. Go to your GitHub repository
2. Click **"Settings"** tab
3. Left sidebar → **"Secrets and variables"** → **"Actions"**
4. Click **"New repository secret"**
5. **Name:** `AZURE_CREDENTIALS`
6. **Value:** Paste the entire JSON from Step 1
7. Click **"Add secret"**

### Step 3: Verify GitHub Actions File Exists

The file `.github/workflows/azure-deploy.yml` already exists in your project!

**Check it:**
```bash
cat .github/workflows/azure-deploy.yml
```

This file tells GitHub how to:
1. Build your Docker image
2. Push to Azure Container Registry
3. Deploy to Azure Container Apps
4. Test the deployment

### Step 4: Push Code to GitHub

```bash
# Stage all changes
git add .

# Commit changes
git commit -m "Setup Azure deployment"

# Push to GitHub
git push origin main
```

### Step 5: Watch Automatic Deployment

1. Go to your GitHub repository
2. Click **"Actions"** tab
3. You'll see a workflow running
4. Click on it to watch progress
5. Wait 5-10 minutes for completion
6. ✅ Your code is automatically deployed!

---

## 📊 Comparison: Manual vs Automatic

| Feature | Manual Update | Automatic (CI/CD) |
|---------|---------------|-------------------|
| **Setup Time** | 0 minutes | 15 minutes (one-time) |
| **Update Time** | 10-15 minutes | 5-10 minutes |
| **Steps Per Update** | 4-5 manual steps | 0 (just git push) |
| **Risk of Errors** | High (manual mistakes) | Low (automated) |
| **Testing** | Manual | Automatic |
| **Team Work** | One person at a time | Multiple developers |
| **Rollback** | Manual | Easy (revert commit) |
| **Best For** | Solo dev, learning | Teams, production |

---

## 🎯 Recommended Workflow

### For Development (Learning)

Use **Manual Updates** while learning:
```bash
# Make changes
code server.js

# Test locally
npm start

# Deploy when ready
./update-azure.sh
```

### For Production (Real App)

Set up **Automatic Deployment**:
```bash
# Make changes
code server.js

# Test locally
npm start

# Deploy to Azure
git add .
git commit -m "Add new feature"
git push origin main

# ✅ GitHub Actions deploys automatically!
```

---

## 🔍 How to Check What's Running in Azure

### Method 1: Check Image Version

```bash
# See what's currently deployed
az containerapp show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --query properties.template.containers[0].image \
  -o tsv
```

### Method 2: Check Logs for Recent Changes

```bash
# View recent logs
az containerapp logs show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --tail 20
```

### Method 3: Check in Azure Portal

1. Go to Container App
2. **"Application"** → **"Revisions"**
3. See all deployed versions
4. Most recent = currently active

---

## 🐛 Troubleshooting Updates

### Problem 1: Changes Not Showing

**Cause:** Azure is using cached image

**Solution:**
```bash
# Force restart
az containerapp restart \
  --name calorie-backend-app \
  --resource-group calorie-app-rg

# Or use a unique tag
docker tag calorie-tracking-backend:latest calpalregistry.azurecr.io/calorie-tracking-backend:v1.1
docker push calpalregistry.azurecr.io/calorie-tracking-backend:v1.1

# Update container app to use new tag
az containerapp update \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --image calpalregistry.azurecr.io/calorie-tracking-backend:v1.1
```

### Problem 2: GitHub Actions Failing

**Check:**
1. GitHub → Actions → Click failed workflow
2. Read error messages
3. Common issues:
   - Azure credentials expired
   - Wrong resource names
   - Syntax error in workflow file

**Fix:**
- Re-create service principal (Step 1 above)
- Update `AZURE_CREDENTIALS` secret in GitHub

### Problem 3: Deployment Takes Too Long

**Speed it up:**
- Use faster internet connection
- Deploy during off-peak hours
- Use Azure Cloud Shell (built into Portal)

---

## 📱 Quick Update Script

I've created `update-azure.sh` for you! Just run:

```bash
./update-azure.sh
```

**What it does:**
1. ✅ Builds new Docker image
2. ✅ Pushes to ACR
3. ✅ Updates Container App
4. ✅ Shows new URL

**Example Output:**
```
🏗️  Building Docker image locally...
✅ Local image built

⬆️  Pushing image to ACR...
✅ Image pushed to ACR

🔄 Updating Container App...
✅ Container App updated

🎉 Update Successful!
Application URL: https://calorie-backend-app...
```

---

## 🎓 Learning Path

### Week 1: Manual Updates
- Make small changes
- Practice manual deployment
- Understand each step

### Week 2: Automated Testing
- Add tests to your code
- Run tests before deploying

### Week 3: CI/CD Setup
- Set up GitHub Actions
- Practice automatic deployment

### Week 4: Advanced Features
- Multiple environments (dev, staging, prod)
- Blue-green deployment
- Automatic rollback

---

## 💡 Pro Tips

### Tip 1: Use Git Tags for Versions

```bash
# Tag your releases
git tag -a v1.0.0 -m "First production release"
git push origin v1.0.0

# Use in Docker
docker tag calorie-tracking-backend:latest calpalregistry.azurecr.io/calorie-tracking-backend:v1.0.0
```

### Tip 2: Keep a Deployment Log

Create `CHANGELOG.md`:
```markdown
## v1.0.1 - 2025-11-08
- Fixed bug in nutrition calculation
- Added new endpoint /api/stats
- Deployed at: 10:30 AM

## v1.0.0 - 2025-11-06
- Initial release
- Deployed to Azure
```

### Tip 3: Test Before Deploying

```bash
# Always test locally first
docker build -t test .
docker run -p 3000:3000 --env-file .env test

# Run your tests
curl http://localhost:3000/health
curl http://localhost:3000/save

# Only deploy if tests pass
```

### Tip 4: Use Environment Variables for Versions

In your code:
```javascript
console.log(`App Version: ${process.env.APP_VERSION || '1.0.0'}`);
```

In Azure Portal:
- Add environment variable: `APP_VERSION=1.0.1`

### Tip 5: Monitor After Deployment

```bash
# Watch logs for 2 minutes after deploy
az containerapp logs show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --follow
```

Press `Ctrl+C` to stop watching.

---

## 📚 Related Documentation

- **Manual Deployment:** See `AZURE_MANUAL_DEPLOYMENT.md`
- **GitHub Actions Setup:** See `GITHUB_ACTIONS_SETUP.md`
- **Quick Commands:** See `AZURE_QUICKSTART.md`
- **Update Script:** Run `./update-azure.sh`

---

## ✅ Quick Reference Commands

### Manual Update (5 Steps)

```bash
# 1. Build
docker build -t calorie-tracking-backend:latest .

# 2. Tag
docker tag calorie-tracking-backend:latest calpalregistry.azurecr.io/calorie-tracking-backend:latest

# 3. Push
docker push calpalregistry.azurecr.io/calorie-tracking-backend:latest

# 4. Update
az containerapp update \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --image calpalregistry.azurecr.io/calorie-tracking-backend:latest

# 5. Verify
curl https://calorie-backend-app.delightfulsky-0b892125.southeastasia.azurecontainerapps.io/health
```

### Automatic Update (Git)

```bash
# 1. Make changes
code server.js

# 2. Commit
git add .
git commit -m "Your changes"

# 3. Push (triggers auto-deploy)
git push origin main

# 4. Watch on GitHub
# Go to: github.com/YOUR-REPO/actions
```

### Quick Update Script

```bash
./update-azure.sh
```

---

## 🎯 Decision Guide

**Choose Manual Updates if:**
- ✅ You're learning Azure
- ✅ You deploy rarely (once a week or less)
- ✅ Working alone
- ✅ Want full control over each step

**Choose Automatic Updates if:**
- ✅ You deploy frequently (multiple times per day)
- ✅ Working in a team
- ✅ Want to focus on coding, not deployment
- ✅ Need consistent deployment process
- ✅ Building a production application

---

## 🚀 Next Steps

1. **Try Manual Update Once:**
   - Make a small change (e.g., add console.log)
   - Run `./update-azure.sh`
   - Verify change in Azure

2. **Set Up Automatic Deployment:**
   - Follow `GITHUB_ACTIONS_SETUP.md`
   - Push to GitHub
   - Watch automatic deployment

3. **Choose Your Workflow:**
   - Stick with manual for learning
   - Switch to automatic for production

---

## 💬 Summary

| Question | Answer |
|----------|--------|
| **Do updates happen automatically?** | No, not by default |
| **How do I update manually?** | Build → Push → Update (or use `./update-azure.sh`) |
| **How do I make it automatic?** | Set up GitHub Actions CI/CD |
| **How long does manual update take?** | 10-15 minutes |
| **How long does automatic update take?** | 5-10 minutes (after setup) |
| **Which should I use?** | Manual for learning, Automatic for production |

---

**Remember:** Azure doesn't "watch" your code. You must tell it when to update, either manually or automatically via CI/CD!

---

**Want to try an update right now?**

1. Edit any file (e.g., add a comment in `server.js`)
2. Run: `./update-azure.sh`
3. Wait 5 minutes
4. Check if change is live!
