# Firebase Cloud Functions - Ambulance Dispatch Backend

This directory contains the Firebase Cloud Functions backend for the Smart Ambulance Dispatch &
Hospital Pre-Booking System.

## 📁 Project Structure

```
functions/
├── index.js                 # Main entry point, all Cloud Functions
├── package.json             # Dependencies
├── .gitignore              # Git ignore rules
├── services/               # Business logic layer
│   ├── incidentService.js  # Incident management
│   └── locationService.js  # Location tracking
└── utils/                  # Utility functions
    ├── distance.js         # Haversine distance calculator
    ├── broadcast.js        # Broadcast management
    ├── validation.js       # Input validation
    └── logger.js           # Structured logging
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Firestore
# - Functions
# - Use existing project or create new one
```

### 3. Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:api
```

### 4. Test Locally

```bash
# Start Firebase emulators
npm run serve

# Functions will be available at:
# http://localhost:5001/<project-id>/us-central1/api
```

## 📦 Dependencies

### Production

- `firebase-admin` - Firebase Admin SDK
- `firebase-functions` - Cloud Functions SDK
- `express` - Web framework for REST API
- `cors` - Cross-Origin Resource Sharing
- `geofire-common` - Geospatial utilities (optional)

### Development

- `eslint` - Linting
- `firebase-functions-test` - Testing framework

## 🔧 Configuration

### Environment Variables

Set environment variables for your functions:

```bash
firebase functions:config:set service.name="Ambulance Dispatch"
```

Access in code:

```javascript
const config = functions.config();
console.log(config.service.name);
```

## 📝 Available Functions

### HTTP Functions

#### 1. API (REST Endpoints)

**Function Name:** `api`
**URL:** `https://us-central1-<project-id>.cloudfunctions.net/api`

Endpoints:

- `GET /health` - Health check
- `POST /incident` - Create incident
- `GET /incident/:id` - Get incident
- `POST /incident/:id/acceptAmbulance` - Ambulance accepts
- `POST /incident/:id/acceptHospital` - Hospital accepts
- `POST /incident/:id/complete` - Complete incident
- `POST /ambulance/:id/location` - Update location
- `GET /ambulance/:id/location` - Get location
- `GET /broadcasts/:type/:id` - Get broadcasts

#### 2. Callable Functions (Firebase SDK)

- `createIncident` - Create incident (authenticated)
- `acceptByAmbulance` - Accept by ambulance
- `acceptByHospital` - Accept by hospital
- `updateLocation` - Update entity location

### Background Functions

#### 1. Firestore Triggers

**onIncidentAmbulanceAssigned**

- Trigger: When incident status changes to `ambulance_assigned`
- Action: Broadcast to nearest hospitals

**onIncidentCreated** (optional)

- Trigger: When new incident is created
- Action: Additional processing, notifications

#### 2. Scheduled Functions

**cleanupExpiredBroadcasts**

- Schedule: Every 5 minutes
- Action: Mark expired broadcasts as expired

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

See `TESTING_GUIDE.md` in the root directory.

### Manual Testing

```bash
# Watch logs in real-time
firebase functions:log --only api

# Get specific function logs
firebase functions:log --only onIncidentAmbulanceAssigned
```

## 🔒 Security

- Cloud Functions run with service account credentials
- No Firebase Auth checks in Cloud Functions (handle in security rules)
- Input validation on all endpoints
- Firestore security rules enforce access control

## 📊 Monitoring

### View Function Metrics

1. Go to Firebase Console
2. Navigate to Functions
3. View metrics, logs, and usage

### Set Up Alerts

```bash
# Enable alerting in Firebase Console
# Functions > Select function > Set up alerts
```

## 🐛 Debugging

### Common Issues

**1. "Cannot find module"**

```bash
cd functions
npm install
```

**2. "Permission denied"**

- Check Firestore rules
- Verify service account permissions

**3. "Transaction failed"**

- Check for concurrent writes
- Verify document exists

**4. "Deployment failed"**

```bash
# Check Node version
node --version  # Should be 18

# Check Firebase CLI version
firebase --version
```

### Debug Logs

Add debug logs:

```javascript
const logger = require('./utils/logger');
logger.debug('DEBUG_EVENT', { data: someData });
```

View in console:

```bash
firebase functions:log
```

## 🚀 Performance Optimization

### Best Practices

1. **Minimize Cold Starts**
    - Keep functions small
    - Use global variables for SDK initialization

2. **Optimize Firestore Queries**
    - Create proper indexes
    - Limit query results
    - Use `select()` to get specific fields

3. **Batch Operations**
    - Use batched writes when possible
    - Limit to 500 operations per batch

4. **Cache External API Calls**
    - Use Firebase Hosting for static assets
    - Implement caching strategies

## 📈 Scaling

Firebase Cloud Functions scale automatically based on load:

- Default: Up to 1000 concurrent instances
- Cold start time: ~1-3 seconds
- Warm execution: ~100-500ms

### Increase Limits

```bash
# Request quota increase in Firebase Console
# Settings > Usage and billing > Details & settings
```

## 💰 Cost Optimization

### Free Tier Limits

- 2M invocations/month
- 400K GB-seconds/month
- 200K CPU-seconds/month

### Tips to Reduce Costs

1. Optimize function execution time
2. Use scheduled functions sparingly
3. Implement caching
4. Clean up old data
5. Use Firestore triggers efficiently

## 📚 Additional Resources

- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Express.js Guide](https://expressjs.com/)
- [BACKEND_ARCHITECTURE.md](../BACKEND_ARCHITECTURE.md)
- [TESTING_GUIDE.md](../TESTING_GUIDE.md)

## 🤝 Contributing

When adding new functions:

1. Create service files in `services/`
2. Add utilities in `utils/`
3. Export functions in `index.js`
4. Update documentation
5. Write tests
6. Deploy and verify

## 📄 License

MIT License - See LICENSE file for details
