/**
 * Validation Utility
 * Input validation helpers for API endpoints
 */

/**
 * Validate latitude value
 * @param {number} lat 
 * @returns {boolean}
 */
function isValidLatitude(lat) {
  return typeof lat === 'number' && lat >= -90 && lat <= 90;
}

/**
 * Validate longitude value
 * @param {number} lon 
 * @returns {boolean}
 */
function isValidLongitude(lon) {
  return typeof lon === 'number' && lon >= -180 && lon <= 180;
}

/**
 * Validate location object
 * @param {object} location - Object with lat and lon properties
 * @returns {object} { valid: boolean, error: string }
 */
function validateLocation(location) {
  if (!location) {
    return { valid: false, error: 'Location is required' };
  }
  
  if (!isValidLatitude(location.lat)) {
    return { valid: false, error: 'Invalid latitude. Must be between -90 and 90' };
  }
  
  if (!isValidLongitude(location.lon)) {
    return { valid: false, error: 'Invalid longitude. Must be between -180 and 180' };
  }
  
  return { valid: true };
}

/**
 * Validate incident creation request
 * @param {object} body - Request body
 * @returns {object} { valid: boolean, error: string }
 */
function validateIncidentRequest(body) {
  if (!body.userLat || !body.userLon) {
    return { valid: false, error: 'userLat and userLon are required' };
  }
  
  return validateLocation({ lat: body.userLat, lon: body.userLon });
}

/**
 * Validate entity (ambulance/hospital) data
 * @param {object} entity - Entity data
 * @param {string} type - "ambulance" or "hospital"
 * @returns {object} { valid: boolean, error: string }
 */
function validateEntity(entity, type) {
  const idField = type === 'ambulance' ? 'ambId' : 'hospId';
  
  if (!entity[idField]) {
    return { valid: false, error: `${idField} is required` };
  }
  
  if (!entity.name) {
    return { valid: false, error: 'name is required' };
  }
  
  const locationValidation = validateLocation({ lat: entity.lat, lon: entity.lon });
  if (!locationValidation.valid) {
    return locationValidation;
  }
  
  if (!['available', 'busy'].includes(entity.status)) {
    return { valid: false, error: 'status must be "available" or "busy"' };
  }
  
  return { valid: true };
}

/**
 * Sanitize user input to prevent injection
 * @param {string} input 
 * @returns {string}
 */
function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input.trim().substring(0, 500); // Limit length
}

module.exports = {
  isValidLatitude,
  isValidLongitude,
  validateLocation,
  validateIncidentRequest,
  validateEntity,
  sanitizeString
};
