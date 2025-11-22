# Azure Deployment - Quick Start Guide

## 🎯 Choose Your Deployment Method

### Option 1: Automated Script (Easiest) ⭐

```bash
# Make sure you're logged into Azure first
az login

# Run the deployment script
./deploy-azure.sh
```

This script will:
- ✅ Create resource group
- ✅ Create Azure Container Registry
- ✅ Build and push Docker image
- ✅ Create Container Apps environment
- ✅ Deploy your application
- ✅ Display the application URL

**Estimated time:** 10-15 minutes

---

### Option 2: Manual Deployment

Follow the detailed steps in `AZURE_DEPLOYMENT.md`

---

### Option 3: GitHub Actions CI/CD (Recommended for Production)

1. Set up Azure credentials (see `GITHUB_ACTIONS_SETUP.md`)
2. Push to `main` branch
3. GitHub automatically deploys to Azure

---

## 📋 Prerequisites

### 1. Install Azure CLI

```bash
# macOS
brew install azure-cli

# Verify
az --version
```

### 2. Create Azure Account

Sign up at: https://azure.microsoft.com/free/

**Free tier includes:**
- $200 credit for 30 days
- Free services for 12 months
- Always free services

### 3. Have Docker Running

```bash
# Check Docker
docker ps
```

---

## 🚀 Quick Deploy (3 Steps)

### Step 1: Login to Azure

```bash
az login
```

This will open your browser for authentication.

### Step 2: Run Deployment Script

```bash
./deploy-azure.sh
```

The script will:
- Ask for your subscription (if you have multiple)
- Create all necessary resources
- Deploy your application
- Show you the application URL

### Step 3: Test Your Deployment

```bash
# Replace with your actual URL from the script output
APP_URL="your-app-url.azurecontainerapps.io"

# Test health endpoint
curl https://$APP_URL/health

# Test nutrition API
curl -X POST https://$APP_URL/nutrition \
  -H "Content-Type: application/json" \
  -d '{"food": "apple"}'

# Get saved logs
curl https://$APP_URL/save
```

---

## 🔄 Update Existing Deployment

After making code changes:

```bash
./update-azure.sh
```

This will:
- Build new Docker image
- Push to Azure Container Registry
- Update your running application
- Zero downtime deployment

---

## 📊 Monitoring

### View Application Logs

```bash
az containerapp logs show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --follow
```

### Check Application Status

```bash
az containerapp show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --output table
```

### View All Resources

```bash
az resource list \
  --resource-group calorie-app-rg \
  --output table
```

---

## 💰 Cost Management

### Check Current Costs

```bash
az consumption usage list \
  --output table
```

### Stop Application (to save costs)

```bash
# Scale to 0 replicas
az containerapp update \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --min-replicas 0 \
  --max-replicas 0
```

### Start Application Again

```bash
# Scale back up
az containerapp update \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --min-replicas 1 \
  --max-replicas 3
```

---

## 🗑️ Delete Everything

```bash
# Delete entire resource group (removes all resources)
az group delete --name calorie-app-rg --yes --no-wait
```

**Warning:** This will delete everything in the resource group!

---

## 🆘 Troubleshooting

### Can't login to Azure CLI

```bash
# Clear cache and login again
az account clear
az login
```

### Script fails with permission error

```bash
# Make scripts executable
chmod +x deploy-azure.sh update-azure.sh
```

### Can't access application

```bash
# Check if app is running
az containerapp show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --query properties.provisioningState

# Check logs for errors
az containerapp logs show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --tail 50
```

### Image pull errors

```bash
# Verify ACR is working
az acr check-health --name calpalregistry

# Re-login to ACR
az acr login --name calpalregistry
```

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `AZURE_DEPLOYMENT.md` | Complete deployment guide with all details |
| `AZURE_QUICKSTART.md` | This quick reference (you are here) |
| `GITHUB_ACTIONS_SETUP.md` | CI/CD automation setup |
| `deploy-azure.sh` | Automated deployment script |
| `update-azure.sh` | Update existing deployment script |

---

## 🎯 Next Steps After Deployment

1. ✅ Deploy application (using `./deploy-azure.sh`)
2. 🧪 Test all endpoints
3. 📊 Set up monitoring and alerts
4. 🔐 Configure custom domain and SSL
5. 🤖 Set up GitHub Actions CI/CD
6. 📈 Configure auto-scaling rules
7. 🔒 Move secrets to Azure Key Vault

---

## 💡 Pro Tips

1. **Use Azure Cloud Shell** if you don't want to install Azure CLI locally
   - Access at: https://shell.azure.com

2. **Tag your resources** for better organization:
   ```bash
   az group update \
     --name calorie-app-rg \
     --tags Environment=Production Project=CalPal
   ```

3. **Enable monitoring** with Application Insights:
   ```bash
   az monitor app-insights component create \
     --app calorie-app-insights \
     --location eastus \
     --resource-group calorie-app-rg
   ```

4. **Set up alerts** for issues:
   ```bash
   az monitor metrics alert create \
     --name high-cpu-alert \
     --resource-group calorie-app-rg \
     --condition "avg Percentage CPU > 80"
   ```

---

## 🌐 Useful Azure Portal Links

- **Container Apps:** https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.App%2FcontainerApps
- **Container Registry:** https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.ContainerRegistry%2Fregistries
- **Cost Management:** https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/overview
- **Resource Groups:** https://portal.azure.com/#view/HubsExtension/BrowseResourceGroups

---

## 📞 Support

- **Azure Documentation:** https://learn.microsoft.com/azure/
- **Azure Support:** https://azure.microsoft.com/support/
- **Pricing Calculator:** https://azure.microsoft.com/pricing/calculator/
- **Azure Status:** https://status.azure.com/

---

**Ready to deploy? Run:** `./deploy-azure.sh` 🚀
