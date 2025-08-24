import axios from 'axios';
import { TeamsWebhookPayload, TeamsAdaptiveCard, SimplifiedMaintenanceMessage } from '../types';

export class TeamsClient {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendMaintenanceMessage(message: SimplifiedMaintenanceMessage): Promise<void> {
    const adaptiveCard = this.buildAdaptiveCard(message);
    const payload: TeamsWebhookPayload = {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: adaptiveCard
        }
      ]
    };

    try {
      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.status !== 200) {
        throw new Error(`Teams webhook returned status ${response.status}`);
      }

      console.log('Message sent to Teams successfully');
    } catch (error) {
      console.error('Error sending message to Teams:', error);
      throw new Error(`Failed to send message to Teams: ${error}`);
    }
  }

  private buildAdaptiveCard(message: SimplifiedMaintenanceMessage): TeamsAdaptiveCard {
    const statusColor = this.getStatusColor(message.status);
    
    return {
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: message.title,
          size: 'Large',
          weight: 'Bolder',
          color: 'Accent',
          wrap: true
        },
        {
          type: 'TextBlock',
          text: message.summary,
          size: 'Medium',
          wrap: true
        },
        {
          type: 'FactSet',
          facts: [
            {
              title: 'Status',
              value: message.status
            },
            {
              title: 'Impact',
              value: message.impact
            },
            {
              title: 'Timeframe',
              value: message.timeframe
            }
          ]
        },
        {
          type: 'TextBlock',
          text: 'Affected Services:',
          size: 'Medium',
          weight: 'Bolder',
          wrap: true
        },
        {
          type: 'TextBlock',
          text: message.affectedServices.length > 0 
            ? message.affectedServices.join(', ')
            : 'None specified',
          size: 'Small',
          color: 'Default',
          wrap: true
        },
        {
          type: 'TextBlock',
          text: 'Recommendations:',
          size: 'Medium',
          weight: 'Bolder',
          wrap: true
        },
        ...message.recommendations.map(rec => ({
          type: 'TextBlock',
          text: `• ${rec}`,
          size: 'Small',
          color: 'Default',
          wrap: true
        }))
      ],
      actions: [
        {
          type: 'Action.OpenUrl',
          title: 'View AWS Health Dashboard',
          url: 'https://phd.aws.amazon.com/phd/home'
        }
      ]
    };
  }

  private getStatusColor(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('resolved') || statusLower.includes('completed')) {
      return 'Good';
    } else if (statusLower.includes('in progress') || statusLower.includes('ongoing')) {
      return 'Warning';
    } else if (statusLower.includes('scheduled') || statusLower.includes('planned')) {
      return 'Default';
    } else {
      return 'Attention';
    }
  }
}
