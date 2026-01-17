package com.example.ambulance.data

import android.content.Context
import io.appwrite.Client
import io.appwrite.services.Account
import io.appwrite.services.Databases
import io.appwrite.services.Storage

/**
 * Appwrite Client Singleton
 * Manages connection to Appwrite backend services
 */
object AppwriteClient {

    // Appwrite Project Configuration
    private const val APPWRITE_PROJECT_ID = "693daf640004117aa438"
    private const val APPWRITE_PROJECT_NAME = "ambulance"
    private const val APPWRITE_PUBLIC_ENDPOINT = "https://sgp.cloud.appwrite.io/v1"

    private lateinit var client: Client

    // Appwrite Services
    lateinit var account: Account
        private set

    lateinit var databases: Databases
        private set

    lateinit var storage: Storage
        private set

    /**
     * Initialize Appwrite client with application context
     */
    fun init(context: Context) {
        client = Client(context)
            .setEndpoint(APPWRITE_PUBLIC_ENDPOINT)
            .setProject(APPWRITE_PROJECT_ID)

        // Initialize services
        account = Account(client)
        databases = Databases(client)
        storage = Storage(client)
    }

    /**
     * Ping the Appwrite server to verify connectivity
     * This will show up in the Appwrite console logs
     */
    suspend fun ping(): String {
        return try {
            // Make a real API call to verify connection
            // This will show up in Appwrite console logs
            account.listSessions()
            "online"
        } catch (e: Exception) {
            // If we get 401, "guest", or "missing scope" error, connection is working!
            // User just isn't logged in yet, which is expected
            val message = e.message?.lowercase() ?: ""
            if (message.contains("401") ||
                message.contains("unauthorized") ||
                message.contains("guest") ||
                message.contains("missing scope")
            ) {
                "online - connected successfully"
            } else {
                // Real connection error
                throw e
            }
        }
    }

    /**
     * Get the raw client for custom operations
     */
    fun getClient(): Client = client
}
