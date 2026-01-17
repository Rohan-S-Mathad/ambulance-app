/**
 * Broadcast Utility
 * Manages broadcast creation and cancellation for ambulances and hospitals
 */

const admin = require('firebase-admin');
const logger = require('./logger');

/**
 * Create broadcast messages for multiple targets
 * @param {object} db - Firestore database instance
 * @param {string} incidentId - Incident ID
 * @param {string} targetType - "ambulance" or "hospital"
 * @param {Array} targets - Array of target entities (ambulances or hospitals)
 * @returns {Promise<Array>} Array of created broadcast IDs
 */
async function createBroadcasts(db, incidentId, targetType, targets) {
  const batch = db.batch();
  const broadcastIds = [];
  
  targets.forEach(target => {
    const broadcastRef = db.collection('broadcasts').doc();
    const targetId = targetType === 'ambulance' ? target.ambId : target.hospId;
    
    batch.set(broadcastRef, {
      targetType,
      targetId,
      incidentId,
      status: 'pending',
      distance: target.distance || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiration
      )
    });
    
    broadcastIds.push(broadcastRef.id);
  });
  
  await batch.commit();
  
  const targetIds = targets.map(t => targetType === 'ambulance' ? t.ambId : t.hospId);
  
  if (targetType === 'ambulance') {
    logger.ambulanceBroadcast(incidentId, targetIds, targets.length);
  } else {
    logger.hospitalBroadcast(incidentId, targetIds, targets.length);
  }
  
  return broadcastIds;
}

/**
 * Cancel all pending broadcasts for an incident except the accepted one
 * @param {object} db - Firestore database instance
 * @param {string} incidentId - Incident ID
 * @param {string} targetType - "ambulance" or "hospital"
 * @param {string} exceptTargetId - Target ID to exclude from cancellation (optional)
 * @returns {Promise<number>} Number of broadcasts cancelled
 */
async function cancelBroadcasts(db, incidentId, targetType, exceptTargetId = null) {
  const querySnapshot = await db.collection('broadcasts')
    .where('incidentId', '==', incidentId)
    .where('targetType', '==', targetType)
    .where('status', '==', 'pending')
    .get();
  
  if (querySnapshot.empty) {
    return 0;
  }
  
  const batch = db.batch();
  let cancelledCount = 0;
  
  querySnapshot.forEach(doc => {
    const data = doc.data();
    if (exceptTargetId === null || data.targetId !== exceptTargetId) {
      batch.update(doc.ref, {
        status: 'cancelled',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp()
      });
      cancelledCount++;
    }
  });
  
  if (cancelledCount > 0) {
    await batch.commit();
    logger.broadcastsCancelled(incidentId, targetType, cancelledCount);
  }
  
  return cancelledCount;
}

/**
 * Mark a broadcast as accepted
 * @param {object} db - Firestore database instance
 * @param {string} incidentId - Incident ID
 * @param {string} targetType - "ambulance" or "hospital"
 * @param {string} targetId - Target ID that accepted
 * @returns {Promise<boolean>} True if broadcast was marked as accepted
 */
async function markBroadcastAccepted(db, incidentId, targetType, targetId) {
  const querySnapshot = await db.collection('broadcasts')
    .where('incidentId', '==', incidentId)
    .where('targetType', '==', targetType)
    .where('targetId', '==', targetId)
    .where('status', '==', 'pending')
    .limit(1)
    .get();
  
  if (querySnapshot.empty) {
    return false;
  }
  
  const broadcastDoc = querySnapshot.docs[0];
  await broadcastDoc.ref.update({
    status: 'accepted',
    acceptedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return true;
}

/**
 * Check if a target has a pending broadcast for an incident
 * @param {object} db - Firestore database instance
 * @param {string} incidentId - Incident ID
 * @param {string} targetType - "ambulance" or "hospital"
 * @param {string} targetId - Target ID
 * @returns {Promise<boolean>} True if pending broadcast exists
 */
async function hasPendingBroadcast(db, incidentId, targetType, targetId) {
  const querySnapshot = await db.collection('broadcasts')
    .where('incidentId', '==', incidentId)
    .where('targetType', '==', targetType)
    .where('targetId', '==', targetId)
    .where('status', '==', 'pending')
    .limit(1)
    .get();
  
  return !querySnapshot.empty;
}

module.exports = {
  createBroadcasts,
  cancelBroadcasts,
  markBroadcastAccepted,
  hasPendingBroadcast
};
