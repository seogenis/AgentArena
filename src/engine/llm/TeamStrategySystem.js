/**
 * TeamStrategySystem.js
 * 
 * Manages team-level strategic decisions using LLM integration.
 * Determines high-level team strategies and priorities.
 */

import LLMService from './LLMService.js';
import PromptTemplates from './PromptTemplates.js';
import ServiceInitializer from './ServiceInitializer.js';

class TeamStrategySystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.llmService = new LLMService();
        
        // Register with ServiceInitializer for API updates
        ServiceInitializer.registerService('TeamStrategySystem', this);
        
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
        
        // Configure from current environment settings
        const env = typeof window !== 'undefined' ? window.process?.env : process?.env;
        if (env) {
            const apiKey = env.LLM_API_KEY || '';
            const useMockResponses = env.USE_MOCK_RESPONSES === 'true';
            
            if (apiKey && !useMockResponses) {
                console.log('🔑 Using OpenAI API for TeamStrategySystem');
            } else {
                console.log('🤖 Using mock responses for TeamStrategySystem');
                this.llmService.enableMockResponses();
            }
        } else {
            // Enable mock responses if environment not configured
            console.log('⚠️ Environment not initialized. Using mock responses for TeamStrategySystem.');
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
                console.log(`✅ Updated ${teamId} team strategy:`, newStrategy.description);
            } else {
                console.warn(`⚠️ Invalid strategy response for ${teamId} team, using fallback strategy`);
                
                // Use a fallback strategy instead of keeping old one
                this.teamStrategies[teamId] = {
                    strategy: "balanced",
                    focus: "resources",
                    priorities: ["collect_energy", "expand_territory", "defend_base"],
                    description: "Fallback balanced strategy due to invalid response.",
                    lastUpdated: Date.now()
                };
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
        
        // Handle potential null or undefined systems
        if (!worldSystem || !agentSystem || !resourceSystem || !baseSystem) {
            console.error('TeamStrategySystem: Missing required game systems');
            return {
                territoryControl: { red: 50, blue: 50 },
                agents: { red: [], blue: [] },
                resources: { 
                    red: { energy: 0, materials: 0, data: 0 },
                    blue: { energy: 0, materials: 0, data: 0 }
                },
                resourcesOnMap: { energy: 0, materials: 0, data: 0, total: 0 }
            };
        }
        
        // Safe access to methods
        const territoryControl = worldSystem.getTerritoryControlPercentages?.() || { red: 50, blue: 50 };
        
        // Handle agent counts safely
        let redAgents = [];
        let blueAgents = [];
        try {
            redAgents = agentSystem.getAgentsByTeam('red') || [];
            blueAgents = agentSystem.getAgentsByTeam('blue') || [];
        } catch (e) {
            console.error('Error getting agent counts:', e);
        }
        
        // Handle resource access safely
        let redResources = { energy: 0, materials: 0, data: 0 };
        let blueResources = { energy: 0, materials: 0, data: 0 };
        try {
            redResources = baseSystem.getTeamResources('red') || redResources;
            blueResources = baseSystem.getTeamResources('blue') || blueResources;
        } catch (e) {
            console.error('Error getting team resources:', e);
        }
        
        // Handle resource counts safely
        let resourceCounts = { energy: 0, materials: 0, data: 0, total: 0 };
        try {
            resourceCounts = resourceSystem.getResourceCounts?.() || resourceCounts;
        } catch (e) {
            console.error('Error getting resource counts:', e);
        }
        
        return {
            territoryControl: territoryControl,
            agents: {
                red: redAgents,
                blue: blueAgents
            },
            resources: {
                red: redResources,
                blue: blueResources
            },
            resourcesOnMap: resourceCounts
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