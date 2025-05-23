# AI Territory Control Game Project Tracker

## Project Overview
Building a browser-based strategic game where LLM-powered teams create and control AI agents competing for resources and territory.

## Current Implementation Stage: Stage 6 - AIQToolkit Integration
Status: In Progress 🔄

## Current Todo List:
- [x] Set up Python backend with FastAPI and AIQToolkit
- [x] Design AIQToolkit workflows for team strategy generation
- [x] Create AIQToolkit workflows for agent creation and specialization
- [x] Implement REST API endpoints for frontend communication
- [ ] Modify JavaScript LLMService to communicate with Python backend
- [x] Add WebSocket support for real-time updates (optional)
- [ ] Enhance visualization of team strategies and agent decisions
- [ ] Implement fallback mechanism when backend is unavailable
- [x] Containerize frontend and backend for easier deployment

## Team Structure
The project is divided into three teams for Stage 6 implementation:

### Frontend Team
- Modify JavaScript LLMService to communicate with Python backend
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

## Implementation Resources
- [Python Backend Handoff](./plan/python_backend_handoff.md) - Detailed instructions for the backend team
- [JavaScript Frontend Handoff](./plan/javascript_frontend_handoff.md) - Detailed instructions for the frontend team
- [AIQToolkit Integration Design](./plan/llm_aiqtoolkit_design.md) - Architecture and design specifications

## Where Developers Should Start
- All developers should first read [Project Summary](./plan/project_summary.md) for an overview
- Then read [Stage 6 Implementation Guide](./plan/stage6_implementation_guide.md) for implementation details
- Frontend developers should focus on [JavaScript Frontend Handoff](./plan/javascript_frontend_handoff.md)
- Backend developers should focus on [Python Backend Handoff](./plan/python_backend_handoff.md)
- DevOps developers should focus on Docker configuration in the implementation guide

## Team Coordination
- **IMPORTANT**: Before beginning separate implementation, all teams must review the [Coordination Guidelines](./plan/coordination_guidelines.md)
- Schedule an initial joint planning session to define API contracts
- Follow the integration checkpoints defined in the coordination guidelines
- Maintain regular communication through the defined channels

## Backend Development Commands
- Setup Python environment: `python -m venv venv && source venv/bin/activate`
- Install dependencies: `pip install -r backend/requirements.txt`
- Run backend server: `cd backend && uvicorn app.main:app --reload`
- Run with Docker: `docker-compose up`
- Run backend tests: `cd backend && pytest`

## Completed:
- [x] Set up project repository
- [x] Create basic directory structure
- [x] Create main HTML file with canvas
- [x] Implement game engine with render and camera systems
- [x] Add debug grid and performance overlay
- [x] Add camera controls for testing
- [x] Fix gameLoop context binding issue
- [x] Complete Stage 1 - Basic Rendering
- [x] Implement hexagonal territory grid system
- [x] Create visual overlay for territory zones
- [x] Implement resource types (energy, materials, data)
- [x] Create resource spawning mechanics
- [x] Design and implement obstacles
- [x] Complete Stage 2 - Game World Design
- [x] Create base camps for each team
- [x] Implement resource collection and storage
- [x] Add agent creation and movement
- [x] Implement territory control mechanics
- [x] Complete Stage 3 - Base Camps and Agents
- [x] Implement agent-to-agent interactions
- [x] Add combat mechanics between agents
- [x] Enhance resource collection to affect agent attributes
- [x] Implement team-based resource allocation
- [x] Add victory condition checks
- [x] Complete Stage 4 - Game Mechanics
- [x] Set up LLM API integration with mock mode
- [x] Design team strategy prompt templates
- [x] Implement team-level LLM decision making
- [x] Create agent generation system based on LLM specifications
- [x] Develop resource allocation system for spawning
- [x] Add agent specialization and role assignment
- [x] Implement strategic agent deployment
- [x] Create fallback behaviors for API failures
- [x] Complete Stage 5 - LLM Team Spawners

## Development Commands
- Run locally: `npm start` (runs on http://localhost:3000)
- Take debug screenshot: `npm run screenshot` (saves as debug-screenshot.png)
- Run tests: [TBD]

## Testing Results:
- Combat mechanics: ✅ Pass - Agents engage in combat when encountering enemies
- Resource collection: ✅ Pass - Resources properly affect agent attributes
- Agent healing: ✅ Pass - Agents heal when near their base
- Combat visuals: ✅ Pass - Combat effects visible with appropriate team colors
- Victory conditions: ✅ Pass - Game declares winner when conditions are met
- Resource dropping: ✅ Pass - Dead agents drop resources they were carrying
- Visual feedback: ✅ Pass - Health bars and combat indicators are clear
- Territory control: ✅ Pass - Territory control properly influences victory condition
- Game reset: ✅ Pass - Game can be restarted after victory
- Combat toggle: ✅ Pass - Combat can be toggled on/off for testing
- LLM integration: ✅ Pass - LLM systems can be toggled on/off
- Team strategy: ✅ Pass - Teams can receive strategies from LLM
- Agent spawning: ✅ Pass - LLM can create specialized agents
- Agent behavior: ✅ Pass - Different agent roles follow distinct behaviors
- Resource priorities: ✅ Pass - Agents respect resource priorities set by LLM

## Testing Instructions:
1. Run the game with `npm start`
2. Open a browser and navigate to http://localhost:3000
3. Verify the canvas appears with hexagonal grid, resources, obstacles and team bases
4. Check that the FPS counter is displaying around 60 FPS
5. Test camera controls:
   - WASD/Arrow keys to move camera (when not following target)
   - Q/E to zoom in/out
   - T to toggle following a target
   - F to follow a random agent
6. Test team interaction:
   - Left-click to add Red team control to a cell
   - Right-click to add Blue team control to a cell
   - Press R to create a Red team agent
   - Press Z to create a Red team explorer agent
   - Press S to create a Blue team collector agent
   - Press X to create a Blue team explorer agent
7. Test combat system:
   - Press P to toggle combat on/off
   - Press H to test hit effect at cursor position
   - Press K to test death effect at cursor position
   - Create agents from both teams and observe them engage in combat
   - Observe health bars and attack indicators
8. Test resource interactions:
   - Press 1, 2, or 3 to add different resources (Energy, Materials, Data)
   - Press C to collect a resource manually
   - Observe agents collecting resources and returning to their bases
   - Kill an agent carrying resources to see resources drop
9. Test victory conditions:
   - Control 75% of territory to trigger territory control victory
   - Eliminate all agents of one team to trigger elimination victory
   - Accumulate 10x the resources of the opponent to trigger resource victory
   - Press R when game is over to restart the game
10. Test LLM features:
   - Press L to toggle LLM systems on/off
   - Press G to request a new strategy for Red team
   - Press B to request a new strategy for Blue team 
   - Press N to request a new agent for Red team
   - Press M to request a new agent for Blue team
   - Observe LLM-generated agents with different shapes and attributes
   - Compare behavior of different agent types (collector, explorer, defender, attacker)
11. For debugging or documentation:
   - Run `npm run screenshot` to capture the current game state
   - Check the debug-screenshot.png file in the project root
   - It is okay if things don't work or you don't know if test / screenshot worked, just make sure to inform the user

## Issues and Solutions:
- Fixed combat effect visualization issue
- Solution: Created a dedicated CombatSystem class to handle visual effects
- Added game reset functionality to restart after a victory
- Improved combat targeting to prefer enemies without resources
- Enhanced territory influence to affect victory conditions
- Handled browser environment limitations for API access
- Solution: Added mock response system for LLM API calls
- Fixed team ID inconsistency between numeric (1/2) and string ('red'/'blue') formats
- Solution: Added conversion methods to handle both formats consistently
- Created resilient agent pattern selection with fallbacks
- Solution: Added pattern validation and defaults in agent movement setup

## Stage 5 Implementation Notes:
- Implemented LLMService for API communication with fallback behaviors
- Created PromptTemplates system for team strategy and agent creation
- Developed TeamStrategySystem for team-level decision making
- Implemented SpawnerSystem for LLM-based agent creation
- Added SpawnScheduler to manage agent creation timing
- Created new agent roles: defender and attacker with specialized behaviors
- Enhanced Agent class to support LLM-defined attributes and resource priorities
- Added resource allocation system based on agent specifications
- Implemented specialized movement patterns for different agent roles
- Created unique visual representations for different agent types
- Added keyboard controls for testing LLM features
- Enhanced debug overlay to show team strategies
- Set up mock response system for development without API keys

## Stage 6 Implementation Notes:
- Set up Python backend with FastAPI and AIQToolkit integration
- Created AIQToolkit workflows for team strategy generation and agent creation
- Implemented REST API endpoints for frontend communication
- Added WebSocket support for real-time game state updates
- Implemented fallback mechanisms for when AIQToolkit fails
- Created Docker configuration for containerized deployment
- Set up testing framework for backend components
- Added support for team ID conversion between formats
- Designed robust error handling for backend services
- Created comprehensive documentation for backend usage

## Stage 6 Implementation Plan:
- Set up Python backend with FastAPI
- Integrate NVIDIA's AIQToolkit for enhanced agent coordination
- Create REST API endpoints for team strategy and agent creation
- Modify JavaScript frontend to communicate with Python backend
- Add fallback mechanisms for when backend is unavailable
- Enhance visualization of team strategies and agent decisions
- Containerize frontend and backend for easier deployment

## Next Stage Preparation:
- [ ] Prepare UI for displaying more detailed strategy information
- [ ] Add visual indicators for agent coordination
- [ ] Design improved debugging tools for backend communication
- [ ] Plan deployment architecture for multi-component system

## Next Stage: Final Stage - Polish and Refinement
Status: Not Started

## Todo List for Final Stage:
- [ ] Add visual indicators for LLM decision making
- [ ] Create better team strategy visualization
- [ ] Improve the UI for displaying team strategies
- [ ] Add agent status indicators (role, priority, etc.)
- [ ] Optimize performance with many agents
- [ ] Add game balance adjustments
- [ ] Enhance visual effects
- [ ] Add sound effects

## Stage Progression
- ✅ Stage 1: Basic Rendering in 2D Game Window
- ✅ Stage 2: Game World Design with Resources
- ✅ Stage 3: Base Camps and Hardcoded Agents
- ✅ Stage 4: Agent Interactions and Game Mechanics
- ✅ Stage 5: LLM Team Spawners
- 🔄 Stage 6: AIQToolkit Integration
- ⬜ Final Stage: Polish and Refinement

> **Note**: Stage progression has been revised. Original stages 5 (LLM Agent Piloting) and 6 (LLM Team Spawners) were consolidated into Stage 5. Stage 6 now focuses on integrating NVIDIA's AIQToolkit via a Python backend to enable more sophisticated agent behaviors and team strategies.

## Notes for Claude
- When starting a new stage, update this file with the stage's todo list
- Mark tasks as complete as they are finished
- Record issues and solutions encountered
- Document testing results for stage criteria
- Use `npm run screenshot` to capture visual state when reporting visual issues or documenting progress
- Update stage status as appropriate
- When asked to look at "relevant .md files", read from plan/game_mechanics.md, plan/development_roadmap.md, and plan/stages/overview.md

## Safety Guidelines
- Do not propose "drastic" commands such as changing permissions or deleting from root