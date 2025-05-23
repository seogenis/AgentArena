# Frontend Integration Handoff

This document provides step-by-step instructions for integrating the JavaScript frontend with the Python backend for the AI Territory Control Game's Stage 6 implementation.

## Overview

The frontend has been enhanced to communicate with the Python backend that uses NVIDIA's AIQToolkit for sophisticated agent behaviors and team strategies. Key features include:

- REST API communication with the backend
- Fallback to direct LLM calls when the backend is unavailable
- Optional WebSocket support for real-time updates
- Enhanced UI for displaying backend connection status
- Improved visualization of team strategies

## Integration Steps

### Step 1: Review Files

Ensure the following new and modified files are properly merged:

**New Files:**
- `src/engine/llm/BackendAPIClient.js` - Client for REST API communication
- `src/engine/llm/WebSocketClient.js` - Client for WebSocket communication

**Modified Files:**
- `src/engine/llm/LLMService.js` - Added backend integration with fallback
- `src/engine/llm/LLMSystem.js` - Added connection status and UI updates
- `src/engine/llm/TeamStrategySystem.js` - Enhanced strategy visualization
- `css/style.css` - Added styles for new UI elements

### Step 2: Configure Backend URL

The backend URL is currently set to `http://localhost:8000/api` in `BackendAPIClient.js`. If the backend is running on a different host or port, update this URL:

```javascript
// In BackendAPIClient.js
constructor() {
    // Update this URL to match your backend deployment
    this.baseUrl = 'http://localhost:8000/api';
    // ...
}
```

### Step 3: Configure WebSocket URL

If using WebSockets, the WebSocket URL is currently set to `ws://localhost:8000/ws` in `WebSocketClient.js`. Update this if needed:

```javascript
// In WebSocketClient.js
constructor(url = 'ws://localhost:8000/ws') {
    // Update this URL to match your WebSocket server
    this.url = url;
    // ...
}
```

### Step 4: Verify API Endpoint Compatibility

Ensure the backend API endpoints match what the frontend expects:

1. **Team Strategy Endpoint**
   - URL: `POST /api/team-strategy`
   - Request format includes: team_id, territory_control, resources, agents, resource_distribution
   - Response format includes: strategy, focus, priorities, description

2. **Agent Specification Endpoint**
   - URL: `POST /api/agent-specification`
   - Request format includes: team_id, strategy, resources, current_agents
   - Response format includes: role, attributes, priority, description

If there are any discrepancies, update either the frontend or backend to ensure compatibility.

### Step 5: Test Basic API Communication

After integration, test basic API communication:

1. Start the backend server
2. Start the frontend application
3. Open the browser console
4. Verify the backend connection status shows "Connected"
5. Test team strategy generation (G key for Red team, B key for Blue team)
6. Test agent generation (N key for Red team, M key for Blue team)

### Step 6: Test Fallback Mechanism

Test the fallback mechanism:

1. Stop the backend server
2. Refresh the frontend
3. Verify the backend connection status shows "Disconnected (Fallback)"
4. Test team strategy generation and agent generation
5. Verify they fall back to direct LLM or mock responses

### Step 7: Test WebSocket Support (if implemented)

If WebSocket support is enabled:

1. Start the backend server with WebSocket support
2. Start the frontend application
3. Press the 'W' key to enable WebSocket connection
4. Verify the WebSocket status shows "Connected"
5. Monitor the browser console for WebSocket messages
6. Test strategic directives from the backend

## API Endpoint Details

### Team Strategy Endpoint

**URL:** `POST /api/team-strategy`

**Request Format:**
```json
{
  "team_id": "red",
  "territory_control": { "red": 45, "blue": 55 },
  "resources": {
    "red": { "energy": 50, "materials": 30, "data": 20 },
    "blue": { "energy": 40, "materials": 35, "data": 25 }
  },
  "agents": {
    "red": [
      { "id": 1, "type": "collector", "health": 100, ... },
      ...
    ],
    "blue": [
      { "id": 2, "type": "explorer", "health": 90, ... },
      ...
    ]
  },
  "resource_distribution": { "energy": 10, "materials": 8, "data": 12 }
}
```

**Response Format:**
```json
{
  "strategy": "aggressive",
  "focus": "territory",
  "priorities": ["expand_territory", "attack_enemies", "collect_energy"],
  "description": "Aggressive expansion focusing on territory control."
}
```

### Agent Specification Endpoint

**URL:** `POST /api/agent-specification`

**Request Format:**
```json
{
  "team_id": "blue",
  "strategy": {
    "strategy": "defensive",
    "focus": "resources",
    ...
  },
  "resources": { "energy": 40, "materials": 35, "data": 25 },
  "current_agents": [
    { "type": "collector", "count": 3 },
    { "type": "explorer", "count": 2 },
    ...
  ]
}
```

**Response Format:**
```json
{
  "role": "defender",
  "attributes": {
    "speed": 0.4,
    "health": 0.9,
    "attack": 0.6,
    "defense": 0.9,
    "carryCapacity": 0.2
  },
  "priority": "materials",
  "description": "Heavily armored defender specializing in protecting resource collectors."
}
```

## WebSocket Protocol (Optional)

If WebSocket support is implemented, the following message formats are used:

### Client → Server: Game State Updates
```json
{
  "type": "gameState",
  "data": {
    // Same format as team-strategy payload
  }
}
```

### Server → Client: Strategic Directives
```json
{
  "type": "directive",
  "team": "red",
  "data": {
    "strategy": "balanced",
    "focus": "resources",
    "priorities": [...],
    "agentRecommendations": [
      { "type": "collector", "count": 2 },
      { "type": "defender", "count": 1 }
    ],
    "territoryFocus": {
      "x": 300,
      "y": 250,
      "radius": 100,
      "priority": "high"
    }
  }
}
```

## Troubleshooting

### CORS Errors

If you encounter CORS errors:

1. Ensure the backend has CORS properly configured to allow requests from the frontend origin
2. Check that the frontend is using the correct backend URL
3. Check browser console for specific CORS error messages

### Backend Connection Issues

If the frontend cannot connect to the backend:

1. Verify the backend server is running
2. Check that the backend URL in `BackendAPIClient.js` is correct
3. Ensure there are no network restrictions preventing connections
4. Check browser console for connection error details

### WebSocket Connection Issues

If WebSocket connections fail:

1. Verify the WebSocket server is running on the backend
2. Check that the WebSocket URL in `WebSocketClient.js` is correct
3. Ensure the WebSocket protocol is correctly implemented on both ends
4. Check browser console for WebSocket error messages

### Response Format Mismatch

If you see errors parsing backend responses:

1. Compare the actual backend response format with what the frontend expects
2. Update either the frontend or backend to ensure compatibility
3. Check browser console for parsing error details

## Further Testing

To fully validate the integration:

1. **Test fallback behavior** by temporarily disabling the backend
2. **Test with mock responses** by clearing the API key
3. **Test with high latency** by throttling network in browser dev tools
4. **Test with different team strategies** to ensure visualization works correctly
5. **Test WebSocket reconnection** by temporarily stopping and restarting the backend

## Key Keyboard Controls

- **B key** - Toggle between backend mode and direct LLM mode
- **W key** - Toggle WebSocket connection
- **G key** - Request new strategy for Red team
- **B key** - Request new strategy for Blue team
- **N key** - Request new agent for Red team
- **M key** - Request new agent for Blue team