import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import { analyzeTimePreference } from './timeAnalysis';

export interface TimeDetectionResult {
  phoneNumber: string | null;
  timezone: string;
  detectedTime?: string;
}

// Common country codes we want to support
const SUPPORTED_COUNTRIES: CountryCode[] = [
  'US',  // United States
  'CA',  // Canada
  'GB',  // United Kingdom
  'NZ',  // New Zealand
  'AU',  // Australia
  'ES',  // Spain
  'FR',  // France
  'DE',  // Germany
  'NO',  // Norway
  'NL',  // Netherlands
  'SE'   // Sweden
];

// Common country calling codes for prepending when missing
const COUNTRY_CODES = {
  US: '1',    // USA/Canada
  CA: '1',
  GB: '44',   // UK
  NZ: '64',   // New Zealand
  AU: '61',   // Australia
  ES: '34',   // Spain
  FR: '33',   // France
  DE: '49',   // Germany
  NO: '47',   // Norway
  NL: '31',   // Netherlands
  SE: '46'    // Sweden
};

// Enhanced regex pattern for international phone numbers
// This pattern matches:
// - Optional + or 00 prefix
// - Optional country code (1-3 digits)
// - Numbers starting with 0 (local format)
// - Main number part (allowing spaces, dots, or dashes between number groups)
// - Minimum 8 digits, maximum 15 (including country code)
const PHONE_REGEX = /(?:(?:\+|00)?[1-9]\d{0,2}[-\s.]?|0)?\d(?:[-\s.]*\d){7,14}/g;

/**
 * Process a message for time detection, including phone number extraction
 * @param messageContent The message content to analyze
 * @param timezone The user's timezone
 * @param aiMemory Optional AI memory for time analysis
 * @param openaiKey Optional OpenAI key for time analysis
 * @returns TimeDetectionResult containing detected phone numbers and time information
 */
export async function processTimeDetection(
  messageContent: string,
  timezone: string,
  aiMemory?: string,
  openaiKey?: string
): Promise<TimeDetectionResult> {
  console.log('Processing message for time detection:', {
    messageContent,
    timezone
  });

  const result: TimeDetectionResult = {
    phoneNumber: null,
    timezone
  };

  try {
    // Extract potential phone numbers using regex
    const matches = messageContent.match(PHONE_REGEX);
    console.log('Found phone matches:', matches);
    
    if (matches) {
      // Try to parse each potential phone number with different country codes
      for (const match of matches) {
        try {
          // First try to parse with the number as-is
          let validNumber = parsePhoneNumberFromString(match);
          
          // If not valid, try with explicit country codes
          if (!validNumber?.isValid()) {
            for (const [country, code] of Object.entries(COUNTRY_CODES)) {
              // Try with + prefix
              validNumber = parsePhoneNumberFromString(`+${code}${match.replace(/^0/, '')}`);
              if (validNumber?.isValid()) break;

              // Try with country code
              validNumber = parsePhoneNumberFromString(match, country as CountryCode);
              if (validNumber?.isValid()) break;
            }
          }
          
          if (validNumber?.isValid()) {
            // Use the first valid phone number found
            result.phoneNumber = validNumber.formatInternational();
            console.log('Valid phone number found:', result.phoneNumber);
            break;
          }
        } catch (parseError) {
          console.error('Error parsing phone number:', parseError);
          continue;
        }
      }
    }

    // Analyze time if we have the required parameters
    if (openaiKey && aiMemory) {
      console.log('Analyzing time preference...');
      try {
        const timeAnalysis = await analyzeTimePreference(
          messageContent,
          aiMemory,
          timezone,
          openaiKey
        );
        
        if (timeAnalysis.detectedTime) {
          result.detectedTime = timeAnalysis.detectedTime;
          console.log('Time detection successful:', timeAnalysis);
        }
      } catch (error) {
        console.error('Error analyzing time:', error);
      }
    } else {
      console.log('Skipping time analysis - missing required parameters');
    }

    return result;
  } catch (error) {
    console.error('Error in time detection:', error);
    return result;
  }
} 