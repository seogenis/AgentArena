/**
 * APIInitializer.js
 * 
 * Utility to initialize API configuration at runtime
 * Handles setting up environment variables and API key for local development
 */

class APIInitializer {
    constructor() {
        this.initialized = false;
        
        // Default values
        this.defaults = {
            apiEndpoint: 'https://api.openai.com/v1/chat/completions',
            modelName: 'gpt-4.1-mini',
            useMockResponses: true
        };
    }
    
    /**
     * Initialize the API with the provided key
     * @param {string} apiKey - The API key to use
     * @param {Object} options - Additional options
     * @returns {boolean} Whether initialization was successful
     */
    initialize(apiKey, options = {}) {
        try {
            // Create process.env if it doesn't exist (browser environment)
            if (typeof process === 'undefined') {
                window.process = window.process || {};
                window.process.env = window.process.env || {};
            } else if (!process.env) {
                process.env = {};
            }
            
            // Use a consistent reference
            const env = typeof window !== 'undefined' ? (window.process.env) : process.env;
            
            // Set API configuration
            env.LLM_API_KEY = apiKey || env.LLM_API_KEY || '';
            env.LLM_API_ENDPOINT = options.apiEndpoint || env.LLM_API_ENDPOINT || this.defaults.apiEndpoint;
            env.LLM_MODEL_NAME = options.modelName || env.LLM_MODEL_NAME || this.defaults.modelName;
            env.USE_MOCK_RESPONSES = options.useMockResponses !== undefined 
                ? String(options.useMockResponses) 
                : env.USE_MOCK_RESPONSES || String(this.defaults.useMockResponses);
                
            // Store API key in window for persistence
            if (typeof window !== 'undefined') {
                window.OPENAI_API_KEY = apiKey || window.OPENAI_API_KEY || '';
            }
            
            // Log configuration
            console.log(`API initialized with:
                - Endpoint: ${env.LLM_API_ENDPOINT}
                - Model: ${env.LLM_MODEL_NAME}
                - Mock Responses: ${env.USE_MOCK_RESPONSES === 'true' ? 'Enabled' : 'Disabled'}
                - API Key: ${apiKey ? 'Provided ✓' : 'Not provided ✗'}
            `);
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing API:', error);
            return false;
        }
    }
    
    /**
     * Toggle between real API and mock responses
     * @param {boolean} useMock - Whether to use mock responses
     * @returns {boolean} The new mock status
     */
    toggleMockResponses(useMock) {
        const env = typeof window !== 'undefined' ? (window.process.env) : process.env;
        
        if (!env) {
            console.error('Environment not initialized');
            return false;
        }
        
        // If useMock is not provided, toggle the current value
        const newValue = useMock !== undefined ? useMock : env.USE_MOCK_RESPONSES !== 'true';
        env.USE_MOCK_RESPONSES = String(newValue);
        
        console.log(`Mock responses ${newValue ? 'enabled' : 'disabled'}`);
        return newValue;
    }
    
    /**
     * Get the current API configuration
     * @returns {Object} The current configuration
     */
    getConfig() {
        if (!this.initialized) {
            return {
                initialized: false,
                error: 'API not initialized'
            };
        }
        
        const env = typeof window !== 'undefined' ? (window.process.env) : process.env;
        
        return {
            initialized: this.initialized,
            apiKey: env.LLM_API_KEY ? 'Set (hidden)' : 'Not set',
            apiEndpoint: env.LLM_API_ENDPOINT || this.defaults.apiEndpoint,
            modelName: env.LLM_MODEL_NAME || this.defaults.modelName,
            useMockResponses: env.USE_MOCK_RESPONSES === 'true'
        };
    }
}

// Export singleton instance
const apiInitializer = new APIInitializer();
export default apiInitializer;

// Create global helper functions
window.initializeAPI = function(apiKey, options = {}) {
    return apiInitializer.initialize(apiKey, options);
};

window.toggleMockResponses = function(useMock) {
    return apiInitializer.toggleMockResponses(useMock);
};

window.getAPIConfig = function() {
    const config = apiInitializer.getConfig();
    console.log('Current API Configuration:');
    console.log(`API Initialized: ${config.initialized ? 'Yes ✓' : 'No ✗'}`);
    console.log(`API Key: ${config.apiKey}`);
    console.log(`API Endpoint: ${config.apiEndpoint}`);
    console.log(`Model: ${config.modelName}`);
    console.log(`Using Mock Responses: ${config.useMockResponses ? 'Yes' : 'No'}`);
    return config;
};