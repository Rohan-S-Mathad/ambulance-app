const express = require('express');
const { Client, Databases, Account, Users, Storage, ID } = require('node-appwrite');
require('dotenv').config();

const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Appwrite Client with API Key
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '693daf640004117aa438')
  .setKey(process.env.APPWRITE_API_KEY); // Your API key here

// Initialize Services
const databases = new Databases(client);
const users = new Users(client);
const storage = new Storage(client);

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Ambulance Backend - Appwrite Integration',
    endpoints: {
      health: 'GET /',
      createEmergency: 'POST /api/emergency',
      getEmergency: 'GET /api/emergency/:id',
      listEmergencies: 'GET /api/emergencies',
      updateEmergency: 'PUT /api/emergency/:id',
      deleteEmergency: 'DELETE /api/emergency/:id',
      createUser: 'POST /api/user',
      getUser: 'GET /api/user/:id'
    }
  });
});

// Create Emergency Request
app.post('/api/emergency', async (req, res) => {
  console.log('📞 Creating emergency request:', req.body);
  
  try {
    const {
      patientName,
      patientPhone,
      latitude,
      longitude,
      address,
      status = 'pending'
    } = req.body;

    // Validate required fields
    if (!patientName || !patientPhone || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: patientName, patientPhone, latitude, longitude'
      });
    }

    // Create document in Appwrite
    const document = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID || 'emergencies_db',
      process.env.APPWRITE_COLLECTION_ID || 'requests',
      ID.unique(),
      {
        patientName,
        patientPhone,
        latitude,
        longitude,
        address: address || `Lat: ${latitude}, Lon: ${longitude}`,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );

    console.log('✅ Emergency created:', document.$id);

    res.json({
      success: true,
      data: document
    });

  } catch (error) {
    console.error('❌ Error creating emergency:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Emergency by ID
app.get('/api/emergency/:id', async (req, res) => {
  try {
    const document = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID || 'emergencies_db',
      process.env.APPWRITE_COLLECTION_ID || 'requests',
      req.params.id
    );

    res.json({
      success: true,
      data: document
    });

  } catch (error) {
    console.error('❌ Error getting emergency:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List All Emergencies
app.get('/api/emergencies', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;

    const queries = [];
    if (status) {
      queries.push(`equal("status", "${status}")`);
    }

    const documents = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID || 'emergencies_db',
      process.env.APPWRITE_COLLECTION_ID || 'requests',
      queries
    );

    res.json({
      success: true,
      data: documents.documents,
      total: documents.total
    });

  } catch (error) {
    console.error('❌ Error listing emergencies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update Emergency
app.put('/api/emergency/:id', async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const document = await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID || 'emergencies_db',
      process.env.APPWRITE_COLLECTION_ID || 'requests',
      req.params.id,
      updates
    );

    console.log('✅ Emergency updated:', document.$id);

    res.json({
      success: true,
      data: document
    });

  } catch (error) {
    console.error('❌ Error updating emergency:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete Emergency
app.delete('/api/emergency/:id', async (req, res) => {
  try {
    await databases.deleteDocument(
      process.env.APPWRITE_DATABASE_ID || 'emergencies_db',
      process.env.APPWRITE_COLLECTION_ID || 'requests',
      req.params.id
    );

    console.log('✅ Emergency deleted:', req.params.id);

    res.json({
      success: true,
      message: 'Emergency deleted'
    });

  } catch (error) {
    console.error('❌ Error deleting emergency:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create User
app.post('/api/user', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, name'
      });
    }

    const user = await users.create(
      ID.unique(),
      email,
      phone,
      password,
      name
    );

    console.log('✅ User created:', user.$id);

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get User by ID
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await users.get(req.params.id);

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('❌ Error getting user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 4000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('');
  console.log('🚑 ========================================');
  console.log('🚑 Ambulance Backend - Appwrite');
  console.log('🚑 ========================================');
  console.log(`🚑 Server: http://localhost:${PORT}`);
  console.log(`🚑 Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
  console.log(`🚑 Project: ${process.env.APPWRITE_PROJECT_ID}`);
  console.log('🚑 ========================================');
  console.log('');
  console.log('📋 Available endpoints:');
  console.log('  GET  / - Health check');
  console.log('  POST /api/emergency - Create emergency');
  console.log('  GET  /api/emergency/:id - Get emergency');
  console.log('  GET  /api/emergencies - List emergencies');
  console.log('  PUT  /api/emergency/:id - Update emergency');
  console.log('  DELETE /api/emergency/:id - Delete emergency');
  console.log('  POST /api/user - Create user');
  console.log('  GET  /api/user/:id - Get user');
  console.log('');
  console.log('✅ Backend ready!');
  console.log('');
});
