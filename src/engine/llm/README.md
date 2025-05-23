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

## Troubleshooting

If you encounter issues with the LLM API:

1. Check that your API key is correctly set using `window.getAPIConfig()`
2. Ensure you have sufficient OpenAI API credits
3. Try enabling mock mode with `window.toggleMockResponses(true)`
4. Check the browser console for error messages

For development, you can set your API key in the console with:
```js
window.initializeAPI('your-api-key-here');
```