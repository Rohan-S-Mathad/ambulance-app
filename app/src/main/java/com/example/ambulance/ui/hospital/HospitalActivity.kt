package com.example.ambulance.ui.hospital

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ambulance.data.EmergencyTriggerRequest
import com.example.ambulance.data.FirestoreRepository
import com.example.ambulance.data.RetrofitClient
import com.example.ambulance.data.models.Broadcast
import com.example.ambulance.data.models.Incident
import com.example.ambulance.databinding.ActivityHospitalBinding
import com.example.ambulance.ui.RoleSelectionActivity
import com.example.ambulance.ui.hospital.HospitalPatientLocationActivity
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * HospitalActivity - Main dashboard for hospital emergency management
 *
 * Features:
 * - Real-time listening for emergency broadcasts
 * - Display patient location and details
 * - Accept/Reject emergency cases
 * - First-Accept Wins algorithm using Firestore transactions
 * - Live location tracking after acceptance (updates every 10 seconds)
 * - Automatic UI updates based on assignment status
 * - View patient on map button (always enabled with demo data)
 * - WORKAROUND: Accept button triggers Twilio calls (since emergency button not working)
 */
class HospitalActivity : AppCompatActivity() {

    // View Binding for type-safe view access
    private lateinit var binding: ActivityHospitalBinding

    // Firestore instance for database operations
    private val db = FirebaseFirestore.getInstance()
    private val repository = FirestoreRepository()

    // Get hospital ID from saved session
    private lateinit var hospitalId: String
    private lateinit var hospitalName: String

    // Firestore listener registration for cleanup
    private var broadcastListener: ListenerRegistration? = null
    private var incidentListener: ListenerRegistration? = null

    // Currently active broadcast
    private var currentBroadcast: Broadcast? = null

    // Currently active incident
    private var currentIncident: Incident? = null

    // Track if incident is accepted
    private var isIncidentAccepted = false

    // Store patient location for map view - with dummy defaults
    private var patientLat: Double = 12.9236 // RV College of Engineering
    private var patientLon: Double = 77.4985
    private var demoIncidentId: String = "DEMO-001"

    // Live location update handler
    private val updateHandler = Handler(Looper.getMainLooper())
    private val updateInterval = 10000L // 10 seconds

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize view binding
        binding = ActivityHospitalBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Set up the toolbar
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setDisplayShowHomeEnabled(true)
        supportActionBar?.title = "Hospital Dashboard"

        // Get hospital details from session
        hospitalId = com.example.ambulance.utils.UserSession.getUserId(this)
        hospitalName = com.example.ambulance.utils.UserSession.getUserName(this)

        if (hospitalId.isEmpty()) {
            Toast.makeText(this, "No hospital ID found. Please login again.", Toast.LENGTH_LONG)
                .show()
            finish()
            return
        }

        // Setup UI
        setupUI()

        // Start listening for hospital broadcasts
        startListeningForBroadcasts()
    }

    /**
     * Setup initial UI state and button click listeners
     */
    private fun setupUI() {
        // Display hospital ID in header
        binding.textViewHospitalId.text = "Hospital: $hospitalName ($hospitalId)"

        // Accept button click handler
        binding.buttonAccept.setOnClickListener {
            currentBroadcast?.let { broadcast ->
                acceptEmergency(broadcast)
            }
        }

        // Reject button click handler
        binding.buttonReject.setOnClickListener {
            currentBroadcast?.let { broadcast ->
                rejectEmergency(broadcast)
            }
        }

        // View patient on map button click handler - ALWAYS WORKS!
        binding.buttonViewOnMap.setOnClickListener {
            val intent = Intent(this, HospitalPatientLocationActivity::class.java)
            intent.putExtra("patientLat", patientLat)
            intent.putExtra("patientLon", patientLon)
            intent.putExtra("incidentId", currentBroadcast?.incidentId ?: demoIncidentId)
            startActivity(intent)
        }

        // TEST CALL button - Manual call testing
        binding.buttonTestCall.setOnClickListener {
            testCallAmbulances()
        }
    }

    /**
     * Start listening for real-time broadcasts targeted at this hospital
     *
     * Listens to Firestore broadcasts collection with filters:
     * - targetType = "hospital"
     * - targetId = this hospital's ID
     * - status = "pending"
     */
    private fun startListeningForBroadcasts() {
        Toast.makeText(this, "Listening for emergency broadcasts...", Toast.LENGTH_SHORT).show()

        broadcastListener = db.collection("broadcasts")
            .whereEqualTo("targetType", "hospital")
            .whereEqualTo("targetId", hospitalId)
            .whereEqualTo("status", "pending")
            .addSnapshotListener { snapshots, error ->
                if (error != null) {
                    Toast.makeText(this, "Error listening: ${error.message}", Toast.LENGTH_LONG)
                        .show()
                    return@addSnapshotListener
                }

                // Check if there are any pending broadcasts
                if (snapshots != null && !snapshots.isEmpty) {
                    // Get the first pending broadcast
                    val document = snapshots.documents[0]
                    val broadcast = document.toObject(Broadcast::class.java)

                    broadcast?.let {
                        currentBroadcast = it
                        // Fetch incident details and display
                        fetchIncidentDetails(it.incidentId)
                    }
                } else {
                    // No pending broadcasts, show waiting state
                    showWaitingState()
                }
            }
    }

    /**
     * Fetch incident details from Firestore
     *
     * @param incidentId The ID of the incident to fetch
     */
    private fun fetchIncidentDetails(incidentId: String) {
        db.collection("incidents")
            .document(incidentId)
            .get()
            .addOnSuccessListener { document ->
                val incident = document.toObject(Incident::class.java)
                incident?.let {
                    currentIncident = it
                    // Store patient location for map view
                    patientLat = it.userLat
                    patientLon = it.userLon
                    displayEmergencyAlert(it)
                }
            }
            .addOnFailureListener { exception ->
                Toast.makeText(
                    this,
                    "Error fetching incident: ${exception.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
    }

    /**
     * Display emergency alert with patient details
     *
     * @param incident The incident object containing patient information
     */
    private fun displayEmergencyAlert(incident: Incident) {
        // Hide waiting message, show emergency card
        binding.textViewStatusMessage.visibility = View.GONE
        binding.cardEmergencyAlert.visibility = View.VISIBLE
        binding.cardInstructions.visibility = View.GONE

        // Populate incident details
        binding.textViewIncidentId.text = currentBroadcast?.incidentId ?: "Unknown"
        binding.textViewPatientId.text = incident.userId
        binding.textViewLatitude.text = String.format("%.6f", incident.userLat)
        binding.textViewLongitude.text = String.format("%.6f", incident.userLon)

        // Format and display timestamp
        incident.createdAt?.let {
            val timeFormat = SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault())
            binding.textViewTimestamp.text = timeFormat.format(it)
        }

        // Show action buttons
        binding.layoutActionButtons.visibility = View.VISIBLE
        binding.cardAssignmentStatus.visibility = View.GONE
        binding.cardCancelledStatus.visibility = View.GONE

        // Play notification sound or vibration (optional)
        Toast.makeText(this, " New Emergency Alert!", Toast.LENGTH_LONG).show()
    }

    /**
     * Show waiting state when no broadcasts are available
     */
    private fun showWaitingState() {
        binding.textViewStatusMessage.visibility = View.VISIBLE
        binding.textViewStatusMessage.text = "Waiting for emergency alerts..."
        binding.cardEmergencyAlert.visibility = View.GONE
        binding.cardInstructions.visibility = View.VISIBLE

        // Reset current data
        currentBroadcast = null
        currentIncident = null
    }

    /**
     * Accept emergency using UPDATED repository method
     * Now uses acceptIncidentAsHospital which is optimized
     * WORKAROUND: Also triggers Twilio calls since emergency button isn't working
     */
    private fun acceptEmergency(broadcast: Broadcast) {
        binding.buttonAccept.isEnabled = false
        binding.buttonReject.isEnabled = false

        Toast.makeText(this, "Processing acceptance and calling ambulances...", Toast.LENGTH_SHORT)
            .show()

        CoroutineScope(Dispatchers.IO).launch {
            // WORKAROUND: Trigger Twilio calls when hospital accepts
            // This will call ambulances and make the system work until emergency button is fixed
            triggerTwilioCalls()

            // Use NEW repository method
            repository.acceptIncidentAsHospital(broadcast.incidentId, hospitalId) { success ->
                runOnUiThread {
                    if (success) {
                        onAcceptSuccess(broadcast)
                    } else {
                        onAcceptFailure()
                    }
                }
            }
        }
    }

    /**
     * WORKAROUND: Trigger Twilio API calls to ambulances and hospitals
     * This is called when hospital accepts the emergency
     */
    private suspend fun triggerTwilioCalls() {
        try {
            val incident = currentIncident ?: return

            val request = EmergencyTriggerRequest(
                patientPhone = "+919482936725", // Hospital number that's verified
                patientName = incident.userId,
                latitude = incident.userLat,
                longitude = incident.userLon,
                address = "RV College of Engineering, Bangalore",
                incidentId = currentBroadcast?.incidentId
            )

            val response = withContext(Dispatchers.IO) {
                RetrofitClient.twilioApi.triggerEmergency(request)
            }

            withContext(Dispatchers.Main) {
                if (response.isSuccessful && response.body()?.success == true) {
                    val results = response.body()?.results
                    val successCount = results?.count { it.status == "success" } ?: 0
                    Toast.makeText(
                        this@HospitalActivity,
                        "📞 Emergency calls sent! $successCount calls successful",
                        Toast.LENGTH_LONG
                    ).show()
                } else {
                    Toast.makeText(
                        this@HospitalActivity,
                        "⚠️ Calls partially sent (some numbers may be unverified)",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        } catch (e: Exception) {
            withContext(Dispatchers.Main) {
                Toast.makeText(
                    this@HospitalActivity,
                    "⚠️ Call API error: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun testCallAmbulances() {
        Toast.makeText(this, "📞 Testing Twilio API - Making test calls...", Toast.LENGTH_LONG)
            .show()

        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Create test emergency data
                val request = EmergencyTriggerRequest(
                    patientPhone = "+919482936725", // Verified hospital number
                    patientName = "TEST PATIENT",
                    latitude = 12.9236, // RV College
                    longitude = 77.4985,
                    address = "RV College of Engineering, Bangalore - TEST CALL",
                    incidentId = "TEST-${System.currentTimeMillis()}"
                )

                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@HospitalActivity,
                        "⏳ Calling server at 172.17.13.32:3000...",
                        Toast.LENGTH_SHORT
                    ).show()
                }

                // Call the API
                val response = withContext(Dispatchers.IO) {
                    RetrofitClient.twilioApi.triggerEmergency(request)
                }

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        val body = response.body()
                        if (body?.success == true) {
                            // Success!
                            val results = body.results ?: emptyList()
                            val successCount = results.count { it.status == "success" }
                            val failCount = results.count { it.status == "error" }

                            val message = buildString {
                                append("✅ TEST SUCCESSFUL!\n\n")
                                append("📞 Calls made: ${results.size}\n")
                                append("✅ Success: $successCount\n")
                                append("❌ Failed: $failCount\n\n")
                                results.forEach { result ->
                                    append("${if (result.status == "success") "✅" else "❌"} ")
                                    append("${result.contact}: ${result.phone}\n")
                                    if (result.error != null) {
                                        append("   Error: ${result.error}\n")
                                    }
                                }
                                append("\n🔔 Check if hospital phone is ringing!")
                            }

                            android.app.AlertDialog.Builder(this@HospitalActivity)
                                .setTitle("📞 Test Call Results")
                                .setMessage(message)
                                .setPositiveButton("OK", null)
                                .show()
                        } else {
                            // API returned success=false
                            Toast.makeText(
                                this@HospitalActivity,
                                "❌ API Error: ${body?.message ?: "Unknown error"}",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                    } else {
                        // HTTP error
                        Toast.makeText(
                            this@HospitalActivity,
                            "❌ HTTP ${response.code()}: ${response.message()}",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }
            } catch (e: java.net.ConnectException) {
                withContext(Dispatchers.Main) {
                    android.app.AlertDialog.Builder(this@HospitalActivity)
                        .setTitle("❌ Connection Failed")
                        .setMessage(
                            "Cannot reach server!\n\n" +
                                    "Checklist:\n" +
                                    "1. Is server running?\n" +
                                    "   → cd twilio-serverless\n" +
                                    "   → node server.js\n\n" +
                                    "2. Same WiFi network?\n" +
                                    "   → Phone: Check WiFi\n" +
                                    "   → Computer: 172.17.13.32\n\n" +
                                    "3. Turn OFF mobile data!\n\n" +
                                    "Error: ${e.message}"
                        )
                        .setPositiveButton("OK", null)
                        .show()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    android.app.AlertDialog.Builder(this@HospitalActivity)
                        .setTitle("❌ Test Failed")
                        .setMessage(
                            "Error: ${e.message}\n\nStack: ${
                                e.stackTraceToString().take(200)
                            }"
                        )
                        .setPositiveButton("OK", null)
                        .show()
                }
            }
        }
    }

    /**
     * Handle successful acceptance
     * Updates the broadcast status and cancels other hospitals' broadcasts
     *
     * @param broadcast The accepted broadcast
     */
    private fun onAcceptSuccess(broadcast: Broadcast) {
        Toast.makeText(
            this,
            " Patient Assigned. Prepare Emergency!",
            Toast.LENGTH_LONG
        ).show()

        // Update UI to show assignment status
        binding.layoutActionButtons.visibility = View.GONE
        binding.cardAssignmentStatus.visibility = View.VISIBLE
        binding.textViewAssignmentStatus.text =
            " You have been assigned to this emergency\n\nPrepare emergency room for incoming patient!"

        // Update this hospital's broadcast to "accepted"
        updateBroadcastStatus(broadcast, "accepted")

        // Cancel all other hospital broadcasts for this incident
        cancelOtherHospitalBroadcasts(broadcast.incidentId)

        // Start live location tracking
        isIncidentAccepted = true
        updatePatientLocation()
        updateHandler.postDelayed(this::updatePatientLocation, updateInterval)
    }

    /**
     * Handle acceptance failure (another hospital was faster)
     */
    private fun onAcceptFailure() {
        Toast.makeText(
            this,
            "Another hospital already accepted this emergency",
            Toast.LENGTH_LONG
        ).show()

        // Update UI to show cancelled status
        binding.layoutActionButtons.visibility = View.GONE
        binding.cardCancelledStatus.visibility = View.VISIBLE

        // Re-enable buttons in case of UI inconsistency
        binding.buttonAccept.isEnabled = true
        binding.buttonReject.isEnabled = true
    }

    /**
     * Reject the emergency broadcast
     * Simply marks this hospital's broadcast as rejected
     *
     * @param broadcast The broadcast to reject
     */
    private fun rejectEmergency(broadcast: Broadcast) {
        Toast.makeText(this, "Emergency rejected", Toast.LENGTH_SHORT).show()

        // Update broadcast status to rejected
        updateBroadcastStatus(broadcast, "rejected")

        // Hide the emergency card
        binding.layoutActionButtons.visibility = View.GONE
        binding.cardCancelledStatus.visibility = View.VISIBLE
        binding.textViewCancelledStatus.text = " You rejected this emergency"
    }

    /**
     * Update the status of a broadcast in Firestore
     *
     * @param broadcast The broadcast to update
     * @param newStatus The new status ("accepted", "rejected", "cancelled")
     */
    private fun updateBroadcastStatus(broadcast: Broadcast, newStatus: String) {
        db.collection("broadcasts")
            .whereEqualTo("targetType", "hospital")
            .whereEqualTo("targetId", hospitalId)
            .whereEqualTo("incidentId", broadcast.incidentId)
            .whereEqualTo("status", "pending")
            .get()
            .addOnSuccessListener { documents ->
                for (document in documents) {
                    document.reference.update("status", newStatus)
                }
            }
            .addOnFailureListener { exception ->
                Toast.makeText(
                    this,
                    "Error updating broadcast: ${exception.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
    }

    /**
     * Cancel all other hospital broadcasts for the given incident
     * Called after this hospital successfully accepts an emergency
     *
     * @param incidentId The incident ID
     */
    private fun cancelOtherHospitalBroadcasts(incidentId: String) {
        db.collection("broadcasts")
            .whereEqualTo("targetType", "hospital")
            .whereEqualTo("incidentId", incidentId)
            .whereEqualTo("status", "pending")
            .get()
            .addOnSuccessListener { documents ->
                // Cancel all pending broadcasts for other hospitals
                for (document in documents) {
                    val targetId = document.getString("targetId")
                    // Don't cancel our own broadcast (already updated to "accepted")
                    if (targetId != hospitalId) {
                        document.reference.update("status", "cancelled")
                    }
                }
            }
            .addOnFailureListener { exception ->
                // Log error but don't show to user (background operation)
                println("Error cancelling broadcasts: ${exception.message}")
            }
    }

    /**
     * Update patient location from Firestore
     */
    private fun updatePatientLocation() {
        if (!isIncidentAccepted || currentBroadcast == null) return

        db.collection("incidents")
            .document(currentBroadcast!!.incidentId)
            .get()
            .addOnSuccessListener { document ->
                val updatedLat = document.getDouble("userLat")
                val updatedLon = document.getDouble("userLon")

                if (updatedLat != null && updatedLon != null) {
                    // Update UI with latest coordinates
                    binding.textViewLatitude.text = String.format("%.6f", updatedLat)
                    binding.textViewLongitude.text = String.format("%.6f", updatedLon)

                    // Update timestamp
                    val timeFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
                    val currentTime = timeFormat.format(Date())

                    // Schedule next update
                    updateHandler.postDelayed(::updatePatientLocation, updateInterval)
                }
            }
            .addOnFailureListener {
                // Retry on failure
                updateHandler.postDelayed(::updatePatientLocation, updateInterval)
            }
    }

    /**
     * Handle back button press
     */
    override fun onSupportNavigateUp(): Boolean {
        // Clear session and go back to role selection
        com.example.ambulance.utils.UserSession.clearSession(this)
        val intent = android.content.Intent(this, RoleSelectionActivity::class.java)
        intent.flags =
            android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP or android.content.Intent.FLAG_ACTIVITY_NEW_TASK
        startActivity(intent)
        finish()
        return true
    }

    override fun onBackPressed() {
        // Same behavior as back button in toolbar
        onSupportNavigateUp()
    }

    /**
     * Clean up listener when activity is destroyed
     */
    override fun onDestroy() {
        super.onDestroy()
        // Remove Firestore listener to prevent memory leaks
        broadcastListener?.remove()
    }
}
