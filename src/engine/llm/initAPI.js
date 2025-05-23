/**
 * initAPI.js
 * 
 * Auto-initializes API configuration when imported
 * This is a separate file to avoid circular dependencies
 */

import apiInitializer from './APIInitializer.js';

// Try to get API key from various sources
const getApiKey = () => {
    // Priority:
    // 1. window.OPENAI_API_KEY (manual setting)
    // 2. localStorage.getItem('OPENAI_API_KEY') (previously saved)
    // 3. process.env.LLM_API_KEY (environment variable)
    // 4. Empty string (mock mode)
    
    if (typeof window !== 'undefined' && window.OPENAI_API_KEY) {
        return window.OPENAI_API_KEY;
    }
    
    // Try localStorage
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const savedKey = window.localStorage.getItem('OPENAI_API_KEY');
            if (savedKey) {
                return savedKey;
            }
        }
    } catch (e) {
        console.warn('Could not access localStorage for API key');
    }
    
    // Try process.env
    if (typeof process !== 'undefined' && process.env && process.env.LLM_API_KEY) {
        return process.env.LLM_API_KEY;
    }
    
    // No key found
    return '';
};

// Get API key
const apiKey = getApiKey();

// Initialize with any key found, or use mock mode if no key
const useMockResponses = !apiKey; // Use mock mode if no API key
apiInitializer.initialize(apiKey, { 
    useMockResponses,
    apiEndpoint: 'https://api.openai.com/v1/chat/completions'
});

// Save API key to localStorage if available
if (apiKey && typeof window !== 'undefined' && window.localStorage) {
    try {
        window.localStorage.setItem('OPENAI_API_KEY', apiKey);
    } catch (e) {
        console.warn('Could not save API key to localStorage');
    }
}

// Add some helpful console messages for local development
console.log(`
╔════════════════════════════════════════════╗
║              API CONFIGURATION              ║
╠════════════════════════════════════════════╣
║ API Key: ${apiKey ? 'Found ✓' : 'Not found ✗'}                          ║
║ Mode: ${useMockResponses ? 'MOCK RESPONSES (no API calls)' : 'REAL API (will make API calls)'}    ║
╠════════════════════════════════════════════╣
║ To set API key: window.initializeAPI('your-key')  ║
║ To toggle mock: window.toggleMockResponses()      ║
║ For status: window.getAPIConfig()                 ║
╚════════════════════════════════════════════╝
`);

export default apiInitializer;