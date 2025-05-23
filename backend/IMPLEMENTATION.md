# Python Backend Implementation for Stage 6

This document explains the implementation of the Python backend using AIQToolkit for the AI Territory Control Game.

## Implementation Overview

The backend is built with FastAPI and integrates NVIDIA's AIQToolkit to enhance agent behaviors and team strategies. The implementation follows the architecture outlined in the [AIQToolkit Integration Design](../plan/llm_aiqtoolkit_design.md) and [Stage 6 Implementation Guide](../plan/stage6_implementation_guide.md).

### Key Features

1. **AIQToolkit Workflows**
   - Team strategy generation with enhanced coordination
   - Specialized agent creation with improved attributes

2. **REST API Endpoints**
   - `/api/team-strategy`: Generate team strategies
   - `/api/agent-specification`: Create specialized agents

3. **WebSocket Support**
   - Real-time game state updates
   - Strategic directives in response

4. **Fallback Mechanisms**
   - Graceful degradation when AIQToolkit fails
   - Consistent response formats with frontend expectations

## Architecture

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

## Implementation Details

### 1. FastAPI Application

The main application is defined in `app/main.py` and includes:
- CORS middleware for secure frontend communication
- WebSocket support for real-time updates
- API routers for team strategy and agent specification

### 2. Data Models

Pydantic models in the `app/schemas/` directory:
- `game_state.py`: Game state data from the frontend
- `strategy.py`: Team strategy response structure
- `agent_spec.py`: Agent specification response structure

### 3. AIQToolkit Workflows

YAML configuration files in `app/workflows/`:
- `team_strategy.yaml`: Team strategy generation workflow
- `agent_creation.yaml`: Agent creation and specialization workflow

These workflows define the prompts and LLM configurations for generating strategies and agents.

### 4. Service Layer

Business logic in `app/services/`:
- `strategy_service.py`: Handles team strategy generation
- `agent_service.py`: Handles agent specification creation

Each service includes fallback mechanisms for when AIQToolkit fails.

### 5. API Endpoints

API routes in `app/api/`:
- `strategy.py`: Team strategy endpoint
- `agent.py`: Agent specification endpoint

### 6. Containerization

Docker support with:
- `Dockerfile`: Container configuration for the backend
- `docker-compose.yml`: Orchestration for frontend and backend

## Frontend Integration

The JavaScript frontend needs to be modified to communicate with this backend. The changes include:

1. Creating a `BackendAPIClient.js` to handle communication
2. Modifying `LLMService.js` to use the backend with fallback behavior
3. Adding UI indicators for backend connection status
4. Enhancing strategy visualization with AIQToolkit-generated data

## Running the Backend

### Local Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Docker Deployment

```bash
docker-compose up
```

## Testing

The backend includes tests for API endpoints and services:
- `tests/test_api.py`: Tests for API endpoints
- `tests/test_services.py`: Tests for service layer functions

Run tests with:
```bash
pytest
```

## Next Steps

1. **Frontend Integration**: Coordinate with the frontend team to integrate with this backend
2. **AIQToolkit Workflow Refinement**: Enhance the workflow templates for better strategies
3. **WebSocket Features**: Develop more advanced real-time features
4. **Testing and Optimization**: Comprehensive testing and performance optimization

## Known Limitations

1. Fallback mechanisms provide basic functionality but lack the sophistication of AIQToolkit
2. WebSocket implementation is basic and could be enhanced
3. Need to ensure proper error handling for various edge cases
4. Current implementation does not include advanced caching or rate limiting

## Resources

- [AIQToolkit Documentation](https://docs.nvidia.com/aiqtoolkit/latest/index.html)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)