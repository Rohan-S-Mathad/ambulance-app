package com.example.ambulance.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ambulance.data.FirestoreRepository
import com.example.ambulance.data.models.Broadcast
import com.example.ambulance.data.models.Incident
import com.google.firebase.firestore.ListenerRegistration
import kotlinx.coroutines.launch

class IncidentViewModel : ViewModel() {

    private val repository = FirestoreRepository()
    private var broadcastListener: ListenerRegistration? = null

    private val _incidentCreationStatus = MutableLiveData<String>()
    val incidentCreationStatus: LiveData<String> = _incidentCreationStatus

    private val _currentIncidentId = MutableLiveData<String>()
    val currentIncidentId: LiveData<String> = _currentIncidentId

    private val _broadcast = MutableLiveData<Broadcast?>()
    val broadcast: LiveData<Broadcast?> = _broadcast

    private val _incidentAccepted = MutableLiveData<Boolean>()
    val incidentAccepted: LiveData<Boolean> = _incidentAccepted

    fun createIncident(incident: Incident) {
        _incidentCreationStatus.value = "Creating emergency incident..."

        repository.createIncidentAndBroadcast(incident) { incidentId, message ->
            if (incidentId.isNotEmpty()) {
                _currentIncidentId.value = incidentId
                _incidentCreationStatus.value = "Emergency created! $message"
            } else {
                _incidentCreationStatus.value = "Failed to create incident: $message"
            }
        }
    }

    fun listenForAmbulanceBroadcasts(ambulanceId: String) {
        broadcastListener?.remove()

        broadcastListener = repository.listenForAmbulanceBroadcasts(ambulanceId) { broadcast ->
            _broadcast.value = broadcast
        }
    }

    fun listenForHospitalBroadcasts(hospitalId: String) {
        broadcastListener?.remove()

        broadcastListener = repository.listenForHospitalBroadcasts(hospitalId) { broadcast ->
            _broadcast.value = broadcast
        }
    }

    fun acceptIncident(broadcast: Broadcast, ambulanceId: String) {
        viewModelScope.launch {
            repository.acceptIncidentAsAmbulance(broadcast.incidentId, ambulanceId) { success ->
                _incidentAccepted.postValue(success)
                if (success) {
                    _broadcast.postValue(null)
                }
            }
        }
    }

    fun acceptIncidentAsHospital(broadcast: Broadcast, hospitalId: String) {
        viewModelScope.launch {
            repository.acceptIncidentAsHospital(broadcast.incidentId, hospitalId) { success ->
                _incidentAccepted.postValue(success)
                if (success) {
                    _broadcast.postValue(null)
                }
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        broadcastListener?.remove()
    }
}
