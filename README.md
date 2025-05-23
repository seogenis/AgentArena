# AI Territory Control Game

A browser-based strategic game where LLM-powered teams create and control AI agents competing for resources and territory.

## Project Status

Currently in development - Stage 6 in progress. See [CLAUDE.md](./CLAUDE.md) for detailed project status and current implementation stage.

## Getting Started

### Prerequisites

- Node.js (latest LTS recommended)
- NPM
- Python 3.11+ (for backend with AIQToolkit)
- Docker and Docker Compose (for containerized development)

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```
   npm install
   ```
3. Set up Python backend (required for Stage 6):
   ```
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   pip install -r requirements.txt
   ```

### Running the Game

#### Frontend Only (Stages 1-5)
```
npm start
```

#### Full Stack (Stage 6+)
```
docker-compose up
```

Then open your browser to http://localhost:3000

### Development Tools

```
# Take a screenshot of the game for debugging/documentation
npm run screenshot
```

This will save a screenshot as `debug-screenshot.png` in the project root.

## Controls

- WASD/Arrow keys: Move camera (when not following target)
- Q/E: Zoom in/out
- T: Toggle camera following the target
- F: Follow a random agent
- Left-click: Add Red team control to a cell
- Right-click: Add Blue team control to a cell
- A/R: Create a Red team collector agent
- Z: Create a Red team explorer agent 
- S/B: Create a Blue team collector agent
- X: Create a Blue team explorer agent
- O: Add obstacle at cursor position
- 1/2/3: Add resources (Energy/Materials/Data)
- C: Collect resource at cursor position
- L: Toggle LLM systems on/off
- G: Request a new strategy for Red team
- B: Request a new strategy for Blue team
- N: Request a new agent for Red team
- M: Request a new agent for Blue team
- P: Toggle combat on/off

### LLM API Configuration
To use the LLM system:
1. Set your API key using window.initializeAPI(your-key)
2. Disable mock responses with window.toggleMockResponses(false)
3. Reset services with window.reinitializeLLMServices()

## Project Structure

- `/src/engine/` - Core game engine components
  - `/agents/` - Agent system and behaviors
  - `/bases/` - Base camps and resource management
  - `/grid/` - Hexagonal grid system
  - `/llm/` - LLM integration components
  - `/resources/` - Resource system
  - `/utils/` - Combat and collision systems
  - `/world/` - World and territory systems
- `/src/game/` - Game-specific logic and components
- `/css/` - Styling
- `/plan/` - Project planning documents
- `/backend/` - Python backend with AIQToolkit (Stage 6)

## Development Roadmap

This game is being developed in stages:

1. Basic Rendering in 2D Game Window ✅
2. Game World Design with Resources ✅
3. Base Camps and Hardcoded Agents ✅
4. Agent Interactions and Game Mechanics ✅
5. LLM Team Spawners ✅
6. AIQToolkit Integration 🔄
7. Polish and Refinement ⬜

See the [plan directory](./plan/) for detailed plans for each stage.

## Documentation

- [Game Mechanics](./plan/game_mechanics.md)
- [Development Roadmap](./plan/development_roadmap.md)
- [AIQToolkit Integration Design](./plan/llm_aiqtoolkit_design.md)
- [Python Backend Handoff](./plan/python_backend_handoff.md)
- [JavaScript Frontend Handoff](./plan/javascript_frontend_handoff.md)

## Implementation Teams

For Stage 6 implementation, the project is divided into the following teams:

### Frontend Team
Responsible for modifying the JavaScript frontend to communicate with the Python backend and enhancing the visualization of team strategies and agent decisions.

### Backend Team
Responsible for implementing the Python backend with FastAPI and AIQToolkit, creating workflows for team strategy generation and agent creation.

### DevOps Team
Responsible for containerizing the frontend and backend, setting up environment variable management, and configuring CORS for secure communication.

## License

[MIT License](LICENSE)