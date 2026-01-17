package com.example.ambulance.data

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.example.ambulance.data.models.Ambulance
import com.example.ambulance.data.models.Broadcast
import com.example.ambulance.data.models.Hospital
import com.example.ambulance.data.models.Incident
import com.example.ambulance.utils.DistanceCalculator
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import android.util.Log

/**
 * FirestoreRepository - Enhanced with automatic nearest detection and parallel broadcasting
 *
 * Key Features:
 * 1. Automatic nearest ambulance detection (top 3)
 * 2. Parallel broadcast to multiple ambulances
 * 3. First-accept-wins algorithm with transactions
 * 4. Automatic hospital pre-booking after ambulance assignment
 * 5. Cancellation of other broadcasts
 * 6. Twilio API integration for emergency calls
 */
class FirestoreRepository {

    private val db = FirebaseFirestore.getInstance()
    private val twilioApi = RetrofitClient.twilioApi

    // Configuration
    private val TOP_N_AMBULANCES = 3  // Broadcast to top 3 nearest ambulances
    private val TOP_N_HOSPITALS = 3   // Broadcast to top 3 nearest hospitals
    private val MAX_RADIUS_KM = 20.0  // Maximum search radius (optional filter)

    /**
     * Create incident and AUTOMATICALLY broadcast to nearest ambulances
     * This is the main entry point for emergency handling
     *
     * @param incident The emergency incident
     * @param callback Returns incident ID if successful
     */
    fun createIncidentAndBroadcast(incident: Incident, callback: (String, String) -> Unit) {
        // Step 1: Create incident in Firestore
        db.collection("incidents")
            .add(incident)
            .addOnSuccessListener { documentReference ->
                val incidentId = documentReference.id

                // Step 2: Automatically find nearest ambulances and broadcast
                findNearestAmbulancesAndBroadcast(
                    incidentId,
                    incident.userLat,
                    incident.userLon
                ) { count ->
                    callback(incidentId, "Broadcasted to $count nearest ambulances")
                }

                // Step 3: Trigger emergency call using Twilio API
                triggerEmergencyCall(incident, incidentId)
            }
            .addOnFailureListener {
                callback("", "Failed to create incident")
            }
    }

    /**
     * Trigger emergency call through Twilio API
     */
    private fun triggerEmergencyCall(incident: Incident, incidentId: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Get patient phone number - use a default if not set
                val patientPhone = incident.userId.takeIf { it.startsWith("+") } ?: "+919482936725"

                val request = EmergencyTriggerRequest(
                    patientPhone = patientPhone,
                    patientName = "Emergency Patient",
                    latitude = incident.userLat,
                    longitude = incident.userLon,
                    address = "Lat: ${incident.userLat}, Lon: ${incident.userLon}",
                    incidentId = incidentId
                )

                val response = twilioApi.triggerEmergency(request)

                if (response.isSuccessful) {
                    Log.d("TwilioAPI", "✅ Emergency calls triggered successfully!")
                    Log.d("TwilioAPI", "Response: ${response.body()}")
                    response.body()?.results?.forEach { result ->
                        Log.d("TwilioAPI", "  ${result.contact}: ${result.status}")
                    }
                } else {
                    Log.e("TwilioAPI", "❌ Error: ${response.errorBody()?.string()}")
                }
            } catch (e: Exception) {
                Log.e("TwilioAPI", "❌ Exception calling Twilio API: ${e.message}", e)
            }
        }
    }

    /**
     * STEP 1: Find nearest ambulances and broadcast to them
     * Uses Haversine formula to calculate distances
     *
     * @param incidentId The incident ID
     * @param userLat User's latitude
     * @param userLon User's longitude
     * @param callback Returns count of ambulances notified
     */
    private fun findNearestAmbulancesAndBroadcast(
        incidentId: String,
        userLat: Double,
        userLon: Double,
        callback: (Int) -> Unit
    ) {
        // Fetch all available ambulances
        db.collection("ambulances")
            .whereEqualTo("status", "available")
            .get()
            .addOnSuccessListener { documents ->
                if (documents.isEmpty) {
                    callback(0)
                    return@addOnSuccessListener
                }

                // Parse ambulances and calculate distances
                val ambulancesWithDistance = documents.mapNotNull { doc ->
                    val ambulance = doc.toObject(Ambulance::class.java)
                    val distance = DistanceCalculator.calculateDistance(
                        userLat, userLon,
                        ambulance.lat, ambulance.lon
                    )

                    // Optional: Filter by max radius
                    if (distance <= MAX_RADIUS_KM) {
                        Pair(ambulance, distance)
                    } else null
                }

                // Sort by distance and take top N
                val nearestAmbulances = ambulancesWithDistance
                    .sortedBy { it.second }
                    .take(TOP_N_AMBULANCES)
                    .map { it.first }

                // Broadcast to all nearest ambulances in PARALLEL
                broadcastToMultipleAmbulances(incidentId, nearestAmbulances)

                callback(nearestAmbulances.size)
            }
            .addOnFailureListener {
                callback(0)
            }
    }

    /**
     * PARALLEL BROADCAST to multiple ambulances
     * All broadcasts created simultaneously (not sequential)
     *
     * @param incidentId The incident ID
     * @param ambulances List of ambulances to notify
     */
    private fun broadcastToMultipleAmbulances(incidentId: String, ambulances: List<Ambulance>) {
        val batch = db.batch()

        ambulances.forEach { ambulance ->
            val broadcast = Broadcast(
                targetType = "ambulance",
                targetId = ambulance.ambId,
                incidentId = incidentId,
                status = "pending"
            )

            val docRef = db.collection("broadcasts").document()
            batch.set(docRef, broadcast)
        }

        // Commit all broadcasts at once (parallel)
        batch.commit()
    }

    /**
     * STEP 2: After ambulance accepts, automatically find nearest hospitals
     * Called after successful ambulance assignment
     *
     * @param incidentId The incident ID
     * @param userLat User's latitude
     * @param userLon User's longitude
     */
    fun findNearestHospitalsAndBroadcast(
        incidentId: String,
        userLat: Double,
        userLon: Double,
        callback: (Int) -> Unit
    ) {
        // Fetch all available hospitals
        db.collection("hospitals")
            .whereEqualTo("status", "available")
            .get()
            .addOnSuccessListener { documents ->
                if (documents.isEmpty) {
                    callback(0)
                    return@addOnSuccessListener
                }

                // Calculate distances to all hospitals
                val hospitalsWithDistance = documents.mapNotNull { doc ->
                    val hospital = doc.toObject(Hospital::class.java)
                    val distance = DistanceCalculator.calculateDistance(
                        userLat, userLon,
                        hospital.lat, hospital.lon
                    )

                    if (distance <= MAX_RADIUS_KM) {
                        Pair(hospital, distance)
                    } else null
                }

                // Sort and take top N
                val nearestHospitals = hospitalsWithDistance
                    .sortedBy { it.second }
                    .take(TOP_N_HOSPITALS)
                    .map { it.first }

                // Broadcast to all nearest hospitals in PARALLEL
                broadcastToMultipleHospitals(incidentId, nearestHospitals)

                callback(nearestHospitals.size)
            }
            .addOnFailureListener {
                callback(0)
            }
    }

    /**
     * PARALLEL BROADCAST to multiple hospitals
     *
     * @param incidentId The incident ID
     * @param hospitals List of hospitals to notify
     */
    private fun broadcastToMultipleHospitals(incidentId: String, hospitals: List<Hospital>) {
        val batch = db.batch()

        hospitals.forEach { hospital ->
            val broadcast = Broadcast(
                targetType = "hospital",
                targetId = hospital.hospId,
                incidentId = incidentId,
                status = "pending"
            )

            val docRef = db.collection("broadcasts").document()
            batch.set(docRef, broadcast)
        }

        // Commit all broadcasts at once
        batch.commit()
    }

    /**
     * Listen for ambulance broadcasts in real-time
     *
     * @param ambulanceId The ambulance ID
     * @param callback Returns broadcast when available
     */
    fun listenForAmbulanceBroadcasts(
        ambulanceId: String,
        callback: (Broadcast?) -> Unit
    ): ListenerRegistration {
        return db.collection("broadcasts")
            .whereEqualTo("targetType", "ambulance")
            .whereEqualTo("targetId", ambulanceId)
            .whereEqualTo("status", "pending")
            .addSnapshotListener { snapshots, _ ->
                if (snapshots != null && !snapshots.isEmpty) {
                    val broadcast = snapshots.documents[0].toObject(Broadcast::class.java)
                    callback(broadcast)
                } else {
                    callback(null)
                }
            }
    }

    /**
     * Listen for hospital broadcasts in real-time
     *
     * @param hospitalId The hospital ID
     * @param callback Returns broadcast when available
     */
    fun listenForHospitalBroadcasts(
        hospitalId: String,
        callback: (Broadcast?) -> Unit
    ): ListenerRegistration {
        return db.collection("broadcasts")
            .whereEqualTo("targetType", "hospital")
            .whereEqualTo("targetId", hospitalId)
            .whereEqualTo("status", "pending")
            .addSnapshotListener { snapshots, _ ->
                if (snapshots != null && !snapshots.isEmpty) {
                    val broadcast = snapshots.documents[0].toObject(Broadcast::class.java)
                    callback(broadcast)
                } else {
                    callback(null)
                }
            }
    }

    /**
     * AMBULANCE ACCEPTANCE with transaction (First-Accept Wins)
     *
     * Process:
     * 1. Check if incident already assigned
     * 2. If not, assign this ambulance
     * 3. Update status
     * 4. Cancel other ambulance broadcasts
     * 5. Trigger hospital broadcast
     *
     * @param incidentId The incident ID
     * @param ambulanceId The accepting ambulance ID
     * @param callback Success or failure
     */
    suspend fun acceptIncidentAsAmbulance(
        incidentId: String,
        ambulanceId: String,
        callback: (Boolean) -> Unit
    ) {
        val incidentRef = db.collection("incidents").document(incidentId)

        try {
            // Atomic transaction for race condition safety
            val success = db.runTransaction { transaction ->
                // READ PHASE
                val snapshot = transaction.get(incidentRef)
                val incident = snapshot.toObject(Incident::class.java)

                // Check if already assigned to another ambulance
                if (incident?.assignedAmbId != null && incident.assignedAmbId.isNotEmpty()) {
                    return@runTransaction false // Another ambulance was faster
                }

                // WRITE PHASE - Assign this ambulance
                transaction.update(incidentRef, "assignedAmbId", ambulanceId)
                transaction.update(incidentRef, "status", "ambulance_assigned")

                return@runTransaction true
            }.await()

            if (success) {
                // Cancel all other ambulance broadcasts
                cancelOtherBroadcasts(incidentId, "ambulance", ambulanceId)

                // Update this ambulance's broadcast to "accepted"
                updateBroadcastStatus(incidentId, "ambulance", ambulanceId, "accepted")

                // AUTOMATIC HOSPITAL BROADCAST
                // Get incident to retrieve location
                incidentRef.get().addOnSuccessListener { doc ->
                    val incident = doc.toObject(Incident::class.java)
                    incident?.let {
                        findNearestHospitalsAndBroadcast(
                            incidentId,
                            it.userLat,
                            it.userLon
                        ) { count ->
                            println("Automatically broadcasted to $count hospitals")
                        }
                    }
                }

                callback(true)
            } else {
                callback(false)
            }

        } catch (e: Exception) {
            callback(false)
        }
    }

    /**
     * HOSPITAL ACCEPTANCE with transaction (First-Accept Wins)
     *
     * @param incidentId The incident ID
     * @param hospitalId The accepting hospital ID
     * @param callback Success or failure
     */
    suspend fun acceptIncidentAsHospital(
        incidentId: String,
        hospitalId: String,
        callback: (Boolean) -> Unit
    ) {
        val incidentRef = db.collection("incidents").document(incidentId)

        try {
            val success = db.runTransaction { transaction ->
                // READ PHASE
                val snapshot = transaction.get(incidentRef)
                val incident = snapshot.toObject(Incident::class.java)

                // Check if already assigned to another hospital
                if (incident?.assignedHospId != null && incident.assignedHospId.isNotEmpty()) {
                    return@runTransaction false
                }

                // WRITE PHASE
                transaction.update(incidentRef, "assignedHospId", hospitalId)
                transaction.update(incidentRef, "status", "hospital_assigned")

                return@runTransaction true
            }.await()

            if (success) {
                // Cancel other hospitals
                cancelOtherBroadcasts(incidentId, "hospital", hospitalId)

                // Update this hospital's broadcast
                updateBroadcastStatus(incidentId, "hospital", hospitalId, "accepted")

                callback(true)
            } else {
                callback(false)
            }

        } catch (e: Exception) {
            callback(false)
        }
    }

    /**
     * Cancel all other broadcasts after one accepts
     *
     * @param incidentId The incident ID
     * @param targetType "ambulance" or "hospital"
     * @param winnerId The ID of the entity that won
     */
    private fun cancelOtherBroadcasts(incidentId: String, targetType: String, winnerId: String) {
        db.collection("broadcasts")
            .whereEqualTo("incidentId", incidentId)
            .whereEqualTo("targetType", targetType)
            .whereEqualTo("status", "pending")
            .get()
            .addOnSuccessListener { documents ->
                for (doc in documents) {
                    val targetId = doc.getString("targetId")
                    if (targetId != winnerId) {
                        doc.reference.update("status", "cancelled")
                    }
                }
            }
    }

    /**
     * Update broadcast status for winner
     *
     * @param incidentId The incident ID
     * @param targetType "ambulance" or "hospital"
     * @param targetId The winner's ID
     * @param newStatus New status
     */
    private fun updateBroadcastStatus(
        incidentId: String,
        targetType: String,
        targetId: String,
        newStatus: String
    ) {
        db.collection("broadcasts")
            .whereEqualTo("incidentId", incidentId)
            .whereEqualTo("targetType", targetType)
            .whereEqualTo("targetId", targetId)
            .get()
            .addOnSuccessListener { documents ->
                for (doc in documents) {
                    doc.reference.update("status", newStatus)
                }
            }
    }

    // Legacy methods for backward compatibility (deprecated)
    @Deprecated("Use createIncidentAndBroadcast instead")
    fun createIncident(incident: Incident, callback: (String) -> Unit) {
        db.collection("incidents").add(incident)
            .addOnSuccessListener { callback(it.id) }
            .addOnFailureListener { callback("") }
    }

    @Deprecated("Use acceptIncidentAsAmbulance instead")
    suspend fun acceptIncident(
        incidentId: String,
        ambulanceId: String,
        callback: (Boolean) -> Unit
    ) {
        acceptIncidentAsAmbulance(incidentId, ambulanceId, callback)
    }
}
