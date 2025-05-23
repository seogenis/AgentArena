# LLM Systems for Agent Arena

## API Configuration

The LLM systems in Agent Arena now use a unified configuration system that works both locally and in production.

### Setting up your API key

There are several ways to set your OpenAI API key:

1. **Browser Console**: 
   ```js
   window.initializeAPI('your-api-key-here');
   ```

2. **Environment Variable**:
   For development, you can set the `LLM_API_KEY` environment variable.

3. **Local Storage**:
   The key will be saved to localStorage once set, so it persists between page refreshes.

### Toggle Mock Mode

When no API key is available, or to avoid API costs during development, you can toggle mock mode:

```js
// Enable mock responses (no API calls)
window.toggleMockResponses(true);

// Use real API (will make API calls)
window.toggleMockResponses(false);
```

### Check Configuration Status

```js
window.getAPIConfig();
```

## AIQToolkit Python Backend (Stage 6)

In Stage 6, we've added support for communicating with a Python backend that uses NVIDIA's AIQToolkit:

### Backend Configuration

The backend is configured to connect to `http://localhost:8000/api` by default. You can check or toggle the backend connection:

```js
// Check backend connection status
window.checkBackendConnection();

// Toggle backend usage (use direct LLM if false)
window.toggleBackendUsage(true/false);
```

### WebSocket Support (Optional)

For real-time updates, WebSocket support is available:

```js
// Enable WebSocket connection
window.enableWebSocket();

// Disable WebSocket connection
window.disableWebSocket();
```

## Fallback Mechanism

The system implements a graceful fallback mechanism:

1. Try Python backend with AIQToolkit
2. If unavailable, fall back to direct LLM API calls
3. If no API key, use mock responses

## Debugging LLM Calls

To monitor what's happening with LLM calls:

1. **Start monitoring**:
   ```js
   window.monitorLLM();
   ```

2. **View recent responses**:
   ```js
   window.getLLMResponses(10); // Get last 10 responses
   ```

3. **Get LLM usage statistics**:
   ```js
   window.getLLMStats();
   ```

## LLM Systems

The Agent Arena game uses several LLM-based systems:

1. **Team Strategy System**: Makes high-level decisions for each team
2. **Spawner System**: Determines what type of agents to create
3. **Spawn Scheduler**: Decides when to spawn new agents
4. **Agent Control System**: Controls individual agent behaviors

## Keyboard Controls

- `L` key: Toggle LLM systems on/off
- `G` key: Request new Red team strategy
- `V` key: Request new Blue team strategy
- `N` key: Spawn LLM agent for Red team
- `M` key: Spawn LLM agent for Blue team
- `B` key: Toggle backend usage (Stage 6)
- `W` key: Toggle WebSocket connection (Stage 6)

## Troubleshooting

If you encounter issues with the LLM API:

1. Check that your API key is correctly set using `window.getAPIConfig()`
2. Ensure you have sufficient OpenAI API credits
3. Try enabling mock mode with `window.toggleMockResponses(true)`
4. Check the browser console for error messages

For backend connection issues:

1. Verify the backend server is running at the expected URL
2. Check browser console for connection errors
3. Look for CORS issues if running on different domains
4. Verify the backend API endpoints match what the frontend expects

For development, you can set your API key in the console with:
```js
window.initializeAPI('your-api-key-here');
```