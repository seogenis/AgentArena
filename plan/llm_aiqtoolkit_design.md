# AIQToolkit Integration Design

## Overview
This document outlines the design for integrating NVIDIA's Agent Intelligence Toolkit (AIQToolkit) with our existing JavaScript-based territory control game. The integration will create a hybrid architecture with a Python backend service that leverages AIQToolkit's capabilities for more sophisticated agent behaviors and team strategies.

## Architecture Comparison

### Current Architecture
- **Frontend**: Pure JavaScript implementation
- **AI Integration**: Direct LLM API calls from the browser
- **Agent Behavior**: Simple hardcoded behaviors with LLM-defined attributes
- **Team Strategy**: Basic LLM-generated strategies
- **Coordination**: Limited coordination between agents
- **Fallback**: Mock responses when no API key is provided

### Proposed Architecture
- **Frontend**: JavaScript (game UI, rendering, basic mechanics)
- **Backend**: Python with NVIDIA AIQToolkit
- **Communication**: REST API and WebSockets
- **Agent Behavior**: Enhanced behaviors with AIQToolkit workflows
- **Team Strategy**: Sophisticated coordination strategies
- **Fallback**: Graceful degradation to current system when backend unavailable

## System Components

### 1. Python Backend Service

#### Core Functionality
- Host AIQToolkit and its workflows
- Expose REST API endpoints for:
  - Team strategy generation
  - Agent creation and specialization
  - Game state analysis
- Optional WebSocket communication for real-time updates
- Handle authentication and API key management

#### Technology Stack
- **Web Framework**: FastAPI for REST API and WebSockets
- **AI Framework**: NVIDIA AIQToolkit for agent coordination
- **Caching**: Optional Redis for caching common requests
- **Deployment**: Docker for containerization

### 2. AIQToolkit Workflows

#### Team Strategy Workflow
**Purpose**: Generate cohesive team strategies based on game state
- **Inputs**: Game state, territory control, resources, agent distribution
- **Processing**: Analyze current situation and opponent behavior
- **Outputs**: Strategy type, resource priorities, and territory focus

#### Agent Creation Workflow
**Purpose**: Design specialized agents based on team needs
- **Inputs**: Team strategy, resource availability, current team composition
- **Processing**: Balance agent attributes for optimal performance
- **Outputs**: Detailed agent specification with role and attributes

#### Strategy Adaptation Workflow
**Purpose**: Adapt team strategy to counter opponent moves
- **Inputs**: Opponent behavior observations, current strategy
- **Processing**: Analyze patterns and weaknesses
- **Outputs**: Updated strategy directives

### 3. JavaScript Frontend Modifications

#### LLMService Updates
- Modify to communicate with Python backend
- Maintain support for direct LLM calls as fallback
- Enhance error handling and retry mechanisms

#### UI Enhancements
- Add visualizations for AIQToolkit-generated strategies
- Create displays for agent specializations and roles
- Implement debug overlay for backend connection status

## Communication Protocol

### REST API Endpoints

#### Team Strategy Endpoint
```
POST /api/team-strategy
```

**Request:**
```json
{
  "team_id": "red",
  "territory_control": { "red": 45, "blue": 55 },
  "resources": {
    "red": { "energy": 50, "materials": 30, "data": 20 },
    "blue": { "energy": 40, "materials": 35, "data": 25 }
  },
  "agents": {
    "red": [
      { "id": 1, "type": "collector", "health": 100, ... },
      ...
    ],
    "blue": [
      { "id": 2, "type": "explorer", "health": 90, ... },
      ...
    ]
  },
  "resource_distribution": { "energy": 10, "materials": 8, "data": 12 }
}
```

**Response:**
```json
{
  "strategy": "aggressive",
  "focus": "territory",
  "priorities": ["expand_territory", "attack_enemies", "collect_energy"],
  "description": "Aggressive expansion focusing on territory control and eliminating enemy agents."
}
```

#### Agent Specification Endpoint
```
POST /api/agent-specification
```

**Request:**
```json
{
  "team_id": "blue",
  "strategy": {
    "strategy": "defensive",
    "focus": "resources",
    ...
  },
  "resources": { "energy": 40, "materials": 35, "data": 25 },
  "current_agents": [
    { "type": "collector", "count": 3 },
    { "type": "explorer", "count": 2 },
    ...
  ]
}
```

**Response:**
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

### WebSocket Protocol (Optional)

#### Client -> Server: Game State Updates
```json
{
  "type": "gameState",
  "data": {
    // Same format as team-strategy payload
  }
}
```

#### Server -> Client: Strategic Directives
```json
{
  "type": "directive",
  "team": "red",
  "data": {
    "strategy": "balanced",
    "focus": "resources",
    "priorities": [...],
    "agentRecommendations": [
      { "type": "collector", "count": 2 },
      { "type": "defender", "count": 1 }
    ],
    "territoryFocus": {
      "x": 300,
      "y": 250,
      "radius": 100,
      "priority": "high"
    }
  }
}
```

## Deployment Architecture

### Development Environment
- **Frontend**: Local Node.js server (localhost:3000)
- **Backend**: Local Python server (localhost:8000)
- **Orchestration**: Docker Compose for easy setup

### Production Environment Options
- **Option 1: Containerized Deployment**
  - Frontend container
  - Backend container
  - Managed container service (e.g., Azure Container Apps, AWS ECS)

- **Option 2: Serverless Deployment**
  - Frontend: Static hosting (e.g., Netlify, Vercel)
  - Backend: Serverless functions (e.g., Azure Functions, AWS Lambda)

## Fallback Mechanism

The game must remain playable when the Python backend is unavailable:

1. **Detection**: Check backend availability on startup and periodically
2. **Graceful Degradation**: Fall back to direct LLM API calls if available
3. **Mock Responses**: Use existing mock response system if no LLM API key
4. **Notification**: Inform user of reduced functionality
5. **Retry Logic**: Attempt to reconnect to backend periodically

## Implementation Considerations

### Performance Considerations
1. **Response Time**: AIQToolkit workflows should complete within 2-3 seconds
2. **Caching**: Cache common strategic decisions to reduce API calls
3. **Batching**: Batch multiple requests when possible
4. **Streaming**: Consider streaming responses for complex decisions
5. **WebSocket Optimization**: Limit update frequency to reduce bandwidth

### Security Considerations
1. **API Key Management**: Store API keys securely on backend only
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **CORS Configuration**: Properly configure CORS for production
4. **Input Validation**: Validate all input from frontend
5. **Authentication**: Consider adding authentication for multi-user scenarios

### Testing Considerations
1. **Mock AIQToolkit**: Create mock implementations for testing
2. **API Tests**: Verify endpoint functionality with automated tests
3. **Integration Tests**: Test communication between frontend and backend
4. **Fallback Tests**: Verify graceful degradation works properly
5. **Performance Tests**: Measure response times under various loads

## Implementation Roadmap

### Phase 1: Basic Backend Setup (Week 1)
- Set up Python environment with FastAPI
- Define data models and API endpoints
- Create basic AIQToolkit workflow configuration

### Phase 2: Core Functionality (Week 2)
- Implement team strategy generation workflow
- Implement agent creation workflow
- Add basic frontend communication

### Phase 3: Enhanced Features (Week 3)
- Add WebSocket support for real-time updates
- Implement strategy adaptation workflow
- Enhance fallback mechanisms

### Phase 4: Polish and Testing (Week 4)
- Optimize performance
- Add comprehensive tests
- Create deployment configurations

## Future Enhancements
1. **Agent Memory**: Implement persistent memory for agents
2. **Multi-Team Tournaments**: Support for more than two teams
3. **Learning System**: Allow strategies to evolve based on past games
4. **Custom Workflows**: User-defined strategy templates
5. **Visualization Enhancements**: Advanced visualization of agent decision-making

## Resources and References
- [NVIDIA AIQToolkit Documentation](https://docs.nvidia.com/aiqtoolkit/latest/index.html)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Python Backend Handoff Instructions](./python_backend_handoff.md)
- [Stage 6 Implementation Plan](./stages/stage6_llm_spawners.md)