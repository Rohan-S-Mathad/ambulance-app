/**
 * Emergency Service
 * Handles emergency calls, voice messages, and location tracking
 */

require('dotenv').config();
const twilio = require('twilio');
const { sendSMS } = require('./smsService');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// In-memory storage for active emergencies (use database in production)
const activeEmergencies = new Map();

/**
 * Create Emergency and Call All Verified Contacts
 * @param {object} emergency - Emergency details
 * @returns {Promise<object>} - Emergency ID and call results
 */
async function createEmergency(emergency) {
  const emergencyId = `EMR_${Date.now()}`;
  
  const emergencyData = {
    id: emergencyId,
    patientPhone: emergency.patientPhone,
    patientName: emergency.patientName || 'Patient',
    patientLocation: emergency.patientLocation, // { lat, lon, address }
    status: 'pending', // pending, ambulance_assigned, hospital_assigned, completed
    assignedAmbulance: null,
    assignedHospital: null,
    createdAt: new Date(),
    calls: [],
    sms: []
  };
  
  activeEmergencies.set(emergencyId, emergencyData);
  
  console.log('🚨 EMERGENCY CREATED!');
  console.log('   ID:', emergencyId);
  console.log('   Patient:', emergency.patientName);
  console.log('   Location:', emergency.patientLocation.address);
  
  // Step 1: Call all ambulances
  const ambulanceCalls = await callAmbulances(emergencyId, emergency);
  
  // Step 2: Send SMS to patient
  await sendSMS(
    emergency.patientPhone,
    `Emergency alert received! We're calling nearby ambulances. Emergency ID: ${emergencyId}`
  );
  
  return {
    success: true,
    emergencyId,
    message: 'Emergency created and calls initiated',
    ambulanceCalls: ambulanceCalls.length,
    data: emergencyData
  };
}

/**
 * Call All Verified Ambulances
 * @param {string} emergencyId - Emergency ID
 * @param {object} emergency - Emergency details
 * @returns {Promise<Array>} - Call results
 */
async function callAmbulances(emergencyId, emergency) {
  // Verified ambulance phone numbers (get from database in production)
  const ambulances = [
    { id: 'AMB_001', phone: process.env.AMBULANCE_1_PHONE || '+919482936725', name: 'City Ambulance 1' },
    { id: 'AMB_002', phone: process.env.AMBULANCE_2_PHONE || '+919876543211', name: 'Metro Ambulance 2' }
  ];
  
  console.log(`📞 Calling ${ambulances.length} ambulances...`);
  
  const calls = [];
  
  for (const ambulance of ambulances) {
    try {
      // Create TwiML for voice message
      const twimlUrl = createAmbulanceTwiML(emergencyId, emergency, ambulance);
      
      const call = await client.calls.create({
        url: twimlUrl,
        to: ambulance.phone,
        from: twilioPhoneNumber,
        statusCallback: `${process.env.SERVER_URL || 'http://localhost:3000'}/webhook/call-status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
      });
      
      console.log(`✅ Called ${ambulance.name}: ${call.sid}`);
      
      calls.push({
        ambulanceId: ambulance.id,
        callSid: call.sid,
        status: call.status,
        name: ambulance.name
      });
      
      // Update emergency data
      const emergencyData = activeEmergencies.get(emergencyId);
      emergencyData.calls.push({
        type: 'ambulance',
        targetId: ambulance.id,
        callSid: call.sid,
        status: 'initiated'
      });
      
    } catch (error) {
      console.error(`❌ Failed to call ${ambulance.name}:`, error.message);
      calls.push({
        ambulanceId: ambulance.id,
        error: error.message
      });
    }
  }
  
  return calls;
}

/**
 * Create TwiML URL for Ambulance Voice Message
 * @param {string} emergencyId 
 * @param {object} emergency 
 * @param {object} ambulance 
 * @returns {string} TwiML URL
 */
function createAmbulanceTwiML(emergencyId, emergency, ambulance) {
  const message = `
    Emergency alert! Emergency alert!
    Patient ${emergency.patientName} needs immediate ambulance assistance.
    Location: ${emergency.patientLocation.address}.
    Emergency ID: ${emergencyId}.
    Press 1 to accept this emergency.
    Press 2 to reject.
  `.trim();
  
  // Twilio's TwiML Bins or hosted TwiML endpoint
  // For now, using simple message
  return `http://twimlets.com/message?Message=${encodeURIComponent(message)}`;
}

/**
 * Call Hospital After Ambulance Accepts
 * @param {string} emergencyId 
 * @returns {Promise<object>}
 */
async function callHospital(emergencyId) {
  const emergencyData = activeEmergencies.get(emergencyId);
  
  if (!emergencyData) {
    throw new Error('Emergency not found');
  }
  
  // Verified hospital phone number
  const hospital = {
    id: 'HOSP_001',
    phone: process.env.HOSPITAL_1_PHONE || '+918765432109',
    name: 'City General Hospital'
  };
  
  console.log(`📞 Calling hospital: ${hospital.name}`);
  
  const message = `
    Emergency patient incoming!
    Patient ${emergencyData.patientName} is being transported.
    Ambulance ${emergencyData.assignedAmbulance.name} is on the way.
    Emergency ID: ${emergencyId}.
    Please confirm bed availability.
    Press 1 to confirm bed available.
    Press 2 if no beds available.
  `.trim();
  
  const call = await client.calls.create({
    url: `http://twimlets.com/message?Message=${encodeURIComponent(message)}`,
    to: hospital.phone,
    from: twilioPhoneNumber
  });
  
  console.log(`✅ Called hospital: ${call.sid}`);
  
  emergencyData.calls.push({
    type: 'hospital',
    targetId: hospital.id,
    callSid: call.sid,
    status: 'initiated'
  });
  
  return {
    success: true,
    hospitalId: hospital.id,
    callSid: call.sid
  };
}

/**
 * Ambulance Accepts Emergency
 * @param {string} emergencyId 
 * @param {string} ambulanceId 
 * @param {object} ambulanceLocation - { lat, lon }
 * @returns {Promise<object>}
 */
async function ambulanceAccepts(emergencyId, ambulanceId, ambulanceLocation) {
  const emergencyData = activeEmergencies.get(emergencyId);
  
  if (!emergencyData) {
    return { success: false, error: 'Emergency not found' };
  }
  
  if (emergencyData.assignedAmbulance) {
    return { success: false, error: 'Already assigned to another ambulance' };
  }
  
  console.log(`🚑 Ambulance ${ambulanceId} accepted emergency ${emergencyId}`);
  
  // Assign ambulance
  emergencyData.assignedAmbulance = {
    id: ambulanceId,
    location: ambulanceLocation,
    acceptedAt: new Date()
  };
  emergencyData.status = 'ambulance_assigned';
  
  // Notify patient via SMS with live tracking link
  await sendSMS(
    emergencyData.patientPhone,
    `Ambulance accepted! Tracking: http://yourapp.com/track/${emergencyId}`
  );
  
  // Call hospital
  await callHospital(emergencyId);
  
  return {
    success: true,
    emergencyId,
    ambulanceId,
    message: 'Ambulance assigned successfully'
  };
}

/**
 * Hospital Accepts Emergency
 * @param {string} emergencyId 
 * @param {string} hospitalId 
 * @returns {Promise<object>}
 */
async function hospitalAccepts(emergencyId, hospitalId) {
  const emergencyData = activeEmergencies.get(emergencyId);
  
  if (!emergencyData) {
    return { success: false, error: 'Emergency not found' };
  }
  
  if (emergencyData.assignedHospital) {
    return { success: false, error: 'Already assigned to another hospital' };
  }
  
  console.log(`🏥 Hospital ${hospitalId} accepted emergency ${emergencyId}`);
  
  emergencyData.assignedHospital = {
    id: hospitalId,
    acceptedAt: new Date()
  };
  emergencyData.status = 'hospital_assigned';
  
  // Notify patient
  await sendSMS(
    emergencyData.patientPhone,
    `Hospital confirmed! Bed ready at City General Hospital.`
  );
  
  // Notify ambulance
  if (emergencyData.assignedAmbulance) {
    await sendSMS(
      emergencyData.assignedAmbulance.phone || emergencyData.patientPhone,
      `Hospital bed confirmed at City General Hospital.`
    );
  }
  
  return {
    success: true,
    emergencyId,
    hospitalId,
    message: 'Hospital assigned successfully'
  };
}

/**
 * Update Ambulance Location (Real-time tracking)
 * @param {string} emergencyId 
 * @param {object} location - { lat, lon }
 * @returns {object}
 */
function updateAmbulanceLocation(emergencyId, location) {
  const emergencyData = activeEmergencies.get(emergencyId);
  
  if (!emergencyData || !emergencyData.assignedAmbulance) {
    return { success: false, error: 'No ambulance assigned' };
  }
  
  emergencyData.assignedAmbulance.location = location;
  emergencyData.assignedAmbulance.lastUpdate = new Date();
  
  console.log(`📍 Ambulance location updated: ${location.lat}, ${location.lon}`);
  
  return {
    success: true,
    emergencyId,
    location
  };
}

/**
 * Get Emergency Details (for tracking)
 * @param {string} emergencyId 
 * @returns {object}
 */
function getEmergency(emergencyId) {
  const emergencyData = activeEmergencies.get(emergencyId);
  
  if (!emergencyData) {
    return null;
  }
  
  return {
    id: emergencyData.id,
    patientName: emergencyData.patientName,
    patientLocation: emergencyData.patientLocation,
    status: emergencyData.status,
    assignedAmbulance: emergencyData.assignedAmbulance,
    assignedHospital: emergencyData.assignedHospital,
    createdAt: emergencyData.createdAt
  };
}

/**
 * Make emergency voice call with custom message
 * @param {string} toPhoneNumber - Phone number to call
 * @param {object} emergencyData - Emergency information
 * @returns {Promise} Call details
 */
async function makeEmergencyVoiceCall(toPhoneNumber, emergencyData) {
    try {
        // Handle both flat and nested location structure
        const lat = emergencyData.latitude || emergencyData.patientLocation?.lat || 'unknown';
        const lon = emergencyData.longitude || emergencyData.patientLocation?.lon || 'unknown';
        const address = emergencyData.address || emergencyData.patientLocation?.address || 'Address not available';
        
        // Create TwiML for voice message
        const twiml = `
            <Response>
                <Say voice="alice" language="en-US">
                    Emergency Alert! Emergency Alert! 
                    This is an automated emergency notification.
                    A medical emergency has been reported.
                    Patient location: Latitude ${lat}, Longitude ${lon}.
                    ${address}.
                    Press 1 to accept this emergency.
                    Press 2 to decline.
                </Say>
                <Gather numDigits="1" action="${process.env.SERVER_URL || 'http://localhost:3000'}/emergency/handle-response" method="POST">
                    <Say voice="alice">Press 1 to accept, or 2 to decline.</Say>
                </Gather>
                <Say voice="alice">No input received. Goodbye.</Say>
            </Response>
        `;

        const call = await client.calls.create({
            from: twilioPhoneNumber,
            to: toPhoneNumber,
            twiml: twiml,
            statusCallback: `${process.env.SERVER_URL || 'http://localhost:3000'}/webhook/call-status`,
            statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
        });

        console.log(`✅ Emergency call initiated to ${toPhoneNumber}: ${call.sid}`);
        return {
            success: true,
            callSid: call.sid,
            status: call.status,
            to: toPhoneNumber
        };
    } catch (error) {
        console.error(`❌ Error making emergency call to ${toPhoneNumber}:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Make emergency call with MP3 audio file
 * @param {string} toPhoneNumber - Phone number to call
 * @param {string} audioUrl - URL to MP3 file
 * @param {object} emergencyData - Emergency information
 * @returns {Promise} Call details
 */
async function makeEmergencyCallWithAudio(toPhoneNumber, audioUrl, emergencyData) {
    try {
        // Create TwiML with audio playback
        const twiml = `
            <Response>
                <Play>${audioUrl}</Play>
                <Gather numDigits="1" action="${process.env.SERVER_URL || 'http://localhost:3000'}/emergency/handle-response" method="POST" timeout="10">
                    <Say voice="alice">Press 1 to accept this emergency, or 2 to decline.</Say>
                </Gather>
                <Say voice="alice">Thank you. Goodbye.</Say>
            </Response>
        `;

        const call = await client.calls.create({
            from: twilioPhoneNumber,
            to: toPhoneNumber,
            twiml: twiml,
            statusCallback: `${process.env.SERVER_URL || 'http://localhost:3000'}/webhook/call-status`,
            statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
        });

        console.log(`✅ Emergency call with audio initiated to ${toPhoneNumber}: ${call.sid}`);
        return {
            success: true,
            callSid: call.sid,
            status: call.status,
            to: toPhoneNumber
        };
    } catch (error) {
        console.error(`❌ Error making emergency call with audio to ${toPhoneNumber}:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Broadcast emergency to multiple phone numbers
 * @param {Array} phoneNumbers - Array of phone numbers
 * @param {object} emergencyData - Emergency information
 * @returns {Promise} Results of all calls
 */
async function broadcastEmergencyCalls(phoneNumbers, emergencyData) {
    const results = [];
    
    for (const phoneNumber of phoneNumbers) {
        try {
            const result = await makeEmergencyVoiceCall(phoneNumber, emergencyData);
            results.push({
                phoneNumber,
                ...result
            });
            
            // Wait 1 second between calls to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            results.push({
                phoneNumber,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}

/**
 * Send SMS emergency alert (fallback)
 * @param {string} toPhoneNumber - Phone number
 * @param {object} emergencyData - Emergency information
 */
async function sendEmergencySMS(toPhoneNumber, emergencyData) {
    try {
        // Handle both flat and nested location structure
        const lat = emergencyData.latitude || emergencyData.patientLocation?.lat || 'unknown';
        const lon = emergencyData.longitude || emergencyData.patientLocation?.lon || 'unknown';
        const address = emergencyData.address || emergencyData.patientLocation?.address || '';
        
        const message = await client.messages.create({
            from: twilioPhoneNumber,
            to: toPhoneNumber,
            body: `🚨 EMERGENCY ALERT!\n\nMedical emergency reported at:\nLat: ${lat}\nLon: ${lon}\n${address}\n\nRespond immediately!`
        });

        console.log(`✅ Emergency SMS sent to ${toPhoneNumber}: ${message.sid}`);
        return {
            success: true,
            messageSid: message.sid
        };
    } catch (error) {
        console.error(`❌ Error sending emergency SMS to ${toPhoneNumber}:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
  createEmergency,
  ambulanceAccepts,
  hospitalAccepts,
  updateAmbulanceLocation,
  getEmergency,
  activeEmergencies,
  makeEmergencyVoiceCall,
  makeEmergencyCallWithAudio,
  broadcastEmergencyCalls,
  sendEmergencySMS
};
