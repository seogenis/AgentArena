/**
 * TeamStrategySystem.js
 * 
 * Manages team-level strategic decisions using LLM integration.
 * Determines high-level team strategies and priorities.
 * Enhanced with visualization for AIQToolkit strategies.
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
        const redTeamId = this.normalizeTeamId('red');
        const blueTeamId = this.normalizeTeamId('blue');
        
        this.teamStrategies = {};
        this.teamStrategies[redTeamId] = {
            strategy: 'balanced',
            focus: 'resources',
            priorities: ['collect_energy', 'expand_territory', 'defend_base'],
            description: 'Default balanced strategy focusing on resources',
            lastUpdated: Date.now()
        };
        this.teamStrategies[blueTeamId] = {
            strategy: 'balanced',
            focus: 'resources',
            priorities: ['collect_energy', 'expand_territory', 'defend_base'],
            description: 'Default balanced strategy focusing on resources',
            lastUpdated: Date.now()
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
        const redTeamId = this.normalizeTeamId('red');
        const blueTeamId = this.normalizeTeamId('blue');
        
        // Update red team strategy if needed
        if (currentTime - this.teamStrategies[redTeamId].lastUpdated >= this.strategyUpdateInterval) {
            this.updateTeamStrategy(redTeamId);
        }
        
        // Update blue team strategy if needed
        if (currentTime - this.teamStrategies[blueTeamId].lastUpdated >= this.strategyUpdateInterval) {
            this.updateTeamStrategy(blueTeamId);
        }
    }

    /**
     * Update strategy for a specific team
     * @param {string} teamId - ID of the team to update
     */
    async updateTeamStrategy(teamId) {
        // Normalize team ID for consistent handling
        const normalizedTeamId = this.normalizeTeamId(teamId);
        const gameState = this.getGameState();
        const prompt = PromptTemplates.teamStrategy(gameState, normalizedTeamId);
        
        try {
            // Set a timeout option for the LLM service
            const response = await this.llmService.getCompletion(prompt, { timeout: 8000 });
            
            // Handle potential non-JSON responses
            let newStrategy;
            try {
                newStrategy = JSON.parse(response);
            } catch (parseError) {
                console.error(`Failed to parse LLM response for ${normalizedTeamId} team:`, parseError);
                console.log(`Raw response:`, response);
                throw new Error('Invalid JSON response from LLM');
            }
            
            // Validate strategy fields
            if (this.validateTeamStrategy(newStrategy)) {
                // Add source information to the strategy
                if (this.llmService.useBackend && this.llmService.backendClient.isConnected) {
                    newStrategy.source = 'AIQToolkit';
                } else if (this.llmService.apiKey) {
                    newStrategy.source = 'Direct LLM';
                } else {
                    newStrategy.source = 'Mock';
                }
                
                this.teamStrategies[normalizedTeamId] = {
                    ...newStrategy,
                    lastUpdated: Date.now()
                };
                
                console.log(`✅ Updated ${normalizedTeamId} team strategy:`, newStrategy.description);
                
                // Display the updated strategy in the UI
                this.displayTeamStrategy(normalizedTeamId, this.teamStrategies[normalizedTeamId]);
            } else {
                console.warn(`⚠️ Invalid strategy response for ${normalizedTeamId} team, using fallback strategy`);
                
                // Use a fallback strategy instead of keeping old one
                this.teamStrategies[normalizedTeamId] = {
                    strategy: "balanced",
                    focus: "resources",
                    priorities: ["collect_energy", "expand_territory", "defend_base"],
                    description: "Fallback balanced strategy due to invalid response.",
                    source: 'Fallback',
                    lastUpdated: Date.now()
                };
                
                // Display the fallback strategy in the UI
                this.displayTeamStrategy(normalizedTeamId, this.teamStrategies[normalizedTeamId]);
            }
        } catch (error) {
            console.error(`Error updating ${normalizedTeamId} team strategy:`, error);
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
        const normalizedTeamId = this.normalizeTeamId(teamId);
        return this.teamStrategies[normalizedTeamId];
    }

    /**
     * Manually set a team's strategy (for debugging or testing)
     * @param {string} teamId - ID of the team
     * @param {Object} strategy - New strategy object
     */
    setTeamStrategy(teamId, strategy) {
        const normalizedTeamId = this.normalizeTeamId(teamId);
        if (this.validateTeamStrategy(strategy)) {
            this.teamStrategies[normalizedTeamId] = {
                ...strategy,
                source: 'Manual',
                lastUpdated: Date.now()
            };
            
            // Display the manually set strategy in the UI
            this.displayTeamStrategy(normalizedTeamId, this.teamStrategies[normalizedTeamId]);
        }
    }
    
    /**
     * Display team strategy in debug overlay
     * @param {string} teamId - ID of the team
     * @param {Object} strategy - Strategy object to display
     */
    displayTeamStrategy(teamId, strategy) {
        const debugOverlay = document.getElementById('debug-overlay');
        if (!debugOverlay) return;
        
        // Normalize team ID
        const normalizedTeamId = this.normalizeTeamId(teamId);
        const teamColor = normalizedTeamId === 'red' ? 'Red' : 'Blue';
        const strategyElement = document.getElementById(`${teamColor.toLowerCase()}-team-strategy`);
        
        if (strategyElement) {
            // Update existing element
            strategyElement.innerHTML = this.formatStrategyDisplay(teamColor, strategy);
        } else {
            // Create new element
            const newStrategyElement = document.createElement('div');
            newStrategyElement.id = `${teamColor.toLowerCase()}-team-strategy`;
            newStrategyElement.className = 'team-strategy';
            newStrategyElement.innerHTML = this.formatStrategyDisplay(teamColor, strategy);
            debugOverlay.appendChild(newStrategyElement);
        }
    }
    
    /**
     * Format strategy display with enhanced information
     * @param {string} teamColor - Team color (Red/Blue)
     * @param {Object} strategy - Strategy object
     * @returns {string} HTML for strategy display
     */
    formatStrategyDisplay(teamColor, strategy) {
        let html = `<h3>${teamColor} Team Strategy</h3>`;
        
        // Main strategy
        html += `<div class="strategy-type">${strategy.strategy.toUpperCase()}</div>`;
        
        // Focus with visual indicator
        const focusClass = `focus-${strategy.focus}`;
        html += `<div class="strategy-focus ${focusClass}">${strategy.focus.toUpperCase()}</div>`;
        
        // Priorities
        if (strategy.priorities && strategy.priorities.length > 0) {
            html += '<div style="margin-top: 5px;">Priorities: ';
            html += strategy.priorities.map(p => `<span class="priority">${p.replace('_', ' ')}</span>`).join(' ');
            html += '</div>';
        }
        
        // Description
        if (strategy.description) {
            html += `<div class="strategy-desc">${strategy.description}</div>`;
        }
        
        // Source indicator
        const source = strategy.source || 'Unknown';
        html += `<div class="strategy-source">Source: ${source}</div>`;
        
        return html;
    }

    /**
     * Force an immediate strategy update for a team
     * @param {string} teamId - ID of the team to update
     */
    forceStrategyUpdate(teamId) {
        this.updateTeamStrategy(teamId);
    }
    
    /**
     * Normalize team ID to consistent 'red'/'blue' format
     * @param {string} teamId - Team ID to normalize
     * @returns {string} - Normalized team ID ('red' or 'blue')
     */
    normalizeTeamId(teamId) {
        const teamIdMap = {
            "team1": "red", 
            "team2": "blue", 
            "1": "red", 
            "2": "blue",
            "red": "red",
            "blue": "blue"
        };
        return teamIdMap[teamId] || (teamId.toLowerCase().includes('red') ? 'red' : 'blue');
    }
}

export default TeamStrategySystem;