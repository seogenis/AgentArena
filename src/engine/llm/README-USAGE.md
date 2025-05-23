# How to Use OpenAI API with Agent Arena

## Setting Up the API

This project can use the OpenAI API for agent decision-making. Here's how to set it up:

### 1. Initialize the API with your key

```javascript
// In the browser console:
window.initializeAPI('your-openai-api-key-here');
```

### 2. Disable mock responses

Make sure mock responses are disabled to use the real API:

```javascript
window.toggleMockResponses(false);
```

### 3. Reinitialize LLM services

After changing API settings, reinitialize all services:

```javascript
window.reinitializeLLMServices();
```

### 4. Check current configuration

```javascript
window.getAPIConfig();
```

## Troubleshooting

If you're still seeing mock responses after setting your API key:

1. **Verify API Configuration**:
   ```javascript
   window.getAPIConfig();
   ```
   - Make sure `API Key` shows "Set (hidden)"
   - Make sure `Using Mock Responses` shows "No"

2. **Force Reinitialize All Services**:
   ```javascript
   window.reinitializeLLMServices();
   ```

3. **Manual Direct Configuration**:
   ```javascript
   // Full initialization with all parameters
   window.initializeAPI('your-openai-api-key-here', {
     apiEndpoint: 'https://api.openai.com/v1/chat/completions',
     modelName: 'gpt-4.1-mini',
     useMockResponses: false
   });
   
   // Then reinitialize services
   window.reinitializeLLMServices();
   ```

## Game Controls

- `L` key: Toggle LLM control on/off 
- `G` key: Request new Red team strategy
- `V` key: Request new Blue team strategy
- `N` key: Spawn new agent for Red team
- `M` key: Spawn new agent for Blue team

## Understanding Game Output

When using the real API:
- Log messages will show `🔑 Using OpenAI API` 
- Strategy updates will be marked with `✅`

When using mock responses:
- Log messages will show `🤖 Using mock LLM response`
- Mock strategies will be randomly selected from pre-defined options

## Common Issues

- **Error: API Key invalid**: Double-check your API key is correct
- **Error: Rate limiting**: You might be making too many API calls
- **No visible changes**: Press `G` or `V` to force a strategy update

## Credits

This project uses the OpenAI API for LLM-based agent decision making. You will need a valid OpenAI API key with access to GPT models.