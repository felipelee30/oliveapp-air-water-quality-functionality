# Environmental Quality Map Overlay

A complete TypeScript solution for displaying environmental quality data (air and water quality) as an interactive map overlay. Built with clean architecture principles for easy integration into existing applications.

## 🏗️ Architecture

This project is structured as a monorepo with separate backend and frontend packages:

```
packages/
├── backend/     # Node.js/Express API with clean architecture
└── frontend/    # React Native/Expo application
```

## ✨ Features

### Backend
- **Clean Architecture**: Domain-driven design with repository pattern
- **TypeScript**: Full type safety with strict typing
- **Framework Agnostic**: Core business logic can be ported to any framework
- **API Integration**: Google Air Quality API and EPA Water Quality data
- **Comprehensive Testing**: Unit and integration tests

### Frontend
- **Glassmorphism UI**: Beautiful translucent overlay with blur effects
- **Responsive Design**: Collapsed and expanded views with smooth animations
- **Real-time Data**: Fetches environmental data based on map coordinates
- **TypeScript**: Fully typed React Native components
- **Tailwind CSS**: Modern utility-first styling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn package manager
- Google API key for Air Quality API
- Expo CLI (for frontend development)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd packages/backend
```

2. Install dependencies:
```bash
yarn install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Add your Google API key to `.env`:
```
GOOGLE_API_KEY=your_google_api_key_here
```

5. Start the development server:
```bash
yarn dev
```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd packages/frontend
```

2. Install dependencies:
```bash
yarn install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Start the Expo development server:
```bash
yarn start
```

## 📊 API Usage

### Get Environmental Quality Data
```http
GET /api/environmental-quality?lat=40.7128&lng=-74.0060
```

#### Response Format:
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
        "exceedsLimit": false
      }
    ]
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
        "exceedsLimit": false
      }
    ]
  },
  "overallHealth": "Fair",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎨 UI Components

### Collapsed View
- Horizontal layout showing air and water quality scores
- Visual quality bars with color-coded ratings
- Tap to expand functionality

### Expanded View  
- Full-screen detailed breakdown
- Scrollable content with:
  - Summary scores and ratings
  - Individual contaminants/pollutants
  - Filter recommendations
  - Scoring methodology
  - Action buttons

## 🧪 Testing

### Backend Tests
```bash
cd packages/backend
yarn test              # Run all tests
yarn test:watch        # Watch mode
yarn test:coverage     # With coverage report
```

### Type Checking
```bash
yarn lint              # TypeScript type checking
```

## 🔧 Integration Guide

### Backend Integration
The backend uses clean architecture, making it easy to integrate into existing systems:

1. **Copy Use Cases**: The `GetEnvironmentalQuality` use case is framework-agnostic
2. **Implement Repositories**: Use existing repository interfaces with your preferred data layer
3. **Replace Express**: Create adapters for your chosen framework (FastAPI, Koa, etc.)

### Frontend Integration
The React Native component can be easily integrated:

1. **Copy Components**: The `EnvironmentalQualityOverlay` component is self-contained
2. **Install Dependencies**: Add required packages to your existing React Native app
3. **Configure API**: Point the service to your backend URL

## 📝 Data Sources

- **Air Quality**: Google Air Quality API (requires API key)
- **Water Quality**: EPA Envirofacts API (no API key required)
- **Geocoding**: Google Geocoding API (uses same API key)

## 🎯 Quality Scoring

### Air Quality
- Based on Air Quality Index (AQI) standards
- Compares pollutant levels against WHO guidelines
- Score range: 0-100 (higher is better)

### Water Quality  
- Based on EPA Maximum Contaminant Levels (MCL)
- Penalty system for exceedances
- Score range: 0-100 (higher is better)

## 🚀 Deployment

### Backend Deployment
The backend can be deployed to any Node.js hosting platform:
- Heroku, Vercel, Railway, AWS, etc.
- Make sure to set environment variables
- The service is stateless and scales horizontally

### Frontend Deployment
- **Mobile**: Build and deploy to App Store/Google Play using EAS Build
- **Web**: Deploy to Vercel, Netlify, or any static hosting service

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run type checking and tests
6. Submit a pull request

## 📞 Support

For questions or issues, please check the individual package READMEs:
- [Backend Documentation](./packages/backend/README.md)
- [Frontend Documentation](./packages/frontend/README.md)