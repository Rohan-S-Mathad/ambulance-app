package com.example.ambulance.utils

import kotlin.math.*

/**
 * DistanceCalculator - Utility for calculating distances between GPS coordinates
 *
 * Uses Haversine formula for accurate distance calculation on Earth's surface
 * Essential for finding nearest ambulances and hospitals
 */
object DistanceCalculator {

    private const val EARTH_RADIUS_KM = 6371.0 // Earth's radius in kilometers

    /**
     * Calculate distance between two GPS coordinates using Haversine formula
     *
     * @param lat1 Latitude of first point
     * @param lon1 Longitude of first point
     * @param lat2 Latitude of second point
     * @param lon2 Longitude of second point
     * @return Distance in kilometers
     */
    fun calculateDistance(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        // Convert degrees to radians
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)

        val lat1Rad = Math.toRadians(lat1)
        val lat2Rad = Math.toRadians(lat2)

        // Haversine formula
        val a = sin(dLat / 2).pow(2) +
                cos(lat1Rad) * cos(lat2Rad) *
                sin(dLon / 2).pow(2)

        val c = 2 * atan2(sqrt(a), sqrt(1 - a))

        return EARTH_RADIUS_KM * c
    }

    /**
     * Calculate distance and return in meters
     */
    fun calculateDistanceInMeters(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        return calculateDistance(lat1, lon1, lat2, lon2) * 1000
    }

    /**
     * Format distance for display
     * Shows km or meters based on distance
     */
    fun formatDistance(distanceKm: Double): String {
        return if (distanceKm < 1.0) {
            "%.0f m".format(distanceKm * 1000)
        } else {
            "%.2f km".format(distanceKm)
        }
    }
}
