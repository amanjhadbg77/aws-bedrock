import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { BedrockRequest, BedrockResponse, SimplifiedMaintenanceMessage } from '../types';

export class BedrockClient {
  private client: BedrockRuntimeClient;
  private modelId: string;

  constructor(region: string = 'us-east-1') {
    this.client = new BedrockRuntimeClient({ region });
    this.modelId = 'amazon.titan-text-express-v1'; // Nova Lite equivalent
  }

  async simplifyMaintenanceMessage(healthEvent: any): Promise<SimplifiedMaintenanceMessage> {
    const prompt = this.buildPrompt(healthEvent);
    
    const request: BedrockRequest = {
      modelId: this.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: 1000,
          stopSequences: [],
          temperature: 0.3,
          topP: 0.9
        }
      })
    };

    try {
      const command = new InvokeModelCommand({
        modelId: request.modelId,
        contentType: request.contentType,
        accept: request.accept,
        body: Buffer.from(request.body)
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return this.parseBedrockResponse(responseBody);
    } catch (error) {
      console.error('Error calling Bedrock:', error);
      throw new Error(`Failed to simplify maintenance message: ${error}`);
    }
  }

  private buildPrompt(healthEvent: any): string {
    return `Please analyze this AWS Health event and provide a simplified, user-friendly maintenance message in the following JSON format:

{
  "title": "Brief, clear title",
  "summary": "Simple explanation of what's happening",
  "affectedServices": ["List of affected services"],
  "impact": "What this means for users",
  "timeframe": "When this will happen or is expected to resolve",
  "status": "Current status",
  "recommendations": ["Action items for users"]
}

AWS Health Event Details:
- Service: ${healthEvent.detail.service}
- Event Type: ${healthEvent.detail.eventTypeCode}
- Category: ${healthEvent.detail.eventTypeCategory}
- Description: ${healthEvent.detail.eventDescription?.[0]?.latestDescription || 'No description available'}
- Start Time: ${healthEvent.detail.startTime || 'Not specified'}
- End Time: ${healthEvent.detail.endTime || 'Not specified'}
- Status: ${healthEvent.detail.statusCode || 'Unknown'}
- Affected Entities: ${healthEvent.detail.affectedEntities?.map(e => e.entityValue).join(', ') || 'None specified'}

Please provide only the JSON response, no additional text.`;
  }

  private parseBedrockResponse(response: any): SimplifiedMaintenanceMessage {
    try {
      // Extract the completion text from the response
      const completionText = response.completion || response.text || '';
      
      // Try to find JSON in the response
      const jsonMatch = completionText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title || 'Maintenance Update',
          summary: parsed.summary || 'No summary available',
          affectedServices: parsed.affectedServices || [],
          impact: parsed.impact || 'Impact not specified',
          timeframe: parsed.timeframe || 'Timeframe not specified',
          status: parsed.status || 'Status unknown',
          recommendations: parsed.recommendations || []
        };
      }
      
      // Fallback if no JSON found
      return {
        title: 'Maintenance Update',
        summary: completionText || 'No summary available',
        affectedServices: [],
        impact: 'Impact not specified',
        timeframe: 'Timeframe not specified',
        status: 'Status unknown',
        recommendations: []
      };
    } catch (error) {
      console.error('Error parsing Bedrock response:', error);
      return {
        title: 'Maintenance Update',
        summary: 'Unable to parse maintenance details',
        affectedServices: [],
        impact: 'Impact not specified',
        timeframe: 'Timeframe not specified',
        status: 'Status unknown',
        recommendations: []
      };
    }
  }
}
