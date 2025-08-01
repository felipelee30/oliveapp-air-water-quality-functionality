# Environmental Quality API - Bruno Collection

This Bruno collection provides comprehensive testing for the Environmental Quality API endpoints.

## Setup

1. **Start the Backend Server**:
   ```bash
   cd packages/backend
   yarn dev
   ```

2. **Open Bruno** and import this collection

3. **Select Environment**: Choose "Local Development" for testing against localhost:3000

## Available Requests

### 🟢 Health Check
- **Endpoint**: `GET /health`
- **Purpose**: Verify server is running and healthy
- **Expected**: 200 status with `{"status": "healthy", "timestamp": "..."}`

### 🌍 Environmental Quality Endpoints

#### NYC (New York City)
- **Coordinates**: 40.7128, -74.0060
- **Purpose**: Test with major US city coordinates
- **Expected**: Complete air and water quality data

#### LA (Los Angeles)
- **Coordinates**: 34.0522, -118.2437
- **Purpose**: Test with West Coast US city
- **Expected**: Complete air and water quality data

#### London, UK
- **Coordinates**: 51.5074, -0.1278
- **Purpose**: Test international coordinates
- **Note**: May have limited water quality data (EPA is US-only)

### ❌ Error Cases

#### Missing Parameters
- **Test**: Request without lat/lng parameters
- **Expected**: 400 Bad Request with descriptive error

#### Invalid Coordinates
- **Test**: Non-numeric lat/lng values
- **Expected**: 400 Bad Request

#### Out of Range Coordinates
- **Test**: Coordinates outside valid ranges (lat: -90 to 90, lng: -180 to 180)
- **Expected**: 400 Bad Request with validation error

## Response Structure

### Success Response (200)
```json
{
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "airQuality": {
    "score": 75,
    "rating": "Good",
    "aqi": 45,
    "pollutants": [
      {
        "name": "pm25",
        "displayName": "PM2.5",
        "value": 15,
        "unit": "μg/m³",
        "limit": 25,
        "description": "Fine particulate matter",
        "exceedsLimit": false,
        "exceedanceRatio": 0.6
      }
    ],
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "waterQuality": {
    "score": 25,
    "rating": "Poor",
    "contaminants": [
      {
        "name": "Haloacetic acids (HAA5)",
        "value": 0.04,
        "unit": "mg/L",
        "legalLimit": 0.06,
        "description": "Byproducts of water disinfection",
        "exceedsLimit": false,
        "exceedanceLabel": null
      }
    ],
    "location": "New York",
    "utilityName": "NYC Water System",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "overallHealth": "Fair",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response (400/500)
```json
{
  "error": "Missing required parameters: lat and lng",
  "message": "Additional error details"
}
```

## Quality Ratings
- **Excellent**: 80-100
- **Good**: 60-79
- **Fair**: 40-59
- **Poor**: 20-39
- **Bad**: 0-19

## Testing Tips

1. **Run requests individually** to test specific scenarios
2. **Use the test suite** to validate response structure automatically
3. **Check server logs** for detailed error information
4. **Try different coordinates** to test various data scenarios

## Troubleshooting

### 500 Internal Server Error
- Check that your Google API key is valid and has Air Quality API enabled
- Verify the server is running with `yarn dev`
- Check server logs for specific error messages

### Connection Refused
- Ensure the backend server is running on port 3000
- Check if another process is using port 3000

### API Rate Limits
- Google APIs have usage quotas
- Consider implementing caching for development

## Environment Variables Required

```bash
# Backend .env file
GOOGLE_API_KEY=your_google_api_key_here
PORT=3000
NODE_ENV=development
```