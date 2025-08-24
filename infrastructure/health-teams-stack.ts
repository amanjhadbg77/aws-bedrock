import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface HealthTeamsStackProps extends cdk.StackProps {
  teamsWebhookUrl: string;
  bedrockRegion?: string;
  environment?: string;
}

export class HealthTeamsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: HealthTeamsStackProps) {
    super(scope, id, props);

    const { teamsWebhookUrl, bedrockRegion = 'us-east-1', environment = 'dev' } = props;

    // Lambda function
    const healthProcessorFunction = new lambda.Function(this, 'HealthProcessorFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../dist'),
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
      environment: {
        TEAMS_WEBHOOK_URL: teamsWebhookUrl,
        BEDROCK_REGION: bedrockRegion,
        ENVIRONMENT: environment,
        POWERTOOLS_SERVICE_NAME: 'health-teams-processor',
        LOG_LEVEL: 'INFO'
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      description: 'Processes AWS Health events and sends simplified messages to Teams via Bedrock'
    });

    // IAM permissions for Bedrock
    const bedrockPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream'
      ],
      resources: [
        `arn:aws:bedrock:${bedrockRegion}::foundation-model/amazon.titan-text-express-v1`
      ]
    });

    healthProcessorFunction.addToRolePolicy(bedrockPolicy);

    // IAM permissions for CloudWatch Logs
    const logsPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents'
      ],
      resources: healthProcessorFunction.logGroup.logGroupArn
    });

    healthProcessorFunction.addToRolePolicy(logsPolicy);

    // EventBridge rule for AWS Health events
    const healthEventRule = new events.Rule(this, 'HealthEventRule', {
      eventPattern: {
        source: ['aws.health'],
        detailType: ['AWS Health Event'],
        detail: {
          eventTypeCategory: [
            'scheduledChange',
            'maintenance',
            'plannedChange',
            'investigation'
          ]
        }
      },
      description: 'Captures AWS Health maintenance and scheduled change events',
      enabled: true
    });

    // Add Lambda as target for Health events
    healthEventRule.addTarget(new targets.LambdaFunction(healthProcessorFunction));

    // EventBridge rule for specific maintenance event types
    const maintenanceEventRule = new events.Rule(this, 'MaintenanceEventRule', {
      eventPattern: {
        source: ['aws.health'],
        detailType: ['AWS Health Event'],
        detail: {
          eventTypeCode: [
            'AWS_EC2_INSTANCE_MAINTENANCE_SCHEDULED',
            'AWS_EC2_INSTANCE_MAINTENANCE_PENDING',
            'AWS_EC2_INSTANCE_MAINTENANCE_IN_PROGRESS',
            'AWS_EC2_INSTANCE_MAINTENANCE_COMPLETED',
            'AWS_RDS_MAINTENANCE_SCHEDULED',
            'AWS_RDS_MAINTENANCE_IN_PROGRESS',
            'AWS_RDS_MAINTENANCE_COMPLETED'
          ]
        }
      },
      description: 'Captures specific AWS maintenance event types',
      enabled: true
    });

    // Add Lambda as target for maintenance events
    maintenanceEventRule.addTarget(new targets.LambdaFunction(healthProcessorFunction));

    // CloudWatch Dashboard
    const dashboard = new cdk.aws_cloudwatch.Dashboard(this, 'HealthTeamsDashboard', {
      dashboardName: `${this.stackName}-dashboard`,
      widgets: [
        [
          new cdk.aws_cloudwatch.GraphWidget({
            title: 'Lambda Invocations',
            left: [healthProcessorFunction.metricInvocations()],
            right: [healthProcessorFunction.metricErrors()],
            width: 12
          }),
          new cdk.aws_cloudwatch.GraphWidget({
            title: 'Lambda Duration',
            left: [healthProcessorFunction.metricDuration()],
            width: 12
          })
        ],
        [
          new cdk.aws_cloudwatch.GraphWidget({
            title: 'EventBridge Events',
            left: [healthEventRule.metricTargetSuccess()],
            right: [maintenanceEventRule.metricTargetSuccess()],
            width: 12
          }),
          new cdk.aws_cloudwatch.GraphWidget({
            title: 'Lambda Memory Usage',
            left: [healthProcessorFunction.metric('UsedMemory')],
            width: 12
          })
        ]
      ]
    });

    // Outputs
    new cdk.CfnOutput(this, 'LambdaFunctionArn', {
      value: healthProcessorFunction.functionArn,
      description: 'ARN of the Health Processor Lambda function'
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: healthProcessorFunction.functionName,
      description: 'Name of the Health Processor Lambda function'
    });

    new cdk.CfnOutput(this, 'EventBridgeRuleArn', {
      value: healthEventRule.ruleArn,
      description: 'ARN of the Health Event EventBridge rule'
    });

    new cdk.CfnOutput(this, 'CloudWatchDashboardName', {
      value: dashboard.dashboardName,
      description: 'Name of the CloudWatch dashboard'
    });
  }
}
