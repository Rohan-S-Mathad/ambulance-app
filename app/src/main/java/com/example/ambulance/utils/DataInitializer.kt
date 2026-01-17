package com.example.ambulance.utils

import android.content.Context
import com.example.ambulance.data.models.Ambulance
import com.example.ambulance.data.models.Hospital
import com.google.firebase.firestore.FirebaseFirestore
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.io.IOException

/**
 * DataInitializer - Reads JSON configuration files and syncs with Firestore
 *
 * Features:
 * - Loads ambulances from ambulances.json
 * - Loads hospitals from hospitals.json
 * - Uploads to Firestore collections
 * - Easy to update by editing JSON files
 */
object DataInitializer {

    private val db = FirebaseFirestore.getInstance()
    private val gson = Gson()

    /**
     * Initialize all data from JSON files to Firestore
     * Call this once when app starts or from settings
     */
    fun initializeAllData(context: Context, callback: (Boolean, String) -> Unit) {
        var ambulancesLoaded = false
        var hospitalsLoaded = false
        var ambulancesMessage = ""
        var hospitalsMessage = ""

        // Load ambulances
        loadAmbulancesFromJson(context) { success, message ->
            ambulancesLoaded = true
            ambulancesMessage = message

            if (ambulancesLoaded && hospitalsLoaded) {
                callback(true, "$ambulancesMessage\n$hospitalsMessage")
            }
        }

        // Load hospitals
        loadHospitalsFromJson(context) { success, message ->
            hospitalsLoaded = true
            hospitalsMessage = message

            if (ambulancesLoaded && hospitalsLoaded) {
                callback(true, "$ambulancesMessage\n$hospitalsMessage")
            }
        }
    }

    /**
     * Load ambulances from JSON file and upload to Firestore
     */
    fun loadAmbulancesFromJson(context: Context, callback: (Boolean, String) -> Unit) {
        try {
            // Read JSON file from assets
            val jsonString =
                context.assets.open("ambulances.json").bufferedReader().use { it.readText() }

            // Parse JSON to list of Ambulance objects
            val ambulanceListType = object : TypeToken<List<Ambulance>>() {}.type
            val ambulances: List<Ambulance> = gson.fromJson(jsonString, ambulanceListType)

            // Upload each ambulance to Firestore
            var uploadCount = 0
            val totalCount = ambulances.size

            ambulances.forEach { ambulance ->
                db.collection("ambulances")
                    .document(ambulance.ambId)
                    .set(ambulance)
                    .addOnSuccessListener {
                        uploadCount++
                        if (uploadCount == totalCount) {
                            callback(true, "✅ Loaded $totalCount ambulances")
                        }
                    }
                    .addOnFailureListener { e ->
                        callback(false, "❌ Failed to load ambulances: ${e.message}")
                    }
            }

        } catch (e: IOException) {
            callback(false, "❌ Error reading ambulances.json: ${e.message}")
        }
    }

    /**
     * Load hospitals from JSON file and upload to Firestore
     */
    fun loadHospitalsFromJson(context: Context, callback: (Boolean, String) -> Unit) {
        try {
            // Read JSON file from assets
            val jsonString =
                context.assets.open("hospitals.json").bufferedReader().use { it.readText() }

            // Parse JSON to list of Hospital objects
            val hospitalListType = object : TypeToken<List<Hospital>>() {}.type
            val hospitals: List<Hospital> = gson.fromJson(jsonString, hospitalListType)

            // Upload each hospital to Firestore
            var uploadCount = 0
            val totalCount = hospitals.size

            hospitals.forEach { hospital ->
                db.collection("hospitals")
                    .document(hospital.hospId)
                    .set(hospital)
                    .addOnSuccessListener {
                        uploadCount++
                        if (uploadCount == totalCount) {
                            callback(true, "✅ Loaded $totalCount hospitals")
                        }
                    }
                    .addOnFailureListener { e ->
                        callback(false, "❌ Failed to load hospitals: ${e.message}")
                    }
            }

        } catch (e: IOException) {
            callback(false, "❌ Error reading hospitals.json: ${e.message}")
        }
    }

    /**
     * Get ambulance list from JSON (without uploading to Firestore)
     */
    fun getAmbulancesFromJson(context: Context): List<Ambulance> {
        return try {
            val jsonString =
                context.assets.open("ambulances.json").bufferedReader().use { it.readText() }
            val ambulanceListType = object : TypeToken<List<Ambulance>>() {}.type
            gson.fromJson(jsonString, ambulanceListType)
        } catch (e: Exception) {
            emptyList()
        }
    }

    /**
     * Get hospital list from JSON (without uploading to Firestore)
     */
    fun getHospitalsFromJson(context: Context): List<Hospital> {
        return try {
            val jsonString =
                context.assets.open("hospitals.json").bufferedReader().use { it.readText() }
            val hospitalListType = object : TypeToken<List<Hospital>>() {}.type
            gson.fromJson(jsonString, hospitalListType)
        } catch (e: Exception) {
            emptyList()
        }
    }
}
