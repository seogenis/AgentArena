# AgentArena

AgentArena is a browser-based strategic game where LLM-powered teams compete for resources and territory. AI agents with specialized roles (collectors, explorers, defenders, attackers) gather resources, claim territory, and engage in combat to achieve victory through territorial control, resource domination, or opponent elimination.

https://www.loom.com/share/ff0ae60e7e3c48efbe8104184339c155?sid=83434cff-77c6-4acc-910b-d2e0e32d19f8

## Project Description

AgentArena demonstrates how AI teams develop strategies and make decisions in competitive scenarios. The project combines a JavaScript game engine with NVIDIA's AIQToolkit via a Python backend to enable sophisticated agent behaviors and team coordination, creating a visually engaging platform for exploring emergent AI strategies.

## Development Challenges

- Balancing game mechanics for meaningful strategic decisions
- Designing effective prompt templates for LLM strategy generation
- Implementing fallback mechanisms for API limitations
- Coordinating frontend-backend integration with consistent API contracts
- Optimizing performance with many agents on limited resources
- Creating distinct visual representations for different agent types

## Running the Project

### Prerequisites
- Node.js (v14+)
- Python 3.8+
- Docker and Docker Compose (optional)

### Setup and Run
1. Clone the repository
   ```
   git clone https://github.com/yourusername/AgentArena.git
   cd AgentArena
   ```

2. Install frontend dependencies
   ```
   npm install
   ```

3. Run frontend only (with mock LLM responses)
   ```
   npm start
   ```

4. Setup backend (for AIQToolkit integration)
   ```
   cd backend
   pip install -r requirements.txt
   python -m app.main
   ```

5. Or run with Docker Compose (both frontend and backend)
   ```
   docker-compose up
   ```

6. Open your browser to http://localhost:3000

### Testing
- Use keyboard controls described in CLAUDE.md for testing
- Run `npm run screenshot` to capture the current game state
