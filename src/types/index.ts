export interface AWSHealthEvent {
  version: string;
  id: string;
  'detail-type': string;
  source: string;
  account: string;
  time: string;
  region: string;
  resources: string[];
  detail: {
    eventTypeCode: string;
    eventTypeCategory: string;
    service: string;
    eventDescription: Array<{
      language: string;
      latestDescription: string;
    }>;
    affectedEntities?: Array<{
      entityValue: string;
      tags?: Record<string, string>;
    }>;
    startTime?: string;
    endTime?: string;
    lastUpdatedTime?: string;
    statusCode?: string;
  };
}

export interface BedrockRequest {
  modelId: string;
  contentType: string;
  accept: string;
  body: string;
}

export interface BedrockResponse {
  body: {
    completion: string;
    stop_reason: string;
    stop: string;
    truncated: boolean;
    truncated_reason: string;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  };
  responseMetadata: {
    requestId: string;
    httpStatusCode: number;
    httpHeaders: Record<string, string>;
  };
}

export interface SimplifiedMaintenanceMessage {
  title: string;
  summary: string;
  affectedServices: string[];
  impact: string;
  timeframe: string;
  status: string;
  recommendations: string[];
}

export interface TeamsAdaptiveCard {
  type: string;
  version: string;
  body: Array<{
    type: string;
    text?: string;
    size?: string;
    weight?: string;
    color?: string;
    wrap?: boolean;
    items?: Array<{
      type: string;
      text: string;
      size?: string;
      color?: string;
    }>;
  }>;
  actions?: Array<{
    type: string;
    title: string;
    url: string;
  }>;
}

export interface TeamsWebhookPayload {
  type: string;
  attachments: Array<{
    contentType: string;
    content: TeamsAdaptiveCard;
  }>;
}

export interface LambdaEvent {
  version: string;
  id: string;
  'detail-type': string;
  source: string;
  account: string;
  time: string;
  region: string;
  resources: string[];
  detail: AWSHealthEvent['detail'];
}

export interface LambdaContext {
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: string;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  remainingTimeInMillis: () => number;
  done: (error?: Error, result?: any) => void;
  fail: (error: string | Error) => void;
  succeed: (message: any) => void;
}
