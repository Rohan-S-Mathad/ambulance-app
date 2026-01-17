package com.example.ambulance.ui

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.ambulance.data.AppwriteClient
import com.example.ambulance.databinding.ActivityRoleSelectionBinding
import com.example.ambulance.ui.ambulance.AmbulanceActivity
import com.example.ambulance.ui.hospital.HospitalActivity
import com.example.ambulance.ui.user.UserActivity
import com.example.ambulance.utils.DataInitializer
import com.example.ambulance.utils.UserSession
import kotlinx.coroutines.launch

class RoleSelectionActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRoleSelectionBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Check if user is already logged in
        if (UserSession.isLoggedIn(this)) {
            // Auto-route to appropriate screen based on saved role
            routeToAppropriateScreen()
            return
        }

        binding = ActivityRoleSelectionBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Load data from JSON files on app start
        loadDataFromJson()

        // Appwrite Test Button
        binding.buttonTestAppwrite.setOnClickListener {
            testAppwriteConnection()
        }

        binding.buttonUser.setOnClickListener {
            // Save user role
            UserSession.saveSession(
                context = this,
                role = "user",
                userId = "user_${System.currentTimeMillis()}"
            )
            startActivity(Intent(this, UserActivity::class.java))
            finish() // Close role selection
        }

        binding.buttonAmbulance.setOnClickListener {
            // For ambulance, we need to know which ambulance
            // In production, get phone number from device
            val ambulances = DataInitializer.getAmbulancesFromJson(this)
            if (ambulances.isNotEmpty()) {
                // For demo, use first ambulance
                val ambulance = ambulances[0]
                UserSession.saveSession(
                    context = this,
                    role = "ambulance",
                    userId = ambulance.ambId,
                    phoneNumber = ambulance.phoneNumber,
                    userName = ambulance.driver
                )
                startActivity(Intent(this, AmbulanceActivity::class.java))
                finish()
            } else {
                Toast.makeText(this, "No ambulances configured", Toast.LENGTH_SHORT).show()
            }
        }

        binding.buttonHospital.setOnClickListener {
            // For hospital, we need to know which hospital
            val hospitals = DataInitializer.getHospitalsFromJson(this)
            if (hospitals.isNotEmpty()) {
                // For demo, use first hospital
                val hospital = hospitals[0]
                UserSession.saveSession(
                    context = this,
                    role = "hospital",
                    userId = hospital.hospId,
                    phoneNumber = hospital.phoneNumber,
                    userName = hospital.name
                )
                startActivity(Intent(this, HospitalActivity::class.java))
                finish()
            } else {
                Toast.makeText(this, "No hospitals configured", Toast.LENGTH_SHORT).show()
            }
        }
    }

    /**
     * Route user to appropriate screen based on saved role
     */
    private fun routeToAppropriateScreen() {
        val role = UserSession.getRole(this)
        val intent = when (role) {
            "user" -> Intent(this, UserActivity::class.java)
            "ambulance" -> Intent(this, AmbulanceActivity::class.java)
            "hospital" -> Intent(this, HospitalActivity::class.java)
            else -> {
                // Invalid role, clear session and show role selection
                UserSession.clearSession(this)
                return
            }
        }

        Toast.makeText(this, "Welcome back, ${UserSession.getUserName(this)}", Toast.LENGTH_SHORT)
            .show()
        startActivity(intent)
        finish()
    }

    /**
     * Load ambulances and hospitals from JSON files and upload to Firestore
     * This runs automatically when app starts
     */
    private fun loadDataFromJson() {
        Toast.makeText(this, "Loading configuration...", Toast.LENGTH_SHORT).show()

        DataInitializer.initializeAllData(this) { success, message ->
            // Show result quietly (don't interrupt user)
            // Data is now loaded for auto-identification
        }
    }

    private fun testAppwriteConnection() {
        lifecycleScope.launch {
            try {
                Toast.makeText(
                    this@RoleSelectionActivity,
                    "📡 Testing Appwrite connection...",
                    Toast.LENGTH_SHORT
                ).show()

                Log.d("AppwriteTest", "Starting connection test...")
                Log.d("AppwriteTest", "Project ID: 693daf640004117aa438")
                Log.d("AppwriteTest", "Endpoint: https://sgp.cloud.appwrite.io/v1")

                // Create an anonymous session - this WILL show up in console!
                try {
                    val session = AppwriteClient.account.createAnonymousSession()
                    Log.d("AppwriteTest", "Anonymous session created! User ID: ${session.userId}")

                    Toast.makeText(
                        this@RoleSelectionActivity,
                        "✅ Appwrite connected! Check console for new anonymous user!",
                        Toast.LENGTH_LONG
                    ).show()

                    // Clean up - delete the test session
                    AppwriteClient.account.deleteSession("current")
                    Log.d("AppwriteTest", "Test session cleaned up")
                } catch (e: Exception) {
                    // Fall back to simple ping test
                    val status = AppwriteClient.ping()
                    Log.d("AppwriteTest", "Connection successful! Status: $status")

                    Toast.makeText(
                        this@RoleSelectionActivity,
                        "✅ Appwrite connected! Status: $status",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                Log.e("AppwriteTest", "Connection error: ${e.message}", e)
                Toast.makeText(
                    this@RoleSelectionActivity,
                    "❌ Appwrite error: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
}
