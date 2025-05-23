/**
 * SpawnerSystem.js
 * 
 * Manages the LLM-based agent spawning system.
 * Generates agent specifications based on team strategy and resources.
 */

import LLMService from './LLMService.js';
import PromptTemplates from './PromptTemplates.js';
import { parseAgentSpecification } from './LLMSchemas.js';

class SpawnerSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.llmService = new LLMService();
        this.spawnQueue = {
            red: [],
            blue: []
        };
        this.spawnCooldown = {
            red: 0,
            blue: 0
        };
        this.spawnCooldownTime = 5000; // 5 seconds between spawn attempts
        
        // Base costs for agent creation
        this.baseCosts = {
            energy: 10,
            materials: 10,
            data: 10
        };
        
        // Role-specific cost multipliers
        this.roleCostMultipliers = {
            collector: { energy: 0.8, materials: 1.0, data: 1.2 },
            explorer: { energy: 1.0, materials: 0.8, data: 1.0 },
            defender: { energy: 1.2, materials: 1.5, data: 0.8 },
            attacker: { energy: 1.5, materials: 1.2, data: 1.0 }
        };
        
        // Enable mock responses if API is not configured
        if (!this.llmService.isConfigured()) {
            this.llmService.enableMockResponses();
        }
    }

    /**
     * Update the spawner system
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        // Update spawn cooldowns
        for (const team of ['red', 'blue']) {
            if (this.spawnCooldown[team] > 0) {
                this.spawnCooldown[team] -= deltaTime;
            } else {
                // If we have agents in the queue, try to spawn one
                if (this.spawnQueue[team].length > 0) {
                    this.trySpawnNextAgent(team);
                    this.spawnCooldown[team] = this.spawnCooldownTime;
                } else if (this.shouldCreateNewAgent(team)) {
                    this.generateAgentSpecification(team);
                }
            }
        }
    }

    /**
     * Generate an agent specification for a team based on strategy
     * @param {string} teamId - ID of the team
     */
    async generateAgentSpecification(teamId) {
        const strategySystem = this.gameEngine.getSystem('teamStrategy');
        const teamStrategy = strategySystem.getTeamStrategy(teamId);
        const gameState = strategySystem.getGameState();
        
        // Make sure agent-specific keywords are in the prompt
        const prompt = PromptTemplates.agentSpecification(gameState, teamId, teamStrategy);
        
        try {
            console.log(`💭 Requesting new ${teamId} team agent...`);
            
            // Set a timeout for agent generation
            const response = await this.llmService.getCompletion(prompt, { 
                timeout: 8000,
                // Add hint for LLMService.detectPromptType
                promptType: 'agent'
            });
            
            let agentSpec;
            
            // First try to parse using the schema parser
            const parsedSpec = parseAgentSpecification(response);
            if (parsedSpec) {
                // Successfully parsed agent spec
                agentSpec = parsedSpec;
            } else {
                // Fallback to manual JSON parsing
                try {
                    agentSpec = JSON.parse(response);
                    // Successfully parsed with JSON
                } catch (parseError) {
                    console.error(`Failed to parse LLM response for agent in ${teamId} team:`, parseError);
                    console.log(`Raw response:`, response);
                    throw new Error('Invalid JSON response from LLM');
                }
            }
            
            // Check if we got a team strategy by mistake
            if (agentSpec && agentSpec.strategy && agentSpec.focus && !agentSpec.role) {
                console.error(`Received team strategy instead of agent specification for ${teamId} team:`, agentSpec);
                throw new Error('Received team strategy instead of agent specification');
            }
            
            // Validate agent specification
            if (this.validateAgentSpecification(agentSpec)) {
                this.spawnQueue[teamId].push(agentSpec);
                console.log(`📥 Added ${agentSpec.role} agent to ${teamId} spawn queue: ${agentSpec.description}`);
            } else {
                console.error(`Invalid agent specification for ${teamId} team:`, response);
                
                // Create fallback agent if specification is invalid
                const fallbackAgent = this.createFallbackAgentSpec(teamId, teamStrategy);
                this.spawnQueue[teamId].push(fallbackAgent);
                console.log(`⚠️ Added fallback ${fallbackAgent.role} agent to ${teamId} spawn queue due to LLM error`);
            }
        } catch (error) {
            console.error(`Error generating agent for ${teamId} team:`, error);
            
            // Create fallback agent on error
            const fallbackAgent = this.createFallbackAgentSpec(teamId, teamStrategy);
            this.spawnQueue[teamId].push(fallbackAgent);
            console.log(`⚠️ Added fallback ${fallbackAgent.role} agent to ${teamId} spawn queue due to LLM error`);
        }
    }

    /**
     * Validate agent specification object
     * @param {Object} spec - Agent specification to validate
     * @returns {boolean} Whether the specification is valid
     */
    validateAgentSpecification(spec) {
        if (!spec) return false;
        
        // Check required fields
        const requiredFields = ['role', 'attributes', 'priority', 'description'];
        for (const field of requiredFields) {
            if (!spec[field]) {
                // Missing required field
                return false;
            }
        }
        
        // Check that role is valid
        const validRoles = ['collector', 'explorer', 'defender', 'attacker'];
        if (!validRoles.includes(spec.role)) {
            // Invalid role in agent spec
            // Try to fix role if possible
            if (typeof spec.role === 'string') {
                if (spec.role.toLowerCase().includes('collect')) spec.role = 'collector';
                else if (spec.role.toLowerCase().includes('explor')) spec.role = 'explorer';
                else if (spec.role.toLowerCase().includes('defend')) spec.role = 'defender';
                else if (spec.role.toLowerCase().includes('attack')) spec.role = 'attacker';
                else return false;
                // Fixed invalid role
            } else {
                return false;
            }
        }
        
        // Check attributes
        const requiredAttributes = ['speed', 'health', 'attack', 'defense', 'carryCapacity'];
        for (const attr of requiredAttributes) {
            if (typeof spec.attributes[attr] !== 'number' || 
                spec.attributes[attr] < 0 || 
                spec.attributes[attr] > 1) {
                // Invalid attribute in agent spec
                
                // Try to fix attribute if possible
                if (typeof spec.attributes[attr] === 'number') {
                    // Clamp value to valid range
                    spec.attributes[attr] = Math.max(0, Math.min(1, spec.attributes[attr]));
                    // Fixed attribute
                } else if (typeof spec.attributes[attr] === 'string') {
                    // Try to parse number from string
                    try {
                        const value = parseFloat(spec.attributes[attr]);
                        if (!isNaN(value)) {
                            spec.attributes[attr] = Math.max(0, Math.min(1, value));
                            // Converted attribute from string
                        } else {
                            spec.attributes[attr] = 0.5; // Default value
                            // Set default attribute value
                        }
                    } catch (e) {
                        spec.attributes[attr] = 0.5; // Default value
                        // Set default attribute value
                    }
                } else {
                    spec.attributes[attr] = 0.5; // Default value
                    // Set default attribute value
                }
            }
        }
        
        // Check priority resource
        const validPriorities = ['energy', 'materials', 'data'];
        if (!validPriorities.includes(spec.priority)) {
            // Invalid priority in agent spec
            // Set a default priority based on role
            if (spec.role === 'collector') spec.priority = 'materials';
            else if (spec.role === 'explorer') spec.priority = 'data';
            else if (spec.role === 'defender') spec.priority = 'materials';
            else if (spec.role === 'attacker') spec.priority = 'energy';
            else spec.priority = 'energy';
            // Set default priority for role
        }
        
        return true;
    }

    /**
     * Create a fallback agent specification when LLM fails
     * @param {string} teamId - Team ID
     * @param {Object} teamStrategy - Current team strategy
     * @returns {Object} Agent specification
     */
    createFallbackAgentSpec(teamId, teamStrategy) {
        // Determine role based on team strategy
        let role = 'collector'; // Default role
        
        if (teamStrategy && teamStrategy.strategy) {
            switch (teamStrategy.strategy) {
                case 'aggressive':
                    role = Math.random() < 0.7 ? 'attacker' : 'explorer';
                    break;
                case 'defensive':
                    role = Math.random() < 0.7 ? 'defender' : 'collector';
                    break;
                case 'economic':
                    role = Math.random() < 0.7 ? 'collector' : 'explorer';
                    break;
                case 'balanced':
                default:
                    // Equal distribution of roles
                    const roles = ['collector', 'explorer', 'defender', 'attacker'];
                    role = roles[Math.floor(Math.random() * roles.length)];
                    break;
            }
        }
        
        // Create attributes based on role
        let attributes = {};
        switch(role) {
            case 'collector':
                attributes = {
                    speed: 0.6,
                    health: 0.5,
                    attack: 0.3,
                    defense: 0.5,
                    carryCapacity: 0.8
                };
                break;
            case 'explorer':
                attributes = {
                    speed: 0.8,
                    health: 0.4,
                    attack: 0.4,
                    defense: 0.3,
                    carryCapacity: 0.3
                };
                break;
            case 'defender':
                attributes = {
                    speed: 0.3,
                    health: 0.9,
                    attack: 0.6,
                    defense: 0.9,
                    carryCapacity: 0.2
                };
                break;
            case 'attacker':
                attributes = {
                    speed: 0.7,
                    health: 0.6,
                    attack: 0.9,
                    defense: 0.4,
                    carryCapacity: 0.1
                };
                break;
        }
        
        // Add some randomness to attributes (±20%)
        for (const attr in attributes) {
            attributes[attr] = Math.max(0.1, Math.min(1.0, attributes[attr] * (0.8 + Math.random() * 0.4)));
        }
        
        // Determine resource priority based on role and strategy
        let priority = 'energy';
        if (role === 'collector') priority = 'materials';
        else if (role === 'explorer') priority = 'data';
        
        // For certain strategies, override priorities
        if (teamStrategy && teamStrategy.focus === 'resources') {
            // If strategy focuses on resources, prioritize energy
            priority = 'energy';
        }
        
        return {
            role,
            attributes,
            priority,
            description: `Fallback ${role} (auto-generated due to LLM error)`
        };
    }

    /**
     * Try to spawn the next agent in the queue
     * @param {string} teamId - ID of the team
     */
    trySpawnNextAgent(teamId) {
        if (this.spawnQueue[teamId].length === 0) return;
        
        const agentSpec = this.spawnQueue[teamId][0];
        const resourceCost = this.calculateResourceCost(agentSpec);
        const baseSystem = this.gameEngine.getSystem('base');
        
        // Check if team has enough resources
        if (baseSystem.hasResources(teamId, resourceCost)) {
            // Deduct resources
            baseSystem.useResources(teamId, resourceCost);
            
            // Create the agent
            const agentSystem = this.gameEngine.getSystem('agent');
            const basePosition = baseSystem.getBasePosition(teamId);
            
            agentSystem.createAgentFromSpec(teamId, agentSpec, basePosition);
            
            // Remove from queue
            this.spawnQueue[teamId].shift();
            
            console.log(`🔝 ${teamId.toUpperCase()} team spawned a ${agentSpec.role.toUpperCase()} agent (cost: ${resourceCost.energy}E, ${resourceCost.materials}M, ${resourceCost.data}D)`);
        }
    }

    /**
     * Calculate resource cost for an agent specification
     * @param {Object} agentSpec - Agent specification
     * @returns {Object} Resource costs
     */
    calculateResourceCost(agentSpec) {
        const roleMult = this.roleCostMultipliers[agentSpec.role];
        const attrSum = Object.values(agentSpec.attributes).reduce((sum, val) => sum + val, 0);
        const attrMultiplier = 0.8 + (attrSum / 5); // 5 attributes, so average * 5 = sum
        
        return {
            energy: Math.round(this.baseCosts.energy * roleMult.energy * attrMultiplier),
            materials: Math.round(this.baseCosts.materials * roleMult.materials * attrMultiplier),
            data: Math.round(this.baseCosts.data * roleMult.data * attrMultiplier)
        };
    }

    /**
     * Determine if a new agent should be created
     * @param {string} teamId - ID of the team
     * @returns {boolean} Whether a new agent should be created
     */
    shouldCreateNewAgent(teamId) {
        const baseSystem = this.gameEngine.getSystem('base');
        const agentSystem = this.gameEngine.getSystem('agent');
        const strategySystem = this.gameEngine.getSystem('teamStrategy');
        
        const teamResources = baseSystem.getTeamResources(teamId);
        const teamAgents = agentSystem.getAgentsByTeam(teamId);
        const teamStrategy = strategySystem.getTeamStrategy(teamId);
        
        // Don't create too many agents
        const maxAgents = 10;
        if (teamAgents.length >= maxAgents) return false;
        
        // Make sure we have resources for at least a basic agent
        const minCost = {
            energy: this.baseCosts.energy * 0.8,
            materials: this.baseCosts.materials * 0.8,
            data: this.baseCosts.data * 0.8
        };
        
        if (teamResources.energy < minCost.energy ||
            teamResources.materials < minCost.materials ||
            teamResources.data < minCost.data) {
            return false;
        }
        
        // Create more agents if we have substantial resources
        const resourceThreshold = 50;
        const totalResources = teamResources.energy + teamResources.materials + teamResources.data;
        
        if (totalResources > resourceThreshold) {
            return true;
        }
        
        // Consider team strategy
        if (teamStrategy.strategy === 'aggressive' && teamAgents.length < 5) {
            return true;
        }
        
        // Random chance to create agent
        return Math.random() < 0.1;
    }

    /**
     * Manually request a new agent specification (for debugging/testing)
     * @param {string} teamId - ID of the team
     */
    requestAgentSpecification(teamId) {
        this.generateAgentSpecification(teamId);
    }

    /**
     * Clear the spawn queue for a team
     * @param {string} teamId - ID of the team
     */
    clearSpawnQueue(teamId) {
        this.spawnQueue[teamId] = [];
    }
}

export default SpawnerSystem;