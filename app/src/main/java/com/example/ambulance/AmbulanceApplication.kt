package com.example.ambulance

import android.app.Application
import android.util.Log
import com.example.ambulance.data.AppwriteClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class AmbulanceApplication : Application() {

    private val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    override fun onCreate() {
        super.onCreate()

        Log.d("AmbulanceApp", "🚑 Initializing Ambulance Application...")

        // Initialize Appwrite
        AppwriteClient.init(this)

        // Verify connectivity with Appwrite
        applicationScope.launch {
            try {
                Log.d("AmbulanceApp", "📡 Pinging Appwrite server...")
                val health = AppwriteClient.ping()
                Log.d("AmbulanceApp", "✅ Appwrite connected successfully: $health")
            } catch (e: Exception) {
                Log.e("AmbulanceApp", "❌ Failed to connect to Appwrite: ${e.message}", e)
            }
        }

        Log.d("AmbulanceApp", "✅ Application initialized")
    }
}
