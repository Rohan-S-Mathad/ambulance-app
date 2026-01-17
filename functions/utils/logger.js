/**
 * Logging Utility
 * Provides structured logging for the ambulance dispatch system
 */

const functions = require('firebase-functions');

const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

/**
 * Log a structured message
 * @param {string} level - Log level
 * @param {string} event - Event name
 * @param {object} data - Additional data
 */
function log(level, event, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...data
  };

  switch (level) {
    case LOG_LEVELS.ERROR:
      console.error(JSON.stringify(logEntry));
      break;
    case LOG_LEVELS.WARN:
      console.warn(JSON.stringify(logEntry));
      break;
    case LOG_LEVELS.DEBUG:
      console.debug(JSON.stringify(logEntry));
      break;
    default:
      console.log(JSON.stringify(logEntry));
  }
}

// Convenience methods
const logger = {
  info: (event, data) => log(LOG_LEVELS.INFO, event, data),
  warn: (event, data) => log(LOG_LEVELS.WARN, event, data),
  error: (event, data) => log(LOG_LEVELS.ERROR, event, data),
  debug: (event, data) => log(LOG_LEVELS.DEBUG, event, data),
  
  // Domain-specific logging methods
  incidentCreated: (incidentId, userLat, userLon) => {
    log(LOG_LEVELS.INFO, 'INCIDENT_CREATED', { incidentId, userLat, userLon });
  },
  
  ambulanceBroadcast: (incidentId, ambulanceIds, count) => {
    log(LOG_LEVELS.INFO, 'AMBULANCE_BROADCAST', { incidentId, ambulanceIds, count });
  },
  
  hospitalBroadcast: (incidentId, hospitalIds, count) => {
    log(LOG_LEVELS.INFO, 'HOSPITAL_BROADCAST', { incidentId, hospitalIds, count });
  },
  
  ambulanceAccepted: (incidentId, ambulanceId) => {
    log(LOG_LEVELS.INFO, 'AMBULANCE_ACCEPTED', { incidentId, ambulanceId });
  },
  
  hospitalAccepted: (incidentId, hospitalId) => {
    log(LOG_LEVELS.INFO, 'HOSPITAL_ACCEPTED', { incidentId, hospitalId });
  },
  
  broadcastsCancelled: (incidentId, targetType, count) => {
    log(LOG_LEVELS.INFO, 'BROADCASTS_CANCELLED', { incidentId, targetType, count });
  },
  
  locationUpdated: (entityType, entityId, lat, lon) => {
    log(LOG_LEVELS.DEBUG, 'LOCATION_UPDATED', { entityType, entityId, lat, lon });
  }
};

module.exports = logger;
