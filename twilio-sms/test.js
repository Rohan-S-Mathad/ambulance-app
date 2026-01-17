/**
 * Test Twilio SMS
 * Quick test script
 */

const { sendSMS, makeCall } = require('./smsService');

async function testSMS() {
  console.log('🧪 Testing Twilio SMS...\n');

  // Test 1: Send SMS
  console.log('Test 1: Sending SMS');
  const smsResult = await sendSMS(
    '+919876543210', // Replace with your phone number
    'Test SMS from Ambulance Dispatch System!'
  );
  console.log('Result:', smsResult);
  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Make Call (commented out to avoid actual call)
  // console.log('Test 2: Making Call');
  // const callResult = await makeCall(
  //   '+919876543210',
  //   'This is a test emergency call from Ambulance Dispatch System'
  // );
  // console.log('Result:', callResult);
}

// Run tests
testSMS()
  .then(() => {
    console.log('✅ Tests completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
