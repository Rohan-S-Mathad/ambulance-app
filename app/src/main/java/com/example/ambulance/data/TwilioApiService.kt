package com.example.ambulance.data

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Twilio Emergency API Service
 * Connects Android app to Node.js Twilio server for making emergency calls
 */
interface TwilioApiService {

    /**
     * Trigger emergency - makes calls to ambulances and hospitals
     * POST /emergency-alert
     */
    @POST("emergency-alert")
    suspend fun triggerEmergency(@Body request: EmergencyTriggerRequest): Response<EmergencyTriggerResponse>

    /**
     * Create emergency and broadcast (uses new unified endpoint)
     * POST /emergency/create
     */
    @POST("emergency/create")
    suspend fun createEmergency(@Body request: EmergencyCreateRequest): Response<EmergencyCreateResponse>
}

/**
 * Request body for /emergency/trigger
 */
data class EmergencyTriggerRequest(
    val patientPhone: String,
    val patientName: String,
    val latitude: Double,
    val longitude: Double,
    val address: String,
    val incidentId: String? = null
)

/**
 * Response from /emergency/trigger
 */
data class EmergencyTriggerResponse(
    val success: Boolean,
    val message: String?,
    val incidentId: String?,
    val results: List<CallResult>?,
    val timestamp: String?
)

data class CallResult(
    val contact: String?,
    val phone: String?,
    val callSid: String?,
    val smsSid: String?,
    val status: String?,
    val error: String?
)

/**
 * Request body for /emergency/create
 */
data class EmergencyCreateRequest(
    val patientPhone: String,
    val patientName: String,
    val patientLocation: PatientLocation
)

data class PatientLocation(
    val lat: Double,
    val lon: Double,
    val address: String
)

/**
 * Response from /emergency/create
 */
data class EmergencyCreateResponse(
    val success: Boolean,
    val emergencyId: String?,
    val message: String?,
    val ambulanceCalls: Int?,
    val data: EmergencyResponseData?
)

data class EmergencyResponseData(
    val id: String,
    val patientPhone: String,
    val patientName: String,
    val status: String
)
