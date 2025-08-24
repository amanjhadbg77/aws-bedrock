import { handler } from '../index';
import * as fs from 'fs';
import * as path from 'path';

async function testHandler() {
  try {
    // Set environment variables for testing
    process.env.TEAMS_WEBHOOK_URL = 'https://your-teams-webhook-url.com/webhook';
    process.env.BEDROCK_REGION = 'us-east-1';
    process.env.ENVIRONMENT = 'test';

    // Load sample health event
    const sampleEventPath = path.join(__dirname, 'sample-health-event.json');
    const sampleEvent = JSON.parse(fs.readFileSync(sampleEventPath, 'utf8'));

    // Mock context
    const context = {
      functionName: 'test-function',
      functionVersion: '1',
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
      memoryLimitInMB: '512',
      awsRequestId: 'test-request-id',
      logGroupName: '/aws/lambda/test-function',
      logStreamName: 'test-stream',
      remainingTimeInMillis: () => 300000,
      done: () => {},
      fail: () => {},
      succeed: () => {}
    };

    console.log('Testing Lambda handler with sample health event...');
    console.log('Sample event:', JSON.stringify(sampleEvent, null, 2));

    const result = await handler(sampleEvent, context);
    
    console.log('Handler result:', JSON.stringify(result, null, 2));
    
    if (result.statusCode === 200) {
      console.log('✅ Test passed! Handler processed the event successfully.');
    } else {
      console.log('❌ Test failed! Handler returned error status:', result.statusCode);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testHandler();
