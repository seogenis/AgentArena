# Integration of Frontend and Backend for AI Territory Control Game

This document provides instructions for running the integrated frontend and backend systems for the AI Territory Control Game.

## Architecture Overview

The integrated system consists of:

1. **JavaScript Frontend**: Browser-based game UI with Canvas rendering
2. **Python Backend**: FastAPI server with NVIDIA AIQToolkit integration
3. **API Communication**: REST endpoints and optional WebSocket connection

## Getting Started

### Prerequisites

- Node.js (v16+) for the frontend
- Python 3.11+ for the backend
- Docker and Docker Compose (optional, for containerized deployment)

### Installation

#### Frontend
```bash
# Install npm dependencies
npm install
```

#### Backend
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Configuration

1. Create a `.env` file in the backend directory:
```
# Backend .env file
OPENAI_API_KEY=your_api_key_here
LOG_LEVEL=info
```

2. Setup frontend environment:
   - The frontend will automatically look for the backend at `http://localhost:8000`
   - The API key can be set in the UI or via localStorage

## Running the Application

### Option 1: Running Components Separately

#### Start the Backend:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Start the Frontend:
```bash
npm start
```

### Option 2: Using Docker Compose
```bash
# Build and start both services
docker-compose up --build
```

## Testing the Integration

1. Open a browser to `http://localhost:3000`
2. Verify that the game loads correctly
3. The frontend will automatically try to connect to the backend
4. If the backend is available, the game will use AIQToolkit for strategy and agent generation
5. If the backend is unavailable, the game will fallback to direct LLM calls or mock responses

### Backend Testing
```bash
cd backend
pytest
```

## API Endpoints

- `GET /` - Health check
- `POST /api/team-strategy` - Generate team strategy
- `POST /api/agent-specification` - Generate agent specification
- `WebSocket /ws/{client_id}` - Real-time game state updates (optional)

## Fallback Mechanism

The system implements a robust fallback mechanism:

1. First tries to use the AIQToolkit backend
2. If unavailable, falls back to direct LLM API calls
3. If LLM API is not configured, uses mock responses

## Troubleshooting

- **Backend Connection Issues**: Check that the backend is running and CORS is properly configured
- **AIQToolkit Errors**: Verify that the workflows are properly formatted and accessible
- **Frontend Display Issues**: Check browser console for any JavaScript errors

## Architecture Decisions

1. The frontend implements `BackendAPIClient.js` to handle communication with the backend
2. The LLMService has been updated to try backend first, then fallback to direct LLM calls
3. WebSocket support is optional and can be disabled without breaking functionality
4. Docker Compose setup ensures consistent deployment across environments