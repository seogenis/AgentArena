// APIConfigurer.js - Utility to configure LLM API at runtime
// This allows setting API keys after the game has initialized

export class APIConfigurer {
    constructor(worldSystem) {
        this.worldSystem = worldSystem;
    }
    
    /**
     * Configure the API key for LLM services
     * @param {string} apiKey - The API key to use
     * @param {string} model - Optional model name (defaults to gpt-4.1-mini)
     * @param {boolean} useDebugMode - Whether to use debug mode with simulated responses
     * @returns {boolean} Success status
     */
    configureAPI(apiKey, model = "gpt-4.1-mini", useDebugMode = false) {
        if (!this.worldSystem || !this.worldSystem.agentSystem) {
            console.error("World system not properly initialized");
            return false;
        }
        
        try {
            // Store API key in window for persistence
            window.OPENAI_API_KEY = apiKey;
            
            // Get decision system
            const decisionSystem = this.worldSystem.agentSystem.decisionSystem;
            
            if (!decisionSystem || !decisionSystem.llmInterface) {
                console.error("Decision system or LLM interface not found");
                return false;
            }
            
            // Configure the LLM interface
            decisionSystem.llmInterface.configure(apiKey, null, model);
            decisionSystem.llmInterface.isDebugMode = useDebugMode;
            
            // Force a new round of decisions by resetting the decision time
            decisionSystem.lastDecisionTime = 0;
            
            console.log(`API configured successfully! Using ${useDebugMode ? 'simulated' : 'real'} LLM responses with model: ${model}`);
            return true;
        } catch (error) {
            console.error("Error configuring API:", error);
            return false;
        }
    }
    
    /**
     * Enable debug mode with simulated responses (no API key needed)
     * @returns {boolean} Success status
     */
    enableDebugMode() {
        if (!this.worldSystem || !this.worldSystem.agentSystem) {
            console.error("World system not properly initialized");
            return false;
        }
        
        try {
            const decisionSystem = this.worldSystem.agentSystem.decisionSystem;
            
            if (!decisionSystem || !decisionSystem.llmInterface) {
                console.error("Decision system or LLM interface not found");
                return false;
            }
            
            // Enable debug mode
            decisionSystem.llmInterface.isDebugMode = true;
            
            console.log("Debug mode enabled! Using simulated LLM responses");
            return true;
        } catch (error) {
            console.error("Error enabling debug mode:", error);
            return false;
        }
    }
}