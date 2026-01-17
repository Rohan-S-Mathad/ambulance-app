/**
 * Incident Service
 * Core business logic for incident management
 */

const admin = require('firebase-admin');
const { findNearest } = require('../utils/distance');
const { createBroadcasts, cancelBroadcasts, markBroadcastAccepted } = require('../utils/broadcast');
const logger = require('../utils/logger');

/**
 * Create a new incident and broadcast to nearest ambulances
 * @param {object} db - Firestore database instance
 * @param {number} userLat - User latitude
 * @param {number} userLon - User longitude
 * @param {string} userId - User ID (optional)
 * @param {object} additionalData - Additional incident data (optional)
 * @returns {Promise<object>} Created incident data with ID
 */
async function createIncident(db, userLat, userLon, userId = null, additionalData = {}) {
  try {
    // Create incident document
    const incidentRef = db.collection('incidents').doc();
    const incidentData = {
      incidentId: incidentRef.id,
      userLat,
      userLon,
      userId,
      status: 'pending',
      assignedAmbId: null,
      assignedHospId: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...additionalData
    };
    
    await incidentRef.set(incidentData);
    
    logger.incidentCreated(incidentRef.id, userLat, userLon);
    
    // Find and broadcast to nearest ambulances
    await broadcastToNearestAmbulances(db, incidentRef.id, userLat, userLon);
    
    return {
      success: true,
      incidentId: incidentRef.id,
      data: incidentData
    };
  } catch (error) {
    logger.error('CREATE_INCIDENT_ERROR', { error: error.message, userLat, userLon });
    throw error;
  }
}

/**
 * Find nearest available ambulances and create broadcasts
 * @param {object} db - Firestore database instance
 * @param {string} incidentId - Incident ID
 * @param {number} userLat - User latitude
 * @param {number} userLon - User longitude
 * @param {number} limit - Maximum number of ambulances to notify
 * @returns {Promise<Array>} Array of broadcast IDs
 */
async function broadcastToNearestAmbulances(db, incidentId, userLat, userLon, limit = 3) {
  try {
    // Fetch all available ambulances
    const ambulancesSnapshot = await db.collection('ambulances')
      .where('status', '==', 'available')
      .get();
    
    if (ambulancesSnapshot.empty) {
      logger.warn('NO_AVAILABLE_AMBULANCES', { incidentId });
      return [];
    }
    
    const ambulances = ambulancesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Find nearest ambulances
    const nearestAmbulances = findNearest(ambulances, userLat, userLon, limit, 50); // Within 50km
    
    if (nearestAmbulances.length === 0) {
      logger.warn('NO_AMBULANCES_IN_RANGE', { incidentId, userLat, userLon });
      return [];
    }
    
    // Create broadcast messages
    const broadcastIds = await createBroadcasts(db, incidentId, 'ambulance', nearestAmbulances);
    
    return broadcastIds;
  } catch (error) {
    logger.error('BROADCAST_AMBULANCES_ERROR', { error: error.message, incidentId });
    throw error;
  }
}

/**
 * Find nearest available hospitals and create broadcasts
 * @param {object} db - Firestore database instance
 * @param {string} incidentId - Incident ID
 * @param {number} userLat - User latitude
 * @param {number} userLon - User longitude
 * @param {number} limit - Maximum number of hospitals to notify
 * @returns {Promise<Array>} Array of broadcast IDs
 */
async function broadcastToNearestHospitals(db, incidentId, userLat, userLon, limit = 3) {
  try {
    // Fetch all available hospitals
    const hospitalsSnapshot = await db.collection('hospitals')
      .where('status', '==', 'available')
      .get();
    
    if (hospitalsSnapshot.empty) {
      logger.warn('NO_AVAILABLE_HOSPITALS', { incidentId });
      return [];
    }
    
    const hospitals = hospitalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Find nearest hospitals
    const nearestHospitals = findNearest(hospitals, userLat, userLon, limit, 100); // Within 100km
    
    if (nearestHospitals.length === 0) {
      logger.warn('NO_HOSPITALS_IN_RANGE', { incidentId, userLat, userLon });
      return [];
    }
    
    // Create broadcast messages
    const broadcastIds = await createBroadcasts(db, incidentId, 'hospital', nearestHospitals);
    
    return broadcastIds;
  } catch (error) {
    logger.error('BROADCAST_HOSPITALS_ERROR', { error: error.message, incidentId });
    throw error;
  }
}

/**
 * Accept incident by ambulance (First-Accept Algorithm with Transaction)
 * @param {object} db - Firestore database instance
 * @param {string} incidentId - Incident ID
 * @param {string} ambulanceId - Ambulance ID
 * @returns {Promise<object>} Result of acceptance
 */
async function acceptByAmbulance(db, incidentId, ambulanceId) {
  const incidentRef = db.collection('incidents').doc(incidentId);
  
  try {
    // Use Firestore transaction for atomic operation
    const result = await db.runTransaction(async (transaction) => {
      const incidentDoc = await transaction.get(incidentRef);
      
      if (!incidentDoc.exists) {
        throw new Error('Incident not found');
      }
      
      const incidentData = incidentDoc.data();
      
      // Check if already assigned
      if (incidentData.assignedAmbId !== null) {
        return {
          success: false,
          reason: 'already_assigned',
          assignedTo: incidentData.assignedAmbId
        };
      }
      
      // Check if incident status is pending
      if (incidentData.status !== 'pending') {
        return {
          success: false,
          reason: 'invalid_status',
          currentStatus: incidentData.status
        };
      }
      
      // Assign ambulance to incident
      transaction.update(incidentRef, {
        assignedAmbId: ambulanceId,
        status: 'ambulance_assigned',
        ambulanceAcceptedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update ambulance status to busy
      const ambulanceRef = db.collection('ambulances').doc(ambulanceId);
      transaction.update(ambulanceRef, {
        status: 'busy',
        currentIncidentId: incidentId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true,
        incidentId,
        ambulanceId
      };
    });
    
    if (result.success) {
      logger.ambulanceAccepted(incidentId, ambulanceId);
      
      // Mark broadcast as accepted and cancel others (outside transaction)
      await markBroadcastAccepted(db, incidentId, 'ambulance', ambulanceId);
      await cancelBroadcasts(db, incidentId, 'ambulance', ambulanceId);
    }
    
    return result;
  } catch (error) {
    logger.error('AMBULANCE_ACCEPT_ERROR', { error: error.message, incidentId, ambulanceId });
    throw error;
  }
}

/**
 * Accept incident by hospital (First-Accept Algorithm with Transaction)
 * @param {object} db - Firestore database instance
 * @param {string} incidentId - Incident ID
 * @param {string} hospitalId - Hospital ID
 * @returns {Promise<object>} Result of acceptance
 */
async function acceptByHospital(db, incidentId, hospitalId) {
  const incidentRef = db.collection('incidents').doc(incidentId);
  
  try {
    // Use Firestore transaction for atomic operation
    const result = await db.runTransaction(async (transaction) => {
      const incidentDoc = await transaction.get(incidentRef);
      
      if (!incidentDoc.exists) {
        throw new Error('Incident not found');
      }
      
      const incidentData = incidentDoc.data();
      
      // Check if already assigned
      if (incidentData.assignedHospId !== null) {
        return {
          success: false,
          reason: 'already_assigned',
          assignedTo: incidentData.assignedHospId
        };
      }
      
      // Check if ambulance has been assigned
      if (incidentData.status !== 'ambulance_assigned') {
        return {
          success: false,
          reason: 'ambulance_not_assigned',
          currentStatus: incidentData.status
        };
      }
      
      // Assign hospital to incident
      transaction.update(incidentRef, {
        assignedHospId: hospitalId,
        status: 'hospital_assigned',
        hospitalAcceptedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update hospital status to busy
      const hospitalRef = db.collection('hospitals').doc(hospitalId);
      transaction.update(hospitalRef, {
        status: 'busy',
        currentIncidentId: incidentId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true,
        incidentId,
        hospitalId
      };
    });
    
    if (result.success) {
      logger.hospitalAccepted(incidentId, hospitalId);
      
      // Mark broadcast as accepted and cancel others (outside transaction)
      await markBroadcastAccepted(db, incidentId, 'hospital', hospitalId);
      await cancelBroadcasts(db, incidentId, 'hospital', hospitalId);
    }
    
    return result;
  } catch (error) {
    logger.error('HOSPITAL_ACCEPT_ERROR', { error: error.message, incidentId, hospitalId });
    throw error;
  }
}

/**
 * Get incident details by ID
 * @param {object} db - Firestore database instance
 * @param {string} incidentId - Incident ID
 * @returns {Promise<object>} Incident data
 */
async function getIncident(db, incidentId) {
  const incidentDoc = await db.collection('incidents').doc(incidentId).get();
  
  if (!incidentDoc.exists) {
    return null;
  }
  
  return { id: incidentDoc.id, ...incidentDoc.data() };
}

/**
 * Complete an incident (mark as completed)
 * @param {object} db - Firestore database instance
 * @param {string} incidentId - Incident ID
 * @returns {Promise<object>} Result
 */
async function completeIncident(db, incidentId) {
  const incidentRef = db.collection('incidents').doc(incidentId);
  
  try {
    await db.runTransaction(async (transaction) => {
      const incidentDoc = await transaction.get(incidentRef);
      
      if (!incidentDoc.exists) {
        throw new Error('Incident not found');
      }
      
      const incidentData = incidentDoc.data();
      
      // Update incident status
      transaction.update(incidentRef, {
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Release ambulance if assigned
      if (incidentData.assignedAmbId) {
        const ambulanceRef = db.collection('ambulances').doc(incidentData.assignedAmbId);
        transaction.update(ambulanceRef, {
          status: 'available',
          currentIncidentId: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      // Release hospital if assigned
      if (incidentData.assignedHospId) {
        const hospitalRef = db.collection('hospitals').doc(incidentData.assignedHospId);
        transaction.update(hospitalRef, {
          status: 'available',
          currentIncidentId: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    });
    
    logger.info('INCIDENT_COMPLETED', { incidentId });
    
    return { success: true, incidentId };
  } catch (error) {
    logger.error('COMPLETE_INCIDENT_ERROR', { error: error.message, incidentId });
    throw error;
  }
}

module.exports = {
  createIncident,
  broadcastToNearestAmbulances,
  broadcastToNearestHospitals,
  acceptByAmbulance,
  acceptByHospital,
  getIncident,
  completeIncident
};
