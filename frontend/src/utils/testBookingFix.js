/**
 * Test script to verify booking status update fix
 * This validates that the correct enum values are being sent to the backend
 */

import { validateBookingStatusPayload } from './payloadValidator';

// Test Cases
const testCases = [
  {
    name: 'Accept booking (maid perspective)',
    input: { status: 'accepted' },
    shouldPass: true,
    expectedOutput: { status: 'accepted' },
  },
  {
    name: 'Complete booking',
    input: { status: 'completed' },
    shouldPass: true,
    expectedOutput: { status: 'completed' },
  },
  {
    name: 'Decline/Cancel booking',
    input: { status: 'canceled' },
    shouldPass: true,
    expectedOutput: { status: 'canceled' },
  },
  {
    name: 'Invalid status: confirmed (OLD - should fail)',
    input: { status: 'confirmed' },
    shouldPass: false,
    expectedError: 'Invalid booking status',
  },
  {
    name: 'Invalid status: cancelled (OLD - should fail)',
    input: { status: 'cancelled' },
    shouldPass: false,
    expectedError: 'Invalid booking status',
  },
  {
    name: 'Pending status',
    input: { status: 'pending' },
    shouldPass: true,
    expectedOutput: { status: 'pending' },
  },
  {
    name: 'Update with notes',
    input: { status: 'accepted', notes: 'Will arrive in 30 mins' },
    shouldPass: true,
    expectedOutput: { status: 'accepted', notes: 'Will arrive in 30 mins' },
  },
  {
    name: 'Empty notes are excluded',
    input: { status: 'accepted', notes: '' },
    shouldPass: true,
    expectedOutput: { status: 'accepted' },
  },
  {
    name: 'Whitespace-only notes are excluded',
    input: { status: 'accepted', notes: '   ' },
    shouldPass: true,
    expectedOutput: { status: 'accepted' },
  },
];

// Run tests
export function runBookingValidationTests() {
  console.log('🧪 Running Booking Status Validation Tests...\n');

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);

    try {
      const result = validateBookingStatusPayload(testCase.input);

      if (testCase.shouldPass) {
        // Check if output matches expected
        const matches = JSON.stringify(result) === JSON.stringify(testCase.expectedOutput);
        if (matches) {
          console.log(
            `✅ PASSED - Input: ${JSON.stringify(testCase.input)} → Output: ${JSON.stringify(result)}`
          );
          passed++;
        } else {
          console.log(
            `❌ FAILED - Expected ${JSON.stringify(testCase.expectedOutput)}, got ${JSON.stringify(result)}`
          );
          failed++;
        }
      } else {
        console.log(
          `❌ FAILED - Should have thrown error but returned: ${JSON.stringify(result)}`
        );
        failed++;
      }
    } catch (error) {
      if (!testCase.shouldPass) {
        if (error.message.includes(testCase.expectedError)) {
          console.log(`✅ PASSED - Correctly rejected with error: "${error.message}"`);
          passed++;
        } else {
          console.log(
            `❌ FAILED - Expected error containing "${testCase.expectedError}" but got "${error.message}"`
          );
          failed++;
        }
      } else {
        console.log(`❌ FAILED - Unexpected error: ${error.message}`);
        failed++;
      }
    }

    console.log('---');
  });

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

  if (failed === 0) {
    console.log('✅ ALL TESTS PASSED! Booking status validation is working correctly.');
    return true;
  } else {
    console.log('❌ SOME TESTS FAILED! Check the validation logic.');
    return false;
  }
}

// Test the status mapping function
export function testStatusMapping() {
  console.log('\n🔄 Testing Status Mapping in handleStatusUpdate()...\n');

  // This simulates what happens in BookingsList.jsx handleStatusUpdate()
  const statusMap = {
    confirmed: 'accepted',
    cancelled: 'canceled',
  };

  const testStatuses = ['confirmed', 'cancelled', 'completed', 'pending', 'accepted'];

  testStatuses.forEach((status) => {
    const backendStatus = statusMap[status] || status;
    console.log(`Frontend: "${status}" → Backend: "${backendStatus}"`);
  });
}

// Auto-run when imported in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment to auto-run:
  // runBookingValidationTests();
  // testStatusMapping();
}
