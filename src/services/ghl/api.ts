import { GHL_API_BASE_URL } from './constants';
import type { CustomValue, UpdateCustomValuePayload } from './types';

export async function fetchCustomValues(apiKey: string): Promise<CustomValue[]> {
  try {
    const response = await fetch(`${GHL_API_BASE_URL}/custom-values/`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`GHL API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract customValues array from response
    if (data.customValues && Array.isArray(data.customValues)) {
      return data.customValues.map((field: any) => ({
        id: field.id,
        name: field.name,
        fieldKey: field.fieldKey,
        value: field.value
      }));
    }

    return [];
  } catch (err) {
    console.error('GHL Custom Fields Error:', err);
    throw err;
  }
}

export async function updateCustomValue(
  apiKey: string,
  customValueId: string,
  value: string
): Promise<void> {
  const response = await fetch(`${GHL_API_BASE_URL}/custom-values/${customValueId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ value })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to update custom value: ${error.message}`);
  }
}

export async function updateCustomValues(
  apiKey: string,
  updates: UpdateCustomValuePayload[]
): Promise<void> {
  await Promise.all(
    updates.map(update => 
      updateCustomValue(apiKey, update.customValueId, update.value)
    )
  );
}

interface GHLContactUpdate {
  email?: string;
  phone?: string;
  customField: {
    chat_gpt: string;
    thread_id: string;
    ai_moderation_reason?: string;
    call_back_time?: string;
  }
}

/**
 * Updates a contact in Go High Level with the webhook response data
 */
export async function updateGHLContact(
  ghlApiKey: string,
  contactData: GHLContactUpdate
): Promise<any> {
  console.log('Updating GHL contact with data:', contactData);

  try {
    const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ghlApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GHL API error:', errorData);
      throw new Error(`GHL API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('GHL contact update successful:', result);
    return result;
  } catch (error) {
    console.error('Failed to update GHL contact:', error);
    throw error;
  }
}