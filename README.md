# AI Territory Control Game

A browser-based strategic game where LLM-powered teams create and control AI agents competing for resources and territory.

## Project Status

Currently in development - Stage 1 complete. See [CLAUDE.md](./CLAUDE.md) for detailed project status and current implementation stage.

## Getting Started

### Prerequisites

- Node.js (latest LTS recommended)
- NPM

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Running the Game

```
npm start
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

## Project Structure

- `/src/engine/` - Core game engine components
- `/src/game/` - Game-specific logic and components
- `/src/utils/` - Utility functions and helpers
- `/css/` - Styling
- `/plan/` - Project planning documents

## Development Roadmap

This game is being developed in stages:

1. Basic Rendering in 2D Game Window ✅
2. Game World Design with Resources
3. Base Camps and Hardcoded Agents
4. Agent Interactions and Game Mechanics
5. LLM Agent Piloting
6. LLM Team Spawner Implementation
7. Polish and Refinement

See the [plan directory](./plan/) for detailed plans for each stage.