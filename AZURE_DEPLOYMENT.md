# Azure Deployment Guide - Calorie Tracking Backend

## 🎯 Deployment Options

You have **3 main options** to deploy your Node.js application to Azure:

### 1. **Azure Container Apps** (⭐ Recommended for Containers)
- Fully managed serverless container platform
- Auto-scaling (scale to zero)
- Pay only for what you use
- Built-in load balancing and HTTPS
- Best for: Microservices, APIs, containerized apps

### 2. **Azure App Service**
- Traditional PaaS (Platform as a Service)
- Supports Docker containers or code deployment
- Built-in CI/CD, monitoring, SSL
- Best for: Web apps, REST APIs, simple deployments

### 3. **Azure Kubernetes Service (AKS)**
- Full Kubernetes orchestration
- Complete control over infrastructure
- Best for: Large-scale, complex applications

---

## 🚀 Recommended: Azure Container Apps Deployment

### Prerequisites

1. **Azure Account**
   - Sign up: https://azure.microsoft.com/free/
   - $200 free credit for 30 days

2. **Install Azure CLI**
   ```bash
   # macOS
   brew install azure-cli
   
   # Verify installation
   az --version
   ```

3. **Docker Running Locally** ✅ (Already done!)

---

## 📋 Deployment Steps

### Step 1: Login to Azure

```bash
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account list --output table
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### Step 2: Create Azure Container Registry (ACR)

```bash
# Create resource group
az group create \
  --name calorie-app-rg \
  --location eastus

# Create container registry
az acr create \
  --resource-group calorie-app-rg \
  --name calpalregistry \
  --sku Basic \
  --location eastus

# Enable admin access (for easier authentication)
az acr update --name calpalregistry --admin-enabled true
```

### Step 3: Push Docker Image to ACR

```bash
# Login to ACR
az acr login --name calpalregistry

# Tag your local image for ACR
docker tag calorie-tracking-backend:latest calpalregistry.azurecr.io/calorie-tracking-backend:latest

# Push image to ACR
docker push calpalregistry.azurecr.io/calorie-tracking-backend:latest
```

### Step 4: Create Azure Container App

```bash
# Create Container Apps environment
az containerapp env create \
  --name calorie-app-env \
  --resource-group calorie-app-rg \
  --location eastus

# Get ACR credentials
ACR_PASSWORD=$(az acr credential show --name calpalregistry --query "passwords[0].value" -o tsv)

# Create Container App
az containerapp create \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --environment calorie-app-env \
  --image calpalregistry.azurecr.io/calorie-tracking-backend:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server calpalregistry.azurecr.io \
  --registry-username calpalregistry \
  --registry-password "$ACR_PASSWORD" \
  --cpu 0.5 \
  --memory 1.0Gi \
  --min-replicas 1 \
  --max-replicas 3 \
  --env-vars \
    "DATABASE_URL=postgresql://calorie_tracker_db_zy08_user:gVPB633ZcnHN17wkg4MBzdU4g4AjaCVp@dpg-d42vo8a4d50c73a657ag-a.oregon-postgres.render.com/calorie_tracker_db_zy08" \
    "GEMINI_API_KEY=AIzaSyAef3w5OLc57oY31tmb_KWXGPJ4QnpcM-I" \
    "NODE_ENV=production" \
    "PORT=3000"
```

### Step 5: Get Application URL

```bash
# Get the application URL
az containerapp show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

---

## 🔄 Update Deployment (After Code Changes)

```bash
# 1. Rebuild Docker image locally
docker build -t calorie-tracking-backend:latest .

# 2. Tag and push to ACR
docker tag calorie-tracking-backend:latest calpalregistry.azurecr.io/calorie-tracking-backend:latest
docker push calpalregistry.azurecr.io/calorie-tracking-backend:latest

# 3. Restart Container App to pull new image
az containerapp update \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --image calpalregistry.azurecr.io/calorie-tracking-backend:latest
```

---

## 📊 Monitoring & Management

### View Logs
```bash
# Stream logs
az containerapp logs show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --follow

# View recent logs
az containerapp logs show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --tail 100
```

### Check App Status
```bash
az containerapp show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --output table
```

### Scale Application
```bash
# Manual scaling
az containerapp update \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --min-replicas 2 \
  --max-replicas 5
```

### Update Environment Variables
```bash
az containerapp update \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --set-env-vars "NEW_VAR=value"
```

---

## 💰 Cost Estimation

### Azure Container Apps (Pay-as-you-go)
- **Compute:** ~$0.0001 per vCPU-second + ~$0.000013 per GiB-second
- **Estimated monthly cost:** $5-15 for small API (1 replica, 0.5 vCPU, 1GB RAM)
- **Free tier:** 180,000 vCPU-seconds + 360,000 GiB-seconds per month

### Azure Container Registry
- **Basic SKU:** $5/month (10 GB storage, 10 GB bandwidth)

**Total estimated cost:** ~$10-20/month for small production app

---

## 🔐 Security Best Practices

### 1. Use Azure Key Vault for Secrets
```bash
# Create Key Vault
az keyvault create \
  --name calpal-keyvault \
  --resource-group calorie-app-rg \
  --location eastus

# Store secrets
az keyvault secret set \
  --vault-name calpal-keyvault \
  --name database-url \
  --value "YOUR_DATABASE_URL"

az keyvault secret set \
  --vault-name calpal-keyvault \
  --name gemini-api-key \
  --value "YOUR_GEMINI_API_KEY"
```

### 2. Enable Managed Identity
```bash
az containerapp identity assign \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --system-assigned
```

### 3. Restrict Ingress
```bash
# Make app private (internal only)
az containerapp ingress update \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --type internal
```

---

## 🧪 Testing Deployed Application

```bash
# Get your app URL
APP_URL=$(az containerapp show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

# Test health endpoint
curl https://$APP_URL/health

# Test nutrition endpoint
curl -X POST https://$APP_URL/nutrition \
  -H "Content-Type: application/json" \
  -d '{"food": "apple"}'

# Test save endpoint
curl https://$APP_URL/save
```

---

## 🗑️ Cleanup (Delete Resources)

```bash
# Delete entire resource group (removes everything)
az group delete --name calorie-app-rg --yes --no-wait
```

---

## 🤖 Alternative: Azure App Service

If you prefer Azure App Service over Container Apps:

```bash
# Create App Service Plan
az appservice plan create \
  --name calorie-app-plan \
  --resource-group calorie-app-rg \
  --is-linux \
  --sku B1

# Create Web App
az webapp create \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --plan calorie-app-plan \
  --deployment-container-image-name calpalregistry.azurecr.io/calorie-tracking-backend:latest

# Configure registry credentials
az webapp config container set \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --docker-registry-server-url https://calpalregistry.azurecr.io \
  --docker-registry-server-user calpalregistry \
  --docker-registry-server-password "$ACR_PASSWORD"

# Configure environment variables
az webapp config appsettings set \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --settings \
    DATABASE_URL="YOUR_DATABASE_URL" \
    GEMINI_API_KEY="YOUR_API_KEY" \
    NODE_ENV="production" \
    WEBSITES_PORT=3000
```

---

## 📚 Next Steps

1. ✅ Complete manual deployment using this guide
2. 🔄 Set up CI/CD with GitHub Actions (see `AZURE_CICD.md`)
3. 📊 Enable Application Insights for monitoring
4. 🔐 Move secrets to Azure Key Vault
5. 🌐 Add custom domain and SSL certificate

---

## 🆘 Troubleshooting

### Container won't start
```bash
# Check container logs
az containerapp logs show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --tail 100
```

### Can't access application
```bash
# Verify ingress is enabled
az containerapp ingress show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg
```

### Image pull errors
```bash
# Verify ACR credentials
az acr credential show --name calpalregistry

# Re-login to ACR
az acr login --name calpalregistry
```

---

## 📞 Support

- **Azure Documentation:** https://learn.microsoft.com/azure/container-apps/
- **Azure CLI Reference:** https://learn.microsoft.com/cli/azure/containerapp
- **Pricing Calculator:** https://azure.microsoft.com/pricing/calculator/
