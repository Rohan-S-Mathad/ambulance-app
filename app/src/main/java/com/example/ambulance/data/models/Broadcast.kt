package com.example.ambulance.data.models

import com.google.firebase.firestore.ServerTimestamp
import java.util.Date

data class Broadcast(
    val targetType: String = "",
    val targetId: String = "",
    val incidentId: String = "",
    val status: String = "",
    @ServerTimestamp
    val timestamp: Date? = null
)
