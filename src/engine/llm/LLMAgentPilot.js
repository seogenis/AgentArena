import { LLMSystem } from './LLMSystem.js';
import { ObservationSystem } from './ObservationSystem.js';
import { DecisionSystem } from './DecisionSystem.js';
import { MemorySystem } from './MemorySystem.js';
import { PromptTemplates } from './PromptTemplates.js';

export class LLMAgentPilot {
    constructor(worldSystem, options = {}) {
        // Store reference to world system and its components
        this.worldSystem = worldSystem;
        
        // Initialize subsystems
        this.llmSystem = new LLMSystem(options.llm);
        this.observationSystem = new ObservationSystem(
            this.worldSystem.hexGrid,
            this.worldSystem.agentSystem,
            this.worldSystem.resourceSystem,
            this.worldSystem.baseSystem
        );
        this.decisionSystem = new DecisionSystem(
            this.worldSystem.agentSystem,
            this.worldSystem.hexGrid,
            this.worldSystem.baseSystem
        );
        this.memorySystem = new MemorySystem(options.memory);
        
        // Decision timing parameters
        this.decisionInterval = options.decisionInterval || 3000; // Time between decisions in ms
        this.agentDecisionTimers = new Map(); // Maps agent ID -> next decision time
        this.lastDecisionTime = Date.now();
        
        // Enable mock mode for testing without API
        this.llmSystem.setMockMode(true, this.createMockResponses());
        
        // Agent performance monitoring
        this.performanceStats = {
            decisions: 0,
            successfulDecisions: 0,
            apiCalls: 0,
            apiErrors: 0,
            avgResponseTime: 0
        };
    }
    
    // Update method called by world system
    update(deltaTime, timestamp) {
        const currentTime = Date.now();
        
        // Check if it's time to clean up old memories
        if (currentTime - this.lastMemoryCleanup > 60000) { // Every minute
            this.memorySystem.cleanupOldMemories();
            this.lastMemoryCleanup = currentTime;
        }
        
        // Update each agent that is due for a decision
        for (const agent of this.worldSystem.agentSystem.agents) {
            // Create a decision timer if none exists
            if (!this.agentDecisionTimers.has(agent.id)) {
                // Stagger decision times to prevent all agents deciding at once
                const offset = Math.random() * this.decisionInterval;
                this.agentDecisionTimers.set(agent.id, currentTime + offset);
            }
            
            // Check if it's time for this agent to make a decision
            if (currentTime >= this.agentDecisionTimers.get(agent.id)) {
                // Make an async decision
                this.makeAgentDecision(agent);
                
                // Set the next decision time
                const jitter = Math.random() * 500 - 250; // +/- 250ms of jitter
                this.agentDecisionTimers.set(
                    agent.id, 
                    currentTime + this.decisionInterval + jitter
                );
            }
        }
        
        // Clean up timers for agents that no longer exist
        for (const [agentId] of this.agentDecisionTimers) {
            if (!this.worldSystem.agentSystem.getAgentById(agentId)) {
                this.agentDecisionTimers.delete(agentId);
            }
        }
    }
    
    // Make a decision for an agent using the LLM
    async makeAgentDecision(agent) {
        try {
            // Get observations about the agent's environment
            const observations = this.observationSystem.getAgentObservations(agent);
            
            // Store observations in memory
            this.memorySystem.addObservations(agent, observations);
            
            // Build prompt using the agent's type and observations
            const prompt = this.buildPrompt(agent, observations);
            
            // Start measuring response time
            const startTime = Date.now();
            
            // Get response from LLM
            const response = await this.llmSystem.generateResponse(prompt, {
                temperature: 0.7,
                maxTokens: 200
            });
            
            // Calculate response time
            const responseTime = Date.now() - startTime;
            
            // Parse response into a decision
            const decision = this.decisionSystem.parseDecision(response);
            
            // Store decision in memory
            this.memorySystem.addDecision(agent, decision);
            
            // Execute the decision
            const success = this.decisionSystem.executeDecision(agent, decision);
            
            // Update performance stats
            this.updatePerformanceStats(success, responseTime);
            
            return success;
        } catch (error) {
            console.error(`Error making decision for agent ${agent.id}:`, error);
            this.performanceStats.apiErrors++;
            return false;
        }
    }
    
    // Build prompt for the LLM based on agent type and observations
    buildPrompt(agent, observations) {
        // Select appropriate template based on agent type
        let promptTemplate;
        if (agent.type === 'collector') {
            promptTemplate = PromptTemplates.collectorDecision;
        } else if (agent.type === 'explorer') {
            promptTemplate = PromptTemplates.explorerDecision;
        } else {
            promptTemplate = PromptTemplates.agentDecision;
        }
        
        // Get memory-related information
        const previousDecision = this.memorySystem.getPreviousDecision(agent);
        const recentObservations = this.memorySystem.getRecentObservationsDescription(agent);
        const recentActions = this.memorySystem.getRecentActionsDescription(agent);
        
        // Format nearest resource description
        let nearestResourceDescription = "None";
        if (observations.resources.nearestResource) {
            const nr = observations.resources.nearestResource;
            nearestResourceDescription = 
                `${nr.type} at (${Math.round(nr.position.x)}, ${Math.round(nr.position.y)}), ` +
                `amount: ${nr.amount}, distance: ${Math.round(nr.distance)}`;
        }
        
        // Format nearest enemy description
        let nearestEnemyDescription = "None";
        if (observations.enemies.nearestEnemy) {
            const ne = observations.enemies.nearestEnemy;
            nearestEnemyDescription = 
                `${ne.type} at (${Math.round(ne.position.x)}, ${Math.round(ne.position.y)}), ` +
                `health: ${ne.health}, distance: ${Math.round(ne.distance)}`;
        }
        
        // Format nearest ally description
        let nearestAllyDescription = "None";
        if (observations.allies.nearestAlly) {
            const na = observations.allies.nearestAlly;
            nearestAllyDescription = 
                `${na.type} at (${Math.round(na.position.x)}, ${Math.round(na.position.y)}), ` +
                `health: ${na.health}, distance: ${Math.round(na.distance)}`;
        }
        
        // Prepare values for template
        const templateValues = {
            // Agent info
            teamName: agent.teamId === 1 ? "Red" : "Blue",
            teamId: agent.teamId,
            agentType: agent.type,
            
            // Agent status
            health: Math.round(agent.health),
            maxHealth: agent.maxHealth,
            x: Math.round(agent.x),
            y: Math.round(agent.y),
            attackPower: agent.attackPower,
            defense: agent.defense,
            speed: Math.round(agent.speed),
            resourceType: agent.resourceType || "None",
            resourceAmount: agent.resourceAmount,
            capacity: agent.capacity,
            isAttacking: agent.isAttacking,
            isHealing: agent.isHealing,
            
            // Environment
            visibleCells: observations.environment.visibleCells,
            obstacles: observations.environment.obstacles,
            teamControl: observations.territory.teamControl,
            enemyControl: observations.territory.enemyControl,
            
            // Resources
            totalResourceCells: observations.resources.totalResourceCells,
            nearestResourceDescription: nearestResourceDescription,
            energy: observations.resources.resourceTypes.energy,
            materials: observations.resources.resourceTypes.materials,
            data: observations.resources.resourceTypes.data,
            
            // Allies
            allyCount: observations.allies.count,
            collectors: observations.allies.allyTypes.collectors,
            explorers: observations.allies.allyTypes.explorers,
            nearestAllyDescription: nearestAllyDescription,
            
            // Enemies
            enemyCount: observations.enemies.count,
            threateningEnemies: observations.enemies.threateningEnemies.length,
            nearestEnemyDescription: nearestEnemyDescription,
            
            // Base
            distanceToBase: observations.base ? Math.round(observations.base.distanceToBase) : "Unknown",
            baseEnergy: observations.base ? observations.base.resources.energy : 0,
            baseMaterials: observations.base ? observations.base.resources.materials : 0,
            baseData: observations.base ? observations.base.resources.data : 0,
            
            // Memory
            previousDecision,
            recentObservationsDescription: recentObservations,
            recentActionsDescription: recentActions
        };
        
        // Replace template placeholders with actual values
        let prompt = promptTemplate;
        for (const [key, value] of Object.entries(templateValues)) {
            const placeholder = `{${key}}`;
            prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
        }
        
        return prompt;
    }
    
    // Create mock responses for testing without API
    createMockResponses() {
        return {
            // Collector responses
            "Collector": {
                // When resources are nearby
                "resource": `ACTION: COLLECT
TARGET: nearest resource
REASONING: I see a resource nearby and I should collect it to help my team.`,

                // When carrying resources
                "full": `ACTION: RETURN
TARGET: base
REASONING: I'm carrying resources and should return them to my base.`,

                // When near enemy
                "enemy": `ACTION: MOVE
TARGET: base
REASONING: There's an enemy nearby and I'm carrying resources, so I should retreat to safety.`,

                // When nothing interesting is happening
                "explore": `ACTION: EXPLORE
TARGET: unexplored area
REASONING: I don't see any resources nearby, so I should explore to find some.`
            },
            
            // Explorer responses
            "Explorer": {
                // When resources are nearby
                "resource": `ACTION: COLLECT
TARGET: nearest resource
REASONING: I see a resource that I can collect to help my team.`,

                // When enemy is nearby
                "enemy": `ACTION: ATTACK
TARGET: nearest enemy
REASONING: I can see an enemy agent and should engage to protect our territory.`,

                // When nothing interesting is happening
                "explore": `ACTION: EXPLORE
TARGET: north east
REASONING: I should explore new areas to find resources and expand our territory.`
            }
        };
    }
    
    // Update performance statistics
    updatePerformanceStats(success, responseTime) {
        this.performanceStats.decisions++;
        this.performanceStats.apiCalls++;
        
        if (success) {
            this.performanceStats.successfulDecisions++;
        }
        
        // Update average response time using a weighted average
        const alpha = 0.1; // Weight for new value
        this.performanceStats.avgResponseTime = 
            this.performanceStats.avgResponseTime * (1 - alpha) + responseTime * alpha;
    }
    
    // Get performance statistics
    getPerformanceStats() {
        return {
            ...this.performanceStats,
            successRate: this.performanceStats.decisions > 0 ? 
                this.performanceStats.successfulDecisions / this.performanceStats.decisions : 0
        };
    }
    
    // Set mock mode (for testing)
    setMockMode(enabled, mockResponses = null) {
        this.llmSystem.setMockMode(enabled, mockResponses || this.createMockResponses());
    }
}