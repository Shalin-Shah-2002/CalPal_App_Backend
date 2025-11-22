#!/bin/bash

# ============================================
# Azure Container Apps Update Script
# Updates existing deployment with new image
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
RESOURCE_GROUP="calorie-app-rg"
ACR_NAME="calpalregistry"
CONTAINER_APP_NAME="calorie-backend-app"
IMAGE_NAME="calorie-tracking-backend"
IMAGE_TAG="latest"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Updating Azure Container App${NC}"
echo -e "${BLUE}============================================${NC}"

# Build Docker image locally
echo -e "\n${YELLOW}🏗️  Building Docker image locally...${NC}"
docker build -t $IMAGE_NAME:$IMAGE_TAG .

echo -e "${GREEN}✅ Local image built${NC}"

# Login to ACR
echo -e "\n${YELLOW}🔐 Logging into Azure Container Registry...${NC}"
az acr login --name $ACR_NAME

ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv)

# Tag image for ACR
echo -e "\n${YELLOW}🏷️  Tagging image...${NC}"
docker tag $IMAGE_NAME:$IMAGE_TAG $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG

# Push to ACR
echo -e "\n${YELLOW}⬆️  Pushing image to ACR...${NC}"
docker push $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG

echo -e "${GREEN}✅ Image pushed to ACR${NC}"

# Update Container App
echo -e "\n${YELLOW}🔄 Updating Container App...${NC}"
az containerapp update \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --image $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG

echo -e "${GREEN}✅ Container App updated${NC}"

# Get application URL
APP_URL=$(az containerapp show \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query properties.configuration.ingress.fqdn \
    --output tsv)

echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}🎉 Update Successful!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "\n${BLUE}Application URL:${NC} https://$APP_URL"
echo -e "\n${YELLOW}Test your updated API:${NC}"
echo -e "  curl https://$APP_URL/health"
echo -e "\n${YELLOW}View logs:${NC}"
echo -e "  az containerapp logs show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --follow"
