export const GHL_API_BASE_URL = 'https://rest.gohighlevel.com/v1';

export const REQUIRED_FIELD_KEYS = {
  WEBHOOK_CHAT_GPT3: '{{custom_values.webook_chat_gpt3}}',
  FIRST_OUTGOING_MESSAGE: '{{custom_values.first_outgoing_message}}',
  AI_KEY: '{{custom_values.open_ai_key}}',
  ASSISTANT_ID: '{{custom_values.assistantid}}',
  GHL_API_KEY: '{{custom_values.ghl_api_key}}',
  GHL_LOCATION_ID: '{{custom_values.ghl_location_id}}'
} as const;