# AWS Health Teams Bot Deployment Script (PowerShell)
# This script deploys the CDK stack for the AWS Health Teams integration

param(
    [string]$Environment = "dev",
    [string]$Region = "us-east-1"
)

# Error handling
$ErrorActionPreference = "Stop"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

Write-Host "🚀 Starting deployment of AWS Health Teams Bot..." -ForegroundColor $Green
Write-Host "Environment: $Environment" -ForegroundColor $Green
Write-Host "Region: $Region" -ForegroundColor $Green
Write-Host ""

# Check if required environment variables are set
if (-not $env:TEAMS_WEBHOOK_URL) {
    Write-Host "❌ Error: TEAMS_WEBHOOK_URL environment variable is required" -ForegroundColor $Red
    Write-Host "Please set it before running this script:" -ForegroundColor $Red
    Write-Host '$env:TEAMS_WEBHOOK_URL = "https://your-teams-webhook-url.com/webhook"' -ForegroundColor $Red
    exit 1
}

if (-not $env:AWS_DEFAULT_REGION) {
    Write-Host "⚠️  Warning: AWS_DEFAULT_REGION not set, using $Region" -ForegroundColor $Yellow
    $env:AWS_DEFAULT_REGION = $Region
}

# Check if AWS CLI is configured
try {
    $callerIdentity = aws sts get-caller-identity 2>$null
    if (-not $callerIdentity) {
        throw "AWS CLI not configured"
    }
} catch {
    Write-Host "❌ Error: AWS CLI is not configured or credentials are invalid" -ForegroundColor $Red
    Write-Host "Please run 'aws configure' or set up your AWS credentials" -ForegroundColor $Red
    exit 1
}

# Check if CDK is installed
try {
    $cdkVersion = cdk --version 2>$null
    if (-not $cdkVersion) {
        Write-Host "⚠️  CDK CLI not found, installing..." -ForegroundColor $Yellow
        npm install -g aws-cdk
    }
} catch {
    Write-Host "⚠️  CDK CLI not found, installing..." -ForegroundColor $Yellow
    npm install -g aws-cdk
}

# Build the TypeScript code
Write-Host "🔨 Building TypeScript code..." -ForegroundColor $Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor $Red
    exit 1
}

# Bootstrap CDK if needed
Write-Host "🚀 Bootstrapping CDK..." -ForegroundColor $Green
$accountId = (aws sts get-caller-identity --query Account --output text 2>$null).Trim()
cdk bootstrap "aws://$accountId/$Region"

# Deploy the stack
Write-Host "🚀 Deploying CDK stack..." -ForegroundColor $Green
cdk deploy --require-approval never

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor $Green
    Write-Host ""
    Write-Host "📋 Stack outputs:" -ForegroundColor $Green
    cdk list-exports
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor $Red
    exit 1
}

Write-Host ""
Write-Host "🎉 AWS Health Teams Bot is now deployed and running!" -ForegroundColor $Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor $Green
Write-Host "1. Verify the Lambda function is working by checking CloudWatch logs" -ForegroundColor $Green
Write-Host "2. Test with a sample AWS Health event" -ForegroundColor $Green
Write-Host "3. Monitor the Teams channel for incoming messages" -ForegroundColor $Green
Write-Host ""
Write-Host "To remove the stack, run: cdk destroy" -ForegroundColor $Green
