# Stage 6 Handoff: Testing and Deployment

## Overview

The Stage 6 implementation of the AI Territory Control Game has been completed with the successful integration of:

1. Python backend with NVIDIA's AIQToolkit
2. JavaScript frontend with backend communication capabilities
3. Docker containerization for development and deployment

This document provides instructions for the next team who will be responsible for testing, deployment, and potential enhancements to the integrated system.

## Project Structure

```
ai-territory-game/
├── backend/               # Python backend with AIQToolkit
│   ├── app/               # FastAPI application
│   │   ├── api/           # API endpoints
│   │   ├── schemas/       # Data models
│   │   ├── services/      # Business logic
│   │   └── workflows/     # AIQToolkit workflows
│   ├── tests/             # Backend tests
│   ├── Dockerfile         # Backend Docker config
│   └── requirements.txt   # Python dependencies
├── src/                   # JavaScript frontend
│   ├── engine/            # Game engine components
│   │   ├── llm/           # LLM integration components
│   │   └── ...            # Other engine components
│   └── game/              # Game-specific logic
├── docker-compose.yml     # Container orchestration
├── README-INTEGRATION.md  # Integration guide
└── MERGE_SUMMARY.md       # Summary of merged changes
```

## Getting Started

### Prerequisites

- Node.js (latest LTS recommended)
- NPM
- Python 3.11+
- Docker and Docker Compose
- OpenAI API key (for LLM functionality)

### Running the Integrated System

The easiest way to run the entire system is with Docker Compose:

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your_api_key_here

# Start the containers
docker-compose up
```

Then open your browser to http://localhost:3000

### Running Components Separately

#### Frontend
```bash
npm start
```

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Testing Plan

The integrated system needs comprehensive testing across multiple dimensions:

### 1. Component Testing

#### Backend Tests
```bash
cd backend
python -m pytest
```

This will run the test suite for the backend components, including API endpoints and service functions.

#### Frontend Visual Testing
The frontend can be visually tested using the in-game controls:

- Press `B` to toggle backend usage
- Press `G` to request a new Red team strategy
- Press `B` to request a new Blue team strategy
- Press `N` to request a new agent for Red team
- Press `M` to request a new agent for Blue team

### 2. Integration Testing

Test the following integration scenarios:

1. **Backend Connection**: Verify frontend can connect to backend and display connection status
2. **Strategy Generation**: Request team strategies and verify they're fetched from the backend
3. **Agent Creation**: Request agent specifications and verify they're created via the backend
4. **Fallback Behavior**: Disable backend and verify fallback to direct LLM calls
5. **WebSocket Communication**: Enable WebSocket and verify real-time updates

### 3. Performance Testing

1. **Responsiveness**: Measure response times for API calls under different loads
2. **Scalability**: Test with increasing numbers of agents to find performance limits
3. **Resource Usage**: Monitor CPU/memory usage of both frontend and backend

### 4. Cross-Browser Testing

Verify functionality in:
- Chrome
- Firefox
- Edge
- Safari

## Deployment Options

### Option 1: Containerized Deployment

The project includes Docker configuration for containerized deployment:

```bash
# Build and run the containers
docker-compose up --build

# For production, build optimized images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### Option 2: Separate Deployment

#### Frontend Deployment
The frontend can be deployed to any static hosting service:

```bash
# Build for production
npm run build

# Deploy the build directory to your static hosting service
```

#### Backend Deployment
The backend can be deployed as a standalone service:

```bash
# Option 1: Deploy as a Docker container
docker build -t ai-territory-backend ./backend
docker run -p 8000:8000 -e OPENAI_API_KEY=your_key_here ai-territory-backend

# Option 2: Deploy to a PaaS like Heroku or Render
# Follow the platform-specific deployment instructions
```

## Environment Variables

### Frontend Environment Variables
- `API_ENDPOINT`: URL of the backend API (default: http://localhost:8000/api)
- `LLM_API_KEY`: OpenAI API key (optional, can be set via UI)
- `USE_MOCK_RESPONSES`: Whether to use mock responses (default: false)

### Backend Environment Variables
- `OPENAI_API_KEY`: Required for AIQToolkit
- `ENVIRONMENT`: Development or production
- `LOG_LEVEL`: Logging level (debug, info, warning, error)
- `ALLOWED_ORIGINS`: CORS allowed origins

## Next Steps

Here are the recommended next steps for the project:

### 1. Testing and Bug Fixing
- Implement comprehensive testing as outlined above
- Fix any bugs or issues discovered during testing
- Document any workarounds or limitations

### 2. Performance Optimization
- Profile backend performance and optimize slow endpoints
- Implement caching for frequent AIQToolkit calls
- Optimize WebSocket communication for real-time updates

### 3. UI Enhancements
- Add more detailed visualization of AIQToolkit strategies
- Improve UI for backend connection status
- Create admin panel for monitoring and configuration

### 4. Infrastructure Setup
- Set up CI/CD pipeline for automated testing and deployment
- Configure monitoring and alerting
- Implement logging and error tracking

### 5. Documentation
- Create user documentation for gameplay
- Update developer documentation with any changes
- Document deployment process and maintenance procedures

## Key Keyboard Controls

- `WASD/Arrow keys`: Move camera
- `Q/E`: Zoom in/out
- `L`: Toggle LLM systems on/off
- `G`: Request new Red team strategy
- `V`: Request new Blue team strategy
- `N`: Spawn LLM agent for Red team
- `M`: Spawn LLM agent for Blue team
- `B`: Toggle backend usage
- `W`: Toggle WebSocket connection

## Troubleshooting Common Issues

### Backend Connection Issues
- Verify the backend is running on port 8000
- Check CORS configuration if running on different domains
- Look for errors in browser console or backend logs

### AIQToolkit Issues
- Ensure OPENAI_API_KEY is correctly set
- Check AIQToolkit workflow syntax
- Verify Python dependencies are installed correctly

### Docker Issues
- Ensure Docker and Docker Compose are installed
- Check port conflicts with existing services
- Verify environment variables are correctly set

## Resources and Documentation

- [AIQToolkit Documentation](https://docs.nvidia.com/aiqtoolkit/latest/index.html)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Project README](./README.md)
- [Integration Guide](./README-INTEGRATION.md)
- [Merge Summary](./MERGE_SUMMARY.md)

## Contact Information

For questions or issues, contact the project maintainers:

- Frontend Team: [TBD]
- Backend Team: [TBD]
- DevOps Team: [TBD]