# AI Territory Game - Python Backend

This is the Python backend component for the AI Territory Control Game, using NVIDIA's AIQToolkit to enhance agent behaviors and team strategies.

## Directory Structure

Create the following directory structure for the backend:

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

4. **Run the application**
   ```bash
   uvicorn app.main:app --reload
   ```

5. **Access the API documentation**
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

## API Endpoints

### Team Strategy
```
POST /api/team-strategy
```
Generates a team strategy based on the current game state.

### Agent Specification
```
POST /api/agent-specification
```
Creates a specialized agent specification based on team needs.

## WebSocket Support (Optional)

Connect to the WebSocket endpoint for real-time updates:
```
ws://localhost:8000/ws/{client_id}
```

## Testing

Run the tests with pytest:
```bash
pytest
```

## AIQToolkit Workflows

The backend uses NVIDIA's AIQToolkit to create workflows for team strategy generation and agent creation. These workflows are defined in YAML files in the `app/workflows/` directory.

## Implementation Details

For detailed implementation instructions, refer to these documents:
- [Python Backend Handoff](./python_backend_handoff.md)
- [AIQToolkit Integration Design](./llm_aiqtoolkit_design.md)
- [Stage 6 Implementation Guide](./stage6_implementation_guide.md)

## Communication with Frontend

The backend communicates with the JavaScript frontend via REST API endpoints and optionally WebSockets. The frontend sends game state information, and the backend responds with team strategies and agent specifications.

## Development Team

The backend is implemented by the Backend Team as part of Stage 6 of the AI Territory Control Game project. For more information about the team structure and responsibilities, see the [Stage 6 Implementation Guide](./stage6_implementation_guide.md).