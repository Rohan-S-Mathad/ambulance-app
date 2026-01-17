package com.example.ambulance.ui.ambulance

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ambulance.databinding.ActivityPatientTrackingBinding
import com.example.ambulance.utils.DistanceCalculator
import java.text.SimpleDateFormat
import java.util.*
import kotlin.random.Random

/**
 * PatientTrackingActivity - Custom Map View (No Google Maps needed!)
 *
 * Shows RV College of Engineering location
 * Patient marker moves within 10 meters
 * Updates every 2 seconds
 */
class PatientTrackingActivity : AppCompatActivity() {

    private lateinit var binding: ActivityPatientTrackingBinding

    // RV College of Engineering coordinates
    private var basePatientLat: Double = 12.9236 // RV College
    private var basePatientLon: Double = 77.4985

    // Current simulated locations
    private var currentPatientLat: Double = 0.0
    private var currentPatientLon: Double = 0.0
    private var ambulanceLat: Double = 0.0
    private var ambulanceLon: Double = 0.0

    private var incidentId: String = ""

    // Update handler
    private val updateHandler = Handler(Looper.getMainLooper())
    private val updateInterval = 2000L // 2 seconds

    // Movement parameters
    private val maxMovementMeters = 10.0
    private val degreesPerMeter = 0.00001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPatientTrackingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Set up toolbar
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setDisplayShowHomeEnabled(true)
        supportActionBar?.title = "Live Patient Tracking (Custom Map)"

        // Get data from intent or use defaults
        basePatientLat = intent.getDoubleExtra("patientLat", 12.9236)
        basePatientLon = intent.getDoubleExtra("patientLon", 77.4985)
        incidentId = intent.getStringExtra("incidentId") ?: "DEMO-001"

        // Initialize positions
        currentPatientLat = basePatientLat
        currentPatientLon = basePatientLon
        ambulanceLat = basePatientLat + (50 * degreesPerMeter)
        ambulanceLon = basePatientLon + (50 * degreesPerMeter)

        setupUI()

        // Start simulation
        startLocationSimulation()

        Toast.makeText(this, " Custom Map - RV College of Engineering", Toast.LENGTH_LONG).show()
    }

    private fun setupUI() {
        binding.textViewIncidentId.text = incidentId
        updatePatientLocationDisplay()
        calculateDistance()

        binding.buttonCenterMap.setOnClickListener {
            Toast.makeText(this, "Map centered on patient", Toast.LENGTH_SHORT).show()
        }

        binding.buttonOpenNavigation.setOnClickListener {
            openGoogleMapsNavigation()
        }

        binding.buttonRefreshLocation.setOnClickListener {
            simulatePatientMovement()
            Toast.makeText(this, "Location refreshed!", Toast.LENGTH_SHORT).show()
        }
    }

    private fun startLocationSimulation() {
        updateHandler.post(object : Runnable {
            override fun run() {
                simulatePatientMovement()
                simulateAmbulanceMovement()
                updatePatientLocationDisplay()
                calculateDistance()
                updateTimestamp()

                updateHandler.postDelayed(this, updateInterval)
            }
        })
    }

    private fun simulatePatientMovement() {
        val randomLatOffset =
            Random.nextDouble(-maxMovementMeters, maxMovementMeters) * degreesPerMeter
        val randomLonOffset =
            Random.nextDouble(-maxMovementMeters, maxMovementMeters) * degreesPerMeter

        currentPatientLat = basePatientLat + randomLatOffset
        currentPatientLon = basePatientLon + randomLonOffset
    }

    private fun simulateAmbulanceMovement() {
        val movementSpeed = 2.0 * degreesPerMeter
        val latDiff = currentPatientLat - ambulanceLat
        val lonDiff = currentPatientLon - ambulanceLon
        val distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff)

        if (distance > 0.0001) {
            val latStep = (latDiff / distance) * movementSpeed
            val lonStep = (lonDiff / distance) * movementSpeed
            ambulanceLat += latStep
            ambulanceLon += lonStep
        }
    }

    private fun updatePatientLocationDisplay() {
        binding.textViewPatientLocation.text = String.format(
            " Patient: %.6f, %.6f\n Ambulance: %.6f, %.6f\n\n RV College of Engineering\nBangalore, India",
            currentPatientLat,
            currentPatientLon,
            ambulanceLat,
            ambulanceLon
        )
    }

    private fun updateTimestamp() {
        val timeFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
        binding.textViewLastUpdate.text = "Updated: ${timeFormat.format(Date())}"
    }

    private fun calculateDistance() {
        val distance = DistanceCalculator.calculateDistance(
            ambulanceLat, ambulanceLon,
            currentPatientLat, currentPatientLon
        )

        val formattedDistance = DistanceCalculator.formatDistance(distance)
        binding.textViewDistance.text = formattedDistance

        val eta = (distance / 40.0 * 60).toInt()
        binding.textViewETA.text = if (eta < 1) "< 1 min" else "$eta min"
    }

    private fun openGoogleMapsNavigation() {
        try {
            val uri = Uri.parse("google.navigation:q=$currentPatientLat,$currentPatientLon&mode=d")
            val mapIntent = Intent(Intent.ACTION_VIEW, uri)
            mapIntent.setPackage("com.google.android.apps.maps")

            if (mapIntent.resolveActivity(packageManager) != null) {
                startActivity(mapIntent)
            } else {
                val browserUri = Uri.parse(
                    "https://www.google.com/maps/dir/?api=1&destination=$currentPatientLat,$currentPatientLon&travelmode=driving"
                )
                startActivity(Intent(Intent.ACTION_VIEW, browserUri))
            }
        } catch (e: Exception) {
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }

    override fun onBackPressed() {
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        updateHandler.removeCallbacksAndMessages(null)
    }
}
