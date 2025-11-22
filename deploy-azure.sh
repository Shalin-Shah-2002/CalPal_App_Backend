#!/bin/bash

# ============================================
# Azure Container Apps Deployment Script
# Calorie Tracking Backend
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="calorie-app-rg"
LOCATION="southeastasia"
ACR_NAME="calpalregistry"
CONTAINER_APP_NAME="calorie-backend-app"
CONTAINER_APP_ENV="calorie-app-env"
IMAGE_NAME="calorie-tracking-backend"
IMAGE_TAG="latest"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Azure Container Apps Deployment${NC}"
echo -e "${BLUE}============================================${NC}"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed${NC}"
    echo "Install it with: brew install azure-cli"
    exit 1
fi

echo -e "${GREEN}✅ Azure CLI found${NC}"

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Login to Azure
echo -e "\n${YELLOW}🔐 Logging into Azure...${NC}"
az login

# Set subscription (if needed)
echo -e "\n${YELLOW}📋 Available subscriptions:${NC}"
az account list --output table

read -p "Enter subscription ID (or press Enter to use default): " SUB_ID
if [ ! -z "$SUB_ID" ]; then
    az account set --subscription "$SUB_ID"
fi

CURRENT_SUB=$(az account show --query name -o tsv)
echo -e "${GREEN}✅ Using subscription: $CURRENT_SUB${NC}"

# Create Resource Group
echo -e "\n${YELLOW}📦 Creating resource group...${NC}"
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION \
    --output table

echo -e "${GREEN}✅ Resource group created: $RESOURCE_GROUP${NC}"

# Create Azure Container Registry
echo -e "\n${YELLOW}🐳 Creating Azure Container Registry...${NC}"
az acr create \
    --resource-group $RESOURCE_GROUP \
    --name $ACR_NAME \
    --sku Basic \
    --location $LOCATION \
    --admin-enabled true \
    --output table

echo -e "${GREEN}✅ ACR created: $ACR_NAME${NC}"

# Build and push Docker image to ACR
echo -e "\n${YELLOW}🏗️  Building and pushing Docker image...${NC}"

# Login to ACR
az acr login --name $ACR_NAME

# Build image directly in ACR (recommended for production)
echo -e "${BLUE}Building image in Azure...${NC}"
az acr build \
    --registry $ACR_NAME \
    --image $IMAGE_NAME:$IMAGE_TAG \
    --file Dockerfile \
    .

echo -e "${GREEN}✅ Image built and pushed to ACR${NC}"

# Get ACR credentials
echo -e "\n${YELLOW}🔑 Retrieving ACR credentials...${NC}"
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv)

echo -e "${GREEN}✅ ACR credentials retrieved${NC}"

# Get environment variables from .env file
echo -e "\n${YELLOW}📝 Reading environment variables from .env...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

# Read .env and create env-vars string
source .env
echo -e "${GREEN}✅ Environment variables loaded${NC}"

# Create Container Apps environment
echo -e "\n${YELLOW}🌍 Creating Container Apps environment...${NC}"
az containerapp env create \
    --name $CONTAINER_APP_ENV \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --output table

echo -e "${GREEN}✅ Container Apps environment created${NC}"

# Create Container App
echo -e "\n${YELLOW}🚀 Creating Container App...${NC}"
az containerapp create \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --environment $CONTAINER_APP_ENV \
    --image $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG \
    --target-port 3000 \
    --ingress external \
    --registry-server $ACR_LOGIN_SERVER \
    --registry-username $ACR_USERNAME \
    --registry-password "$ACR_PASSWORD" \
    --cpu 0.5 \
    --memory 1.0Gi \
    --min-replicas 1 \
    --max-replicas 3 \
    --env-vars \
        "DATABASE_URL=$DATABASE_URL" \
        "GEMINI_API_KEY=$GEMINI_API_KEY" \
        "NODE_ENV=production" \
        "PORT=3000" \
    --output table

echo -e "${GREEN}✅ Container App created and deployed${NC}"

# Get application URL
echo -e "\n${YELLOW}🔗 Retrieving application URL...${NC}"
APP_URL=$(az containerapp show \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query properties.configuration.ingress.fqdn \
    --output tsv)

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}🎉 Deployment Successful!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "\n${BLUE}Application URL:${NC} https://$APP_URL"
echo -e "\n${BLUE}Test your API:${NC}"
echo -e "  Health Check: ${YELLOW}curl https://$APP_URL/health${NC}"
echo -e "  Nutrition API: ${YELLOW}curl -X POST https://$APP_URL/nutrition -H 'Content-Type: application/json' -d '{\"food\":\"apple\"}'${NC}"
echo -e "  Get Logs: ${YELLOW}curl https://$APP_URL/save${NC}"
echo -e "\n${BLUE}Management Commands:${NC}"
echo -e "  View logs: ${YELLOW}az containerapp logs show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --follow${NC}"
echo -e "  View status: ${YELLOW}az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --output table${NC}"
echo -e "  Delete app: ${YELLOW}az group delete --name $RESOURCE_GROUP --yes --no-wait${NC}"
echo -e "\n${GREEN}============================================${NC}"
