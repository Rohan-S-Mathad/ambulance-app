/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

/**
 * Firebase Cloud Functions
 * Smart Ambulance Dispatch & Hospital Pre-Booking System
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Import services
const incidentService = require('./services/incidentService');
const locationService = require('./services/locationService');
const smsService = require('./services/smsService');
const { validateIncidentRequest, validateLocation } = require('./utils/validation');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

/**
 * Health check endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'ambulance-dispatch-api'
  });
});

/**
 * Create a new incident
 * POST /incident
 * Body: { userLat: number, userLon: number, userId?: string, description?: string }
 */
app.post('/incident', async (req, res) => {
  try {
    const { userLat, userLon, userId, description } = req.body;
    
    // Validate request
    const validation = validateIncidentRequest({ userLat, userLon });
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: validation.error 
      });
    }
    
    // Create incident
    const result = await incidentService.createIncident(
      db, 
      userLat, 
      userLon, 
      userId || null,
      { description: description || null }
    );
    
    res.status(201).json(result);
  } catch (error) {
    logger.error('API_CREATE_INCIDENT_ERROR', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create incident',
      message: error.message 
    });
  }
});

/**
 * Get incident details
 * GET /incident/:incidentId
 */
app.get('/incident/:incidentId', async (req, res) => {
  try {
    const { incidentId } = req.params;
    
    const incident = await incidentService.getIncident(db, incidentId);
    
    if (!incident) {
      return res.status(404).json({ 
        success: false, 
        error: 'Incident not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: incident 
    });
  } catch (error) {
    logger.error('API_GET_INCIDENT_ERROR', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get incident',
      message: error.message 
    });
  }
});

/**
 * Ambulance accepts an incident (First-Accept Algorithm)
 * POST /incident/:incidentId/acceptAmbulance
 * Body: { ambulanceId: string }
 */
app.post('/incident/:incidentId/acceptAmbulance', async (req, res) => {
  try {
    const { incidentId } = req.params;
    const { ambulanceId } = req.body;
    
    if (!ambulanceId) {
      return res.status(400).json({ 
        success: false, 
        error: 'ambulanceId is required' 
      });
    }
    
    const result = await incidentService.acceptByAmbulance(db, incidentId, ambulanceId);
    
    if (!result.success) {
      return res.status(409).json(result); // Conflict
    }
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('API_ACCEPT_AMBULANCE_ERROR', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to accept incident',
      message: error.message 
    });
  }
});

/**
 * Hospital accepts an incident (First-Accept Algorithm)
 * POST /incident/:incidentId/acceptHospital
 * Body: { hospitalId: string }
 */
app.post('/incident/:incidentId/acceptHospital', async (req, res) => {
  try {
    const { incidentId } = req.params;
    const { hospitalId } = req.body;
    
    if (!hospitalId) {
      return res.status(400).json({ 
        success: false, 
        error: 'hospitalId is required' 
      });
    }
    
    const result = await incidentService.acceptByHospital(db, incidentId, hospitalId);
    
    if (!result.success) {
      return res.status(409).json(result); // Conflict
    }
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('API_ACCEPT_HOSPITAL_ERROR', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to accept incident',
      message: error.message 
    });
  }
});

/**
 * Complete an incident
 * POST /incident/:incidentId/complete
 */
app.post('/incident/:incidentId/complete', async (req, res) => {
  try {
    const { incidentId } = req.params;
    
    const result = await incidentService.completeIncident(db, incidentId);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('API_COMPLETE_INCIDENT_ERROR', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to complete incident',
      message: error.message 
    });
  }
});

/**
 * Update ambulance location
 * POST /ambulance/:ambulanceId/location
 * Body: { lat: number, lon: number }
 */
app.post('/ambulance/:ambulanceId/location', async (req, res) => {
  try {
    const { ambulanceId } = req.params;
    const { lat, lon } = req.body;
    
    const validation = validateLocation({ lat, lon });
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: validation.error 
      });
    }
    
    const result = await locationService.updateAmbulanceLocation(db, ambulanceId, lat, lon);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('API_UPDATE_AMBULANCE_LOCATION_ERROR', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update location',
      message: error.message 
    });
  }
});

/**
 * Get ambulance location
 * GET /ambulance/:ambulanceId/location
 */
app.get('/ambulance/:ambulanceId/location', async (req, res) => {
  try {
    const { ambulanceId } = req.params;
    
    const location = await locationService.getAmbulanceLocation(db, ambulanceId);
    
    if (!location) {
      return res.status(404).json({ 
        success: false, 
        error: 'Ambulance not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: location 
    });
  } catch (error) {
    logger.error('API_GET_AMBULANCE_LOCATION_ERROR', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get location',
      message: error.message 
    });
  }
});

/**
 * Get broadcasts for a specific target (ambulance or hospital)
 * GET /broadcasts/:targetType/:targetId
 */
app.get('/broadcasts/:targetType/:targetId', async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    
    if (!['ambulance', 'hospital'].includes(targetType)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid targetType. Must be "ambulance" or "hospital"' 
      });
    }
    
    const broadcastsSnapshot = await db.collection('broadcasts')
      .where('targetType', '==', targetType)
      .where('targetId', '==', targetId)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    const broadcasts = broadcastsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({ 
      success: true, 
      data: broadcasts 
    });
  } catch (error) {
    logger.error('API_GET_BROADCASTS_ERROR', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get broadcasts',
      message: error.message 
    });
  }
});

// Export Express app as Cloud Function
exports.api = functions.https.onRequest(app);

// ============================================================================
// FIRESTORE TRIGGERS
// ============================================================================

/**
 * Trigger: When incident status changes to 'ambulance_assigned'
 * Action: Broadcast to nearest hospitals
 */
exports.onIncidentAmbulanceAssigned = functions.firestore
  .document('incidents/{incidentId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const incidentId = context.params.incidentId;
    
    // Check if status changed to 'ambulance_assigned'
    if (before.status !== 'ambulance_assigned' && after.status === 'ambulance_assigned') {
      try {
        logger.info('TRIGGER_AMBULANCE_ASSIGNED', { incidentId });
        
        // Broadcast to nearest hospitals
        await incidentService.broadcastToNearestHospitals(
          db, 
          incidentId, 
          after.userLat, 
          after.userLon
        );
      } catch (error) {
        logger.error('TRIGGER_AMBULANCE_ASSIGNED_ERROR', { 
          error: error.message, 
          incidentId 
        });
      }
    }
  });

/**
 * 🚨 NEW: SMS Queue Trigger
 * Trigger: When a new document is created in sms_queue collection
 * Action: Send SMS via external API (works in emulator!)
 */
exports.onSMSQueueCreate = functions.firestore
  .document('sms_queue/{smsId}')
  .onCreate(async (snapshot, context) => {
    const smsId = context.params.smsId;
    const smsData = snapshot.data();
    
    console.log('='.repeat(60));
    console.log('🔥 SMS TRIGGER FIRED!');
    console.log('   Document ID:', smsId);
    console.log('   Phone Number:', smsData.phoneNumber);
    console.log('   Message:', smsData.message);
    console.log('='.repeat(60));
    
    try {
      // Validate required fields
      if (!smsData.phoneNumber || !smsData.message) {
        logger.error('SMS_QUEUE_INVALID_DATA', { smsId, smsData });
        
        // Update document with error
        await snapshot.ref.update({
          status: 'error',
          error: 'Missing phoneNumber or message',
          processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return;
      }
      
      // Get provider (default to 'mock' for local testing)
      const provider = smsData.provider || 'mock';
      
      logger.info('SMS_QUEUE_PROCESSING', { smsId, phoneNumber: smsData.phoneNumber, provider });
      
      // Send SMS via external API
      const result = await smsService.sendSMS(
        smsData.phoneNumber,
        smsData.message,
        provider
      );
      
      console.log('✅ SMS SENT SUCCESSFULLY!');
      console.log('   Result:', JSON.stringify(result, null, 2));
      
      // Update document with success status
      await snapshot.ref.update({
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        result: result,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      logger.info('SMS_QUEUE_SUCCESS', { smsId, phoneNumber: smsData.phoneNumber });
      
    } catch (error) {
      console.error('❌ SMS SEND FAILED!');
      console.error('   Error:', error.message);
      console.error('   Stack:', error.stack);
      
      logger.error('SMS_QUEUE_ERROR', { 
        smsId, 
        phoneNumber: smsData.phoneNumber,
        error: error.message,
        stack: error.stack
      });
      
      // Update document with error status
      await snapshot.ref.update({
        status: 'failed',
        error: error.message,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

/**
 * Trigger: Clean up expired broadcasts
 * Scheduled function that runs every 5 minutes
 */
exports.cleanupExpiredBroadcasts = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now();
      
      const expiredBroadcasts = await db.collection('broadcasts')
        .where('status', '==', 'pending')
        .where('expiresAt', '<=', now)
        .get();
      
      if (expiredBroadcasts.empty) {
        logger.info('CLEANUP_NO_EXPIRED_BROADCASTS', { count: 0 });
        return null;
      }
      
      const batch = db.batch();
      expiredBroadcasts.forEach(doc => {
        batch.update(doc.ref, {
          status: 'expired',
          expiredAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
      
      logger.info('CLEANUP_EXPIRED_BROADCASTS', { count: expiredBroadcasts.size });
      
      return null;
    } catch (error) {
      logger.error('CLEANUP_ERROR', { error: error.message });
      return null;
    }
  });

/**
 * Trigger: On new incident creation
 */
exports.onIncidentCreated = functions.firestore
  .document('incidents/{incidentId}')
  .onCreate(async (snap, context) => {
    const incidentData = snap.data();
    const incidentId = context.params.incidentId;
    
    logger.info('INCIDENT_CREATED_TRIGGER', { 
      incidentId,
      userLat: incidentData.userLat,
      userLon: incidentData.userLon
    });
  });

// ============================================================================
// CALLABLE FUNCTIONS (for direct client SDK calls)
// ============================================================================

/**
 * Callable Function: Create Incident
 * Can be called directly from Firebase SDK
 */
exports.createIncident = functions.https.onCall(async (data, context) => {
  try {
    const { userLat, userLon, description } = data;
    const userId = context.auth ? context.auth.uid : null;
    
    const validation = validateIncidentRequest({ userLat, userLon });
    if (!validation.valid) {
      throw new functions.https.HttpsError('invalid-argument', validation.error);
    }
    
    const result = await incidentService.createIncident(
      db, 
      userLat, 
      userLon, 
      userId,
      { description: description || null }
    );
    
    return result;
  } catch (error) {
    logger.error('CALLABLE_CREATE_INCIDENT_ERROR', { error: error.message });
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Callable Function: Accept by Ambulance
 */
exports.acceptByAmbulance = functions.https.onCall(async (data, context) => {
  try {
    const { incidentId, ambulanceId } = data;
    
    if (!incidentId || !ambulanceId) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'incidentId and ambulanceId are required'
      );
    }
    
    const result = await incidentService.acceptByAmbulance(db, incidentId, ambulanceId);
    
    return result;
  } catch (error) {
    logger.error('CALLABLE_ACCEPT_AMBULANCE_ERROR', { error: error.message });
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Callable Function: Accept by Hospital
 */
exports.acceptByHospital = functions.https.onCall(async (data, context) => {
  try {
    const { incidentId, hospitalId } = data;
    
    if (!incidentId || !hospitalId) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'incidentId and hospitalId are required'
      );
    }
    
    const result = await incidentService.acceptByHospital(db, incidentId, hospitalId);
    
    return result;
  } catch (error) {
    logger.error('CALLABLE_ACCEPT_HOSPITAL_ERROR', { error: error.message });
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Callable Function: Update Location
 */
exports.updateLocation = functions.https.onCall(async (data, context) => {
  try {
    const { entityType, entityId, lat, lon } = data;
    
    if (!entityType || !entityId || lat === undefined || lon === undefined) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'entityType, entityId, lat, and lon are required'
      );
    }
    
    const validation = validateLocation({ lat, lon });
    if (!validation.valid) {
      throw new functions.https.HttpsError('invalid-argument', validation.error);
    }
    
    let result;
    if (entityType === 'ambulance') {
      result = await locationService.updateAmbulanceLocation(db, entityId, lat, lon);
    } else if (entityType === 'hospital') {
      result = await locationService.updateHospitalLocation(db, entityId, lat, lon);
    } else {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'entityType must be "ambulance" or "hospital"'
      );
    }
    
    return result;
  } catch (error) {
    logger.error('CALLABLE_UPDATE_LOCATION_ERROR', { error: error.message });
    throw new functions.https.HttpsError('internal', error.message);
  }
});
