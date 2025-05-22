// Agent memory system to store individual agent state and history

export class AgentMemory {
    constructor(agent) {
        this.agent = agent;
        this.personality = null;
        
        // Current state
        this.currentAction = null;
        this.currentTarget = null;
        this.currentReasoning = null;
        
        // Memory buffers
        this.recentObservations = [];
        this.significantEvents = [];
        this.decisionHistory = [];
        
        // Emotional state (affects decision-making)
        this.emotionalState = {
            aggression: 0.5,  // 0 = passive, 1 = aggressive
            caution: 0.5,     // 0 = reckless, 1 = cautious
            determination: 0.5 // 0 = flighty, 1 = determined
        };
        
        // Memory limits
        this.maxObservations = 10;
        this.maxSignificantEvents = 5;
        this.maxDecisionHistory = 8;
        
        // Performance tracking
        this.resourcesCollected = 0;
        this.enemiesDefeated = 0;
        this.damageDealt = 0;
        this.damageTaken = 0;
        this.territoryClaimed = 0;
        
        // Initialize timestamps
        this.creationTime = Date.now();
        this.lastDecisionTime = Date.now();
    }
    
    // Generate a personality if one doesn't exist
    async generatePersonality(llmInterface) {
        // If personality already exists, return it
        if (this.personality) return this.personality;
        
        // Create prompt for personality generation
        const prompt = `GENERATE_PERSONALITY
Team: ${this.agent.teamId === 1 ? 'Red' : 'Blue'}
Type: ${this.agent.type}
ID: ${this.agent.id}

Please generate a personality profile for this agent, including traits, background, and preferences.`;
        
        try {
            // Get personality from LLM
            const personality = await llmInterface.getResponse(prompt, {
                teamId: this.agent.teamId,
                type: this.agent.type,
                agentId: this.agent.id
            });
            
            // Store the personality
            this.personality = personality;
            
            // Adjust emotional state based on personality
            if (personality.traits) {
                if (personality.traits.includes('aggressive')) {
                    this.emotionalState.aggression = 0.8;
                } else if (personality.traits.includes('cautious')) {
                    this.emotionalState.aggression = 0.2;
                }
                
                if (personality.traits.includes('methodical') || personality.traits.includes('analytical')) {
                    this.emotionalState.caution = 0.8;
                } else if (personality.traits.includes('impulsive')) {
                    this.emotionalState.caution = 0.2;
                }
                
                if (personality.traits.includes('brave') || personality.traits.includes('loyal')) {
                    this.emotionalState.determination = 0.8;
                }
            }
            
            return personality;
        } catch (error) {
            console.error('Error generating personality:', error);
            
            // Create a basic fallback personality
            this.personality = {
                designation: `${this.agent.teamId === 1 ? 'Red' : 'Blue'}-${this.agent.type.charAt(0).toUpperCase()}${this.agent.id}`,
                traits: ['adaptive'],
                background: 'Standard issue unit',
                focus: 'Mission completion',
                preferences: {
                    resourcePreference: 'any',
                    territoryPreference: 'balanced',
                    combatStance: 'defensive'
                }
            };
            
            return this.personality;
        }
    }
    
    // Add a new observation to memory
    addObservation(perception, timestamp) {
        if (!perception) return;
        
        // Simplify the perception to just the essentials for memory
        const observation = {
            timestamp: timestamp,
            self: {
                position: perception.self.position,
                health: perception.self.health,
                resourceAmount: perception.self.resourceAmount
            },
            nearbyEnemies: perception.visibleEntities.agents.enemies.length,
            nearbyAllies: perception.visibleEntities.agents.allies.length,
            nearbyResources: perception.visibleEntities.resources.length,
            territoryControl: perception.environment.territoryControl
        };
        
        // Add to recent observations
        this.recentObservations.unshift(observation);
        
        // Limit the size
        if (this.recentObservations.length > this.maxObservations) {
            this.recentObservations.pop();
        }
    }
    
    // Add a significant event to memory
    addSignificantEvent(eventType, details, timestamp) {
        const event = {
            type: eventType,
            details: details,
            timestamp: timestamp
        };
        
        // Add to significant events
        this.significantEvents.unshift(event);
        
        // Limit the size
        if (this.significantEvents.length > this.maxSignificantEvents) {
            this.significantEvents.pop();
        }
        
        // Update emotional state based on event type
        this.updateEmotionalState(eventType, details);
        
        // Update performance metrics
        this.updatePerformanceMetrics(eventType, details);
    }
    
    // Record a decision in the history
    recordDecision(action, target, reasoning, timestamp) {
        const decision = {
            action: action,
            target: target,
            reasoning: reasoning,
            timestamp: timestamp
        };
        
        // Add to decision history
        this.decisionHistory.unshift(decision);
        
        // Limit the size
        if (this.decisionHistory.length > this.maxDecisionHistory) {
            this.decisionHistory.pop();
        }
        
        // Update current state
        this.currentAction = action;
        this.currentTarget = target;
        this.currentReasoning = reasoning;
        this.lastDecisionTime = timestamp;
    }
    
    // Update emotional state based on events
    updateEmotionalState(eventType, details) {
        switch (eventType) {
            case 'DAMAGE_TAKEN':
                // Increase caution when taking damage
                this.emotionalState.caution = Math.min(1.0, this.emotionalState.caution + 0.05);
                break;
                
            case 'ENEMY_SPOTTED':
                // Slightly increase aggression when seeing enemies
                this.emotionalState.aggression = Math.min(1.0, this.emotionalState.aggression + 0.02);
                break;
                
            case 'RESOURCE_COLLECTED':
                // Increase determination when collecting resources
                this.emotionalState.determination = Math.min(1.0, this.emotionalState.determination + 0.03);
                break;
                
            case 'DAMAGE_DEALT':
                // Increase aggression when dealing damage
                this.emotionalState.aggression = Math.min(1.0, this.emotionalState.aggression + 0.04);
                // Decrease caution (feeling more confident)
                this.emotionalState.caution = Math.max(0.0, this.emotionalState.caution - 0.02);
                break;
                
            case 'ALLY_DEFEATED':
                // Increase caution when ally is defeated
                this.emotionalState.caution = Math.min(1.0, this.emotionalState.caution + 0.1);
                break;
                
            case 'ENEMY_DEFEATED':
                // Decrease caution (feeling more confident)
                this.emotionalState.caution = Math.max(0.0, this.emotionalState.caution - 0.05);
                // Increase determination
                this.emotionalState.determination = Math.min(1.0, this.emotionalState.determination + 0.05);
                break;
                
            case 'TERRITORY_CLAIMED':
                // Increase determination when claiming territory
                this.emotionalState.determination = Math.min(1.0, this.emotionalState.determination + 0.02);
                break;
                
            case 'HEALING':
                // Decrease caution (feeling safer)
                this.emotionalState.caution = Math.max(0.0, this.emotionalState.caution - 0.03);
                break;
        }
        
        // Gradually regress emotional state toward neutral
        this.emotionalState.aggression = 0.9 * this.emotionalState.aggression + 0.1 * 0.5;
        this.emotionalState.caution = 0.9 * this.emotionalState.caution + 0.1 * 0.5;
        this.emotionalState.determination = 0.9 * this.emotionalState.determination + 0.1 * 0.5;
    }
    
    // Update performance metrics based on events
    updatePerformanceMetrics(eventType, details) {
        switch (eventType) {
            case 'RESOURCE_COLLECTED':
                this.resourcesCollected += details.amount || 1;
                break;
                
            case 'ENEMY_DEFEATED':
                this.enemiesDefeated++;
                break;
                
            case 'DAMAGE_DEALT':
                this.damageDealt += details.amount || 0;
                break;
                
            case 'DAMAGE_TAKEN':
                this.damageTaken += details.amount || 0;
                break;
                
            case 'TERRITORY_CLAIMED':
                this.territoryClaimed += details.amount || 0.1;
                break;
        }
    }
    
    // Generate context for decision making
    generateDecisionContext(perception) {
        if (!perception || !this.personality) return null;
        
        return {
            currentState: {
                ...perception.self,
                emotionalState: this.emotionalState
            },
            personality: this.personality,
            recentObservations: this.recentObservations.slice(0, 3), // Just the 3 most recent
            significantEvents: this.significantEvents,
            performance: {
                resourcesCollected: this.resourcesCollected,
                enemiesDefeated: this.enemiesDefeated,
                damageDealt: this.damageDealt,
                damageTaken: this.damageTaken,
                territoryClaimed: this.territoryClaimed
            },
            lastDecision: this.decisionHistory[0], // Most recent decision
            perception: perception
        };
    }
}