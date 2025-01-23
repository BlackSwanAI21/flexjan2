import { getCurrentTimeData, formatDateForBooking, parseBookingDate } from './timeUtils';

// Test getCurrentTimeData
console.log('\n1. Testing getCurrentTimeData:');
const timeData = getCurrentTimeData('Europe/London');
console.log('Current time data:', JSON.stringify(timeData, null, 2));

// Test parseBookingDate with different formats
console.log('\n2. Testing parseBookingDate:');

// Test "now"
console.log('\n2.1 Testing "now":');
const nowResult = parseBookingDate('now', 'Europe/London');
console.log('Parsed "now":', nowResult);

// Test DD-MMM-YYYY HH:MM format
console.log('\n2.2 Testing DD-MMM-YYYY HH:MM format:');
const testDateStr = '21-OCT-2023 08:30 AM';
const parsedDate = parseBookingDate(testDateStr, 'Europe/London');
console.log('Parsed date string:', parsedDate);

// Test ISO format
console.log('\n2.3 Testing ISO format:');
const testISOStr = '2023-10-21T08:30:00';
const parsedISO = parseBookingDate(testISOStr, 'Europe/London');
console.log('Parsed ISO string:', parsedISO);

// Test formatDateForBooking
console.log('\n3. Testing formatDateForBooking:');

// Test with "now"
console.log('\n3.1 Testing with "now":');
const nowFormatted = formatDateForBooking('now', 'Europe/London');
console.log('Formatted "now":', nowFormatted);

// Test with actual date
console.log('\n3.2 Testing with actual date:');
const testDate = new Date('2023-10-21T08:30:00');
const formattedDate = formatDateForBooking(testDate, 'Europe/London');
console.log('Formatted date:', formattedDate);

// Test complete flow
console.log('\n4. Testing complete flow (parse -> format):');
const parsedForFlow = parseBookingDate('21-OCT-2023 08:30 AM', 'Europe/London');
if (parsedForFlow && parsedForFlow !== 'now') {
  const formattedForFlow = formatDateForBooking(parsedForFlow, 'Europe/London');
  console.log('Flow result:', formattedForFlow);
} 