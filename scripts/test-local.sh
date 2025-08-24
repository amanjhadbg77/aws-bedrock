#!/bin/bash

# Local Testing Script for AWS Health Teams Bot
# This script tests the Lambda function locally without deploying

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Starting local testing of AWS Health Teams Bot...${NC}"
echo ""

# Check if required environment variables are set
if [ -z "$TEAMS_WEBHOOK_URL" ]; then
    echo -e "${YELLOW}⚠️  Warning: TEAMS_WEBHOOK_URL not set, using placeholder${NC}"
    export TEAMS_WEBHOOK_URL="https://placeholder-webhook-url.com/webhook"
fi

# Build the TypeScript code
echo -e "${GREEN}🔨 Building TypeScript code...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${GREEN}📦 Installing dependencies...${NC}"
    npm install
fi

# Run the test
echo -e "${GREEN}🧪 Running local test...${NC}"
echo "Note: This will attempt to call Bedrock and Teams APIs if credentials are configured"
echo ""

# Use ts-node to run the test directly
npx ts-node src/test/test-handler.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Local test completed successfully!${NC}"
else
    echo -e "${RED}❌ Local test failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Local testing completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Check the console output above for any errors"
echo "2. Verify that the sample event was processed correctly"
echo "3. If using real credentials, check your Teams channel for the message"
echo ""
echo "To deploy to AWS, run: ./scripts/deploy.sh"
