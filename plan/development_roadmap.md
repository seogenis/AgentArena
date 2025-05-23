# Development Process and Testing Checkpoints

This document outlines the incremental development process for the AI Territory Control Game, with specific testing checkpoints to ensure functionality before proceeding to the next phase.

## Project Overview

The AI Territory Control Game is a browser-based strategic game where LLM-powered teams create and control AI agents competing for resources and territory. The project combines several technologies:

- JavaScript frontend for game rendering and mechanics
- LLM integration for team strategy and agent generation
- Python backend with NVIDIA's AIQToolkit (Stage 6)
- REST API and WebSockets for communication

The project is currently in **Stage 6 - AIQToolkit Integration**, which enhances the existing JavaScript game with a Python backend using NVIDIA's AIQToolkit for more sophisticated agent behaviors and team strategies.

## Development Philosophy

1. **Incremental Implementation**: Build the game in small, testable increments
2. **Regular Testing**: Verify functionality at each checkpoint before proceeding
3. **User Feedback Integration**: Incorporate user feedback at key milestones
4. **Maintain Compatibility**: Ensure the game continues to work in the browser at all times
5. **Stage-Based Approach**: Follow the staged implementation plan with clear stopping points

## Technology Stack

### Frontend
- HTML5 Canvas for 2D rendering
- JavaScript/TypeScript for game logic
- RequestAnimationFrame for game loop
- Web browser as the runtime environment

### Backend (Stage 6)
- Python with FastAPI for REST API and WebSockets
- NVIDIA AIQToolkit for agent coordination
- Docker for containerization
- Optional Redis for caching

### Game Engine Components
- Custom-built 2D rendering system
- Physics system for agent movement and collisions
- Resource management system
- Territory control visualization (possibly using heat maps)

### LLM Integration
- API integration with LLM providers (Claude, GPT, etc.)
- Prompt engineering for agent behavior and team strategy
- Context/memory management for agents
- AIQToolkit for enhanced agent coordination (Stage 6)

### Development Tools
- Unit testing framework (Jest or similar)
- Browser compatibility testing
- Performance monitoring tools (FPS counter, etc.)
- Docker and Docker Compose for containerized development

## Current Project Structure

```
ai-territory-game/
├── frontend/          # JavaScript game
│   ├── css/           # Styling
│   ├── src/           # Source code
│   │   ├── engine/    # Game engine components
│   │   │   ├── llm/   # LLM integration
│   │   │   └── ...    # Other engine components
│   │   └── game/      # Game-specific logic
│   └── index.html     # Main HTML file
│
├── backend/           # Python backend (Stage 6)
│   ├── app/           # FastAPI application
│   │   ├── api/       # API endpoints
│   │   ├── schemas/   # Data models
│   │   ├── services/  # Business logic
│   │   └── workflows/ # AIQToolkit workflows
│   └── tests/         # Backend tests
│
├── plan/              # Project planning documents
│   ├── stages/        # Stage-specific plans
│   └── ...            # Other planning documents
│
└── docker-compose.yml # Container orchestration
```

## Implementation Stages

See the [Stages Directory](./stages/) for detailed breakdown of:
- [Stage 1: Basic Rendering in 2D Game Window](./stages/stage1_basic_rendering.md) ✅
- [Stage 2: Game World Design with Resources](./stages/stage2_game_world.md) ✅
- [Stage 3: Base Camps and Hardcoded Agents](./stages/stage3_bases_and_agents.md) ✅
- [Stage 4: Agent Interactions and Game Mechanics](./stages/stage4_game_mechanics.md) ✅
- [Stage 5: LLM Team Spawners](./stages/stage5_llm_spawners.md) ✅
- [Stage 6: AIQToolkit Integration](./stages/stage6_llm_spawners.md) 🔄
- [Final Stage: Polish and Refinement](./stages/stage7_polish.md) ⬜

> **Note**: The original plan has been revised to include NVIDIA's AIQToolkit integration. The initial consolidation of Stages 5 and 6 focused on LLM team spawners with hardcoded agent behaviors. The new Stage 6 adds a Python backend using NVIDIA's AIQToolkit to enable more sophisticated agent behaviors and team strategies, creating a hybrid JavaScript/Python architecture.

## Team Structure

The project is divided into three teams for Stage 6 implementation:

### Frontend Team
- Update LLMService to communicate with Python backend
- Implement fallback mechanism for when backend is unavailable
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

- [Python Backend Handoff](./python_backend_handoff.md) - Detailed instructions for the backend team
- [JavaScript Frontend Handoff](./javascript_frontend_handoff.md) - Detailed instructions for the frontend team
- [AIQToolkit Integration Design](./llm_aiqtoolkit_design.md) - Architecture and design specifications

## Development Tracking

Progress is tracked in CLAUDE.md at the root of the project, including:
- Current stage status
- Todo items for current stage
- Completed items
- Testing results
- Issues and solutions

## Development Phases and Checkpoints

### Phase 1: Core Systems Setup

1. **Territory System Implementation** ✅
   - Implement basic grid-based territory zones
   - CHECKPOINT: Visual verification of territory grid overlay
   - TEST: Unit tests for zone creation and ownership state changes

2. **Resource System Implementation** ✅
   - Create resource types and spawning mechanism
   - CHECKPOINT: Visual verification of resources appearing on map
   - TEST: Unit tests for resource creation, collection logic

3. **Base Camp Implementation** ✅
   - Create red and blue team base structures
   - CHECKPOINT: Visual verification of bases on opposite corners
   - TEST: Unit tests for base camp functionality

### Phase 2: Agent Enhancements

4. **Team-Based Agent Creation** ✅
   - Modify agent system to include team affiliations
   - CHECKPOINT: Visual verification of red and blue agents
   - TEST: Unit tests for team-specific agent generation

5. **Agent Resource Collection** ✅
   - Implement resource collection and carrying mechanics
   - CHECKPOINT: UI visualization of agents collecting and returning resources
   - TEST: Unit tests for resource collection and storage

6. **Territory Control Mechanics** ✅
   - Implement agent influence on territory zones
   - CHECKPOINT: Visual verification of zone capture mechanics
   - TEST: Unit tests for territory influence calculations

### Phase 3: LLM Integration

7. **Enhanced Agent Creation** ✅
   - Implement LLM-based team-specific agent generation
   - CHECKPOINT: Console verification of LLM prompts and responses
   - TEST: Unit tests for agent creation with mock LLM responses

8. **Team Strategy Layer** ✅
   - Implement team-level strategy via LLM
   - CHECKPOINT: Verification of strategy recommendations
   - TEST: Unit tests for strategy generation with mock data

### Phase 4: AIQToolkit Integration (Current)

9. **Python Backend Setup** 🔄
   - Implement FastAPI application with AIQToolkit
   - CHECKPOINT: Verification of API endpoints
   - TEST: Unit tests for backend functionality

10. **Frontend-Backend Communication** 🔄
    - Modify JavaScript to communicate with Python backend
    - CHECKPOINT: Verification of successful API calls
    - TEST: Integration tests for communication

11. **Enhanced Team Strategies** 🔄
    - Implement AIQToolkit workflows for strategy generation
    - CHECKPOINT: Comparison of strategies with previous implementation
    - TEST: Verification of strategy quality and diversity

### Phase 5: Polish and Refinement

12. **UI Improvements** ⬜
    - Enhance visualization and control interfaces
    - CHECKPOINT: User testing of interface clarity and functionality
    - TEST: Automated UI tests for key functions

13. **Performance Optimization** ⬜
    - Optimize rendering and calculation systems
    - CHECKPOINT: FPS monitoring during gameplay
    - TEST: Performance benchmarks in different scenarios

14. **Balance and Gameplay** ⬜
    - Fine-tune game mechanics and agent behaviors
    - CHECKPOINT: Game session testing with varied strategies
    - TEST: Simulation of different game scenarios

## Testing Methodology

### Unit Testing
- Each system component should have dedicated unit tests
- Tests should verify both expected behavior and edge cases
- Mock external dependencies (like LLM APIs) for deterministic testing

### Integration Testing
- Test interactions between multiple systems
- Verify that systems work together as expected
- Test the complete game loop with all systems active

### Visual Verification
- Screenshots of key visual elements
- Verification of animation and effects
- UI element positioning and interaction

### User Testing
- Manual testing of game mechanics
- Verification of game feel and responsiveness
- Testing in different browsers and screen sizes

## Testing Checkpoints

At each checkpoint, the following process should be followed:

1. **Run Unit Tests**: Execute automated tests for the relevant components
2. **Visual Verification**: Capture screenshots of the current state
3. **Console Verification**: Check logs for errors or unexpected behavior
4. **User Verification**: Allow user interaction to confirm functionality
5. **Documentation**: Update documentation with current status and findings

## Test Documentation

For each test checkpoint, document:

1. What was tested
2. Test results (pass/fail)
3. Screenshots or console logs
4. Issues identified
5. Actions taken to resolve issues

## Continuous Integration

- All tests should be automated where possible
- Tests should run automatically on code changes
- Test results should be visible to all developers