/**
 * Twilio Serverless Function: Emergency Alert
 * 
 * This function is deployed to Twilio and can be called from your Android app
 * No local server needed! API keys are secure on Twilio's servers.
 * 
 * URL: https://YOUR_FUNCTION_URL.twil.io/emergency-alert
 */

exports.handler = async function(context, event, callback) {
  // Initialize Twilio client (credentials are automatically available)
  const twilioClient = context.getTwilioClient();
  
  // Get environment variables (set in Twilio Console)
  const TWILIO_PHONE = context.TWILIO_PHONE_NUMBER;
  const AMBULANCE_1 = context.AMBULANCE_1_PHONE;
  const AMBULANCE_2 = context.AMBULANCE_2_PHONE;
  const HOSPITAL_1 = context.HOSPITAL_1_PHONE;
  
  // Parse incoming request data
  const {
    patientPhone,
    patientName,
    latitude,
    longitude,
    address,
    incidentId
  } = event;
  
  // Validate required fields
  if (!latitude || !longitude) {
    return callback(null, {
      success: false,
      error: 'Missing required fields: latitude, longitude'
    });
  }
  
  // Prepare response
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return callback(null, response);
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
    
    // Array to store all phone numbers
    const contacts = [];
    if (AMBULANCE_1) contacts.push({ phone: AMBULANCE_1, type: 'Ambulance 1' });
    if (AMBULANCE_2) contacts.push({ phone: AMBULANCE_2, type: 'Ambulance 2' });
    if (HOSPITAL_1) contacts.push({ phone: HOSPITAL_1, type: 'Hospital 1' });
    
    if (contacts.length === 0) {
      response.setBody({
        success: false,
        error: 'No emergency contacts configured'
      });
      return callback(null, response);
    }
    
    // Make calls and send SMS to all contacts
    const results = await Promise.all(
      contacts.map(async (contact) => {
        try {
          // Make voice call
          const call = await twilioClient.calls.create({
            from: TWILIO_PHONE,
            to: contact.phone,
            twiml: twimlMessage
          });
          
          // Send SMS as backup
          const sms = await twilioClient.messages.create({
            from: TWILIO_PHONE,
            to: contact.phone,
            body: emergencyMessage
          });
          
          return {
            contact: contact.type,
            phone: contact.phone,
            callSid: call.sid,
            smsSid: sms.sid,
            status: 'success'
          };
        } catch (error) {
          console.error(`Error contacting ${contact.type}:`, error);
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
    response.setBody({
      success: true,
      message: 'Emergency alerts sent',
      incidentId: incidentId,
      results: results,
      timestamp: new Date().toISOString()
    });
    
    return callback(null, response);
    
  } catch (error) {
    console.error('Emergency alert error:', error);
    response.setBody({
      success: false,
      error: error.message
    });
    return callback(null, response);
  }
};
