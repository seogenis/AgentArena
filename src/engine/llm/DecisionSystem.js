// Decision system to handle agent decision making using LLM

import { LLMInterface } from './LLMInterface.js';
import { AgentMemory } from './AgentMemory.js';

export class DecisionSystem {
    constructor() {
        this.llmInterface = new LLMInterface();
        this.agentMemories = new Map(); // Maps agent.id to AgentMemory
        this.decisionCache = new Map(); // Cache recent decisions to reduce API calls
        this.fallbackMode = false; // Use fallback if API is not available
        
        // Configuration
        this.minDecisionInterval = 2000; // Minimum ms between decision requests (2 seconds)
        this.decisionCooldowns = new Map(); // Track cooldowns for each agent
        
        // Initialize
        this.init();
    }
    
    async init() {
        // This would normally configure the LLM API with keys, etc.
        // For demo purposes, we'll just use the debug mode
        console.log("Initializing Decision System with simulated LLM responses");
    }
    
    // Get or create memory for an agent
    getAgentMemory(agent) {
        if (!this.agentMemories.has(agent.id)) {
            this.agentMemories.set(agent.id, new AgentMemory(agent));
        }
        return this.agentMemories.get(agent.id);
    }
    
    // Main method to get a decision for an agent
    async getDecision(agent, perception, timestamp) {
        if (!agent || !perception) {
            return this.getFallbackDecision(agent, "Missing agent or perception data");
        }
        
        // Check decision cooldown
        if (this.decisionCooldowns.has(agent.id)) {
            const lastTime = this.decisionCooldowns.get(agent.id);
            if (timestamp - lastTime < this.minDecisionInterval) {
                // Reuse the last decision if in cooldown period
                return this.getLastDecision(agent);
            }
        }
        
        // Get agent's memory
        const memory = this.getAgentMemory(agent);
        
        // Generate or retrieve personality
        if (!memory.personality) {
            await memory.generatePersonality(this.llmInterface);
        }
        
        // Generate decision context
        const context = memory.generateDecisionContext(perception);
        
        // Get decision from LLM
        let decision;
        try {
            decision = await this.getLLMDecision(agent, context);
            
            // Update decision cooldown
            this.decisionCooldowns.set(agent.id, timestamp);
            
            // Record the decision in memory
            memory.recordDecision(
                decision.action,
                decision.target,
                decision.reasoning,
                timestamp
            );
            
            // Add perception to agent's memory
            memory.addObservation(perception, timestamp);
            
        } catch (error) {
            console.error('Error getting LLM decision:', error);
            decision = this.getFallbackDecision(agent, "API error");
        }
        
        return decision;
    }
    
    // Get decision from LLM API
    async getLLMDecision(agent, context) {
        // Create a prompt for the LLM based on the context
        const prompt = this.createDecisionPrompt(agent, context);
        
        // Calculate options for the LLM call
        const options = this.calculateLLMOptions(agent, context);
        
        // Call LLM interface
        const response = await this.llmInterface.getResponse(prompt, options);
        
        return this.parseDecisionResponse(response);
    }
    
    // Create a formatted prompt for the LLM
    createDecisionPrompt(agent, context) {
        const { personality, currentState, perception, lastDecision } = context;
        const { visibleEntities, environment, teamKnowledge } = perception;
        
        // Format the prompt with all relevant information
        return `AGENT_DECISION
Agent ID: ${agent.id}
Team: ${agent.teamId === 1 ? 'Red' : 'Blue'}
Type: ${agent.type}
Designation: ${personality.designation}
Traits: ${personality.traits.join(', ')}
Background: ${personality.background}
Focus: ${personality.focus}

Current State:
- Position: (${currentState.position.x.toFixed(0)}, ${currentState.position.y.toFixed(0)})
- Health: ${(currentState.health * 100).toFixed(0)}%
- Carrying: ${currentState.resourceAmount > 0 ? 
    `${currentState.resourceAmount} ${currentState.resourceType}` : 'nothing'}
- In combat: ${currentState.inCombat ? 'Yes' : 'No'}
- Emotional state: Aggression ${currentState.emotionalState.aggression.toFixed(2)}, 
  Caution ${currentState.emotionalState.caution.toFixed(2)}, 
  Determination ${currentState.emotionalState.determination.toFixed(2)}

Observations:
- Enemies visible: ${visibleEntities.agents.enemies.length}
- Allies visible: ${visibleEntities.agents.allies.length}
- Resources visible: ${visibleEntities.resources.length}
- Territory control: ${agent.teamId === 1 ? 
    `${(environment.territoryControl.team1 * 100).toFixed(0)}% us vs ${(environment.territoryControl.team2 * 100).toFixed(0)}% them` : 
    `${(environment.territoryControl.team2 * 100).toFixed(0)}% us vs ${(environment.territoryControl.team1 * 100).toFixed(0)}% them`}
- Distance to own base: ${environment.nearestBase.own ? 
    environment.nearestBase.own.distance.toFixed(0) : 'unknown'}
- Danger level: ${(environment.dangerLevel * 100).toFixed(0)}%

Team Knowledge:
- Resource hotspots: ${teamKnowledge.resourceHotspots.length}
- Danger zones: ${teamKnowledge.dangerZones.length}
- Enemy base location: ${teamKnowledge.enemyBase ? 'Known' : 'Unknown'}

${lastDecision ? `Last Decision:
- Action: ${lastDecision.action}
- Target: ${lastDecision.target}
- Reasoning: ${lastDecision.reasoning}` : 'No previous decision.'}

Please make a decision for this agent based on its current situation and personality.`;
    }
    
    // Calculate additional options for the LLM call
    calculateLLMOptions(agent, context) {
        const { perception } = context;
        
        return {
            teamId: agent.teamId,
            type: agent.type,
            health: context.currentState.health,
            resourcesCarried: agent.resourceAmount,
            nearbyResources: perception.visibleEntities.resources.length,
            nearbyEnemies: perception.visibleEntities.agents.enemies.length,
            nearbyAllies: perception.visibleEntities.agents.allies.length,
            unclaimedTerritory: agent.teamId === 1 ? 
                perception.environment.territoryControl.neutral : 
                perception.environment.territoryControl.neutral
        };
    }
    
    // Parse the response from the LLM into a structured decision
    parseDecisionResponse(response) {
        // Response should already be in the expected format
        // But we'll validate it here
        const validActions = [
            'EXPLORE', 'COLLECT', 'RETURN_TO_BASE', 
            'ATTACK', 'FLEE', 'CLAIM_TERRITORY', 
            'SCOUT_ENEMY', 'DEFEND', 'HEAL'
        ];
        
        if (!response || !response.action || !validActions.includes(response.action)) {
            return {
                action: 'EXPLORE',
                target: 'RANDOM',
                reasoning: 'Invalid response from LLM, using fallback exploration.'
            };
        }
        
        return {
            action: response.action,
            target: response.target || 'NEAREST',
            reasoning: response.reasoning || 'No reasoning provided.'
        };
    }
    
    // Get the last recorded decision for an agent
    getLastDecision(agent) {
        const memory = this.getAgentMemory(agent);
        if (memory.currentAction && memory.currentTarget) {
            return {
                action: memory.currentAction,
                target: memory.currentTarget,
                reasoning: memory.currentReasoning || 'Reusing previous decision.'
            };
        }
        
        // Fallback if no previous decision
        return this.getFallbackDecision(agent, "No previous decision available");
    }
    
    // Get a fallback decision when LLM is unavailable
    getFallbackDecision(agent, reason) {
        const randomActions = [
            { action: 'EXPLORE', target: 'RANDOM' },
            { action: 'EXPLORE', target: 'RESOURCE_RICH' },
            { action: 'COLLECT', target: 'NEAREST_RESOURCE' },
            { action: 'RETURN_TO_BASE', target: 'BASE' }
        ];
        
        // If carrying resources, return to base
        if (agent.resourceAmount > 0) {
            return {
                action: 'RETURN_TO_BASE',
                target: 'BASE',
                reasoning: `${reason}. Fallback: Returning to base with resources.`
            };
        }
        
        // If low health, retreat to heal
        if (agent.health < 40) {
            return {
                action: 'HEAL',
                target: 'BASE',
                reasoning: `${reason}. Fallback: Health low, retreating to heal.`
            };
        }
        
        // Otherwise, pick a random action
        const fallback = randomActions[Math.floor(Math.random() * randomActions.length)];
        return {
            action: fallback.action,
            target: fallback.target,
            reasoning: `${reason}. Fallback: Using random exploration behavior.`
        };
    }
    
    // Record a significant event for an agent
    recordEvent(agentId, eventType, details, timestamp) {
        const agent = this.getAgentById(agentId);
        if (!agent) return;
        
        const memory = this.getAgentMemory(agent);
        memory.addSignificantEvent(eventType, details, timestamp);
    }
    
    // Utility to get agent by ID from the world
    getAgentById(agentId) {
        return this.worldSystem?.agentSystem?.getAgentById(agentId);
    }
    
    // Set reference to world system
    setWorldSystem(worldSystem) {
        this.worldSystem = worldSystem;
    }
}