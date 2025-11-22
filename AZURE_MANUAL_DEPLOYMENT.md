# Azure Manual Deployment Guide - Using Azure Portal (No Commands)

## 📖 Complete Step-by-Step Guide for Manual Deployment

This guide will walk you through deploying your Calorie Tracking Backend to Azure using only the Azure Portal web interface - **NO command-line required!**

---

## 🎯 What You'll Deploy

- **Azure Container Registry (ACR)** - Store your Docker image
- **Azure Container Apps** - Run your application
- **Environment Variables** - Configure database and API keys
- **HTTPS URL** - Public secure endpoint

**Estimated Time:** 30-45 minutes  
**Cost:** ~$10-15/month (may be free with Azure for Students)

---

## 📋 Prerequisites

Before starting, make sure you have:

1. ✅ Azure Account - [Sign up here](https://azure.microsoft.com/free/students/)
2. ✅ Docker Desktop running on your computer
3. ✅ Your Docker image built locally (`calorie-tracking-backend:latest`)
4. ✅ Database URL (your PostgreSQL connection string)
5. ✅ Gemini API Key

---

## 🚀 Part 1: Login to Azure Portal

### Step 1.1: Access Azure Portal

1. Open your web browser
2. Go to: **https://portal.azure.com**
3. Sign in with your Azure account
4. You'll see the Azure Portal home page

**What you'll see:**
- Navigation menu on the left
- Search bar at the top
- Dashboard in the center
- Resource groups, subscriptions, and services

---

## 📦 Part 2: Create Resource Group

A Resource Group is a container that holds all your Azure resources.

### Step 2.1: Navigate to Resource Groups

1. Click the **☰ hamburger menu** (three horizontal lines) in the top-left
2. Click on **"Resource groups"**
3. Click the **"+ Create"** button at the top

### Step 2.2: Configure Resource Group

**Basics Tab:**

| Field | Value |
|-------|-------|
| **Subscription** | Select "Azure for Students" |
| **Resource group name** | `calorie-app-rg` |
| **Region** | Select `Southeast Asia` (or any allowed region) |

**Important Regions for Azure for Students:**
- Southeast Asia (Singapore)
- East Asia (Hong Kong)
- Korea Central
- UAE North
- Malaysia West

### Step 2.3: Create Resource Group

1. Click **"Review + create"** at the bottom
2. Wait for validation (green checkmark)
3. Click **"Create"**
4. Wait 5-10 seconds for creation
5. Click **"Go to resource group"**

**✅ Checkpoint:** You should see an empty resource group with 0 resources.

---

## 🐳 Part 3: Create Azure Container Registry (ACR)

This is where you'll store your Docker image.

### Step 3.1: Navigate to Create ACR

**Option A - From Resource Group:**
1. In your resource group, click **"+ Create"**
2. In the search box, type: `Container Registry`
3. Select **"Container Registry"** by Microsoft
4. Click **"Create"**

**Option B - From Azure Portal:**
1. Click the **search bar** at the top
2. Type: `Container Registry`
3. Click **"Container registries"** under Services
4. Click **"+ Create"**

### Step 3.2: Configure Container Registry

**Basics Tab:**

| Field | Value | Notes |
|-------|-------|-------|
| **Subscription** | Azure for Students | |
| **Resource group** | calorie-app-rg | Select from dropdown |
| **Registry name** | `calpalregistry` | Must be unique, lowercase only |
| **Location** | Southeast Asia | Same as resource group |
| **SKU** | Basic | Most cost-effective option |

**Networking Tab:**
- Leave all defaults (Public endpoint enabled)

**Encryption Tab:**
- Leave all defaults (Microsoft-managed keys)

**Tags Tab:**
- Optional: Add tags like:
  - Name: `Project`, Value: `CalPal`
  - Name: `Environment`, Value: `Production`

### Step 3.3: Create ACR

1. Click **"Review + create"**
2. Review the settings
3. Click **"Create"**
4. Wait 2-3 minutes for deployment
5. Click **"Go to resource"**

**✅ Checkpoint:** You should see your Container Registry overview page.

### Step 3.4: Enable Admin User

This allows you to push Docker images.

1. In the ACR page, find the left sidebar
2. Under **"Settings"**, click **"Access keys"**
3. Toggle **"Admin user"** to **Enabled**
4. You'll see:
   - **Username:** `calpalregistry`
   - **password:** (click eye icon to reveal)
   - **password2:** (backup password)

**📝 IMPORTANT:** Copy and save these credentials somewhere safe! You'll need them.

```
ACR Login Server: calpalregistry.azurecr.io
Username: calpalregistry
Password: [copy from portal]
```

---

## 🏗️ Part 4: Push Docker Image to ACR

Now we'll upload your local Docker image to Azure.

### Step 4.1: Login to ACR from Your Computer

**Open Terminal/Command Prompt:**

**On macOS/Linux:**
```bash
docker login calpalregistry.azurecr.io
```

**On Windows (PowerShell):**
```powershell
docker login calpalregistry.azurecr.io
```

**When prompted:**
- Username: `calpalregistry`
- Password: [paste password from Azure Portal]

**Expected Output:**
```
Login Succeeded
```

### Step 4.2: Tag Your Local Image

This prepares your image for Azure.

```bash
docker tag calorie-tracking-backend:latest calpalregistry.azurecr.io/calorie-tracking-backend:latest
```

**What this does:**
- Takes your local image: `calorie-tracking-backend:latest`
- Adds Azure registry prefix: `calpalregistry.azurecr.io/`
- Creates a new tag pointing to the same image

### Step 4.3: Push Image to ACR

```bash
docker push calpalregistry.azurecr.io/calorie-tracking-backend:latest
```

**This will take 5-10 minutes** depending on your internet speed.

**Expected Output:**
```
The push refers to repository [calpalregistry.azurecr.io/calorie-tracking-backend]
122e24dc9539: Pushed
96de5d2480d1: Pushed
...
latest: digest: sha256:abc123... size: 3032
```

### Step 4.4: Verify Image Upload

**In Azure Portal:**
1. Go back to your Container Registry
2. In left sidebar, under **"Services"**, click **"Repositories"**
3. You should see: `calorie-tracking-backend`
4. Click on it
5. You should see tag: `latest`
6. Click on `latest` to see image details

**✅ Checkpoint:** Your Docker image is now stored in Azure!

---

## 🌍 Part 5: Create Container Apps Environment

This is the infrastructure that will run your containers.

### Step 5.1: Navigate to Container Apps

1. In the Azure Portal search bar (top), type: `Container Apps`
2. Click **"Container Apps"** under Services
3. Click **"+ Create"**

**OR from Resource Group:**
1. Go to your resource group `calorie-app-rg`
2. Click **"+ Create"**
3. Search for: `Container App`
4. Select **"Container App"** by Microsoft
5. Click **"Create"**

### Step 5.2: Configure Container App - Basics

**Project Details:**

| Field | Value |
|-------|-------|
| **Subscription** | Azure for Students |
| **Resource group** | calorie-app-rg |
| **Container app name** | `calorie-backend-app` |
| **Region** | Southeast Asia |

**Container Apps Environment:**

Since you don't have one yet, we'll create it:

1. Under "Container Apps Environment", click **"Create new"**
2. **Name:** `calorie-app-env`
3. **Zone redundancy:** Disabled (to save costs)
4. Click **"Create"**

**✅ Note:** Creating the environment takes 2-3 minutes. Wait for the green checkmark.

### Step 5.3: Configure Container App - Container

**Container Details:**

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `calorie-backend-app` | Container name |
| **Image source** | Azure Container Registry | Select this option |
| **Registry** | calpalregistry | From dropdown |
| **Image** | calorie-tracking-backend | From dropdown |
| **Image tag** | latest | From dropdown |
| **CPU and Memory** | 0.5 CPU cores, 1 Gi memory | Keep defaults |

**Authentication:**
- **Use managed identity** should be OFF
- The system will use the ACR credentials automatically

**Environment Variables:**

Click **"+ Add"** to add each variable:

| Name | Value | Type |
|------|-------|------|
| `DATABASE_URL` | postgresql://calorie_tracker_db... | Secret (check box) |
| `GEMINI_API_KEY` | AIzaSy... | Secret (check box) |
| `NODE_ENV` | production | Regular |
| `PORT` | 3000 | Regular |

**⚠️ Important:** For `DATABASE_URL` and `GEMINI_API_KEY`:
- Check the **"Secret"** checkbox to hide sensitive values
- Paste your actual values from your `.env` file

### Step 5.4: Configure Container App - Ingress

**Ingress Settings:**

| Field | Value | Notes |
|-------|-------|-------|
| **Ingress** | Enabled | Turn ON |
| **Ingress traffic** | Accepting traffic from anywhere | Select this option |
| **Ingress type** | HTTP | Select |
| **Target port** | 3000 | Your app port |
| **Transport** | Auto | Default |

**Client certificate mode:** Not configured (leave blank)

**Session affinity:** Disabled (default)

### Step 5.5: Configure Container App - Scaling

**Scale Rule Settings:**

| Field | Value | Notes |
|-------|-------|-------|
| **Min replicas** | 1 | Always running |
| **Max replicas** | 3 | Scale up to 3 instances |

**HTTP Scaling (Optional):**
You can leave this empty for now. It will use default auto-scaling.

### Step 5.6: Configure Container App - Tags (Optional)

Add tags to organize resources:

| Name | Value |
|------|-------|
| Environment | Production |
| Project | CalPal |
| Owner | Your Name |

### Step 5.7: Review and Create

1. Click **"Review + create"** at the bottom
2. Azure will validate your configuration
3. Review all settings:
   - ✅ Resource group: calorie-app-rg
   - ✅ Region: Southeast Asia
   - ✅ Container image: calpalregistry.azurecr.io/calorie-tracking-backend:latest
   - ✅ Environment variables: 4 variables configured
   - ✅ Ingress: Enabled on port 3000
4. Click **"Create"**

**⏱️ Deployment Time:** 5-10 minutes

You'll see:
- "Deployment is in progress..."
- Multiple resources being created
- Progress bars

**Wait for:** "Your deployment is complete" (green checkmark)

---

## 🎉 Part 6: Access Your Application

### Step 6.1: Get Application URL

After deployment completes:

1. Click **"Go to resource"**
2. You'll see the Container App overview page
3. Look for **"Application Url"** on the right side
4. The URL will look like:
   ```
   https://calorie-backend-app.RANDOM.southeastasia.azurecontainerapps.io
   ```
5. **Click on the URL** to open your app

**Or find it manually:**
1. Go to your Container App page
2. In the left sidebar, click **"Overview"**
3. Under **"Essentials"**, find **"Application Url"**
4. Click the **copy icon** to copy the URL

### Step 6.2: Test Your Application

**In your web browser:**

**Test 1: Health Check**
```
https://YOUR-APP-URL/health
```
Expected: `{"status":"OK","message":"Server is running"}`

**Test 2: Get Saved Logs**
```
https://YOUR-APP-URL/save
```
Expected: JSON array with nutrition logs

**Test 3: Nutrition API (using browser's developer console or Postman)**

Using **Postman** or **Thunder Client**:
- Method: POST
- URL: `https://YOUR-APP-URL/nutrition`
- Headers: `Content-Type: application/json`
- Body:
  ```json
  {
    "food": "apple"
  }
  ```

Expected: Nutrition data for apple

---

## 📊 Part 7: Monitor Your Application

### Step 7.1: View Application Logs

1. In your Container App page
2. Left sidebar → **"Monitoring"** section
3. Click **"Log stream"**
4. You'll see **real-time logs** from your application
5. Look for:
   - ✅ "Node.js server running on http://localhost:3000"
   - ✅ "Connected to PostgreSQL database"
   - ✅ "Database tables initialized successfully"

### Step 7.2: View Metrics

1. In your Container App page
2. Left sidebar → **"Monitoring"** section
3. Click **"Metrics"**
4. You can view:
   - **CPU Usage**
   - **Memory Usage**
   - **Request Count**
   - **Response Time**

**Add a Metric:**
1. Click **"+ New chart"**
2. **Metric:** Select "Requests"
3. **Aggregation:** Sum
4. Click **"Apply"**

### Step 7.3: View Revisions

1. In your Container App page
2. Left sidebar → **"Application"** section
3. Click **"Revisions"**
4. You'll see all deployed versions
5. Current active revision is marked with **"Active"**

---

## ⚙️ Part 8: Manage Your Application

### Step 8.1: Update Environment Variables

If you need to change environment variables:

1. Go to your Container App
2. Left sidebar → **"Settings"** → **"Containers"**
3. Find **"Environment variables"** section
4. Click **"Edit and deploy"**
5. Make changes to variables
6. Click **"Create"** to deploy new revision

**OR using Secrets:**
1. Left sidebar → **"Settings"** → **"Secrets"**
2. Click **"+ Add"**
3. Add new secret
4. Go back to Containers → Edit → Reference the new secret

### Step 8.2: Scale Your Application

**Manual Scaling:**
1. Go to your Container App
2. Left sidebar → **"Application"** → **"Scale"**
3. Change **"Min replicas"** and **"Max replicas"**
4. Click **"Save"**

**To scale to zero (pause app):**
- Set Min replicas: 0
- Set Max replicas: 0
- App will stop running (saves money)

**To resume:**
- Set Min replicas: 1
- Set Max replicas: 3

### Step 8.3: View Resource Costs

1. In Azure Portal, go to **"Cost Management + Billing"**
2. Click **"Cost analysis"**
3. Filter by **Resource group**: `calorie-app-rg`
4. View daily/monthly costs
5. Set up **budget alerts** if needed

---

## 🔄 Part 9: Update Your Application

When you make code changes and want to deploy updates:

### Step 9.1: Build New Docker Image Locally

```bash
# Navigate to your project
cd "/Users/shalinshah/Developer-Shalin /Node-Js-Practice/Calorie Tracking Backend"

# Build new image
docker build -t calorie-tracking-backend:latest .
```

### Step 9.2: Tag and Push to ACR

```bash
# Tag for ACR
docker tag calorie-tracking-backend:latest calpalregistry.azurecr.io/calorie-tracking-backend:latest

# Push to ACR
docker push calpalregistry.azurecr.io/calorie-tracking-backend:latest
```

### Step 9.3: Deploy New Revision in Portal

1. Go to your Container App in Azure Portal
2. Left sidebar → **"Application"** → **"Containers"**
3. Click **"Edit and deploy"**
4. The new image will be automatically pulled
5. Click **"Create"**
6. Wait 2-3 minutes for new revision
7. New revision becomes active automatically

**Or restart the app:**
1. Overview page → Click **"Restart"** at the top
2. Confirm restart
3. App will pull latest image from ACR

---

## 🔐 Part 10: Security Best Practices

### Step 10.1: Use Azure Key Vault for Secrets

**Create Key Vault:**
1. Search for "Key vaults" in Azure Portal
2. Click **"+ Create"**
3. Resource group: `calorie-app-rg`
4. Key vault name: `calpal-keyvault`
5. Region: Southeast Asia
6. Click **"Review + create"** → **"Create"**

**Add Secrets:**
1. Open your Key Vault
2. Left sidebar → **"Objects"** → **"Secrets"**
3. Click **"+ Generate/Import"**
4. Name: `database-url`
5. Value: [your DATABASE_URL]
6. Click **"Create"**
7. Repeat for `gemini-api-key`

**Use in Container App:**
1. Go to Container App → **"Settings"** → **"Secrets"**
2. Click **"+ Add"**
3. Key vault reference: Select your Key Vault
4. Secret: Select `database-url`
5. Update environment variables to reference Key Vault secrets

### Step 10.2: Enable Managed Identity

1. In your Container App
2. Left sidebar → **"Settings"** → **"Identity"**
3. **System assigned** tab
4. Toggle **"Status"** to **On**
5. Click **"Save"**

This allows your app to securely access other Azure resources.

### Step 10.3: Restrict Ingress (Optional)

If you want to make your app private:

1. Go to Container App → **"Settings"** → **"Ingress"**
2. Change **"Ingress traffic"** to:
   - **Limited to Container Apps Environment** (internal only)
   - **Limited to VNet** (if you have a VNet)
3. Click **"Save"**

---

## 🧹 Part 11: Clean Up Resources

When you want to delete everything:

### Step 11.1: Delete Resource Group (Deletes Everything)

**⚠️ WARNING:** This will delete ALL resources!

1. Go to your Resource Group `calorie-app-rg`
2. Click **"Delete resource group"** at the top
3. Type the resource group name: `calorie-app-rg`
4. Check **"Apply force delete..."** if available
5. Click **"Delete"**
6. Wait 5-10 minutes for deletion

This deletes:
- ✅ Container App
- ✅ Container Apps Environment
- ✅ Container Registry (and all images)
- ✅ Log Analytics Workspace
- ✅ All associated resources

### Step 11.2: Verify Deletion

1. Go to **"Resource groups"**
2. Verify `calorie-app-rg` is gone
3. Go to **"All resources"**
4. Filter by name and verify nothing remains

---

## 📸 Part 12: Visual Guide - Key Screenshots

### What Each Screen Looks Like:

**1. Azure Portal Home:**
- Search bar at top
- Navigation menu on left
- Dashboard cards in center
- "Create a resource" button

**2. Resource Group Page:**
- List of all resources
- "Create" button at top
- Overview, Settings sections on left

**3. Container Registry:**
- Overview showing login server
- Access keys showing username/password
- Repositories showing Docker images

**4. Container App Overview:**
- Application URL prominently displayed
- Status: Running/Stopped
- Metrics graphs
- Recent revisions

**5. Container App Logs:**
- Real-time streaming logs
- Filter options
- Download logs button

---

## 🆘 Part 13: Troubleshooting

### Issue 1: Container App Not Starting

**Check Logs:**
1. Container App → **"Log stream"**
2. Look for errors

**Common Issues:**
- ❌ Wrong environment variables
- ❌ Missing environment variables
- ❌ Database connection failed
- ❌ Port mismatch (must be 3000)

**Solutions:**
- Verify all environment variables are set
- Check DATABASE_URL is correct
- Check GEMINI_API_KEY is correct
- Verify target port is 3000

### Issue 2: Can't Access Application URL

**Check Ingress:**
1. Container App → **"Settings"** → **"Ingress"**
2. Verify **"Enabled"** is checked
3. Verify **"Ingress traffic"** is "Accepting traffic from anywhere"
4. Verify **"Target port"** is 3000

**Check Application Status:**
1. Container App → **"Overview"**
2. **"Provisioning state"** should be "Succeeded"
3. **"Running status"** should be "Running"

### Issue 3: Application Shows Old Code

**Force Update:**
1. Rebuild Docker image locally
2. Push to ACR (same tag: `latest`)
3. Container App → **"Containers"** → **"Edit and deploy"**
4. Or use **"Restart"** button on Overview page

### Issue 4: Environment Variables Not Working

**Check if Variables are Set:**
1. Container App → **"Containers"**
2. Scroll to **"Environment variables"**
3. Verify all 4 variables are present
4. Secrets should show as "••••••••"

**Re-add Variables:**
1. Click **"Edit and deploy"**
2. Remove and re-add environment variables
3. Click **"Create"**

### Issue 5: High Costs

**Reduce Costs:**
1. Scale to zero when not using (Min replicas: 0)
2. Use Basic tier for ACR
3. Delete Log Analytics workspace if not needed
4. Set up budget alerts

**Check Current Usage:**
1. **"Cost Management + Billing"** → **"Cost analysis"**
2. View daily breakdown

---

## 💡 Part 14: Pro Tips

### Tip 1: Create Custom Domain

1. Buy domain (GoDaddy, Namecheap, etc.)
2. Container App → **"Settings"** → **"Custom domains"**
3. Click **"+ Add custom domain"**
4. Follow wizard to add DNS records
5. Add SSL certificate (free with Azure)

### Tip 2: Set Up Application Insights

1. Create Application Insights resource
2. Container App → **"Settings"** → **"Application Insights"**
3. Connect to your Application Insights
4. Get advanced monitoring and analytics

### Tip 3: Create Backup of Container Registry

1. Container Registry → **"Services"** → **"Repositories"**
2. For each image, download locally:
   ```bash
   docker pull calpalregistry.azurecr.io/calorie-tracking-backend:latest
   docker save calorie-tracking-backend:latest > backup.tar
   ```

### Tip 4: Use Multiple Environments

Create separate resource groups for:
- `calorie-app-dev-rg` (Development)
- `calorie-app-staging-rg` (Staging)
- `calorie-app-prod-rg` (Production)

### Tip 5: Set Up Alerts

1. Container App → **"Monitoring"** → **"Alerts"**
2. Click **"+ Create"** → **"Alert rule"**
3. Set conditions:
   - CPU > 80%
   - Memory > 80%
   - HTTP 5xx errors > 10
4. Set action: Email notification

---

## 📚 Part 15: Additional Resources

### Azure Documentation

- **Container Apps:** https://learn.microsoft.com/azure/container-apps/
- **Container Registry:** https://learn.microsoft.com/azure/container-registry/
- **Pricing Calculator:** https://azure.microsoft.com/pricing/calculator/

### Video Tutorials

- **Azure Portal Tour:** https://www.youtube.com/watch?v=3m5eOBmf5Sg
- **Container Apps Tutorial:** https://www.youtube.com/watch?v=b3dopSTnSRg

### Support

- **Azure Support:** https://azure.microsoft.com/support/
- **Azure Portal Help:** Click "?" icon in top-right of portal
- **Community Forum:** https://learn.microsoft.com/answers/

---

## ✅ Final Checklist

Before you finish, verify:

- ✅ Resource group created: `calorie-app-rg`
- ✅ Container registry created: `calpalregistry`
- ✅ Docker image pushed to ACR
- ✅ Container App created: `calorie-backend-app`
- ✅ Environment variables configured (4 variables)
- ✅ Ingress enabled on port 3000
- ✅ Application URL accessible
- ✅ Health endpoint returns OK
- ✅ Nutrition API working
- ✅ Database connected

---

## 🎊 Congratulations!

You've successfully deployed your Calorie Tracking Backend to Azure using only the Azure Portal - no command-line required!

**Your app is now:**
- ✅ Running in the cloud 24/7
- ✅ Accessible via HTTPS
- ✅ Auto-scaling (1-3 replicas)
- ✅ Fully managed by Azure
- ✅ Ready for production use

**Share your URL with your Flutter app and start tracking calories! 🎉**

---

**Need help?** Review the Troubleshooting section or check the Azure Portal help icon (?) in the top-right corner.
