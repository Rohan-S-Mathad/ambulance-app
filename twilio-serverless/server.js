const express = require('express');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Twilio client
const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

// Emergency alert endpoint
app.post('/emergency-alert', async (req, res) => {
  console.log('📞 Emergency alert received!', req.body);

  const {
    patientPhone,
    patientName,
    latitude,
    longitude,
    address,
    incidentId
  } = req.body;

  // Validate required fields
  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: latitude, longitude'
    });
  }

  try {
    // Build emergency message
    const emergencyMessage = `🚨 EMERGENCY ALERT!
Patient: ${patientName || 'Unknown'}
Location: ${address || `Lat: ${latitude}, Lon: ${longitude}`}
Incident ID: ${incidentId || 'N/A'}

Respond immediately!`;

    // Build TwiML for voice call
    const twimlMessage = `
      <Response>
        <Say voice="alice" language="en-US">
          Emergency Alert! Emergency Alert! 
          A medical emergency has been reported.
          Patient location: Latitude ${latitude}, Longitude ${longitude}.
          ${address || ''}
          Press 1 to accept this emergency.
          Press 2 to decline.
        </Say>
        <Gather numDigits="1" timeout="10">
          <Say voice="alice">Press 1 to accept, or 2 to decline.</Say>
        </Gather>
        <Say voice="alice">No input received. Goodbye.</Say>
      </Response>
    `;

    // Get phone numbers from environment
    const contacts = [];
    if (process.env.AMBULANCE_1_PHONE) {
      contacts.push({ phone: process.env.AMBULANCE_1_PHONE, type: 'Ambulance 1' });
    }
    if (process.env.AMBULANCE_2_PHONE && process.env.AMBULANCE_2_PHONE !== process.env.AMBULANCE_1_PHONE) {
      contacts.push({ phone: process.env.AMBULANCE_2_PHONE, type: 'Ambulance 2' });
    }
    if (process.env.HOSPITAL_1_PHONE) {
      contacts.push({ phone: process.env.HOSPITAL_1_PHONE, type: 'Hospital 1' });
    }

    if (contacts.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'No emergency contacts configured'
      });
    }

    console.log(`📞 Calling ${contacts.length} contacts...`);

    // Make calls and send SMS to all contacts
    const results = await Promise.all(
      contacts.map(async (contact) => {
        try {
          console.log(`  ☎️  Calling ${contact.type}: ${contact.phone}`);

          // Make voice call
          const call = await client.calls.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: contact.phone,
            twiml: twimlMessage
          });

          console.log(`  ✅ Call SID: ${call.sid}`);

          // Send SMS as backup
          const sms = await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: contact.phone,
            body: emergencyMessage
          });

          console.log(`  ✅ SMS SID: ${sms.sid}`);

          return {
            contact: contact.type,
            phone: contact.phone,
            callSid: call.sid,
            smsSid: sms.sid,
            status: 'success'
          };
        } catch (error) {
          console.error(`  ❌ Error contacting ${contact.type}:`, error.message);
          return {
            contact: contact.type,
            phone: contact.phone,
            status: 'error',
            error: error.message
          };
        }
      })
    );

    // Return success response
    res.json({
      success: true,
      message: 'Emergency alerts sent',
      incidentId: incidentId,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Emergency alert error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Ambulance Emergency System - Twilio Server',
    endpoints: ['/emergency-alert']
  });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';  // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log('');
  console.log('🚑 ========================================');
  console.log('🚑 Ambulance Emergency System - RUNNING!');
  console.log('🚑 ========================================');
  console.log(`🚑 Server: http://localhost:${PORT}`);
  console.log(`🚑 Network: http://10.251.87.24:${PORT}`);
  console.log(`🚑 Emergency endpoint: /emergency-alert`);
  console.log('🚑 ========================================');
  console.log('');
  console.log('📱 Configured contacts:');
  console.log(`  Twilio Number: ${process.env.TWILIO_PHONE_NUMBER}`);
  console.log(`  Ambulance 1: ${process.env.AMBULANCE_1_PHONE}`);
  console.log(`  Ambulance 2: ${process.env.AMBULANCE_2_PHONE}`);
  console.log(`  Hospital 1: ${process.env.HOSPITAL_1_PHONE}`);
  console.log('');
  console.log('✅ Ready to handle emergencies!');
  console.log('✅ Accepting connections from network!');
  console.log('');
});
