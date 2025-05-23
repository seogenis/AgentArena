/**
 * TeamStrategySystem.js
 * 
 * Manages team-level strategic decisions using LLM integration.
 * Determines high-level team strategies and priorities.
 */

import LLMService from './LLMService.js';
import PromptTemplates from './PromptTemplates.js';

class TeamStrategySystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.llmService = new LLMService();
        
        // Strategy cache to avoid too frequent API calls
        this.teamStrategies = {
            red: {
                strategy: 'balanced',
                focus: 'resources',
                priorities: ['collect_energy', 'expand_territory', 'defend_base'],
                description: 'Default balanced strategy focusing on resources',
                lastUpdated: Date.now()
            },
            blue: {
                strategy: 'balanced',
                focus: 'resources',
                priorities: ['collect_energy', 'expand_territory', 'defend_base'],
                description: 'Default balanced strategy focusing on resources',
                lastUpdated: Date.now()
            }
        };
        
        // Time between strategy updates (in milliseconds)
        this.strategyUpdateInterval = 30000; // 30 seconds
        
        // Enable mock responses if API is not configured
        if (!this.llmService.isConfigured()) {
            console.log('LLM API not configured. Using mock responses for TeamStrategySystem.');
            this.llmService.enableMockResponses();
        }
    }

    /**
     * Update team strategies based on current game state
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        const currentTime = Date.now();
        
        // Update red team strategy if needed
        if (currentTime - this.teamStrategies.red.lastUpdated >= this.strategyUpdateInterval) {
            this.updateTeamStrategy('red');
        }
        
        // Update blue team strategy if needed
        if (currentTime - this.teamStrategies.blue.lastUpdated >= this.strategyUpdateInterval) {
            this.updateTeamStrategy('blue');
        }
    }

    /**
     * Update strategy for a specific team
     * @param {string} teamId - ID of the team to update
     */
    async updateTeamStrategy(teamId) {
        const gameState = this.getGameState();
        const prompt = PromptTemplates.teamStrategy(gameState, teamId);
        
        try {
            // Set a timeout option for the LLM service
            const response = await this.llmService.getCompletion(prompt, { timeout: 8000 });
            
            // Handle potential non-JSON responses
            let newStrategy;
            try {
                newStrategy = JSON.parse(response);
            } catch (parseError) {
                console.error(`Failed to parse LLM response for ${teamId} team:`, parseError);
                console.log(`Raw response:`, response);
                throw new Error('Invalid JSON response from LLM');
            }
            
            // Validate strategy fields
            if (this.validateTeamStrategy(newStrategy)) {
                this.teamStrategies[teamId] = {
                    ...newStrategy,
                    lastUpdated: Date.now()
                };
                console.log(`Updated ${teamId} team strategy:`, newStrategy.description);
            } else {
                console.error(`Invalid strategy response for ${teamId} team:`, response);
                // Keep using existing strategy instead of failing
            }
        } catch (error) {
            console.error(`Error updating ${teamId} team strategy:`, error);
            // No need to update lastUpdated since we're keeping the old strategy
        }
    }

    /**
     * Validate team strategy object
     * @param {Object} strategy - Strategy object to validate
     * @returns {boolean} Whether the strategy is valid
     */
    validateTeamStrategy(strategy) {
        if (!strategy) return false;
        
        // Check required fields
        const requiredFields = ['strategy', 'focus', 'priorities', 'description'];
        for (const field of requiredFields) {
            if (!strategy[field]) return false;
        }
        
        // Check that priorities is an array
        if (!Array.isArray(strategy.priorities) || strategy.priorities.length === 0) {
            return false;
        }
        
        return true;
    }

    /**
     * Get current game state for decision making
     * @returns {Object} Current game state
     */
    getGameState() {
        const worldSystem = this.gameEngine.getSystem('world');
        const agentSystem = this.gameEngine.getSystem('agent');
        const resourceSystem = this.gameEngine.getSystem('resource');
        const baseSystem = this.gameEngine.getSystem('base');
        
        return {
            territoryControl: worldSystem.getTerritoryControlPercentages(),
            agents: {
                red: agentSystem.getAgentsByTeam('red'),
                blue: agentSystem.getAgentsByTeam('blue')
            },
            resources: {
                red: baseSystem.getTeamResources('red'),
                blue: baseSystem.getTeamResources('blue')
            },
            resourcesOnMap: resourceSystem.getResourceCounts()
        };
    }

    /**
     * Get the current strategy for a team
     * @param {string} teamId - ID of the team
     * @returns {Object} Current team strategy
     */
    getTeamStrategy(teamId) {
        return this.teamStrategies[teamId];
    }

    /**
     * Manually set a team's strategy (for debugging or testing)
     * @param {string} teamId - ID of the team
     * @param {Object} strategy - New strategy object
     */
    setTeamStrategy(teamId, strategy) {
        if (this.validateTeamStrategy(strategy)) {
            this.teamStrategies[teamId] = {
                ...strategy,
                lastUpdated: Date.now()
            };
        }
    }

    /**
     * Force an immediate strategy update for a team
     * @param {string} teamId - ID of the team to update
     */
    forceStrategyUpdate(teamId) {
        this.updateTeamStrategy(teamId);
    }
}

export default TeamStrategySystem;