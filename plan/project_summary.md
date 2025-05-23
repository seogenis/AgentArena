# AI Territory Control Game - Project Summary

## Project Overview

The AI Territory Control Game is a browser-based strategic game where LLM-powered teams create and control AI agents competing for resources and territory. Players can observe as teams with different strategies battle for dominance in a dynamic environment.

## Core Concepts

- **Territory Control**: Teams compete to control hexagonal territory cells
- **Resource Collection**: Agents gather energy, materials, and data
- **Base Camps**: Team headquarters where resources are stored
- **Agents**: Various specialized units (collectors, explorers, defenders, attackers)
- **LLM Integration**: AI models generate team strategies and agent specifications
- **AIQToolkit**: NVIDIA's framework for enhanced agent coordination (Stage 6)

## Architecture

The game uses a hybrid architecture:

- **JavaScript Frontend**: Handles game rendering, basic mechanics, and UI
- **Python Backend**: Integrates NVIDIA's AIQToolkit for enhanced strategy generation
- **Communication**: REST API endpoints and optional WebSockets
- **Fallback System**: Direct LLM calls when backend is unavailable

## Current Implementation Stage

We are currently implementing **Stage 6 - AIQToolkit Integration**. This stage enhances the existing JavaScript game with a Python backend using NVIDIA's AIQToolkit for more sophisticated agent behaviors and team strategies.

### Implementation Teams

The project is divided into three teams:

1. **Frontend Team**: Modifying JavaScript to communicate with Python backend
2. **Backend Team**: Implementing Python backend with AIQToolkit
3. **DevOps Team**: Containerization and deployment configuration

## Getting Started

If you're new to the project, follow these steps:

1. **Read the Documentation**: Start with the [Stage 6 Implementation Guide](./stage6_implementation_guide.md)
2. **Set Up Your Environment**: Follow the setup instructions for your team (frontend, backend, or DevOps)
3. **Understand Your Tasks**: Review the tasks assigned to your team
4. **Check the Resources**: Use the provided resources and handoff documents

## Key Documents

### For All Teams
- [Stage 6 Implementation Guide](./stage6_implementation_guide.md) - Comprehensive guide for all teams
- [AIQToolkit Integration Design](./llm_aiqtoolkit_design.md) - Architecture and design specifications
- [Development Roadmap](./development_roadmap.md) - Overall project roadmap
- [Stage 6 Plan](./stages/stage6_llm_spawners.md) - Detailed stage requirements

### For Frontend Team
- [JavaScript Frontend Handoff](./javascript_frontend_handoff.md) - Detailed instructions

### For Backend Team
- [Python Backend Handoff](./python_backend_handoff.md) - Detailed instructions
- [Backend README](./backend_README.md) - Backend structure and setup

## Development Timeline

- **Week 1**: Setup phase - create basic infrastructure
- **Week 2**: Core functionality - implement main features
- **Week 3**: Enhanced features - add additional capabilities
- **Week 4**: Testing and deployment - finalize implementation

## Project History

The project has progressed through several stages:

1. **Basic Rendering**: Core game window and rendering setup ✅
2. **Game World Design**: Hexagonal grid, resources, and obstacles ✅
3. **Base Camps and Agents**: Team bases and basic agent behaviors ✅
4. **Game Mechanics**: Combat, resource collection, victory conditions ✅
5. **LLM Team Spawners**: LLM-based team strategy and agent generation ✅
6. **AIQToolkit Integration**: Python backend with NVIDIA's AIQToolkit 🔄
7. **Polish and Refinement**: Visual enhancements and optimizations ⬜

## Future Plans

After completing Stage 6, the project will move to the final stage:

- **Polish and Refinement**: Enhance visuals, optimize performance, and improve game balance

## Contact Information

For questions or assistance, contact the appropriate team lead:
- Frontend Team: [TBD]
- Backend Team: [TBD]
- DevOps Team: [TBD]