package com.example.ambulance.data.models

data class Hospital(
    val hospId: String = "",
    val name: String = "",
    val address: String = "",
    val lat: Double = 0.0,
    val lon: Double = 0.0,
    val status: String = "",
    val phoneNumber: String = "",
    val emergencyNumber: String = "",
    val totalBeds: Int = 0,
    val availableBeds: Int = 0,
    val specialties: List<String> = emptyList(),
    val hasICU: Boolean = false,
    val hasEmergencyRoom: Boolean = false
)
