# GitHub Actions CI/CD Setup for Azure

This guide explains how to set up automated deployment to Azure using GitHub Actions.

## 🔐 Prerequisites

1. Azure subscription
2. GitHub repository
3. Azure CLI installed locally

---

## 📋 Setup Steps

### Step 1: Create Azure Service Principal

First, you need to create credentials that GitHub Actions can use to authenticate with Azure.

```bash
# Login to Azure
az login

# Get your subscription ID
az account list --output table

# Create service principal (replace with your subscription ID and resource group)
az ad sp create-for-rbac \
  --name "github-actions-calpal" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/calorie-app-rg \
  --sdk-auth
```

This command will output JSON credentials like this:
```json
{
  "clientId": "xxxx",
  "clientSecret": "xxxx",
  "subscriptionId": "xxxx",
  "tenantId": "xxxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

**Copy this entire JSON output!**

---

### Step 2: Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

#### Required Secrets:

| Secret Name | Value |
|-------------|-------|
| `AZURE_CREDENTIALS` | The entire JSON output from Step 1 |
| `DATABASE_URL` | Your PostgreSQL connection string |
| `GEMINI_API_KEY` | Your Google Gemini API key |

#### Optional Secrets (if using Key Vault):
| Secret Name | Value |
|-------------|-------|
| `AZURE_KEY_VAULT_NAME` | Your Azure Key Vault name |

---

### Step 3: Update GitHub Actions Workflow

The workflow file `.github/workflows/azure-deploy.yml` is already created. Review and update if needed:

- **Resource Group:** `calorie-app-rg`
- **Container App:** `calorie-backend-app`
- **ACR Name:** `calpalregistry`

---

### Step 4: Enable GitHub Actions

1. Go to your repository on GitHub
2. Click on the **Actions** tab
3. Enable workflows if prompted
4. The workflow will trigger automatically on:
   - Push to `main` branch
   - Manual trigger via "Run workflow" button

---

## 🚀 Deployment Process

### Automatic Deployment

Every time you push to the `main` branch:

```bash
git add .
git commit -m "Update API endpoint"
git push origin main
```

GitHub Actions will automatically:
1. ✅ Build Docker image
2. ✅ Push to Azure Container Registry
3. ✅ Update Azure Container App
4. ✅ Test health endpoint
5. ✅ Display deployment summary

---

### Manual Deployment

1. Go to GitHub repository
2. Click **Actions** tab
3. Select **Deploy to Azure Container Apps** workflow
4. Click **Run workflow** button
5. Select branch and click **Run workflow**

---

## 📊 Monitoring Deployments

### View Workflow Runs

1. Go to **Actions** tab in your repository
2. Click on any workflow run to see details
3. View logs for each step

### Check Deployment Status

```bash
# View Container App status
az containerapp show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --output table

# View logs
az containerapp logs show \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --follow
```

---

## 🔄 Workflow Features

### What the Workflow Does:

1. **Checkout Code** - Pulls latest code from repository
2. **Azure Login** - Authenticates using service principal
3. **ACR Login** - Logs into Azure Container Registry
4. **Build & Push** - Builds and pushes Docker image with:
   - Commit SHA tag (e.g., `abc123`)
   - Latest tag
5. **Deploy** - Updates Container App with new image
6. **Health Check** - Tests `/health` endpoint
7. **Summary** - Displays deployment info in GitHub UI

---

## 🛠️ Customization

### Change Trigger Events

Edit `.github/workflows/azure-deploy.yml`:

```yaml
on:
  push:
    branches:
      - main
      - staging  # Add staging branch
  pull_request:
    branches:
      - main
  workflow_dispatch:  # Manual trigger
```

### Add Environment Variables

```yaml
- name: 🚀 Deploy to Azure Container Apps
  run: |
    az containerapp update \
      --name ${{ env.AZURE_CONTAINER_APP }} \
      --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
      --image ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }} \
      --set-env-vars \
        NEW_VAR=value \
        ANOTHER_VAR=value
```

### Add Slack/Discord Notifications

Add notification step at the end:

```yaml
- name: 📢 Notify Deployment
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment to Azure ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🧪 Testing in Workflow

### Add API Tests

```yaml
- name: 🧪 Test API Endpoints
  run: |
    APP_URL=${{ steps.get-url.outputs.app_url }}
    
    # Test health
    curl -f $APP_URL/health || exit 1
    
    # Test nutrition endpoint
    RESPONSE=$(curl -s -X POST $APP_URL/nutrition \
      -H "Content-Type: application/json" \
      -d '{"food":"apple"}')
    
    # Verify response contains expected fields
    echo $RESPONSE | jq -e '.food_name' || exit 1
```

---

## 🔐 Security Best Practices

### 1. Use Azure Key Vault

Store secrets in Azure Key Vault instead of GitHub Secrets:

```yaml
- name: 🔑 Get Secrets from Key Vault
  run: |
    DATABASE_URL=$(az keyvault secret show \
      --vault-name calpal-keyvault \
      --name database-url \
      --query value -o tsv)
    
    GEMINI_KEY=$(az keyvault secret show \
      --vault-name calpal-keyvault \
      --name gemini-api-key \
      --query value -o tsv)
```

### 2. Use Managed Identity

Enable system-assigned managed identity for Container App:

```bash
az containerapp identity assign \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --system-assigned
```

### 3. Restrict Service Principal Permissions

Limit service principal to specific resource group:

```bash
az ad sp create-for-rbac \
  --name "github-actions-calpal" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUB_ID/resourceGroups/calorie-app-rg
```

---

## 🐛 Troubleshooting

### Workflow Fails: Authentication Error

**Problem:** Service principal credentials are invalid

**Solution:**
1. Regenerate service principal
2. Update `AZURE_CREDENTIALS` secret in GitHub
3. Re-run workflow

### Workflow Fails: Image Push Error

**Problem:** Can't push to ACR

**Solution:**
```bash
# Verify ACR admin is enabled
az acr update --name calpalregistry --admin-enabled true

# Re-run workflow
```

### Deployment Succeeds but App Not Working

**Problem:** Environment variables not set

**Solution:**
```bash
# Update environment variables
az containerapp update \
  --name calorie-backend-app \
  --resource-group calorie-app-rg \
  --set-env-vars \
    DATABASE_URL="your-value" \
    GEMINI_API_KEY="your-value"
```

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Azure CLI Reference](https://learn.microsoft.com/cli/azure/)
- [Docker Documentation](https://docs.docker.com/)

---

## 🎯 Next Steps

1. ✅ Set up service principal
2. ✅ Add secrets to GitHub
3. ✅ Push code to trigger deployment
4. 📊 Monitor deployment in Actions tab
5. 🧪 Test deployed application
6. 🔄 Enable automatic deployments for development branch
