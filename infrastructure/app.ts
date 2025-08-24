#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HealthTeamsStack } from './health-teams-stack';

const app = new cdk.App();

// Get configuration from environment variables or use defaults
const teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL;
const bedrockRegion = process.env.BEDROCK_REGION || 'us-east-1';
const environment = process.env.ENVIRONMENT || 'dev';

if (!teamsWebhookUrl) {
  throw new Error('TEAMS_WEBHOOK_URL environment variable is required. Please set it before deploying.');
}

new HealthTeamsStack(app, `HealthTeamsStack-${environment}`, {
  teamsWebhookUrl,
  bedrockRegion,
  environment,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  },
  description: 'AWS Health events processor with Teams integration using Bedrock Nova Lite',
  tags: {
    Environment: environment,
    Service: 'health-teams-processor',
    ManagedBy: 'cdk'
  }
});

app.synth();
