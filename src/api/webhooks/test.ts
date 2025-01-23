import { handleWebhookCall } from './controller';

// Test webhook payload
const testPayload = {
  lead_response: "How does that work?",
  openai_key: process.env.OPENAI_API_KEY || "test-key",
  assistant_id: "asst_test123", // This should match the assistant_id in your preferences table
  ghl_api_key: "test-ghl-key",
  "AI Memory": "Previous conversation",
  contact_id: "test-contact-id"
};

async function testWebhookHandler() {
  try {
    console.log('Starting webhook handler test...');
    
    // Test with a known webhook ID
    const result = await handleWebhookCall('test-webhook-id', testPayload);
    
    console.log('Test completed. Result:', result);
    console.log('GHL Preferences lookup successful if you see preferences logging above');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testWebhookHandler(); 
