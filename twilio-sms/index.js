/**
 * Twilio SMS & Emergency Call API Server
 * Complete emergency response system with voice calls and live tracking
 */

const express = require('express');
const { sendSMS, makeCall, sendBulkSMS } = require('./smsService');
const {
  createEmergency,
  ambulanceAccepts,
  hospitalAccepts,
  updateAmbulanceLocation,
  getEmergency,
  makeEmergencyVoiceCall,
  makeEmergencyCallWithAudio,
  broadcastEmergencyCalls,
  sendEmergencySMS
} = require('./emergencyService');
const twilio = require('twilio');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ============================================================================
// EMERGENCY ENDPOINTS
// ============================================================================

/**
 * EMERGENCY BUTTON - Create Emergency and Call All
 * POST /emergency/create
 * Body: {
 *   patientPhone: "+919876543210",
 *   patientName: "John Doe",
 *   patientLocation: { lat: 12.9716, lon: 77.5946, address: "MG Road, Bangalore" }
 * }
 */
app.post('/emergency/create', async (req, res) => {
  try {
    const { patientPhone, patientName, patientLocation } = req.body;

    if (!patientPhone || !patientLocation) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: patientPhone, patientLocation'
      });
    }

    const result = await createEmergency({
      patientPhone,
      patientName: patientName || 'Patient',
      patientLocation
    });

    res.json(result);

  } catch (error) {
    console.error('Emergency creation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Ambulance Accepts Emergency
 * POST /emergency/:emergencyId/ambulance/accept
 * Body: {
 *   ambulanceId: "AMB_001",
 *   location: { lat: 12.9800, lon: 77.6000 }
 * }
 */
app.post('/emergency/:emergencyId/ambulance/accept', async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { ambulanceId, location } = req.body;

    if (!ambulanceId || !location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: ambulanceId, location'
      });
    }

    const result = await ambulanceAccepts(emergencyId, ambulanceId, location);
    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Hospital Accepts Emergency
 * POST /emergency/:emergencyId/hospital/accept
 * Body: { hospitalId: "HOSP_001" }
 */
app.post('/emergency/:emergencyId/hospital/accept', async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { hospitalId } = req.body;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: hospitalId'
      });
    }

    const result = await hospitalAccepts(emergencyId, hospitalId);
    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update Ambulance Location (Real-time tracking)
 * POST /emergency/:emergencyId/ambulance/location
 * Body: { lat: 12.9800, lon: 77.6000 }
 */
app.post('/emergency/:emergencyId/ambulance/location', (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { lat, lon } = req.body;

    if (lat === undefined || lon === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: lat, lon'
      });
    }

    const result = updateAmbulanceLocation(emergencyId, { lat, lon });
    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get Emergency Details (for tracking page)
 * GET /emergency/:emergencyId
 */
app.get('/emergency/:emergencyId', (req, res) => {
  try {
    const { emergencyId } = req.params;
    const emergency = getEmergency(emergencyId);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: 'Emergency not found'
      });
    }

    res.json({
      success: true,
      data: emergency
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// BASIC SMS/CALL ENDPOINTS (from original)
// ============================================================================

/**
 * Health Check
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'Twilio Emergency API',
    timestamp: new Date().toISOString()
  });
});

/**
 * Send Single SMS
 * POST /sms/send
 */
app.post('/sms/send', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, message'
      });
    }

    const result = await sendSMS(to, message);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Make Voice Call
 * POST /call/make
 */
app.post('/call/make', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, message'
      });
    }

    const result = await makeCall(to, message);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Trigger emergency - calls ambulances and hospitals
 * POST /emergency/trigger
 * Body: {
 *   patientPhone: "+919876543210",
 *   patientName: "John Doe",
 *   latitude: 12.9716,
 *   longitude: 77.5946,
 *   address: "MG Road, Bangalore",
 *   audioUrl: "https://yourserver.com/emergency-alert.mp3" (optional)
 * }
 */
app.post('/emergency/trigger', async (req, res) => {
  try {
    const { 
      patientPhone, 
      patientName, 
      latitude, 
      longitude, 
      address,
      audioUrl 
    } = req.body;

    // Validate input
    if (!patientPhone || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: patientPhone, latitude, longitude'
      });
    }

    // Emergency data
    const emergencyData = {
      patientPhone,
      patientName: patientName || 'Unknown',
      latitude,
      longitude,
      address: address || 'Address not available',
      callbackUrl: `http://yourserver.com/api`, // Replace with your server URL
      timestamp: new Date().toISOString()
    };

    // Get ambulance and hospital phone numbers from environment
    const ambulancePhones = [
      process.env.AMBULANCE_1_PHONE,
      process.env.AMBULANCE_2_PHONE
    ].filter(Boolean);

    const hospitalPhones = [
      process.env.HOSPITAL_1_PHONE
    ].filter(Boolean);

    // Check if we have phone numbers configured
    if (ambulancePhones.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'No ambulance phone numbers configured'
      });
    }

    // Make calls to ambulances
    const ambulanceCalls = audioUrl 
      ? await Promise.all(ambulancePhones.map(phone => 
          makeEmergencyCallWithAudio(phone, audioUrl, emergencyData)))
      : await broadcastEmergencyCalls(ambulancePhones, emergencyData);

    // Make calls to hospitals (if configured)
    const hospitalCalls = hospitalPhones.length > 0
      ? await broadcastEmergencyCalls(hospitalPhones, emergencyData)
      : [];

    // Also send SMS as backup
    const smsResults = await Promise.all([
      ...ambulancePhones.map(phone => sendEmergencySMS(phone, emergencyData)),
      ...hospitalPhones.map(phone => sendEmergencySMS(phone, emergencyData))
    ]);

    res.json({
      success: true,
      message: 'Emergency alerts sent',
      data: {
        emergencyData,
        ambulanceCalls,
        hospitalCalls,
        smsBackup: smsResults
      }
    });

  } catch (error) {
    console.error('Error triggering emergency:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Handle call response (when user presses 1 or 2)
 * POST /emergency/handle-response
 */
app.post('/emergency/handle-response', (req, res) => {
  const digit = req.body.Digits;
  const callSid = req.body.CallSid;
  const from = req.body.From;

  console.log(`Call response received: ${digit} from ${from} (${callSid})`);

  const twiml = new twilio.twiml.VoiceResponse();

  if (digit === '1') {
    twiml.say({ voice: 'alice' }, 'Thank you for accepting this emergency. You have been assigned. Goodbye.');
    // TODO: Update database to mark this responder as accepted
  } else if (digit === '2') {
    twiml.say({ voice: 'alice' }, 'You have declined this emergency. Thank you. Goodbye.');
    // TODO: Update database to mark as declined
  } else {
    twiml.say({ voice: 'alice' }, 'Invalid input. Goodbye.');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

/**
 * Handle call status updates
 * POST /emergency/call-status
 */
app.post('/emergency/call-status', (req, res) => {
  const { CallSid, CallStatus, From, To } = req.body;
  
  console.log(`Call ${CallSid} to ${To} status: ${CallStatus}`);
  
  // TODO: Update database with call status
  // Possible statuses: queued, initiated, ringing, in-progress, completed, busy, failed, no-answer
  
  res.sendStatus(200);
});

/**
 * Make a single emergency call
 * POST /emergency/call
 * Body: {
 *   toPhone: "+919876543210",
 *   latitude: 12.9716,
 *   longitude: 77.5946,
 *   address: "MG Road, Bangalore"
 * }
 */
app.post('/emergency/call', async (req, res) => {
  try {
    const { toPhone, latitude, longitude, address, audioUrl } = req.body;

    if (!toPhone || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const emergencyData = {
      latitude,
      longitude,
      address: address || 'Address not available',
      callbackUrl: 'http://yourserver.com/api'
    };

    const result = audioUrl
      ? await makeEmergencyCallWithAudio(toPhone, audioUrl, emergencyData)
      : await makeEmergencyVoiceCall(toPhone, emergencyData);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// TWILIO WEBHOOKS
// ============================================================================

/**
 * Webhook: Call Status Updates
 * POST /webhook/call-status
 */
app.post('/webhook/call-status', (req, res) => {
  console.log(' Call Status Update:', {
    callSid: req.body.CallSid,
    status: req.body.CallStatus,
    to: req.body.To
  });
  
  res.sendStatus(200);
});

/**
 * Webhook: Handle Digit Press (1=Accept, 2=Reject)
 * POST /webhook/gather
 */
app.post('/webhook/gather', (req, res) => {
  const digit = req.body.Digits;
  
  console.log(' User pressed:', digit);
  
  if (digit === '1') {
    res.send(`
      <Response>
        <Say>Thank you for accepting. We are connecting you now.</Say>
      </Response>
    `);
  } else if (digit === '2') {
    res.send(`
      <Response>
        <Say>Emergency rejected. Thank you.</Say>
      </Response>
    `);
  } else {
    res.send(`
      <Response>
        <Say>Invalid input. Please try again.</Say>
      </Response>
    `);
  }
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log(' EMERGENCY RESPONSE SYSTEM STARTED!');
  console.log(` Server: http://localhost:${PORT}`);
  console.log('='.repeat(70));
  console.log('EMERGENCY ENDPOINTS:');
  console.log('  POST /emergency/create                       - Emergency button');
  console.log('  POST /emergency/:id/ambulance/accept         - Ambulance accepts');
  console.log('  POST /emergency/:id/hospital/accept          - Hospital accepts');
  console.log('  POST /emergency/:id/ambulance/location       - Update location');
  console.log('  GET  /emergency/:id                          - Track emergency');
  console.log('');
  console.log('BASIC ENDPOINTS:');
  console.log('  GET  /health                                 - Health check');
  console.log('  POST /sms/send                               - Send SMS');
  console.log('  POST /call/make                              - Make call');
  console.log('='.repeat(70));
});
