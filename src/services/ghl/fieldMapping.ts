// Required field keys that we need to match
export const REQUIRED_FIELD_KEYS = {
  WEBHOOK_CHAT_GPT3: '{{custom_values.webook_chat_gpt3}}',
  FIRST_OUTGOING_MESSAGE: '{{custom_values.first_outgoing_message}}',
  AI_KEY: '{{custom_values.ai_key}}',
  ASSISTANT_ID: '{{custom_values.assistantid}}',
  GHL_API_KEY: '{{custom_values.ghl_api_key}}',
  GHL_LOCATION_ID: '{{custom_values.ghl_location_id}}'
} as const;

export interface MatchedFields {
  [key: string]: {
    id: string;
    name: string;
    fieldKey: string;
    matched: boolean;
  };
}

export function matchRequiredFields(customFields: any[]): MatchedFields {
  const result: MatchedFields = {};
  
  // Initialize result with all required fields as unmatched
  Object.entries(REQUIRED_FIELD_KEYS).forEach(([key, fieldKey]) => {
    result[key] = {
      id: '',
      name: '',
      fieldKey: fieldKey,
      matched: false
    };
  });

  // Match fields from the API response
  customFields.forEach(field => {
    Object.entries(REQUIRED_FIELD_KEYS).forEach(([key, requiredKey]) => {
      if (field.fieldKey === requiredKey) {
        result[key] = {
          id: field.id,
          name: field.name,
          fieldKey: field.fieldKey,
          matched: true
        };
      }
    });
  });

  return result;
}