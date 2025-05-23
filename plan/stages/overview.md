# Implementation Stages Overview

This directory contains detailed plans for each implementation stage of the AI Territory Control Game. Each stage has its own markdown file with specific requirements, testing methods, and completion criteria.

## Project Big Picture

This project is building a browser-based strategic game where LLM-powered teams create and control AI agents competing for resources and territory. The game progresses through several implementation stages, each building upon the previous one:

1. **Basic Rendering** - Core game window and rendering setup
2. **Game World Design** - Hexagonal grid, resources, and obstacles
3. **Base Camps and Agents** - Team bases and basic agent behaviors
4. **Game Mechanics** - Combat, resource collection, victory conditions
5. **LLM Team Spawners** - LLM-based team strategy and agent generation
6. **AIQToolkit Integration** - Python backend with NVIDIA's AIQToolkit
7. **Polish and Refinement** - Visual enhancements and optimizations

We are currently implementing **Stage 6 - AIQToolkit Integration**, which introduces a Python backend using NVIDIA's AIQToolkit to enhance agent behaviors and team strategies.

## Current Architecture

### JavaScript Frontend (Existing)
- Game UI and rendering
- Basic game mechanics
- LLM integration for team strategy and agent generation

### Python Backend (New - Stage 6)
- FastAPI web server
- NVIDIA AIQToolkit integration
- Enhanced team strategy generation
- Sophisticated agent creation

### Communication
- REST API for strategy and agent generation
- Optional WebSockets for real-time updates
- Fallback to direct LLM calls when backend is unavailable

## Team Structure

The project is divided into three teams for Stage 6 implementation:

1. **Frontend Team**: Modifying JavaScript to communicate with Python backend
2. **Backend Team**: Implementing Python backend with AIQToolkit
3. **DevOps Team**: Containerization and deployment configuration

## Development Best Practices

1. **Stage Tracking**: 
   - Update CLAUDE.md at the beginning of each stage with the stage's todo list
   - Mark items as complete when finished
   - Tag each stage as "In Progress", "Awaiting Debugging", or "Complete"

2. **Documentation**:
   - Update relevant .md files after completing each stage
   - Document any issues encountered and how they were resolved
   - Capture screenshots of working implementations for reference

3. **Testing**:
   - Follow test procedures specified for each stage
   - Document test results in CLAUDE.md
   - Use `npm run screenshot` to capture game state for documentation and bug reports
   - Fix any issues before proceeding to the next stage

4. **Code Organization**:
   - Maintain clean code separation between systems
   - Use consistent naming conventions
   - Add minimal inline comments for complex logic

## Implementation Order

1. **First Phase**: Set up basic infrastructure
   - Create Python backend structure
   - Implement frontend client for backend communication
   - Set up Docker configuration

2. **Second Phase**: Core functionality
   - Implement AIQToolkit workflows
   - Modify LLMService to use backend
   - Create fallback mechanisms

3. **Third Phase**: Enhanced features
   - Add WebSocket support
   - Enhance visualization of strategies
   - Implement real-time updates

4. **Fourth Phase**: Testing and deployment
   - Test all components together
   - Optimize performance
   - Prepare deployment configuration

## Stages Summary

1. [**Basic Rendering**](./stage1_basic_rendering.md) - ✅ COMPLETED - Established foundational game window with basic rendering
2. [**Game World Design**](./stage2_game_world.md) - ✅ COMPLETED - Implemented territory grid and resources
3. [**Base Camps and Agents**](./stage3_bases_and_agents.md) - ✅ COMPLETED - Added team bases and hardcoded agents with resource collection
4. [**Game Mechanics**](./stage4_game_mechanics.md) - ✅ COMPLETED - Implement core interactions and gameplay systems
5. [**LLM Team Spawners**](./stage5_llm_spawners.md) - ✅ COMPLETED - Add LLM-based team strategy and agent generation
6. [**AIQToolkit Integration**](./stage6_llm_spawners.md) - 🔄 IN PROGRESS - Enhance with NVIDIA AIQToolkit via Python backend
7. [**Polish and Refinement**](./stage7_polish.md) - ⬜ PLANNED - Fine-tune gameplay and optimize performance

> **Stage Restructuring Note**: The development plan has been revised to include NVIDIA's AIQToolkit integration. Original stages 5 and 6 were consolidated into a single stage 5 (LLM Team Spawners). The new Stage 6 adds a Python backend using NVIDIA's AIQToolkit to enable more sophisticated agent behaviors and team strategies.

## Team Assignment Structure

Each stage file includes implementation tasks broken down for different team roles:
- **Frontend Team**: Responsible for UI, visualization, and JavaScript implementation
- **Backend Team**: Responsible for API, AIQToolkit integration, and Python implementation
- **DevOps Team**: Responsible for containerization, deployment, and environment setup

## Key Documentation

- [Python Backend Handoff](../python_backend_handoff.md) - Detailed instructions for the backend team
- [JavaScript Frontend Handoff](../javascript_frontend_handoff.md) - Detailed instructions for the frontend team
- [AIQToolkit Integration Design](../llm_aiqtoolkit_design.md) - Architecture and design specifications
- [Game Mechanics](../game_mechanics.md) - Core game mechanics documentation
- [Development Roadmap](../development_roadmap.md) - Overall project roadmap

## CLAUDE.md Template

Each stage file includes a CLAUDE.md template section that should be used to update the project's CLAUDE.md file when beginning work on that stage. This ensures consistent tracking and documentation throughout development.