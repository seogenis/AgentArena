# Stage 6 Implementation Guide: AIQToolkit Integration

## Overview

This document provides a comprehensive guide for implementing Stage 6 of the AI Territory Control Game. This stage focuses on integrating NVIDIA's AIQToolkit via a Python backend to enable more sophisticated agent behaviors and team strategies.

## Project Architecture

Stage 6 introduces a hybrid architecture:

```
┌────────────────────────┐     ┌────────────────────────┐
│                        │     │                        │
│   JavaScript Frontend  │◄────┤   Python Backend       │
│   (Game UI & Logic)    │────►│   (AIQToolkit)         │
│                        │     │                        │
└────────────────────────┘     └────────────────────────┘
         │                               │
         │                               │
         ▼                               ▼
┌────────────────────────┐     ┌────────────────────────┐
│                        │     │                        │
│   Direct LLM API       │     │   LLM API              │
│   (Fallback Mode)      │     │   (via AIQToolkit)     │
│                        │     │                        │
└────────────────────────┘     └────────────────────────┘
```

### Key Components:
1. **JavaScript Frontend**: Existing game UI and logic
2. **Python Backend**: New FastAPI service with AIQToolkit
3. **Communication**: REST API and optional WebSockets
4. **Fallback Mechanism**: Direct LLM calls when backend unavailable

## Team Structure and Responsibilities

The project is divided into three teams with distinct responsibilities:

### Frontend Team
- Modify `LLMService.js` to communicate with Python backend
- Implement fallback mechanism for when backend is unavailable
- Add visual indicators for AIQToolkit-driven decisions
- Enhance visualization of team strategies and agent decisions
- Add UI for displaying backend connection status

### Backend Team
- Set up Python backend with FastAPI and AIQToolkit
- Design AIQToolkit workflows for team strategy generation
- Create AIQToolkit workflows for agent creation and specialization
- Implement REST API endpoints for frontend communication
- Add WebSocket support for real-time updates (optional)

### DevOps Team
- Containerize frontend and backend for easier deployment
- Create Docker Compose configuration for development
- Set up environment variable management
- Configure CORS for secure communication

## Implementation Sequence

**IMPORTANT**: Before beginning separate implementation, all teams must review the [Coordination Guidelines](./coordination_guidelines.md) and hold an initial joint planning session to define API contracts.

Follow this recommended sequence for implementing Stage 6:

### Phase 1: Setup (Week 1)
1. **Joint planning session** to define API contracts and data models
2. Create basic directory structure for Python backend
3. Set up FastAPI application with CORS configuration
4. Create basic API models for data validation
5. Create JavaScript client for backend communication
6. Set up Docker configuration for development
7. **Integration Checkpoint 1**: Basic components working together

### Phase 2: Core Functionality (Week 2)
1. Implement AIQToolkit workflows for team strategy generation
2. Implement AIQToolkit workflows for agent creation
3. Create service layer to manage workflow execution
4. Modify JavaScript LLMService to use backend
5. Implement fallback mechanisms for when backend is unavailable

### Phase 3: Enhanced Features (Week 3)
1. Add WebSocket support for real-time updates (optional)
2. Enhance frontend visualization of team strategies
3. Create UI for backend connection status
4. Implement strategy adaptation workflow
5. Add visual indicators for AIQToolkit-driven decisions

### Phase 4: Testing and Deployment (Week 4)
1. Write comprehensive tests for backend functionality
2. Test frontend-backend communication
3. Optimize performance
4. Finalize deployment configuration
5. Document the implementation

## Key Documentation Resources

Team members should carefully review these documents:

### For All Teams
- [AIQToolkit Integration Design](./llm_aiqtoolkit_design.md) - Architecture overview
- [Development Roadmap](./development_roadmap.md) - Project roadmap
- [Stage 6 Implementation Plan](./stages/stage6_llm_spawners.md) - Detailed requirements

### For Frontend Team
- [JavaScript Frontend Handoff](./javascript_frontend_handoff.md) - Step-by-step guide

### For Backend Team
- [Python Backend Handoff](./python_backend_handoff.md) - Step-by-step guide

### For DevOps Team
- Docker and container orchestration documentation

## Development Environment Setup

### Prerequisites
- Node.js (latest LTS recommended)
- NPM
- Python 3.11+
- Docker and Docker Compose
- Git

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd ai-territory-game
```

### Step 2: Frontend Setup
```bash
npm install
```

### Step 3: Backend Setup
```bash
mkdir -p backend/app/api backend/app/schemas backend/app/services backend/app/workflows backend/tests
cd backend
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
pip install fastapi uvicorn python-dotenv pydantic websockets
pip install aiqtoolkit[langchain]  # Install LangChain plugin
pip install pytest pytest-asyncio httpx  # Testing dependencies
```

### Step 4: Docker Setup
Create the following files:
- `backend/Dockerfile`
- `backend/requirements.txt`
- `docker-compose.yml` (in project root)

## Implementation Details

### Backend Components

#### 1. FastAPI Application (`backend/app/main.py`)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Territory Game Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI Territory Game Backend is running"}

# Import and include API routers
# app.include_router(...)
```

#### 2. API Models (`backend/app/schemas/`)
Define data models for game state, team strategy, and agent specifications.

#### 3. AIQToolkit Workflows (`backend/app/workflows/`)
Create YAML configuration files for AIQToolkit workflows.

#### 4. Service Layer (`backend/app/services/`)
Implement service modules for strategy generation and agent creation.

#### 5. API Endpoints (`backend/app/api/`)
Create API routers for team strategy and agent specification endpoints.

### Frontend Components

#### 1. Backend API Client (`src/engine/llm/BackendAPIClient.js`)
Create a client for communicating with the Python backend.

#### 2. LLMService Modifications (`src/engine/llm/LLMService.js`)
Update to use the backend client with fallback to current implementation.

#### 3. UI Enhancements
Add backend connection status indicator and enhanced strategy visualization.

#### 4. WebSocket Client (Optional)
Implement WebSocket communication for real-time updates.

### DevOps Components

#### 1. Docker Configuration
Create Dockerfile for the backend and docker-compose.yml for orchestration.

#### 2. Environment Variables
Set up environment variable management for API keys and configuration.

## Testing Strategy

### Backend Testing
- Unit tests for service functions
- API endpoint tests using TestClient
- AIQToolkit workflow tests

### Frontend Testing
- Test backend communication
- Test fallback behavior
- Test UI indicators
- Test WebSocket communication (if implemented)

### Integration Testing
- Test end-to-end communication
- Verify strategy and agent creation flow
- Test performance and response times

## Troubleshooting Common Issues

### CORS Errors
- Verify CORS middleware configuration
- Check request URLs
- Use browser developer tools to diagnose

### AIQToolkit Workflow Issues
- Check workflow file paths
- Verify YAML syntax
- Check AIQToolkit installation

### API Key Authentication
- Verify environment variables
- Check .env file configuration
- Ensure API keys have sufficient credits

### WebSocket Connection Issues
- Verify WebSocket server is running
- Check browser console for errors
- Test with a WebSocket client tool

## Implementation Checklist

### Backend Team
- [ ] Basic FastAPI application setup
- [ ] API models defined
- [ ] AIQToolkit workflows created
- [ ] Service layer implementation
- [ ] API endpoints implemented
- [ ] WebSocket support (optional)
- [ ] Tests written and passing

### Frontend Team
- [ ] BackendAPIClient implementation
- [ ] LLMService modification with fallback behavior
- [ ] UI updates for backend status
- [ ] Enhanced strategy visualization
- [ ] WebSocket client (optional)
- [ ] Testing and verification

### DevOps Team
- [ ] Backend Dockerfile
- [ ] Frontend Docker configuration
- [ ] docker-compose.yml setup
- [ ] Environment variable management
- [ ] CORS configuration
- [ ] Deployment documentation

## Acceptance Criteria

The implementation will be considered complete when:

1. **Python backend** successfully generates team strategies and agent specifications
2. **JavaScript frontend** correctly communicates with the backend
3. **Agent behaviors** show more sophisticated coordination and specialization
4. **Performance** remains stable with the additional backend component
5. **Fallback** to local processing works when backend is unavailable

## Communication Channels

- Use the project issue tracker for task management
- Daily stand-up meetings for team coordination
- Weekly review meetings for progress assessment
- Slack channel for real-time communication

## Resources

- [AIQToolkit Documentation](https://docs.nvidia.com/aiqtoolkit/latest/index.html)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Docker Documentation](https://docs.docker.com/)

## Timeline

- **Week 1**: Setup phase
- **Week 2**: Core functionality implementation
- **Week 3**: Enhanced features implementation
- **Week 4**: Testing, deployment, and documentation