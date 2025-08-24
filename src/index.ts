import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { HealthEventProcessor } from './lib/health-event-processor';
import { AWSHealthEvent } from './types';

export const handler = async (
  event: APIGatewayProxyEvent | any,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log('Lambda function started');
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));

  try {
    // Get configuration from environment variables
    const teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL;
    const bedrockRegion = process.env.BEDROCK_REGION || 'us-east-1';

    if (!teamsWebhookUrl) {
      throw new Error('TEAMS_WEBHOOK_URL environment variable is required');
    }

    // Initialize the health event processor
    const processor = new HealthEventProcessor(teamsWebhookUrl, bedrockRegion);

    // Handle different event sources
    if (event.source === 'aws.health') {
      // Direct AWS Health event
      await processor.processHealthEvent(event);
    } else if (event.Records && event.Records.length > 0) {
      // EventBridge/CloudWatch Events
      const healthEvents: AWSHealthEvent[] = [];
      
      for (const record of event.Records) {
        if (record.EventSource === 'aws:events' || record.eventSource === 'aws:events') {
          try {
            const healthEvent = JSON.parse(record.body || record.detail);
            if (healthEvent.source === 'aws.health') {
              healthEvents.push(healthEvent);
            }
          } catch (parseError) {
            console.warn('Failed to parse event record:', parseError);
          }
        }
      }

      if (healthEvents.length > 0) {
        await processor.processBatchEvents(healthEvents);
      }
    } else if (event.detail && event.source === 'aws.health') {
      // EventBridge event with detail
      await processor.processHealthEvent(event);
    } else {
      console.log('Unsupported event format, skipping processing');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Health events processed successfully',
        processedAt: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error in Lambda handler:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Export for testing
export { HealthEventProcessor };
