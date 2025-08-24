# AWS Health Teams Bot

A serverless solution that processes AWS Health events, uses Amazon Bedrock (Nova Lite) to simplify maintenance messages, and sends them to Microsoft Teams channels via webhooks.

## 🚀 Features

- **Event-Driven Architecture**: Automatically triggered by AWS Health events via EventBridge
- **AI-Powered Simplification**: Uses Amazon Bedrock Nova Lite to convert technical maintenance messages into user-friendly notifications
- **Teams Integration**: Sends beautiful Adaptive Cards to Microsoft Teams channels
- **Serverless**: Built with AWS Lambda for cost-effective, scalable processing
- **Infrastructure as Code**: Complete CDK stack for easy deployment and management
- **Monitoring**: Built-in CloudWatch dashboard for observability

## 🏗️ Architecture

```
AWS Health Dashboard → EventBridge → Lambda → Bedrock Nova Lite → Teams Webhook
```

1. **AWS Health Events**: Captures maintenance, scheduled changes, and investigation events
2. **EventBridge**: Routes events to Lambda based on event patterns
3. **Lambda Function**: Processes events and orchestrates the workflow
4. **Bedrock Nova Lite**: Simplifies technical maintenance messages
5. **Teams Webhook**: Delivers user-friendly notifications to Teams channels

## 📁 Project Structure

```
aws-bedrock/
├── src/
│   ├── types/           # TypeScript type definitions
│   ├── lib/             # Core libraries and utilities
│   │   ├── bedrock-client.ts      # Bedrock API client
│   │   ├── teams-client.ts        # Teams webhook client
│   │   └── health-event-processor.ts # Main event processor
│   ├── test/            # Test files and sample data
│   └── index.ts         # Lambda handler entry point
├── infrastructure/      # CDK infrastructure code
│   ├── app.ts          # CDK app entry point
│   └── health-teams-stack.ts # Main stack definition
├── scripts/            # Deployment and testing scripts
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── cdk.json           # CDK configuration
```

## 🛠️ Prerequisites

- **AWS Account**: With appropriate permissions for Lambda, EventBridge, and Bedrock
- **Node.js 18+**: For development and deployment
- **AWS CLI**: Configured with appropriate credentials
- **CDK CLI**: For infrastructure deployment
- **Microsoft Teams**: With webhook URL for the target channel

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd aws-bedrock
npm install
```

### 2. Configure Environment

Set your Teams webhook URL:

```bash
export TEAMS_WEBHOOK_URL="https://your-organization.webhook.office.com/webhookb2/..."
export AWS_DEFAULT_REGION="us-east-1"  # Optional, defaults to us-east-1
```

### 3. Build and Test Locally

```bash
# Build the project
npm run build

# Test locally (requires AWS credentials)
./scripts/test-local.sh
```

### 4. Deploy to AWS

```bash
# Deploy the CDK stack
./scripts/deploy.sh
```

## 🔧 Configuration

### Environment Variables

| Variable            | Description                    | Required | Default     |
| ------------------- | ------------------------------ | -------- | ----------- |
| `TEAMS_WEBHOOK_URL` | Microsoft Teams webhook URL    | Yes      | -           |
| `BEDROCK_REGION`    | AWS region for Bedrock service | No       | `us-east-1` |
| `ENVIRONMENT`       | Deployment environment         | No       | `dev`       |

### Teams Webhook Setup

1. In Microsoft Teams, go to the channel where you want to receive notifications
2. Click the "..." menu → "Connectors"
3. Find "Incoming Webhook" and click "Configure"
4. Give it a name and optionally an icon
5. Click "Create" and copy the webhook URL

### AWS Permissions

The Lambda function requires the following permissions:

- `bedrock:InvokeModel` - For calling Bedrock Nova Lite
- CloudWatch Logs permissions (automatically configured)
- EventBridge permissions (automatically configured)

## 📊 Monitoring

The CDK stack automatically creates a CloudWatch dashboard with:

- Lambda function metrics (invocations, errors, duration)
- EventBridge event processing metrics
- Memory usage and performance indicators

## 🧪 Testing

### Sample Health Event

The project includes a sample AWS Health event in `src/test/sample-health-event.json` for testing.

### Local Testing

```bash
# Test the handler locally
npm run build
npx ts-node src/test/test-handler.ts
```

### Integration Testing

1. Deploy the stack
2. Create a test AWS Health event in your account
3. Monitor the Teams channel for the processed message
4. Check CloudWatch logs for any errors

## 🔍 Troubleshooting

### Common Issues

1. **Bedrock Access Denied**: Ensure your AWS account has access to Bedrock and the Lambda has proper IAM permissions
2. **Teams Webhook Failed**: Verify the webhook URL is correct and the Teams channel is accessible
3. **Event Not Processed**: Check EventBridge rules and Lambda function logs

### Debugging

- **CloudWatch Logs**: Check `/aws/lambda/HealthProcessorFunction-*` log groups
- **EventBridge**: Verify event patterns match your Health events
- **IAM**: Ensure Lambda execution role has all required permissions

## 📈 Scaling

The solution automatically scales based on:

- **Event Volume**: Lambda automatically scales based on incoming events
- **Concurrency**: Configurable Lambda concurrency limits
- **Memory**: Adjustable Lambda memory allocation (default: 512MB)

## 🔒 Security

- **IAM Roles**: Least-privilege access for Lambda function
- **Environment Variables**: Sensitive configuration stored securely
- **VPC**: Can be configured to run in private subnets if needed
- **Encryption**: All data encrypted in transit and at rest

## 🚀 Advanced Features

### Custom Event Filtering

Modify the `isMaintenanceEvent` method in `health-event-processor.ts` to customize which events are processed.

### Custom Bedrock Prompts

Adjust the prompt template in `bedrock-client.ts` to change how maintenance messages are simplified.

### Teams Message Formatting

Customize the Adaptive Card layout in `teams-client.ts` to match your Teams channel design.

## 📝 Development

### Adding New Features

1. **New Event Types**: Update the event filtering logic in `health-event-processor.ts`
2. **Additional AI Models**: Extend `bedrock-client.ts` to support multiple models
3. **Enhanced Teams Cards**: Modify the Adaptive Card structure in `teams-client.ts`

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and style enforcement
- **Testing**: Unit tests for core functionality
- **Documentation**: Comprehensive inline documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review CloudWatch logs for error details
3. Open an issue in the repository
4. Contact the development team

## 🔄 Updates

### Version History

- **v1.0.0**: Initial release with basic Health event processing
- **Future**: Enhanced AI capabilities, additional Teams integrations, monitoring improvements

### Upcoming Features

- Support for additional AI models
- Enhanced Teams message formatting
- Advanced event filtering and routing
- Integration with other notification platforms
