/**
 * LLMSystem.js
 * 
 * Core system for managing LLM integration in the game.
 * Coordinates between TeamStrategySystem and SpawnerSystem.
 */

import { LLMService } from './index.js';
import SpawnerSystem from './SpawnerSystem.js';
import TeamStrategySystem from './TeamStrategySystem.js';
import serviceInitializer from './ServiceInitializer.js';

class LLMSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.enabled = true;
        this.llmService = new LLMService();
        
        // Create and register subsystems
        this.teamStrategySystem = new TeamStrategySystem(gameEngine);
        this.spawnerSystem = new SpawnerSystem(gameEngine);
        
        // Register this system for reinitialization
        serviceInitializer.registerService('LLMSystem', this);
        
        console.log('LLM System initialized');
    }
    
    /**
     * Initialize the LLM system
     */
    initialize() {
        // Register subsystems with game engine
        this.gameEngine.registerSystem('teamStrategy', this.teamStrategySystem);
        this.gameEngine.registerSystem('spawner', this.spawnerSystem);
        
        console.log('LLM subsystems registered with game engine');
    }
    
    /**
     * Update the LLM system
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        if (!this.enabled) return;
        
        // Update subsystems
        this.teamStrategySystem.update(deltaTime);
        this.spawnerSystem.update(deltaTime);
    }
    
    /**
     * Enable or disable the LLM system
     * @param {boolean} enabled - Whether the system should be enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`LLM System ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Get the current status of the LLM system
     * @returns {Object} Status information
     */
    getStatus() {
        const apiConfig = window.getAPIConfig ? window.getAPIConfig() : { useMockResponses: true };
        
        return {
            enabled: this.enabled,
            useMockResponses: apiConfig.useMockResponses,
            apiConfigured: this.llmService.isConfigured(),
            requestsInProgress: this.llmService.hasRequestsInProgress()
        };
    }
    
    /**
     * Request a new team strategy for a specific team
     * @param {string} teamId - ID of the team
     */
    requestTeamStrategy(teamId) {
        if (!this.enabled) return;
        this.teamStrategySystem.requestTeamStrategy(teamId);
    }
    
    /**
     * Request a new agent for a specific team
     * @param {string} teamId - ID of the team
     */
    requestAgent(teamId) {
        if (!this.enabled) return;
        this.spawnerSystem.requestAgentSpecification(teamId);
    }
}

export default LLMSystem;