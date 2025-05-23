# AI Territory Game - Python Backend

This is the Python backend for the AI Territory Control Game, using NVIDIA's AIQToolkit to enhance agent behaviors and team strategies.

## Directory Structure

```
backend/
├── app/
│   ├── main.py            # FastAPI application entry point
│   ├── api/               # API endpoints
│   │   ├── __init__.py
│   │   ├── strategy.py    # Strategy endpoints
│   │   └── agent.py       # Agent endpoints
│   ├── schemas/           # Data models
│   │   ├── __init__.py
│   │   ├── game_state.py  # Game state models
│   │   ├── strategy.py    # Strategy models
│   │   └── agent_spec.py  # Agent specification models
│   ├── services/          # Business logic
│   │   ├── __init__.py
│   │   ├── strategy_service.py  # Strategy generation
│   │   └── agent_service.py     # Agent creation
│   └── workflows/         # AIQToolkit workflows
│       ├── team_strategy.yaml   # Team strategy workflow
│       └── agent_creation.yaml  # Agent creation workflow
├── tests/                 # Backend tests
│   ├── __init__.py
│   ├── test_api.py        # API tests
│   └── test_services.py   # Service tests
├── Dockerfile             # Docker configuration
└── requirements.txt       # Python dependencies
```

## Setup Instructions

### Environment Setup

1. **Create a Python virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```
   OPENAI_API_KEY=your_api_key_here
   ENVIRONMENT=development
   LOG_LEVEL=debug
   ```

### Running the Application

1. **Start the FastAPI server**
   ```bash
   uvicorn app.main:app --reload
   ```

2. **Access the API documentation**
   Open your browser and navigate to:
   - http://localhost:8000/docs - Swagger UI
   - http://localhost:8000/redoc - ReDoc UI

## Docker Support

To run the backend with Docker:

1. **Build the Docker image**
   ```bash
   docker build -t ai-territory-backend .
   ```

2. **Run the container**
   ```bash
   docker run -p 8000:8000 -e OPENAI_API_KEY=your_api_key_here ai-territory-backend
   ```

## Using Docker Compose

To run both frontend and backend together:

1. **Create a docker-compose.yml file in the project root**
   
2. **Run the compose setup**
   ```bash
   docker-compose up
   ```

## API Endpoints

### Team Strategy
```
POST /api/team-strategy
```
Generates a team strategy based on the current game state.

Example request:
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

Example response:
```json
{
  "strategy": "aggressive",
  "focus": "territory",
  "priorities": ["expand_territory", "attack_enemies", "collect_energy"],
  "description": "Aggressive expansion focusing on territory control and eliminating enemy agents."
}
```

### Agent Specification
```
POST /api/agent-specification
```
Creates a specialized agent specification based on team needs.

Example request:
```json
{
  "team_id": "blue",
  "strategy": {
    "strategy": "defensive",
    "focus": "resources",
    "priorities": ["collect_energy", "defend_territory"]
  },
  "resources": {"energy": 40, "materials": 35, "data": 25},
  "current_agents": [
    {"type": "collector", "count": 3},
    {"type": "explorer", "count": 2}
  ]
}
```

Example response:
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

## WebSocket Support

Connect to the WebSocket endpoint for real-time updates:
```
ws://localhost:8000/ws/{client_id}
```

Send game state updates as JSON and receive strategic directives in response.

## Testing

Run the tests with pytest:
```bash
pytest
```

## AIQToolkit Workflows

The backend uses NVIDIA's AIQToolkit to create workflows for team strategy generation and agent creation. These workflows are defined in YAML files in the `app/workflows/` directory.

## Troubleshooting

### CORS Errors
- Verify that the frontend URL is included in the CORS middleware configuration
- Check that the correct headers and methods are allowed

### AIQToolkit Issues
- Ensure you have a valid OpenAI API key in your .env file
- Check that the workflow YAML files are properly formatted
- Verify that you have the correct version of AIQToolkit installed

### Connection Issues
- Make sure the backend is running on the expected port (8000)
- Check for any firewall or network restrictions
- Verify environment variable configuration