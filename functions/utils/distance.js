/**
 * Haversine Distance Calculator
 * Calculates the great-circle distance between two points on Earth
 * using their latitude and longitude coordinates.
 */

const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers

/**
 * Convert degrees to radians
 * @param {number} degrees 
 * @returns {number} radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return EARTH_RADIUS_KM * c;
}

/**
 * Find nearest entities (ambulances or hospitals) to a given location
 * @param {Array} entities - Array of entities with lat/lon properties
 * @param {number} targetLat - Target latitude
 * @param {number} targetLon - Target longitude
 * @param {number} limit - Maximum number of results
 * @param {number} maxDistanceKm - Maximum distance in kilometers (optional)
 * @returns {Array} Sorted array of entities with distance property
 */
function findNearest(entities, targetLat, targetLon, limit = 3, maxDistanceKm = null) {
  const entitiesWithDistance = entities
    .filter(entity => entity.status === 'available')
    .map(entity => ({
      ...entity,
      distance: calculateDistance(targetLat, targetLon, entity.lat, entity.lon)
    }))
    .filter(entity => maxDistanceKm === null || entity.distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return entitiesWithDistance;
}

module.exports = {
  calculateDistance,
  findNearest,
  toRadians,
  EARTH_RADIUS_KM
};
