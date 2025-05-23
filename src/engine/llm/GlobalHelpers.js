// GlobalHelpers.js - Provides global helper functions for API configuration

// Function to set the OpenAI API key and configure the LLM system
window.setOpenAIKey = function(apiKey, useRealAPI = true) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
        console.error("Invalid API key provided");
        return false;
    }
    
    try {
        // Store API key
        window.OPENAI_API_KEY = apiKey;
        
        // Get references to game objects
        const gameEngine = window.gameEngine;
        if (!gameEngine || !gameEngine.worldSystem) {
            console.error("Game engine not initialized yet");
            return false;
        }
        
        // Configure API
        const success = gameEngine.worldSystem.apiConfigurer.configureAPI(
            apiKey, 
            "gpt-4.1-mini", 
            !useRealAPI // Debug mode is opposite of useRealAPI
        );
        
        if (success) {
            console.log(`API key configured successfully! Using ${useRealAPI ? 'real' : 'simulated'} LLM responses`);
            return true;
        } else {
            console.error("Failed to configure API key");
            return false;
        }
    } catch (error) {
        console.error("Error setting API key:", error);
        return false;
    }
};

// Function to enable debug mode (simulated responses)
window.useDebugMode = function() {
    try {
        // Get references to game objects
        const gameEngine = window.gameEngine;
        if (!gameEngine || !gameEngine.worldSystem) {
            console.error("Game engine not initialized yet");
            return false;
        }
        
        // Enable debug mode
        const success = gameEngine.worldSystem.apiConfigurer.enableDebugMode();
        
        if (success) {
            console.log("Debug mode enabled! Using simulated LLM responses");
            return true;
        } else {
            console.error("Failed to enable debug mode");
            return false;
        }
    } catch (error) {
        console.error("Error enabling debug mode:", error);
        return false;
    }
};

// Function to get the current LLM configuration status
window.getLLMStatus = function() {
    try {
        // Get references to game objects
        const gameEngine = window.gameEngine;
        if (!gameEngine || !gameEngine.worldSystem) {
            return "Game engine not initialized yet";
        }
        
        const decisionSystem = gameEngine.worldSystem.agentSystem.decisionSystem;
        const llmInterface = decisionSystem.llmInterface;
        
        return {
            isDebugMode: llmInterface.isDebugMode,
            apiKey: llmInterface.apiKey ? "Set (hidden)" : "Not set",
            model: llmInterface.model,
            llmControlEnabled: gameEngine.worldSystem.agentSystem.useLLMControl
        };
    } catch (error) {
        console.error("Error getting LLM status:", error);
        return "Error getting LLM status";
    }
};

// Display usage instructions in console
console.log("LLM API Helper Functions Available:");
console.log("- setOpenAIKey(apiKey, useRealAPI = true): Configure the OpenAI API key");
console.log("- useDebugMode(): Switch to simulated responses (no API calls)");
console.log("- getLLMStatus(): Check current LLM configuration");
console.log("- Press 'M' key to toggle between real API and debug mode");