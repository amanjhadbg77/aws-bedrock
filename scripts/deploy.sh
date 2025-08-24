#!/bin/bash

# AWS Health Teams Bot Deployment Script
# This script deploys the CDK stack for the AWS Health Teams integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="HealthTeamsStack"
ENVIRONMENT=${ENVIRONMENT:-"dev"}
REGION=${AWS_DEFAULT_REGION:-"us-east-1"}

echo -e "${GREEN}🚀 Starting deployment of AWS Health Teams Bot...${NC}"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo ""

# Check if required environment variables are set
if [ -z "$TEAMS_WEBHOOK_URL" ]; then
    echo -e "${RED}❌ Error: TEAMS_WEBHOOK_URL environment variable is required${NC}"
    echo "Please set it before running this script:"
    echo "export TEAMS_WEBHOOK_URL='https://your-teams-webhook-url.com/webhook'"
    exit 1
fi

if [ -z "$AWS_DEFAULT_REGION" ]; then
    echo -e "${YELLOW}⚠️  Warning: AWS_DEFAULT_REGION not set, using us-east-1${NC}"
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: AWS CLI is not configured or credentials are invalid${NC}"
    echo "Please run 'aws configure' or set up your AWS credentials"
    exit 1
fi

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo -e "${YELLOW}⚠️  CDK CLI not found, installing...${NC}"
    npm install -g aws-cdk
fi

# Build the TypeScript code
echo -e "${GREEN}🔨 Building TypeScript code...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Bootstrap CDK if needed
echo -e "${GREEN}🚀 Bootstrapping CDK...${NC}"
cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/$REGION

# Deploy the stack
echo -e "${GREEN}🚀 Deploying CDK stack...${NC}"
cdk deploy --require-approval never

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo ""
    echo -e "${GREEN}📋 Stack outputs:${NC}"
    cdk list-exports
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 AWS Health Teams Bot is now deployed and running!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify the Lambda function is working by checking CloudWatch logs"
echo "2. Test with a sample AWS Health event"
echo "3. Monitor the Teams channel for incoming messages"
echo ""
echo "To remove the stack, run: cdk destroy"
