/**
 * Location Service
 * Manages real-time location updates for ambulances and hospitals
 */

const admin = require('firebase-admin');
const logger = require('../utils/logger');

/**
 * Update ambulance location
 * @param {object} db - Firestore database instance
 * @param {string} ambulanceId - Ambulance ID
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} Result
 */
async function updateAmbulanceLocation(db, ambulanceId, lat, lon) {
  try {
    const ambulanceRef = db.collection('ambulances').doc(ambulanceId);
    
    await ambulanceRef.update({
      lat,
      lon,
      lastLocationUpdate: admin.firestore.FieldValue.serverTimestamp()
    });
    
    logger.locationUpdated('ambulance', ambulanceId, lat, lon);
    
    return { success: true, ambulanceId };
  } catch (error) {
    logger.error('UPDATE_AMBULANCE_LOCATION_ERROR', { 
      error: error.message, 
      ambulanceId, 
      lat, 
      lon 
    });
    throw error;
  }
}

/**
 * Update hospital location (typically static, but included for completeness)
 * @param {object} db - Firestore database instance
 * @param {string} hospitalId - Hospital ID
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} Result
 */
async function updateHospitalLocation(db, hospitalId, lat, lon) {
  try {
    const hospitalRef = db.collection('hospitals').doc(hospitalId);
    
    await hospitalRef.update({
      lat,
      lon,
      lastLocationUpdate: admin.firestore.FieldValue.serverTimestamp()
    });
    
    logger.locationUpdated('hospital', hospitalId, lat, lon);
    
    return { success: true, hospitalId };
  } catch (error) {
    logger.error('UPDATE_HOSPITAL_LOCATION_ERROR', { 
      error: error.message, 
      hospitalId, 
      lat, 
      lon 
    });
    throw error;
  }
}

/**
 * Get ambulance current location
 * @param {object} db - Firestore database instance
 * @param {string} ambulanceId - Ambulance ID
 * @returns {Promise<object>} Location data
 */
async function getAmbulanceLocation(db, ambulanceId) {
  const ambulanceDoc = await db.collection('ambulances').doc(ambulanceId).get();
  
  if (!ambulanceDoc.exists) {
    return null;
  }
  
  const data = ambulanceDoc.data();
  return {
    ambulanceId,
    lat: data.lat,
    lon: data.lon,
    lastUpdate: data.lastLocationUpdate
  };
}

/**
 * Get hospital location
 * @param {object} db - Firestore database instance
 * @param {string} hospitalId - Hospital ID
 * @returns {Promise<object>} Location data
 */
async function getHospitalLocation(db, hospitalId) {
  const hospitalDoc = await db.collection('hospitals').doc(hospitalId).get();
  
  if (!hospitalDoc.exists) {
    return null;
  }
  
  const data = hospitalDoc.data();
  return {
    hospitalId,
    lat: data.lat,
    lon: data.lon,
    lastUpdate: data.lastLocationUpdate
  };
}

module.exports = {
  updateAmbulanceLocation,
  updateHospitalLocation,
  getAmbulanceLocation,
  getHospitalLocation
};
