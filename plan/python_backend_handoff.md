# Python Backend Handoff Instructions

## Overview

Welcome to the AI Territory Control Game project! You'll be implementing the Python backend service using NVIDIA's Agent Intelligence Toolkit (AIQToolkit) to enhance our existing JavaScript game with more sophisticated agent behaviors and team strategies.

This document provides step-by-step instructions for setting up the development environment and implementing the core components of the Python backend.

## Project Structure

```
ai-territory-game/
├── frontend/          # Existing JavaScript game
│   ├── css/
│   ├── src/
│   │   ├── engine/    # Game engine
│   │   ├── game/      # Game logic
│   │   └── ...
│   ├── index.html
│   └── package.json
│
└── backend/           # New Python backend (to be implemented)
    ├── app/
    │   ├── main.py    # FastAPI application entry point
    │   ├── api/       # API endpoints
    │   ├── schemas/   # Pydantic models for data validation
    │   ├── workflows/ # AIQToolkit workflow configurations
    │   └── services/  # Business logic services
    ├── tests/         # Backend tests
    ├── requirements.txt
    └── Dockerfile
```

## Prerequisites

1. Python 3.11 or 3.12
2. [NVIDIA AIQToolkit](https://github.com/NVIDIA/AIQToolkit)
3. Docker and Docker Compose (for containerized development)
4. Git
5. An OpenAI API key (or another LLM provider supported by AIQToolkit)

## Development Timeline

Your expected timeline for implementing the backend is:

| Week | Tasks |
|------|-------|
| Week 1 | Setup environment, create basic FastAPI app structure, define API models |
| Week 2 | Implement API endpoints, create basic AIQToolkit workflows |
| Week 3 | Complete service layer implementation, add WebSocket support |
| Week 4 | Testing, debugging, containerization, documentation |

## Setup Steps

Follow these steps carefully to set up your development environment:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-territory-game
```

### 2. Create a Python Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

### 3. Install the AIQToolkit and Dependencies

```bash
pip install aiqtoolkit fastapi uvicorn python-dotenv pydantic websockets
pip install aiqtoolkit[langchain]  # Install LangChain plugin
pip install pytest pytest-asyncio httpx  # Testing dependencies
```

### 4. Set Up Environment Variables

Create a `.env` file in the backend directory:

```
OPENAI_API_KEY=your_api_key_here
ENVIRONMENT=development
LOG_LEVEL=debug
```

### 5. Verify the Installation

```bash
python -c "import aiq; print(f'AIQToolkit version: {aiq.__version__}')"
```

## Implementation Steps

Follow these steps in order to implement the Python backend:

### Step 1: Create Basic FastAPI Application

Create the `backend/app/main.py` file:

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

Test that the application runs:

```bash
cd backend
python app/main.py
```

Visit http://localhost:8000 in your browser - you should see the message "AI Territory Game Backend is running".

### Step 2: Define API Models

Create the following files for your data models:

#### File: `backend/app/schemas/game_state.py`

```python
from pydantic import BaseModel
from typing import Dict, List, Optional

class Resource(BaseModel):
    energy: int
    materials: int
    data: int

class Agent(BaseModel):
    id: int
    type: str
    health: float
    x: float
    y: float
    # Add other relevant attributes

class GameState(BaseModel):
    team_id: str
    territory_control: Dict[str, float]
    resources: Dict[str, Resource]
    agents: Dict[str, List[Agent]]
    resource_distribution: Dict[str, int]
```

#### File: `backend/app/schemas/strategy.py`

```python
from pydantic import BaseModel
from typing import List

class TeamStrategy(BaseModel):
    strategy: str
    focus: str
    priorities: List[str]
    description: str
```

#### File: `backend/app/schemas/agent_spec.py`

```python
from pydantic import BaseModel
from typing import Dict

class AgentAttributes(BaseModel):
    speed: float
    health: float
    attack: float
    defense: float
    carryCapacity: float

class AgentSpecification(BaseModel):
    role: str
    attributes: AgentAttributes
    priority: str
    description: str
```

### Step 3: Create AIQToolkit Workflows

Create the directory for workflow files:

```bash
mkdir -p backend/app/workflows
```

#### File: `backend/app/workflows/team_strategy.yaml`

```yaml
name: team_strategy
description: Generate team strategy based on game state
entities:
  llm:
    type: aiq.llms.openai
    config:
      model: gpt-4-turbo
  team_strategy_prompt:
    type: aiq.prompts.simple_prompt
    config:
      template: |
        You are the strategic AI for the {{team_id}} team in a resource-based territory control game.
        
        CURRENT GAME STATE:
        - Your team controls {{territory_control[team_id]}}% of the map
        - The opponent team controls {{territory_control[opponent_id]}}% of the map
        - Your team has {{agents[team_id]|length}} agents
        - The opponent team has {{agents[opponent_id]|length}} agents
        - Resource counts for your team: Energy: {{resources[team_id].energy}}, Materials: {{resources[team_id].materials}}, Data: {{resources[team_id].data}}
        
        Your task is to determine the optimal strategy for your team.
workflow:
  steps:
    - id: generate_strategy
      entity: llm
      config:
        prompt: $team_strategy_prompt
        temperature: 0.7
      outputs:
        - strategy
  outputs:
    - strategy
```

#### File: `backend/app/workflows/agent_creation.yaml`

```yaml
name: agent_creation
description: Create specialized agent based on team needs
entities:
  llm:
    type: aiq.llms.openai
    config:
      model: gpt-4-turbo
  agent_creation_prompt:
    type: aiq.prompts.simple_prompt
    config:
      template: |
        You are designing a specialized agent for the {{team_id}} team in a territory control game.
        
        TEAM STRATEGY:
        - Overall strategy: {{strategy.strategy}}
        - Strategic focus: {{strategy.focus}}
        
        AVAILABLE RESOURCES:
        - Energy: {{resources.energy}}
        - Materials: {{resources.materials}}
        - Data: {{resources.data}}
        
        CURRENT AGENT COMPOSITION:
        {% for agent_type in current_agents %}
        - {{agent_type.type}}: {{agent_type.count}} agents
        {% endfor %}
        
        Design a new agent with the following attributes (values must be between 0.0 and 1.0):
        - Speed: Movement speed (higher = faster)
        - Health: Hit points (higher = more health)
        - Attack: Combat strength (higher = more damage)
        - Defense: Damage reduction (higher = more protection)
        - CarryCapacity: Resource carrying ability (higher = carries more)
        
        The sum of all attributes should not exceed 3.0.
workflow:
  steps:
    - id: create_agent
      entity: llm
      config:
        prompt: $agent_creation_prompt
        temperature: 0.7
      outputs:
        - agent
  outputs:
    - agent
```

### Step 4: Implement Service Layer

Create the following service files:

#### File: `backend/app/services/strategy_service.py`

```python
import aiq
from ..schemas.game_state import GameState
from ..schemas.strategy import TeamStrategy
import json
import os

async def generate_team_strategy(game_state: GameState) -> TeamStrategy:
    """Generate team strategy based on current game state"""
    # Prepare data for the workflow
    opponent_id = "blue" if game_state.team_id == "red" else "red"
    workflow_input = {
        "team_id": game_state.team_id,
        "opponent_id": opponent_id,
        "territory_control": game_state.territory_control,
        "agents": game_state.agents,
        "resources": game_state.resources,
    }
    
    # Load and run workflow
    workflow_path = os.path.join(os.path.dirname(__file__), 
                               "../workflows/team_strategy.yaml")
    workflow = aiq.workflows.get_workflow(workflow_path)
    result = workflow.run(input=workflow_input)
    
    # Parse result and return TeamStrategy
    strategy_data = json.loads(result.strategy)
    return TeamStrategy(**strategy_data)
```

#### File: `backend/app/services/agent_service.py`

```python
import aiq
from ..schemas.agent_spec import AgentSpecification
import json
import os

async def generate_agent_specification(request_data: dict) -> AgentSpecification:
    """Generate specialized agent specification based on team needs"""
    # Load and run workflow
    workflow_path = os.path.join(os.path.dirname(__file__), 
                               "../workflows/agent_creation.yaml")
    workflow = aiq.workflows.get_workflow(workflow_path)
    result = workflow.run(input=request_data)
    
    # Parse result and return AgentSpecification
    agent_data = json.loads(result.agent)
    return AgentSpecification(**agent_data)
```

### Step 5: Implement API Endpoints

Create the API router files:

#### File: `backend/app/api/strategy.py`

```python
from fastapi import APIRouter, HTTPException
from ..schemas.game_state import GameState
from ..schemas.strategy import TeamStrategy
from ..services.strategy_service import generate_team_strategy

router = APIRouter(prefix="/api", tags=["strategy"])

@router.post("/team-strategy", response_model=TeamStrategy)
async def team_strategy(game_state: GameState):
    """Generate team strategy based on current game state"""
    try:
        strategy = await generate_team_strategy(game_state)
        return strategy
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### File: `backend/app/api/agent.py`

```python
from fastapi import APIRouter, HTTPException
from ..schemas.agent_spec import AgentSpecification
from ..services.agent_service import generate_agent_specification

router = APIRouter(prefix="/api", tags=["agent"])

@router.post("/agent-specification", response_model=AgentSpecification)
async def agent_specification(request_data: dict):
    """Generate specialized agent specification based on team needs"""
    try:
        agent_spec = await generate_agent_specification(request_data)
        return agent_spec
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### Update `backend/app/main.py` to include the routers:

Add these imports at the top:

```python
from .api import strategy, agent
```

Add these lines before the `if __name__ == "__main__"` block:

```python
# Include API routers
app.include_router(strategy.router)
app.include_router(agent.router)
```

### Step 6: Implement WebSocket Support (Optional)

Update `backend/app/main.py` to add WebSocket support:

```python
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Process game state and generate response
            game_state = json.loads(data)
            # TODO: Generate directives using AIQToolkit
            directives = {"message": "Received game state"}  # Placeholder
            await manager.send_personal_message(json.dumps(directives), client_id)
    except WebSocketDisconnect:
        manager.disconnect(client_id)
```

### Step 7: Add Docker Configuration

#### File: `backend/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### File: `docker-compose.yml` (root directory)

```yaml
version: '3'
services:
  frontend:
    image: node:18-alpine
    volumes:
      - ./frontend:/app
      - /app/node_modules
    working_dir: /app
    command: npm start
    ports:
      - "3000:3000"
    environment:
      - API_ENDPOINT=http://backend:8000/api

  backend:
    build:
      context: ./backend
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
```

#### File: `backend/requirements.txt`

```
fastapi==0.110.0
uvicorn==0.27.1
pydantic==2.6.1
python-dotenv==1.0.0
websockets==12.0
aiqtoolkit==0.1.0  # Use the correct version of AIQToolkit
pytest==7.4.0
pytest-asyncio==0.21.1
httpx==0.25.2
```

### Step 8: Create Tests

#### File: `backend/tests/test_strategy_service.py`

```python
import pytest
from app.schemas.game_state import GameState, Resource, Agent
from app.services.strategy_service import generate_team_strategy
from typing import Dict, List

@pytest.mark.asyncio
async def test_generate_team_strategy():
    # Create a mock game state
    game_state = GameState(
        team_id="red",
        territory_control={"red": 45, "blue": 55},
        resources={
            "red": Resource(energy=50, materials=30, data=20), 
            "blue": Resource(energy=40, materials=35, data=25)
        },
        agents={
            "red": [Agent(id=1, type="collector", health=100, x=100, y=100)],
            "blue": [Agent(id=2, type="explorer", health=90, x=200, y=200)]
        },
        resource_distribution={"energy": 10, "materials": 8, "data": 12}
    )
    
    # Mock the AIQToolkit workflow call
    # This requires setting up a proper testing framework with mocks
    
    # For now, we'll just check that the function doesn't throw an error
    # In a real test, you would mock the AIQToolkit call and verify the response
    try:
        # strategy = await generate_team_strategy(game_state)
        # assert strategy.strategy in ["balanced", "aggressive", "defensive", "economic"]
        pass
    except Exception as e:
        pytest.fail(f"generate_team_strategy raised an exception: {e}")
```

#### File: `backend/tests/test_api.py`

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "AI Territory Game Backend is running"}

# Add more API tests here
```

## Running the Backend

### Development Mode

```bash
cd backend
uvicorn app.main:app --reload
```

### Docker Mode

```bash
docker-compose up
```

### Accessing API Documentation

Open your browser and navigate to:
- http://localhost:8000/docs - Swagger UI
- http://localhost:8000/redoc - ReDoc UI

## Testing Guide

### Running Tests

```bash
cd backend
pytest
```

### Testing API Endpoints Manually

You can use the Swagger UI (http://localhost:8000/docs) to test API endpoints directly.

Sample team strategy request body:

```json
{
  "team_id": "red",
  "territory_control": {"red": 45, "blue": 55},
  "resources": {
    "red": {"energy": 50, "materials": 30, "data": 20},
    "blue": {"energy": 40, "materials": 35, "data": 25}
  },
  "agents": {
    "red": [{"id": 1, "type": "collector", "health": 100, "x": 100, "y": 100}],
    "blue": [{"id": 2, "type": "explorer", "health": 90, "x": 200, "y": 200}]
  },
  "resource_distribution": {"energy": 10, "materials": 8, "data": 12}
}
```

## Integration with Frontend

The JavaScript frontend will need to be modified to communicate with your Python backend. The main changes will be in the `LLMService.js` file.

Here's a simplified example of how the frontend will communicate with your backend:

```javascript
async requestTeamStrategy(teamId, gameState) {
    try {
        const response = await fetch('http://localhost:8000/api/team-strategy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                team_id: teamId,
                territory_control: gameState.territoryControl,
                resources: gameState.resources,
                agents: gameState.agents,
                resource_distribution: gameState.resourceDistribution
            })
        });
        
        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Strategy API error:', error);
        // Fallback to local implementation
        return this.generateFallbackStrategy(teamId, gameState);
    }
}
```

## Common Issues and Solutions

### 1. CORS Errors

**Symptoms**: Frontend cannot connect to backend, browser console shows CORS errors.

**Solution**: 
- Verify CORS middleware configuration in main.py
- Make sure allowed_origins includes your frontend URL
- Check that headers and methods are properly configured

### 2. AIQToolkit Workflow Loading Issues

**Symptoms**: Error when trying to load workflows.

**Solution**:
- Check workflow file paths
- Verify YAML syntax
- Make sure AIQToolkit is properly installed

### 3. API Key Authentication

**Symptoms**: Authentication errors when calling LLM services.

**Solution**:
- Verify that the OPENAI_API_KEY environment variable is set
- Check .env file configuration
- Make sure API key is valid and has sufficient credits

### 4. JSON Serialization Issues

**Symptoms**: Error when trying to parse JSON data.

**Solution**:
- Check the format of LLM responses
- Ensure responses match expected schemas
- Add better error handling and validation

## Progress Tracking

Keep track of your progress with this checklist:

- [ ] Basic FastAPI application setup
- [ ] API models defined
- [ ] AIQToolkit workflows created
- [ ] Service layer implementation
- [ ] API endpoints implemented
- [ ] WebSocket support (optional)
- [ ] Docker configuration
- [ ] Tests written and passing
- [ ] Documentation completed
- [ ] Frontend integration tested

## Resources

- [AIQToolkit Documentation](https://docs.nvidia.com/aiqtoolkit/latest/index.html)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Docker Documentation](https://docs.docker.com/)

Good luck with the implementation! If you have any questions, feel free to reach out to the senior team members.