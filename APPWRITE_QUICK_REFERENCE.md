# 📚 Appwrite Quick Reference

## 🔧 Your Project Configuration

```kotlin
Project ID: 693daf640004117aa438
Project Name: ambulance
Endpoint: https://sgp.cloud.appwrite.io/v1
```

---

## 🚀 Quick Start

### Import in Your Activity/Fragment

```kotlin
import com.example.ambulance.data.AppwriteClient
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
```

### Basic Usage Pattern

```kotlin
lifecycleScope.launch {
    try {
        // Your Appwrite code here
        val result = AppwriteClient.account.get()
        Log.d("Appwrite", "Success: $result")
    } catch (e: Exception) {
        Log.e("Appwrite", "Error: ${e.message}")
    }
}
```

---

## 👤 Account Service (Authentication)

### Check Current User

```kotlin
lifecycleScope.launch {
    try {
        val user = AppwriteClient.account.get()
        Log.d("Auth", "Logged in as: ${user.name}")
    } catch (e: Exception) {
        Log.d("Auth", "Not logged in")
    }
}
```

### Create New Account

```kotlin
import io.appwrite.ID

lifecycleScope.launch {
    try {
        val user = AppwriteClient.account.create(
            userId = ID.unique(),
            email = "user@example.com",
            password = "SecurePass123!",
            name = "John Doe"
        )
        Toast.makeText(this@YourActivity, "Account created!", Toast.LENGTH_SHORT).show()
    } catch (e: Exception) {
        Toast.makeText(this@YourActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
    }
}
```

### Login (Email/Password)

```kotlin
lifecycleScope.launch {
    try {
        val session = AppwriteClient.account.createEmailPasswordSession(
            email = "user@example.com",
            password = "SecurePass123!"
        )
        Log.d("Auth", "Session ID: ${session.userId}")
        // Navigate to main screen
    } catch (e: Exception) {
        Toast.makeText(this@YourActivity, "Login failed: ${e.message}", Toast.LENGTH_SHORT).show()
    }
}
```

### Logout

```kotlin
lifecycleScope.launch {
    try {
        AppwriteClient.account.deleteSession("current")
        // Navigate to login screen
    } catch (e: Exception) {
        Log.e("Auth", "Logout error: ${e.message}")
    }
}
```

### Update User Name

```kotlin
lifecycleScope.launch {
    try {
        val user = AppwriteClient.account.updateName("New Name")
        Toast.makeText(this@YourActivity, "Name updated!", Toast.LENGTH_SHORT).show()
    } catch (e: Exception) {
        Log.e("Auth", "Update error: ${e.message}")
    }
}
```

---

## 🗄️ Database Service

### Create Document

```kotlin
import io.appwrite.ID

lifecycleScope.launch {
    try {
        val document = AppwriteClient.databases.createDocument(
            databaseId = "YOUR_DATABASE_ID",
            collectionId = "YOUR_COLLECTION_ID",
            documentId = ID.unique(),
            data = mapOf(
                "patientName" to "John Doe",
                "location" to "Lat: 12.9236, Lon: 77.4985",
                "status" to "pending",
                "timestamp" to System.currentTimeMillis()
            )
        )
        Log.d("Database", "Document created: ${document.id}")
    } catch (e: Exception) {
        Log.e("Database", "Error: ${e.message}")
    }
}
```

### Get Document

```kotlin
lifecycleScope.launch {
    try {
        val document = AppwriteClient.databases.getDocument(
            databaseId = "YOUR_DATABASE_ID",
            collectionId = "YOUR_COLLECTION_ID",
            documentId = "DOCUMENT_ID"
        )
        val data = document.data
        Log.d("Database", "Patient: ${data["patientName"]}")
    } catch (e: Exception) {
        Log.e("Database", "Error: ${e.message}")
    }
}
```

### List Documents (with Query)

```kotlin
import io.appwrite.Query

lifecycleScope.launch {
    try {
        val documents = AppwriteClient.databases.listDocuments(
            databaseId = "YOUR_DATABASE_ID",
            collectionId = "YOUR_COLLECTION_ID",
            queries = listOf(
                Query.equal("status", "pending"),
                Query.limit(10),
                Query.orderDesc("timestamp")
            )
        )
        
        documents.documents.forEach { doc ->
            Log.d("Database", "Emergency: ${doc.data["patientName"]}")
        }
    } catch (e: Exception) {
        Log.e("Database", "Error: ${e.message}")
    }
}
```

### Update Document

```kotlin
lifecycleScope.launch {
    try {
        val document = AppwriteClient.databases.updateDocument(
            databaseId = "YOUR_DATABASE_ID",
            collectionId = "YOUR_COLLECTION_ID",
            documentId = "DOCUMENT_ID",
            data = mapOf(
                "status" to "accepted",
                "ambulanceId" to "AMB-001",
                "acceptedAt" to System.currentTimeMillis()
            )
        )
        Log.d("Database", "Document updated")
    } catch (e: Exception) {
        Log.e("Database", "Error: ${e.message}")
    }
}
```

### Delete Document

```kotlin
lifecycleScope.launch {
    try {
        AppwriteClient.databases.deleteDocument(
            databaseId = "YOUR_DATABASE_ID",
            collectionId = "YOUR_COLLECTION_ID",
            documentId = "DOCUMENT_ID"
        )
        Log.d("Database", "Document deleted")
    } catch (e: Exception) {
        Log.e("Database", "Error: ${e.message}")
    }
}
```

---

## 📁 Storage Service

### Upload File

```kotlin
import io.appwrite.ID
import io.appwrite.models.InputFile
import java.io.File

lifecycleScope.launch {
    try {
        val file = File("/path/to/file.jpg")
        val uploadedFile = AppwriteClient.storage.createFile(
            bucketId = "YOUR_BUCKET_ID",
            fileId = ID.unique(),
            file = InputFile.fromPath(file.absolutePath)
        )
        Log.d("Storage", "File uploaded: ${uploadedFile.id}")
    } catch (e: Exception) {
        Log.e("Storage", "Error: ${e.message}")
    }
}
```

### Get File URL

```kotlin
val fileUrl = "https://sgp.cloud.appwrite.io/v1/storage/buckets/YOUR_BUCKET_ID/files/FILE_ID/view?project=693daf640004117aa438"
// Use this URL to load in ImageView with Glide/Picasso
```

### Download File

```kotlin
lifecycleScope.launch {
    try {
        val fileBytes = AppwriteClient.storage.getFileDownload(
            bucketId = "YOUR_BUCKET_ID",
            fileId = "FILE_ID"
        )
        // Save fileBytes to local storage
    } catch (e: Exception) {
        Log.e("Storage", "Error: ${e.message}")
    }
}
```

### Delete File

```kotlin
lifecycleScope.launch {
    try {
        AppwriteClient.storage.deleteFile(
            bucketId = "YOUR_BUCKET_ID",
            fileId = "FILE_ID"
        )
        Log.d("Storage", "File deleted")
    } catch (e: Exception) {
        Log.e("Storage", "Error: ${e.message}")
    }
}
```

---

## 🔄 Real-time Subscriptions

### Subscribe to Collection Changes

```kotlin
import io.appwrite.services.Realtime

class YourActivity : AppCompatActivity() {
    private var realtime: Realtime? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        realtime = Realtime(AppwriteClient.getClient())
        
        // Subscribe to all documents in a collection
        realtime?.subscribe(
            "databases.YOUR_DATABASE_ID.collections.YOUR_COLLECTION_ID.documents"
        ) { response ->
            Log.d("Realtime", "Event: ${response.events}")
            Log.d("Realtime", "Payload: ${response.payload}")
            
            // Update UI based on changes
            runOnUiThread {
                // Refresh your data
            }
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        realtime?.close()
    }
}
```

### Subscribe to Specific Document

```kotlin
realtime?.subscribe(
    "databases.YOUR_DATABASE_ID.collections.YOUR_COLLECTION_ID.documents.DOCUMENT_ID"
) { response ->
    Log.d("Realtime", "Document updated: ${response.payload}")
}
```

---

## 🔍 Common Query Filters

```kotlin
import io.appwrite.Query

// Equal
Query.equal("status", "pending")

// Not Equal
Query.notEqual("status", "completed")

// Less Than
Query.lessThan("timestamp", System.currentTimeMillis())

// Greater Than
Query.greaterThan("distance", 5.0)

// Contains
Query.contains("tags", listOf("urgent"))

// Search
Query.search("patientName", "John")

// Limit Results
Query.limit(20)

// Offset (Pagination)
Query.offset(20)

// Order Ascending
Query.orderAsc("timestamp")

// Order Descending
Query.orderDesc("timestamp")

// Multiple Queries
listOf(
    Query.equal("status", "pending"),
    Query.greaterThan("timestamp", yesterday),
    Query.limit(10)
)
```

---

## ⚡ Emergency System Example

### Create Emergency Request

```kotlin
lifecycleScope.launch {
    try {
        val emergency = AppwriteClient.databases.createDocument(
            databaseId = "emergencies_db",
            collectionId = "requests",
            documentId = ID.unique(),
            data = mapOf(
                "patientName" to "John Doe",
                "patientPhone" to "+919482936725",
                "latitude" to 12.9236,
                "longitude" to 77.4985,
                "address" to "MG Road, Bangalore",
                "status" to "pending",
                "createdAt" to System.currentTimeMillis()
            )
        )
        
        Toast.makeText(this@UserActivity, "Emergency dispatched!", Toast.LENGTH_SHORT).show()
    } catch (e: Exception) {
        Toast.makeText(this@UserActivity, "Error: ${e.message}", Toast.LENGTH_LONG).show()
    }
}
```

### Accept Emergency (Ambulance)

```kotlin
lifecycleScope.launch {
    try {
        AppwriteClient.databases.updateDocument(
            databaseId = "emergencies_db",
            collectionId = "requests",
            documentId = emergencyId,
            data = mapOf(
                "status" to "accepted",
                "ambulanceId" to "AMB-001",
                "ambulanceDriver" to "Driver Name",
                "acceptedAt" to System.currentTimeMillis()
            )
        )
        
        // Navigate to tracking screen
    } catch (e: Exception) {
        Log.e("Emergency", "Error: ${e.message}")
    }
}
```

### Track Active Emergencies (Real-time)

```kotlin
realtime?.subscribe("databases.emergencies_db.collections.requests.documents") { response ->
    val event = response.events.firstOrNull() ?: return@subscribe
    
    when {
        event.contains("create") -> {
            // New emergency created
            Log.d("Emergency", "New emergency!")
            playNotificationSound()
        }
        event.contains("update") -> {
            // Emergency updated
            Log.d("Emergency", "Status changed")
            refreshEmergencyList()
        }
        event.contains("delete") -> {
            // Emergency completed/cancelled
            Log.d("Emergency", "Emergency closed")
        }
    }
}
```

---

## 🎯 Best Practices

### 1. Always Use Try-Catch

```kotlin
lifecycleScope.launch {
    try {
        // Appwrite calls
    } catch (e: AppwriteException) {
        // Appwrite-specific error
        Log.e("Appwrite", "Code: ${e.code}, Message: ${e.message}")
    } catch (e: Exception) {
        // Generic error
        Log.e("Appwrite", "Error: ${e.message}")
    }
}
```

### 2. Use lifecycleScope in Activities/Fragments

```kotlin
// Good: Auto-cancelled when Activity/Fragment is destroyed
lifecycleScope.launch { }

// Avoid: GlobalScope (doesn't respect lifecycle)
GlobalScope.launch { }
```

### 3. Use Dispatchers for Heavy Operations

```kotlin
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

lifecycleScope.launch {
    val result = withContext(Dispatchers.IO) {
        // Heavy operation
        AppwriteClient.databases.listDocuments(...)
    }
    
    // Update UI on Main thread
    textView.text = result.toString()
}
```

### 4. Close Real-time Connections

```kotlin
override fun onDestroy() {
    super.onDestroy()
    realtime?.close()
}
```

---

## 🔗 Useful Links

- **Appwrite Console**: https://sgp.cloud.appwrite.io/
- **Your Project**: https://sgp.cloud.appwrite.io/console/project-693daf640004117aa438
- **Documentation**: https://appwrite.io/docs
- **Android SDK Reference**: https://appwrite.io/docs/sdks#android

---

**Quick Access in Code:**

```kotlin
import com.example.ambulance.data.AppwriteClient
```

Happy coding! 🚀
