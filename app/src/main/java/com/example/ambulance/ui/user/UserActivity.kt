package com.example.ambulance.ui.user

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.example.ambulance.data.models.Incident
import com.example.ambulance.databinding.ActivityUserBinding
import com.example.ambulance.ui.RoleSelectionActivity
import com.example.ambulance.utils.UserSession
import com.example.ambulance.viewmodel.IncidentViewModel
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import java.util.Date

class UserActivity : AppCompatActivity() {

    private lateinit var binding: ActivityUserBinding
    private val incidentViewModel: IncidentViewModel by viewModels()
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private var hasLocationPermission = false

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        hasLocationPermission = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true

        if (hasLocationPermission) {
            getCurrentLocation()
        } else {
            Toast.makeText(this, "Location permission required for emergency services", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityUserBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Set up the toolbar
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setDisplayShowHomeEnabled(true)
        supportActionBar?.title = "Emergency Request"

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        checkLocationPermission()

        binding.buttonEmergency.setOnClickListener {
            if (hasLocationPermission) {
                getCurrentLocation()
            } else {
                requestLocationPermission()
            }
        }

        observeIncidentStatus()
    }

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

    private fun checkLocationPermission() {
        hasLocationPermission = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED || ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestLocationPermission() {
        requestPermissionLauncher.launch(
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            )
        )
    }

    private fun getCurrentLocation() {
        if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            Toast.makeText(this, "Location permission was denied.", Toast.LENGTH_SHORT).show()
            return
        }

        binding.textViewStatus.text = "Getting location..."

        fusedLocationClient.lastLocation
            .addOnSuccessListener { location ->
                if (location != null) {
                    binding.textViewStatus.text = "Location found. Creating incident..."

                    val newIncident = Incident(
                        "dummy_user_id",
                        location.latitude,
                        location.longitude,
                        Date(),
                        "pending"
                    )
                    incidentViewModel.createIncident(newIncident)

                } else {
                    binding.textViewStatus.text = "No location available. Try again."
                    Toast.makeText(this, "No location available", Toast.LENGTH_SHORT).show()
                }
            }
            .addOnFailureListener { exception ->
                binding.textViewStatus.text = "Location error: ${exception.message}"
                Toast.makeText(this, "Location error: ${exception.message}", Toast.LENGTH_LONG).show()
            }
    }

    private fun observeIncidentStatus() {
        incidentViewModel.incidentCreationStatus.observe(this) { status ->
            binding.textViewStatus.text = status
            if (status.contains("success", ignoreCase = true) || status.contains("created", ignoreCase = true)) {
                Toast.makeText(this, "Emergency incident created successfully!", Toast.LENGTH_LONG).show()
            }
        }
    }
}
