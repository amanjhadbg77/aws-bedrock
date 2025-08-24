import { BedrockClient } from './bedrock-client';
import { TeamsClient } from './teams-client';
import { AWSHealthEvent, SimplifiedMaintenanceMessage } from '../types';

export class HealthEventProcessor {
  private bedrockClient: BedrockClient;
  private teamsClient: TeamsClient;

  constructor(teamsWebhookUrl: string, bedrockRegion: string = 'us-east-1') {
    this.bedrockClient = new BedrockClient(bedrockRegion);
    this.teamsClient = new TeamsClient(teamsWebhookUrl);
  }

  async processHealthEvent(healthEvent: AWSHealthEvent): Promise<void> {
    try {
      console.log('Processing AWS Health event:', healthEvent.id);

      // Check if this is a maintenance-related event
      if (!this.isMaintenanceEvent(healthEvent)) {
        console.log('Skipping non-maintenance event:', healthEvent.detail.eventTypeCategory);
        return;
      }

      // Use Bedrock to simplify the maintenance message
      const simplifiedMessage = await this.bedrockClient.simplifyMaintenanceMessage(healthEvent);
      
      console.log('Simplified message generated:', simplifiedMessage);

      // Send the simplified message to Teams
      await this.teamsClient.sendMaintenanceMessage(simplifiedMessage);

      console.log('Health event processed successfully');
    } catch (error) {
      console.error('Error processing health event:', error);
      throw error;
    }
  }

  private isMaintenanceEvent(healthEvent: AWSHealthEvent): boolean {
    const maintenanceCategories = [
      'scheduledChange',
      'maintenance',
      'plannedChange',
      'investigation'
    ];

    const maintenanceEventTypes = [
      'AWS_EC2_INSTANCE_MAINTENANCE_SCHEDULED',
      'AWS_EC2_INSTANCE_MAINTENANCE_PENDING',
      'AWS_EC2_INSTANCE_MAINTENANCE_IN_PROGRESS',
      'AWS_EC2_INSTANCE_MAINTENANCE_COMPLETED',
      'AWS_RDS_MAINTENANCE_SCHEDULED',
      'AWS_RDS_MAINTENANCE_IN_PROGRESS',
      'AWS_RDS_MAINTENANCE_COMPLETED'
    ];

    return (
      maintenanceCategories.includes(healthEvent.detail.eventTypeCategory) ||
      maintenanceEventTypes.includes(healthEvent.detail.eventTypeCode) ||
      healthEvent.detail.eventTypeCode.toLowerCase().includes('maintenance') ||
      healthEvent.detail.eventTypeCode.toLowerCase().includes('scheduled')
    );
  }

  async processBatchEvents(healthEvents: AWSHealthEvent[]): Promise<void> {
    console.log(`Processing batch of ${healthEvents.length} health events`);
    
    const maintenanceEvents = healthEvents.filter(event => 
      this.isMaintenanceEvent(event)
    );

    console.log(`Found ${maintenanceEvents.length} maintenance events to process`);

    // Process events sequentially to avoid overwhelming Bedrock/Teams
    for (const event of maintenanceEvents) {
      try {
        await this.processHealthEvent(event);
        // Add a small delay between events
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to process event ${event.id}:`, error);
        // Continue processing other events
      }
    }
  }
}
