package com.example.ambulance.ui.ambulance

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.ambulance.databinding.ActivityAmbulanceBinding
import com.example.ambulance.ui.RoleSelectionActivity
import com.example.ambulance.utils.UserSession
import com.example.ambulance.viewmodel.IncidentViewModel
import com.google.firebase.firestore.FirebaseFirestore

class AmbulanceActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAmbulanceBinding
    private val incidentViewModel: IncidentViewModel by viewModels()
    private val db = FirebaseFirestore.getInstance()

    // Get ambulance ID from saved session
    private lateinit var ambulanceId: String
    private lateinit var ambulanceName: String

    // Store current incident details for navigation - with dummy defaults
    private var currentIncidentId: String? = "DEMO-001"
    private var currentPatientLat: Double = 12.9236 // RV College of Engineering
    private var currentPatientLon: Double = 77.4985
    
    // Track if incident is accepted
    private var isIncidentAccepted = false

    companion object {
        private const val LOCATION_PERMISSION_REQUEST_CODE = 1001
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAmbulanceBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Set up the toolbar
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setDisplayShowHomeEnabled(true)
        supportActionBar?.title = "Ambulance Dashboard"

        // Get ambulance details from session
        ambulanceId = UserSession.getUserId(this)
        ambulanceName = UserSession.getUserName(this)

        if (ambulanceId.isEmpty()) {
            Toast.makeText(this, "No ambulance ID found. Please login again.", Toast.LENGTH_LONG)
                .show()
            finish()
            return
        }

        Toast.makeText(this, "Logged in as: $ambulanceName ($ambulanceId)", Toast.LENGTH_SHORT)
            .show()

        // Start listening for broadcasts targeted at this ambulance
        incidentViewModel.listenForAmbulanceBroadcasts(ambulanceId)

        // Observe the broadcast LiveData for incoming incidents
        incidentViewModel.broadcast.observe(this) { broadcast ->
            if (broadcast != null && !isIncidentAccepted) {
                currentIncidentId = broadcast.incidentId

                // Fetch incident details to get patient location
                fetchIncidentDetails(broadcast.incidentId)

                binding.textViewIncident.text =
                    "🚨 NEW EMERGENCY ALERT!\n\nIncident ID: ${broadcast.incidentId}\n\nPatient waiting for assistance.\nAccept to view live location."
                binding.buttonAccept.isEnabled = true
                binding.buttonReject.isEnabled = true
                binding.buttonViewLocation.isEnabled = true
                binding.buttonViewLocation.alpha = 1.0f

                binding.buttonAccept.setOnClickListener {
                    // Call acceptIncident with the received broadcast object and the ambulanceId
                    incidentViewModel.acceptIncident(broadcast, ambulanceId)
                    binding.buttonAccept.isEnabled = false // Disable button after clicking
                    binding.buttonReject.isEnabled = false
                }
                
                binding.buttonReject.setOnClickListener {
                    // Reject the incident
                    binding.textViewIncident.text = "Incident rejected.\n\nWaiting for new emergency alerts..."
                    binding.buttonAccept.isEnabled = false
                    binding.buttonReject.isEnabled = false
                    binding.buttonViewLocation.isEnabled = true
                    binding.buttonViewLocation.alpha = 1.0f
                }
            } else if (!isIncidentAccepted) {
                // No active broadcast, or it has been resolved by another ambulance
                binding.textViewIncident.text =
                    "✓ Ready for Service\n\nAmbulance: $ambulanceName\n\nWaiting for emergency alerts...\n\nYou will be notified when a patient needs assistance."
                binding.buttonAccept.isEnabled = false
                binding.buttonReject.isEnabled = false
                binding.buttonViewLocation.isEnabled = true
                binding.buttonViewLocation.alpha = 1.0f
            }
        }

        // Observe the result of accepting the incident
        incidentViewModel.incidentAccepted.observe(this) { success ->
            if (success) {
                isIncidentAccepted = true
                Toast.makeText(this, "✓ Incident accepted! You are now assigned.", Toast.LENGTH_SHORT)
                    .show()
                binding.textViewIncident.text = 
                    "✓ INCIDENT ASSIGNED TO YOU!\n\nIncident ID: $currentIncidentId\n\nPatient Location:\nLat: ${String.format("%.6f", currentPatientLat)}\nLon: ${String.format("%.6f", currentPatientLon)}\n\nClick 'View Live Location' to track patient in real-time."
                
                // Enable the View Location button
                binding.buttonViewLocation.isEnabled = true
                binding.buttonViewLocation.alpha = 1.0f
                binding.buttonAccept.isEnabled = false
                binding.buttonReject.isEnabled = false
            } else {
                Toast.makeText(this, "Failed to accept incident (already taken).", Toast.LENGTH_SHORT).show()
                binding.textViewIncident.text = "Incident was taken by another unit.\n\nWaiting for new emergency alerts..."
                isIncidentAccepted = false
            }
        }

        // View Location button
        binding.buttonViewLocation.setOnClickListener {
            openPatientTracking()
        }
    }

    /**
     * Fetch incident details to get patient location
     */
    private fun fetchIncidentDetails(incidentId: String) {
        db.collection("incidents")
            .document(incidentId)
            .get()
            .addOnSuccessListener { document ->
                currentPatientLat = document.getDouble("userLat") ?: 0.0
                currentPatientLon = document.getDouble("userLon") ?: 0.0
            }
            .addOnFailureListener {
                Toast.makeText(this, "Error fetching incident details", Toast.LENGTH_SHORT).show()
            }
    }

    /**
     * Open patient tracking activity with location data
     */
    private fun openPatientTracking() {
        if (currentIncidentId != null && currentPatientLat != 0.0 && currentPatientLon != 0.0) {
            val intent = Intent(this, PatientTrackingActivity::class.java).apply {
                putExtra("incidentId", currentIncidentId)
                putExtra("patientLat", currentPatientLat)
                putExtra("patientLon", currentPatientLon)
            }
            startActivity(intent)
        } else {
            Toast.makeText(this, "Patient location not available yet", Toast.LENGTH_SHORT).show()
        }
    }

    // Handle back button press
    override fun onSupportNavigateUp(): Boolean {
        // Clear session and go back to role selection
        UserSession.clearSession(this)
        val intent = Intent(this, RoleSelectionActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
        startActivity(intent)
        finish()
        return true
    }

    override fun onBackPressed() {
        // Same behavior as back button in toolbar
        onSupportNavigateUp()
    }
}
