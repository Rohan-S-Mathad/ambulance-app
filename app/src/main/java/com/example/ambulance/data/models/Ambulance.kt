package com.example.ambulance.data.models

data class Ambulance(
    val ambId: String = "",
    val name: String = "",
    val driver: String = "",
    val vehicleNumber: String = "",
    val lat: Double = 0.0,
    val lon: Double = 0.0,
    val status: String = "",
    val phoneNumber: String = "",
    val vehicleType: String = ""
)
