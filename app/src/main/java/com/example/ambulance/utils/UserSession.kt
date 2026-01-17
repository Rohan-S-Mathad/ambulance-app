package com.example.ambulance.utils

import android.content.Context
import android.content.SharedPreferences

/**
 * UserSession - Manages user role and identification
 *
 * Stores:
 * - User role (user/ambulance/hospital)
 * - User ID (ambulance_001 or hospital_001)
 * - Phone number for identification
 * - Login status
 */
object UserSession {

    private const val PREF_NAME = "ambulance_app_session"
    private const val KEY_ROLE = "user_role"
    private const val KEY_USER_ID = "user_id"
    private const val KEY_PHONE_NUMBER = "phone_number"
    private const val KEY_IS_LOGGED_IN = "is_logged_in"
    private const val KEY_USER_NAME = "user_name"

    private fun getPreferences(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
    }

    /**
     * Save user session after login/role selection
     */
    fun saveSession(
        context: Context,
        role: String,
        userId: String,
        phoneNumber: String = "",
        userName: String = ""
    ) {
        getPreferences(context).edit().apply {
            putString(KEY_ROLE, role)
            putString(KEY_USER_ID, userId)
            putString(KEY_PHONE_NUMBER, phoneNumber)
            putString(KEY_USER_NAME, userName)
            putBoolean(KEY_IS_LOGGED_IN, true)
            apply()
        }
    }

    /**
     * Get current user's role
     */
    fun getRole(context: Context): String {
        return getPreferences(context).getString(KEY_ROLE, "") ?: ""
    }

    /**
     * Get current user's ID (ambulance_001 or hospital_001)
     */
    fun getUserId(context: Context): String {
        return getPreferences(context).getString(KEY_USER_ID, "") ?: ""
    }

    /**
     * Get current user's phone number
     */
    fun getPhoneNumber(context: Context): String {
        return getPreferences(context).getString(KEY_PHONE_NUMBER, "") ?: ""
    }

    /**
     * Get current user's name
     */
    fun getUserName(context: Context): String {
        return getPreferences(context).getString(KEY_USER_NAME, "") ?: ""
    }

    /**
     * Check if user is logged in
     */
    fun isLoggedIn(context: Context): Boolean {
        return getPreferences(context).getBoolean(KEY_IS_LOGGED_IN, false)
    }

    /**
     * Clear session (logout)
     */
    fun clearSession(context: Context) {
        getPreferences(context).edit().clear().apply()
    }

    /**
     * Auto-identify user based on phone number from JSON
     */
    fun autoIdentifyUser(context: Context, phoneNumber: String): Pair<String, String>? {
        // Check ambulances
        val ambulances = DataInitializer.getAmbulancesFromJson(context)
        for (ambulance in ambulances) {
            if (ambulance.phoneNumber == phoneNumber) {
                return Pair("ambulance", ambulance.ambId)
            }
        }

        // Check hospitals
        val hospitals = DataInitializer.getHospitalsFromJson(context)
        for (hospital in hospitals) {
            if (hospital.phoneNumber == phoneNumber) {
                return Pair("hospital", hospital.hospId)
            }
        }

        // Not found - regular user
        return null
    }
}
