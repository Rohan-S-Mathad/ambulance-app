/**
 * Twilio SMS Service
 * Simple SMS sending without Firebase
 */

require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Send SMS via Twilio
 * @param {string} to - Recipient phone number (e.g., +919876543210)
 * @param {string} message - SMS message content
 * @returns {Promise<object>} - Twilio API response
 */
async function sendSMS(to, message) {
  try {
    console.log('📱 Sending SMS...');
    console.log('   To:', to);
    console.log('   Message:', message);

    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    console.log('✅ SMS Sent Successfully!');
    console.log('   SID:', result.sid);
    console.log('   Status:', result.status);

    return {
      success: true,
      sid: result.sid,
      status: result.status,
      to: result.to,
      from: result.from,
      dateCreated: result.dateCreated
    };

  } catch (error) {
    console.error('❌ SMS Send Failed!');
    console.error('   Error:', error.message);
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

/**
 * Make Voice Call via Twilio
 * @param {string} to - Recipient phone number
 * @param {string} message - Voice message (TwiML URL or text)
 * @returns {Promise<object>} - Twilio API response
 */
async function makeCall(to, message) {
  try {
    console.log('📞 Making Call...');
    console.log('   To:', to);
    console.log('   Message:', message);

    const result = await client.calls.create({
      url: `http://twimlets.com/message?Message=${encodeURIComponent(message)}`,
      to: to,
      from: twilioPhoneNumber
    });

    console.log('✅ Call Initiated!');
    console.log('   SID:', result.sid);
    console.log('   Status:', result.status);

    return {
      success: true,
      sid: result.sid,
      status: result.status,
      to: result.to,
      from: result.from
    };

  } catch (error) {
    console.error('❌ Call Failed!');
    console.error('   Error:', error.message);
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

/**
 * Send SMS to multiple recipients
 * @param {Array<string>} recipients - Array of phone numbers
 * @param {string} message - SMS message
 * @returns {Promise<Array>} - Array of results
 */
async function sendBulkSMS(recipients, message) {
  console.log(`📱 Sending SMS to ${recipients.length} recipients...`);
  
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendSMS(recipient, message);
    results.push(result);
    
    // Wait 1 second between sends to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const successful = results.filter(r => r.success).length;
  console.log(`✅ Sent ${successful}/${recipients.length} SMS successfully`);
  
  return results;
}

module.exports = {
  sendSMS,
  makeCall,
  sendBulkSMS
};
