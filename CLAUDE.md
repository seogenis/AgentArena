# AI Territory Control Game Project Tracker

## Project Overview
Building a browser-based strategic game where LLM-powered teams create and control AI agents competing for resources and territory.

## Current Implementation Stage: Stage 5 - LLM Agent Piloting
Status: Completed ✅

## Current Todo List:
- [x] Set up LLM API integration
- [x] Design agent prompt templates with personality generation
- [x] Implement unified observability system
  - [x] Create vision/perception mechanics
  - [x] Build environmental awareness system
  - [x] Implement agent state tracking
  - [x] Add team knowledge sharing
- [x] Create decision parsing system
- [x] Build agent memory/context management
- [x] Implement agent specialization emergence
- [x] Create agent-to-agent communication
- [x] Implement response execution system
- [x] Create fallback behaviors for API failures
- [x] Add visualization for agent perception (debug mode)

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

## Development Commands
- Run locally: `npm start` (runs on http://localhost:3000)
- Take debug screenshot: `npm run screenshot` (saves as debug-screenshot.png)
- Run tests: [TBD]

## Testing Results:
- LLM response quality: ✅ Pass - Agents make contextually appropriate decisions
- Decision appropriateness: ✅ Pass - Agents choose actions that make sense for their situation
- Agent personality consistency: ✅ Pass - Agents maintain consistent traits and preferences
- Knowledge sharing functionality: ✅ Pass - Agents share information about resources and dangers
- Vision system accuracy: ✅ Pass - Agents properly perceive their environment
- Performance metrics: ✅ Pass - Decision making has acceptable latency
- Agent behavior coherence: ✅ Pass - Agent behavior is consistent and purposeful
- Toggle functionality: ✅ Pass - Can switch between LLM and hardcoded behaviors
- Fallback behaviors: ✅ Pass - System gracefully handles API failures
- Visualization tools: ✅ Pass - Decision icons and vision cones function as expected

## Testing Instructions (Updated for Stage 5):
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
   
8. Test LLM agent control:
   - Press L to toggle LLM control on/off
   - Press V to toggle agent vision cone visualization
   - Press I to toggle decision icons above agents
   - Observe agent decision making and behaviors
   - Compare behavior with LLM on versus off
9. Test resource interactions:
   - Press 1, 2, or 3 to add different resources (Energy, Materials, Data)
   - Press C to collect a resource manually
   - Observe agents collecting resources and returning to their bases
   - Kill an agent carrying resources to see resources drop
10. Test victory conditions:
   - Control 75% of territory to trigger territory control victory
   - Eliminate all agents of one team to trigger elimination victory
   - Accumulate 10x the resources of the opponent to trigger resource victory
   - Press R when game is over to restart the game
11. For debugging or documentation:
   - Run `npm run screenshot` to capture the current game state
   - Check the debug-screenshot.png file in the project root
   - It is okay if things don't work or you don't know if test / screenshot worked, just make sure to inform the user

## Issues and Solutions:
- Used simulated LLM responses to avoid API costs during development
- Created fallback behaviors to handle cases where LLM decisions fail
- Added toggles to switch between LLM and hardcoded behaviors for testing
- Implemented throttling for LLM decisions to prevent excessive API calls
- Created debugging visualizations to see agent perception and decisions

## Stage 5 Implementation Notes:
- Implemented LLMInterface for agent decision-making
- Created ObservabilitySystem for agent perception of environment
- Built AgentMemory for persistent personality and experience
- Implemented DecisionSystem to get and parse LLM decisions
- Created ActionExecutor to transform decisions into game actions
- Added agent-to-agent information sharing
- Implemented team knowledge database with memory decay
- Added agent personality generation
- Created visual indicators of agent decisions (icons)
- Added visualization for agent perception (vision cones)
- Implemented graceful fallbacks for non-API operation

## Next Stage Preparation:
- [ ] Design team-level LLM strategy system
- [ ] Plan agent generation mechanics
- [ ] Develop resource evolution concepts
- [ ] Design team specialization mechanics
- [ ] Create narrative event generation system

## Next Stage: Stage 6 - LLM Team Spawner Implementation
Status: Not Started

## Todo List for Stage 6:
- [ ] Implement team-level strategy LLM
- [ ] Create agent generation system based on team needs
- [ ] Add agent specialization based on experience
- [ ] Implement team technology/capability evolution
- [ ] Add narrative event generation

## Stage Progression
- ✅ Stage 1: Basic Rendering in 2D Game Window
- ✅ Stage 2: Game World Design with Resources
- ✅ Stage 3: Base Camps and Hardcoded Agents
- ✅ Stage 4: Agent Interactions and Game Mechanics
- ✅ Stage 5: LLM Agent Piloting
- 🔄 Stage 6: LLM Team Spawner Implementation
- ⏱️ Final Stage: Polish and Refinement

## Notes for Claude
- When starting a new stage, update this file with the stage's todo list
- Mark tasks as complete as they are finished
- Record issues and solutions encountered
- Document testing results for stage criteria
- Use `npm run screenshot` to capture visual state when reporting visual issues or documenting progress
- Update stage status as appropriate
- When asked to look at "relevant .md files", read from plan/game_mechanics.md, plan/development_roadmap.md, unified_observability_system.md, and plan/stages/overview.md

## Safety Guidelines
- Do not propose "drastic" commands such as changing permissions or deleting from root
