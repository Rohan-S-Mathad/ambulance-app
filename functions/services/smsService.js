/**
 * SMS Service
 * Handles sending SMS/calls via external APIs (Twilio, Fast2SMS, etc.)
 * Works locally with Firebase Emulator
 */

const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Send SMS via external API
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - SMS message content
 * @param {string} provider - SMS provider (twilio, fast2sms, mock)
 * @returns {Promise<object>} Result of SMS send
 */
async function sendSMS(phoneNumber, message, provider = 'mock') {
  try {
    logger.info('SMS_SEND_STARTED', { phoneNumber, provider, messageLength: message.length });

    let result;

    switch (provider) {
      case 'twilio':
        result = await sendViaTwilio(phoneNumber, message);
        break;
      case 'fast2sms':
        result = await sendViaFast2SMS(phoneNumber, message);
        break;
      case 'mock':
      default:
        result = await sendViaMockAPI(phoneNumber, message);
        break;
    }

    logger.info('SMS_SEND_SUCCESS', { phoneNumber, provider, result });
    return { success: true, provider, result };

  } catch (error) {
    logger.error('SMS_SEND_ERROR', { 
      phoneNumber, 
      provider, 
      error: error.message,
      stack: error.stack 
    });
    throw error;
  }
}

/**
 * Send SMS via Twilio
 * @param {string} phoneNumber 
 * @param {string} message 
 * @returns {Promise<object>}
 */
async function sendViaTwilio(phoneNumber, message) {
  // Twilio credentials (set these in environment variables)
  const accountSid = process.env.TWILIO_ACCOUNT_SID || 'YOUR_TWILIO_SID';
  const authToken = process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_TOKEN';
  const fromNumber = process.env.TWILIO_FROM_NUMBER || '+1234567890';

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const response = await axios.post(url, 
    new URLSearchParams({
      To: phoneNumber,
      From: fromNumber,
      Body: message
    }), 
    {
      auth: {
        username: accountSid,
        password: authToken
      }
    }
  );

  return response.data;
}

/**
 * Send SMS via Fast2SMS (India)
 * @param {string} phoneNumber 
 * @param {string} message 
 * @returns {Promise<object>}
 */
async function sendViaFast2SMS(phoneNumber, message) {
  // Fast2SMS API key (set in environment variable)
  const apiKey = process.env.FAST2SMS_API_KEY || 'YOUR_FAST2SMS_KEY';

  const url = 'https://www.fast2sms.com/dev/bulkV2';

  const response = await axios.post(url, {
    route: 'v3',
    sender_id: 'TXTIND',
    message: message,
    language: 'english',
    flash: 0,
    numbers: phoneNumber.replace('+91', '') // Remove country code
  }, {
    headers: {
      'authorization': apiKey,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

/**
 * Mock API for local testing (always succeeds)
 * @param {string} phoneNumber 
 * @param {string} message 
 * @returns {Promise<object>}
 */
async function sendViaMockAPI(phoneNumber, message) {
  // Using a free mock API service for testing
  const url = 'https://httpbin.org/post'; // Public test endpoint
  
  const payload = {
    to: phoneNumber,
    message: message,
    timestamp: new Date().toISOString(),
    service: 'mock-sms-service'
  };

  console.log('📱 MOCK SMS SEND:');
  console.log('   To:', phoneNumber);
  console.log('   Message:', message);
  console.log('   Payload:', JSON.stringify(payload, null, 2));

  const response = await axios.post(url, payload, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  console.log('✅ MOCK SMS Response:', response.status, response.statusText);

  return {
    success: true,
    mockResponse: response.data,
    sentTo: phoneNumber,
    message: message
  };
}

/**
 * Make a call via external API
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - Voice message or TwiML URL
 * @returns {Promise<object>} Result of call
 */
async function makeCall(phoneNumber, message) {
  try {
    logger.info('CALL_STARTED', { phoneNumber });

    // Using mock API for demonstration
    const url = 'https://httpbin.org/post';
    
    const payload = {
      to: phoneNumber,
      message: message,
      callType: 'voice',
      timestamp: new Date().toISOString()
    };

    console.log('📞 MOCK CALL:');
    console.log('   To:', phoneNumber);
    console.log('   Message:', message);

    const response = await axios.post(url, payload);

    logger.info('CALL_SUCCESS', { phoneNumber, status: response.status });
    
    return {
      success: true,
      callTo: phoneNumber,
      status: 'initiated',
      mockResponse: response.data
    };

  } catch (error) {
    logger.error('CALL_ERROR', { phoneNumber, error: error.message });
    throw error;
  }
}

module.exports = {
  sendSMS,
  makeCall,
  sendViaTwilio,
  sendViaFast2SMS,
  sendViaMockAPI
};
