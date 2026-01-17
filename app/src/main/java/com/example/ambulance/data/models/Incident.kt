package com.example.ambulance.data.models

import com.google.firebase.firestore.ServerTimestamp
import java.util.Date

data class Incident(
    val userId: String = "",
    val userLat: Double = 0.0,
    val userLon: Double = 0.0,
    @ServerTimestamp
    val createdAt: Date? = null,
    val status: String = "",
    val incidentId: String = "",
    val assignedAmbId: String? = null,
    val assignedHospId: String? = null
)
