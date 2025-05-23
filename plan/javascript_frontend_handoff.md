# JavaScript Frontend Handoff Instructions

## Overview

Welcome to the AI Territory Control Game project! You'll be updating the JavaScript frontend to communicate with the new Python backend that uses NVIDIA's Agent Intelligence Toolkit (AIQToolkit) to enhance the game with more sophisticated agent behaviors and team strategies.

This document provides step-by-step instructions for implementing the frontend changes needed to integrate with the Python backend.

## Project Structure

The frontend is organized as follows:

```
frontend/
├── css/
│   └── style.css         # Main stylesheet
├── src/
│   ├── engine/           # Game engine components
│   │   ├── GameEngine.js # Main game engine
│   │   ├── llm/          # LLM integration components
│   │   │   ├── LLMService.js        # Service for LLM API calls
│   │   │   ├── LLMSystem.js         # System for managing LLM features
│   │   │   ├── PromptTemplates.js   # Templates for LLM prompts
│   │   │   ├── SpawnerSystem.js     # System for spawning agents
│   │   │   ├── TeamStrategySystem.js # System for team strategies
│   │   │   └── ...
│   │   └── ...
│   └── game/
│       └── main.js       # Main game entry point
└── index.html            # Main HTML file
```

## Prerequisites

1. Node.js (v16+)
2. NPM (v8+)
3. Basic knowledge of JavaScript and browser fetch API
4. Understanding of the existing LLM integration in the game

## Development Timeline

Your expected timeline for implementing the frontend changes is:

| Week | Tasks |
|------|-------|
| Week 1 | Understand existing code, create API client for backend communication |
| Week 2 | Modify LLMService to communicate with backend, add fallback behavior |
| Week 3 | Enhance UI to display backend connection status and strategy visualization |
| Week 4 | Testing, debugging, and finalization |

## Implementation Steps

Follow these steps in order to implement the frontend changes:

### Step 1: Create Backend API Client

First, create a new file `src/engine/llm/BackendAPIClient.js` to handle communication with the Python backend:

```javascript
/**
 * Client for communicating with the Python backend API
 */
class BackendAPIClient {
    constructor() {
        // Default to localhost during development
        this.baseUrl = 'http://localhost:8000/api';
        this.isConnected = false;
        this.connectionCheckInterval = null;
        
        // Check connection on initialization
        this.checkConnection();
    }

    /**
     * Set the base URL for the API
     * @param {string} url - The base URL for the API
     */
    setBaseUrl(url) {
        this.baseUrl = url;
    }

    /**
     * Check if the backend is available
     * @returns {Promise<boolean>} - True if connected, false otherwise
     */
    async checkConnection() {
        try {
            const response = await fetch(`${this.baseUrl.split('/api')[0]}`);
            this.isConnected = response.ok;
            return this.isConnected;
        } catch (error) {
            console.warn('Backend connection check failed:', error);
            this.isConnected = false;
            return false;
        }
    }

    /**
     * Start periodic connection checks
     * @param {number} interval - Check interval in milliseconds
     */
    startConnectionChecks(interval = 30000) {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
        }
        
        this.connectionCheckInterval = setInterval(() => {
            this.checkConnection();
        }, interval);
    }

    /**
     * Stop periodic connection checks
     */
    stopConnectionChecks() {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
            this.connectionCheckInterval = null;
        }
    }

    /**
     * Request team strategy from the backend
     * @param {string} teamId - The team ID
     * @param {object} gameState - The current game state
     * @returns {Promise<object>} - The team strategy
     */
    async requestTeamStrategy(teamId, gameState) {
        if (!this.isConnected) {
            throw new Error('Backend not connected');
        }

        try {
            const response = await fetch(`${this.baseUrl}/team-strategy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    team_id: teamId,
                    territory_control: gameState.territoryControl,
                    resources: gameState.resources,
                    agents: gameState.agents,
                    resource_distribution: gameState.resourceDistribution
                })
            });
            
            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Strategy API error:', error);
            throw error;
        }
    }

    /**
     * Request agent specification from the backend
     * @param {string} teamId - The team ID
     * @param {object} strategy - The team strategy
     * @param {object} resources - Available resources
     * @param {array} currentAgents - Current agent composition
     * @returns {Promise<object>} - The agent specification
     */
    async requestAgentSpecification(teamId, strategy, resources, currentAgents) {
        if (!this.isConnected) {
            throw new Error('Backend not connected');
        }

        try {
            const response = await fetch(`${this.baseUrl}/agent-specification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    team_id: teamId,
                    strategy: strategy,
                    resources: resources,
                    current_agents: currentAgents
                })
            });
            
            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Agent API error:', error);
            throw error;
        }
    }
}

export default BackendAPIClient;
```

### Step 2: Modify LLMService

Update the `src/engine/llm/LLMService.js` file to use the backend client with fallback to the current implementation:

```javascript
import BackendAPIClient from './BackendAPIClient.js';
import { teamStrategyPrompt, agentCreationPrompt } from './PromptTemplates.js';

/**
 * Service for handling LLM API interactions
 */
class LLMService {
    constructor(apiKey = null) {
        this.apiKey = apiKey;
        this.useBackend = true;
        this.backendClient = new BackendAPIClient();
        this.backendClient.startConnectionChecks();
        
        // Initialize connection status
        this.checkBackendConnection();
    }

    /**
     * Check if backend is connected
     */
    async checkBackendConnection() {
        const isConnected = await this.backendClient.checkConnection();
        this.useBackend = isConnected;
        console.log(`Backend connection: ${isConnected ? 'Connected' : 'Disconnected'}`);
        return isConnected;
    }

    /**
     * Generate team strategy
     * @param {string} teamId - The team ID
     * @param {object} gameState - The current game state
     * @returns {Promise<object>} - The team strategy
     */
    async generateTeamStrategy(teamId, gameState) {
        try {
            // Try to use backend if available
            if (this.useBackend) {
                try {
                    return await this.backendClient.requestTeamStrategy(teamId, gameState);
                } catch (error) {
                    console.warn('Backend strategy generation failed, falling back to direct LLM:', error);
                    this.useBackend = false;
                    await this.backendClient.checkConnection();
                }
            }
            
            // Fallback to direct LLM call
            if (this.apiKey) {
                return await this.directLLMStrategyCall(teamId, gameState);
            } else {
                // Fallback to mock response if no API key
                return this.mockTeamStrategy(teamId, gameState);
            }
        } catch (error) {
            console.error('Strategy generation error:', error);
            return this.mockTeamStrategy(teamId, gameState);
        }
    }

    /**
     * Generate agent specification
     * @param {string} teamId - The team ID
     * @param {object} strategy - The team strategy
     * @param {object} resources - Available resources
     * @param {object} teamComposition - Current team composition
     * @returns {Promise<object>} - The agent specification
     */
    async generateAgentSpecification(teamId, strategy, resources, teamComposition) {
        try {
            // Try to use backend if available
            if (this.useBackend) {
                try {
                    const currentAgents = Object.entries(teamComposition).map(([type, count]) => ({
                        type, count
                    }));
                    
                    return await this.backendClient.requestAgentSpecification(
                        teamId, strategy, resources, currentAgents
                    );
                } catch (error) {
                    console.warn('Backend agent generation failed, falling back to direct LLM:', error);
                    this.useBackend = false;
                    await this.backendClient.checkConnection();
                }
            }
            
            // Fallback to direct LLM call
            if (this.apiKey) {
                return await this.directLLMAgentCall(teamId, strategy, resources, teamComposition);
            } else {
                // Fallback to mock response if no API key
                return this.mockAgentSpecification(teamId, strategy);
            }
        } catch (error) {
            console.error('Agent generation error:', error);
            return this.mockAgentSpecification(teamId, strategy);
        }
    }

    /**
     * Direct LLM call for team strategy (existing implementation)
     * @private
     */
    async directLLMStrategyCall(teamId, gameState) {
        // Your existing implementation
        const prompt = teamStrategyPrompt(teamId, gameState);
        // Make LLM API call with prompt
        // ...
    }

    /**
     * Direct LLM call for agent specification (existing implementation)
     * @private
     */
    async directLLMAgentCall(teamId, strategy, resources, teamComposition) {
        // Your existing implementation
        const prompt = agentCreationPrompt(teamId, strategy, resources, teamComposition);
        // Make LLM API call with prompt
        // ...
    }

    /**
     * Mock team strategy response (existing implementation)
     * @private
     */
    mockTeamStrategy(teamId, gameState) {
        // Your existing mock implementation
        // ...
    }

    /**
     * Mock agent specification response (existing implementation)
     * @private
     */
    mockAgentSpecification(teamId, strategy) {
        // Your existing mock implementation
        // ...
    }
}

export default LLMService;
```

### Step 3: Update LLMSystem

Modify the `src/engine/llm/LLMSystem.js` file to show backend connection status and manage the fallback behavior:

```javascript
// Add these methods to the LLMSystem class

/**
 * Initialize backend connection status UI
 */
initBackendStatusUI() {
    // Create status indicator in the debug overlay
    const debugOverlay = document.getElementById('debug-overlay');
    if (!debugOverlay) return;
    
    const statusElement = document.createElement('div');
    statusElement.id = 'backend-status';
    statusElement.className = 'status-indicator';
    statusElement.innerHTML = 'Backend: <span class="status-unknown">Unknown</span>';
    debugOverlay.appendChild(statusElement);
    
    // Update status based on LLMService
    this.updateBackendStatus();
}

/**
 * Update backend connection status UI
 */
async updateBackendStatus() {
    const statusElement = document.getElementById('backend-status');
    if (!statusElement) return;
    
    const isConnected = await this.llmService.checkBackendConnection();
    const statusSpan = statusElement.querySelector('span');
    
    if (isConnected) {
        statusSpan.className = 'status-connected';
        statusSpan.textContent = 'Connected';
    } else if (this.llmService.apiKey) {
        statusSpan.className = 'status-fallback';
        statusSpan.textContent = 'Fallback (Direct LLM)';
    } else {
        statusSpan.className = 'status-disconnected';
        statusSpan.textContent = 'Mock Mode';
    }
}

/**
 * Toggle backend usage
 */
toggleBackendUsage() {
    this.llmService.useBackend = !this.llmService.useBackend;
    console.log(`Backend usage: ${this.llmService.useBackend ? 'Enabled' : 'Disabled'}`);
    this.updateBackendStatus();
}
```

Then update the initialization and update methods:

```javascript
// In the constructor
constructor(gameEngine) {
    // Existing code...
    
    // Initialize backend status UI
    this.initBackendStatusUI();
    
    // Add key binding for toggling backend
    window.addEventListener('keydown', (e) => {
        if (e.key === 'b') {
            this.toggleBackendUsage();
        }
    });
}

// In the update method
update(deltaTime) {
    // Existing code...
    
    // Periodically update backend status
    this.statusUpdateTimer += deltaTime;
    if (this.statusUpdateTimer > 5) { // Check every 5 seconds
        this.updateBackendStatus();
        this.statusUpdateTimer = 0;
    }
}
```

### Step 4: Enhance Strategy Visualization

Modify the strategy display in the debug overlay to show more details about AIQToolkit-generated strategies:

```javascript
// In TeamStrategySystem.js

/**
 * Display team strategy in debug overlay
 */
displayTeamStrategy(teamId, strategy) {
    const debugOverlay = document.getElementById('debug-overlay');
    if (!debugOverlay) return;
    
    const teamColor = teamId === 'team1' || teamId === 'red' ? 'Red' : 'Blue';
    const strategyElement = document.getElementById(`${teamColor.toLowerCase()}-team-strategy`);
    
    if (strategyElement) {
        // Update existing element
        strategyElement.innerHTML = this.formatStrategyDisplay(teamColor, strategy);
    } else {
        // Create new element
        const newStrategyElement = document.createElement('div');
        newStrategyElement.id = `${teamColor.toLowerCase()}-team-strategy`;
        newStrategyElement.className = 'team-strategy';
        newStrategyElement.innerHTML = this.formatStrategyDisplay(teamColor, strategy);
        debugOverlay.appendChild(newStrategyElement);
    }
}

/**
 * Format strategy display with enhanced information
 */
formatStrategyDisplay(teamColor, strategy) {
    let html = `<h3>${teamColor} Team Strategy</h3>`;
    
    // Main strategy
    html += `<div class="strategy-type">${strategy.strategy || 'Unknown'}</div>`;
    
    // Focus and priorities (from AIQToolkit)
    if (strategy.focus) {
        html += `<div>Focus: ${strategy.focus}</div>`;
    }
    
    if (strategy.priorities && strategy.priorities.length > 0) {
        html += '<div>Priorities: ';
        html += strategy.priorities.map(p => `<span class="priority">${p}</span>`).join(', ');
        html += '</div>';
    }
    
    // Description
    if (strategy.description) {
        html += `<div class="strategy-desc">${strategy.description}</div>`;
    }
    
    // Source indicator
    const source = this.llmSystem.llmService.useBackend ? 'AIQToolkit' : 
                  (this.llmSystem.llmService.apiKey ? 'Direct LLM' : 'Mock');
    html += `<div class="strategy-source">Source: ${source}</div>`;
    
    return html;
}
```

### Step 5: Add CSS Styles

Add styles for the new UI elements to `css/style.css`:

```css
/* Backend status indicator */
.status-indicator {
    padding: 5px;
    margin: 5px 0;
    font-size: 12px;
    background-color: rgba(0, 0, 0, 0.7);
}

.status-unknown {
    color: #aaa;
}

.status-connected {
    color: #4caf50; /* Green */
}

.status-fallback {
    color: #ff9800; /* Orange */
}

.status-disconnected {
    color: #f44336; /* Red */
}

/* Enhanced strategy display */
.team-strategy {
    padding: 8px;
    margin: 5px 0;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 4px;
}

.team-strategy h3 {
    margin: 0 0 5px 0;
    font-size: 14px;
}

.strategy-type {
    font-weight: bold;
    font-size: 13px;
    text-transform: uppercase;
}

.priority {
    background-color: rgba(100, 100, 255, 0.3);
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 11px;
}

.strategy-desc {
    font-style: italic;
    margin-top: 5px;
    font-size: 11px;
}

.strategy-source {
    font-size: 10px;
    color: #aaa;
    margin-top: 5px;
    text-align: right;
}
```

### Step 6: Implement WebSocket Support (Optional)

If you want to implement real-time updates using WebSockets, create a new file `src/engine/llm/WebSocketClient.js`:

```javascript
/**
 * Client for WebSocket communication with the backend
 */
class WebSocketClient {
    constructor(url = 'ws://localhost:8000/ws') {
        this.url = url;
        this.socket = null;
        this.isConnected = false;
        this.clientId = this.generateClientId();
        this.messageHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    /**
     * Generate a unique client ID
     */
    generateClientId() {
        return 'client_' + Math.random().toString(36).substring(2, 9);
    }

    /**
     * Connect to the WebSocket server
     */
    connect() {
        if (this.socket) {
            this.disconnect();
        }

        try {
            this.socket = new WebSocket(`${this.url}/${this.clientId}`);
            
            this.socket.onopen = () => {
                console.log('WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
            };
            
            this.socket.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                this.attemptReconnect();
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnected = false;
            };
            
            this.socket.onmessage = (event) => {
                this.handleMessage(event.data);
            };
        } catch (error) {
            console.error('WebSocket connection error:', error);
        }
    }

    /**
     * Attempt to reconnect to the WebSocket server
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn('Max reconnect attempts reached, giving up');
            return;
        }
        
        this.reconnectAttempts++;
        const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
        
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
        setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * Disconnect from the WebSocket server
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
        }
    }

    /**
     * Send game state to the server
     * @param {object} gameState - The current game state
     */
    sendGameState(gameState) {
        if (!this.isConnected) {
            return;
        }
        
        try {
            const message = {
                type: 'gameState',
                data: gameState
            };
            
            this.socket.send(JSON.stringify(message));
        } catch (error) {
            console.error('Error sending game state:', error);
        }
    }

    /**
     * Register a message handler
     * @param {string} type - Message type to handle
     * @param {function} handler - Handler function
     */
    registerHandler(type, handler) {
        this.messageHandlers.set(type, handler);
    }

    /**
     * Handle incoming messages
     * @param {string} data - Message data
     */
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            const handler = this.messageHandlers.get(message.type);
            
            if (handler) {
                handler(message.data);
            } else {
                console.warn('No handler for message type:', message.type);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }
}

export default WebSocketClient;
```

Then integrate it with the LLMSystem:

```javascript
// In LLMSystem.js
import WebSocketClient from './WebSocketClient.js';

// In the constructor
constructor(gameEngine) {
    // Existing code...
    
    // Initialize WebSocket client (if enabled)
    this.websocketEnabled = false;
    this.websocketClient = new WebSocketClient();
    
    // Add key binding for toggling WebSocket
    window.addEventListener('keydown', (e) => {
        if (e.key === 'w') {
            this.toggleWebSocket();
        }
    });
}

/**
 * Toggle WebSocket connection
 */
toggleWebSocket() {
    this.websocketEnabled = !this.websocketEnabled;
    
    if (this.websocketEnabled) {
        this.websocketClient.connect();
        
        // Register handlers for directives
        this.websocketClient.registerHandler('directive', (data) => {
            if (data.team === 'red' || data.team === 'team1') {
                this.teamStrategySystem.applyTeamStrategy('team1', data.data);
            } else if (data.team === 'blue' || data.team === 'team2') {
                this.teamStrategySystem.applyTeamStrategy('team2', data.data);
            }
        });
    } else {
        this.websocketClient.disconnect();
    }
    
    console.log(`WebSocket: ${this.websocketEnabled ? 'Enabled' : 'Disabled'}`);
}

// In the update method
update(deltaTime) {
    // Existing code...
    
    // Send game state via WebSocket if enabled
    if (this.websocketEnabled && this.websocketClient.isConnected) {
        this.websocketUpdateTimer += deltaTime;
        if (this.websocketUpdateTimer > 1) { // Send every second
            const gameState = this.gameEngine.getGameState();
            this.websocketClient.sendGameState(gameState);
            this.websocketUpdateTimer = 0;
        }
    }
}
```

## Testing

### 1. Test Backend Communication

First, make sure the Python backend is running on http://localhost:8000. Then test the communication:

```javascript
// In the browser console
const backendClient = new BackendAPIClient();
backendClient.checkConnection().then(connected => console.log('Connected:', connected));
```

### 2. Test Fallback Behavior

Test that the system falls back to direct LLM calls when the backend is unavailable:

1. Start the game with the backend running
2. Stop the backend
3. Try to generate a team strategy
4. Verify that it falls back to direct LLM or mock mode

### 3. Test UI Indicators

Verify that the UI correctly shows:
- Backend connection status
- Strategy source (AIQToolkit, Direct LLM, or Mock)
- Enhanced strategy visualization

### 4. Test WebSocket (if implemented)

Test real-time updates:
1. Connect to WebSocket with the 'W' key
2. Verify connection status
3. Make changes to game state
4. Verify that directives are received from the backend

## Common Issues and Solutions

### 1. CORS Errors

**Symptoms**: Console shows CORS errors when trying to connect to the backend.

**Solution**:
- Make sure the backend has CORS configured properly
- Check that the request URLs are correct
- Try using a CORS browser extension for testing

### 2. Backend Connection Issues

**Symptoms**: Cannot connect to backend or connection keeps dropping.

**Solution**:
- Verify the backend is running
- Check network settings
- Try using a different port
- Make sure the backend URL is correct

### 3. WebSocket Connection Issues

**Symptoms**: WebSocket connection fails or messages aren't received.

**Solution**:
- Verify WebSocket server is running
- Check browser console for errors
- Make sure the WebSocket URL is correct
- Check for network restrictions

## Progress Tracking

Keep track of your progress with this checklist:

- [ ] BackendAPIClient implementation
- [ ] LLMService modification with fallback behavior
- [ ] LLMSystem updates with backend status display
- [ ] Enhanced strategy visualization
- [ ] WebSocket implementation (optional)
- [ ] CSS styling for new UI elements
- [ ] Testing and debugging
- [ ] Documentation

## Resources

- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [WebSocket API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [AIQToolkit Documentation](https://docs.nvidia.com/aiqtoolkit/latest/index.html)
- [AIQToolkit Integration Design](./llm_aiqtoolkit_design.md)
- [Python Backend Handoff Instructions](./python_backend_handoff.md)

Good luck with the implementation! If you have any questions, feel free to reach out to the senior team members.