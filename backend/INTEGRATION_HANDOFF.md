# Backend Integration Handoff Document

This document provides instructions for integrating the new Python backend with the existing JavaScript frontend for the AI Territory Control Game.

## Integration Overview

The backend component is now ready to be integrated with the frontend. This document outlines the steps needed to merge the backend and frontend components and achieve the full Stage 6 implementation.

## Backend Implementation Summary

The Python backend provides the following capabilities:
- Team strategy generation using AIQToolkit workflows
- Specialized agent creation with improved attributes
- REST API endpoints for frontend communication
- WebSocket support for real-time updates
- Fallback mechanisms for reliability
- Docker configuration for containerized deployment

## Key Files for Integration

1. **Backend API Endpoints**:
   - `/api/team-strategy`: Generate team strategies
   - `/api/agent-specification`: Create specialized agents
   - `/ws/{client_id}`: WebSocket endpoint for real-time updates

2. **Frontend Files to Modify**:
   - `src/engine/llm/LLMService.js`: Update to communicate with the backend
   - Create new file: `src/engine/llm/BackendAPIClient.js`
   - Update `src/engine/llm/LLMSystem.js` to show backend connection status

## Integration Steps

### 1. Setup Backend Server

```bash
# Clone repository if needed
git clone <repository-url>
cd ai-territory-game

# Set up Python environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file with your API key
cp .env.example .env
# Edit .env to add your OpenAI API key

# Start the backend server
uvicorn app.main:app --reload
```

### 2. Verify Backend API

The backend API should be accessible at:
- http://localhost:8000/docs - Swagger UI documentation
- http://localhost:8000/api/team-strategy - Team strategy endpoint
- http://localhost:8000/api/agent-specification - Agent specification endpoint

### 3. Create Backend API Client

Create a new file `src/engine/llm/BackendAPIClient.js` following the template in the [JavaScript Frontend Handoff](../plan/javascript_frontend_handoff.md) document.

### 4. Modify LLMService

Update `src/engine/llm/LLMService.js` to use the backend client with fallback to direct LLM calls as specified in the frontend handoff document.

### 5. Update LLMSystem for UI Indicators

Modify `src/engine/llm/LLMSystem.js` to display backend connection status and manage fallback behavior.

### 6. Test Integration

Test the integration to ensure:
- Team strategies can be generated through the backend
- Specialized agents can be created via the backend
- Fallback works when backend is unavailable
- UI indicates backend connection status

### 7. Dockerized Deployment (Optional)

To run both frontend and backend with Docker:

```bash
# From project root
docker-compose up
```

## API Response Formats

### Team Strategy Response

```json
{
  "strategy": "aggressive",
  "focus": "territory",
  "priorities": ["expand_territory", "attack_enemies", "collect_energy"],
  "description": "Aggressive expansion focusing on territory control and eliminating enemy agents."
}
```

### Agent Specification Response

```json
{
  "role": "defender",
  "attributes": {
    "speed": 0.4,
    "health": 0.9,
    "attack": 0.6,
    "defense": 0.9,
    "carryCapacity": 0.2
  },
  "priority": "materials",
  "description": "Heavily armored defender specializing in protecting resource collectors."
}
```

## Integration Troubleshooting

### CORS Issues
- If you encounter CORS errors, verify that the backend allows requests from your frontend origin.
- The backend is configured to allow requests from `http://localhost:3000` by default.

### Connection Issues
- Make sure the backend server is running on port 8000.
- Check browser console for connection errors.
- Verify that the backend client is using the correct URL.

### API Response Issues
- Check that the backend responses match the expected format for the frontend.
- Verify that team IDs are properly converted between formats.
- Look for mismatches in data structure between backend and frontend.

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Team Strategy Generation | ✅ Complete | `/api/team-strategy` endpoint |
| Agent Specification | ✅ Complete | `/api/agent-specification` endpoint |
| WebSocket Support | ✅ Complete | Basic implementation, can be enhanced |
| Fallback Mechanism | ✅ Complete | Built into backend services |
| Docker Configuration | ✅ Complete | See docker-compose.yml |
| Frontend Integration | ⬜ Pending | Requires LLMService updates |
| UI Indicators | ⬜ Pending | Requires LLMSystem updates |

## Next Steps After Integration

After successfully integrating the backend with the frontend:

1. Enhance the WebSocket implementation for more sophisticated real-time updates
2. Add more detailed visualizations for AIQToolkit-generated strategies
3. Improve error handling and retry mechanisms
4. Consider implementing caching for common requests
5. Add more comprehensive tests for the integrated system

## Contact Information

For questions about the backend implementation, please contact the backend team.

## References

- [Python Backend Handoff](../plan/python_backend_handoff.md)
- [JavaScript Frontend Handoff](../plan/javascript_frontend_handoff.md)
- [AIQToolkit Integration Design](../plan/llm_aiqtoolkit_design.md)
- [Stage 6 Implementation Guide](../plan/stage6_implementation_guide.md)
- [Coordination Guidelines](../plan/coordination_guidelines.md)