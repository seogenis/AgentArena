# AI Territory Control Game Project Tracker

## Project Overview
Building a browser-based strategic game where LLM-powered teams create and control AI agents competing for resources and territory.

## Current Implementation Stage: Stage 5 - LLM Team Spawners
Status: Completed ✅

## Current Todo List:
- [x] Set up LLM API integration
- [x] Design team strategy prompt templates
- [x] Implement team-level LLM integration
- [x] Create agent generation system based on LLM specifications
- [x] Develop resource allocation system for spawning
- [x] Add agent specialization and role assignment
- [x] Implement strategic agent deployment
- [x] Create fallback behaviors for API failures

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

## Next Stage Preparation:
- [ ] Enhance game visualization to show LLM decisions
- [ ] Add more complex strategy patterns
- [ ] Design improved UI for LLM status
- [ ] Optimize game performance

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
- 🔄 Final Stage: Polish and Refinement

> **Note**: Stage progression has been revised. Original stages 5 (LLM Agent Piloting) and 6 (LLM Team Spawners) have been consolidated into a single Stage 5 focusing on LLM team spawners. Agent behavior will continue to use hardcoded patterns.

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
