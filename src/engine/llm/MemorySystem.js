export class MemorySystem {
    constructor(options = {}) {
        // Initialize memory storage
        this.agentMemories = new Map(); // Maps agent ID -> memory object
        
        // Configuration
        this.maxMemorySize = options.maxMemorySize || 10; // Number of recent decisions/observations to keep
        this.compressionThreshold = options.compressionThreshold || 5; // When to summarize memories
        this.maxMemoryAgeMs = options.maxMemoryAgeMs || 60000; // Memory lifetime in milliseconds (1 minute)
    }
    
    // Initialize memory for a new agent
    initializeMemory(agent) {
        const memory = {
            agentId: agent.id,
            teamId: agent.teamId,
            type: agent.type,
            recentDecisions: [],
            recentObservations: [],
            significantEvents: [],
            knownResources: new Map(), // Maps cell ID -> resource info
            knownEnemies: new Map(),   // Maps agent ID -> last known info
            knownAllies: new Map(),    // Maps agent ID -> last known info
            currentGoal: null,
            goalProgress: 0,
            lastUpdateTime: Date.now()
        };
        
        this.agentMemories.set(agent.id, memory);
        return memory;
    }
    
    // Get memory for an agent (create if doesn't exist)
    getMemory(agent) {
        if (!this.agentMemories.has(agent.id)) {
            return this.initializeMemory(agent);
        }
        return this.agentMemories.get(agent.id);
    }
    
    // Add a decision to agent's memory
    addDecision(agent, decision) {
        const memory = this.getMemory(agent);
        
        // Add new decision to front of array
        memory.recentDecisions.unshift({
            timestamp: Date.now(),
            action: decision.action,
            target: decision.target,
            reasoning: decision.reasoning
        });
        
        // Trim to keep only the most recent decisions
        if (memory.recentDecisions.length > this.maxMemorySize) {
            memory.recentDecisions.pop();
        }
        
        // Update goal if decision contains a clear goal
        if (this.isGoalSettingDecision(decision)) {
            memory.currentGoal = this.extractGoal(decision);
            memory.goalProgress = 0;
        }
        
        // Update last update time
        memory.lastUpdateTime = Date.now();
    }
    
    // Add observations to agent's memory
    addObservations(agent, observations) {
        const memory = this.getMemory(agent);
        
        // Add new observation to front of array
        memory.recentObservations.unshift({
            timestamp: Date.now(),
            data: observations
        });
        
        // Trim to keep only the most recent observations
        if (memory.recentObservations.length > this.maxMemorySize) {
            memory.recentObservations.pop();
        }
        
        // Update resource knowledge
        if (observations.resources && observations.resources.nearestResource) {
            const resource = observations.resources.nearestResource;
            const cellKey = `${Math.floor(resource.position.x)}_${Math.floor(resource.position.y)}`;
            
            memory.knownResources.set(cellKey, {
                position: resource.position,
                type: resource.type,
                amount: resource.amount,
                lastSeen: Date.now()
            });
        }
        
        // Update enemy knowledge
        if (observations.enemies && observations.enemies.nearestEnemy) {
            const enemy = observations.enemies.nearestEnemy;
            
            memory.knownEnemies.set(enemy.id, {
                id: enemy.id,
                type: enemy.type,
                position: enemy.position,
                health: enemy.health,
                lastSeen: Date.now()
            });
        }
        
        // Update ally knowledge
        if (observations.allies && observations.allies.nearestAlly) {
            const ally = observations.allies.nearestAlly;
            
            memory.knownAllies.set(ally.id, {
                id: ally.id,
                type: ally.type,
                position: ally.position,
                health: ally.health,
                lastSeen: Date.now()
            });
        }
        
        // Update goal progress if applicable
        this.updateGoalProgress(agent, memory, observations);
        
        // Check for significant events
        this.checkForSignificantEvents(memory, observations);
        
        // Update last update time
        memory.lastUpdateTime = Date.now();
    }
    
    // Update goal progress based on observations
    updateGoalProgress(agent, memory, observations) {
        if (!memory.currentGoal) return;
        
        // Different logic based on goal type
        switch (memory.currentGoal.type) {
            case "COLLECT":
                if (agent.resourceAmount > 0) {
                    memory.goalProgress = agent.resourceAmount / agent.capacity;
                }
                break;
                
            case "RETURN":
                const basePos = observations.base?.position;
                if (basePos) {
                    const distToBase = Math.sqrt(
                        Math.pow(agent.x - basePos.x, 2) + 
                        Math.pow(agent.y - basePos.y, 2)
                    );
                    memory.goalProgress = 1 - Math.min(1, distToBase / 300);
                }
                break;
                
            case "ATTACK":
                if (agent.isAttacking && agent.target) {
                    memory.goalProgress = 1 - (agent.target.health / agent.target.maxHealth);
                }
                break;
                
            case "EXPLORE":
                // Progress is measured by new cells seen
                // This is a rough approximation
                memory.goalProgress += 0.1;
                memory.goalProgress = Math.min(1, memory.goalProgress);
                break;
        }
        
        // If goal is complete, clear it
        if (memory.goalProgress >= 1) {
            memory.significantEvents.unshift({
                type: "GOAL_COMPLETED",
                goal: memory.currentGoal,
                timestamp: Date.now()
            });
            
            memory.currentGoal = null;
            memory.goalProgress = 0;
        }
    }
    
    // Check for significant events based on observations
    checkForSignificantEvents(memory, observations) {
        const currentObs = observations;
        
        // No previous observation to compare with
        if (memory.recentObservations.length < 2) return;
        
        const prevObs = memory.recentObservations[1].data;
        
        // Check for health loss
        if (currentObs.agent.health < prevObs.agent.health) {
            memory.significantEvents.unshift({
                type: "TOOK_DAMAGE",
                amount: prevObs.agent.health - currentObs.agent.health,
                timestamp: Date.now()
            });
        }
        
        // Check for resource collection
        if (currentObs.agent.resourceAmount > prevObs.agent.resourceAmount) {
            memory.significantEvents.unshift({
                type: "COLLECTED_RESOURCE",
                resourceType: currentObs.agent.resourceType,
                amount: currentObs.agent.resourceAmount,
                timestamp: Date.now()
            });
        }
        
        // Check for resource delivery
        if (prevObs.agent.resourceAmount > 0 && currentObs.agent.resourceAmount === 0) {
            memory.significantEvents.unshift({
                type: "DELIVERED_RESOURCE",
                resourceType: prevObs.agent.resourceType,
                amount: prevObs.agent.resourceAmount,
                timestamp: Date.now()
            });
        }
        
        // Check for enemy sightings
        if (currentObs.enemies.count > 0 && prevObs.enemies.count === 0) {
            memory.significantEvents.unshift({
                type: "SPOTTED_ENEMY",
                count: currentObs.enemies.count,
                timestamp: Date.now()
            });
        }
        
        // Keep only the most recent events
        if (memory.significantEvents.length > this.maxMemorySize * 2) {
            memory.significantEvents.length = this.maxMemorySize * 2;
        }
    }
    
    // Check if a decision is setting a new goal
    isGoalSettingDecision(decision) {
        // Goal-setting decisions are usually actions like COLLECT, ATTACK, EXPLORE
        const goalActions = ["COLLECT", "RETURN", "ATTACK", "DEFEND", "EXPLORE"];
        return goalActions.includes(decision.action);
    }
    
    // Extract goal from a decision
    extractGoal(decision) {
        return {
            type: decision.action,
            target: decision.target,
            startTime: Date.now()
        };
    }
    
    // Clean up old memories to prevent memory leaks
    cleanupOldMemories() {
        const now = Date.now();
        
        for (const [agentId, memory] of this.agentMemories.entries()) {
            // Remove memories for agents that haven't been updated recently
            if (now - memory.lastUpdateTime > this.maxMemoryAgeMs) {
                this.agentMemories.delete(agentId);
                continue;
            }
            
            // Clean up old resource knowledge
            for (const [cellKey, resourceInfo] of memory.knownResources.entries()) {
                if (now - resourceInfo.lastSeen > this.maxMemoryAgeMs / 2) {
                    memory.knownResources.delete(cellKey);
                }
            }
            
            // Clean up old enemy knowledge
            for (const [enemyId, enemyInfo] of memory.knownEnemies.entries()) {
                if (now - enemyInfo.lastSeen > this.maxMemoryAgeMs / 3) { // Enemies get outdated faster
                    memory.knownEnemies.delete(enemyId);
                }
            }
        }
    }
    
    // Format memories for inclusion in a prompt
    formatMemoryForPrompt(agent) {
        const memory = this.getMemory(agent);
        
        // Format recent decisions
        let recentDecisionsText = "None";
        if (memory.recentDecisions.length > 0) {
            const decisions = memory.recentDecisions.slice(0, 3); // Last 3 decisions
            recentDecisionsText = decisions.map(d => 
                `[${new Date(d.timestamp).toLocaleTimeString()}] ${d.action} ${d.target || ''}`
            ).join(', ');
        }
        
        // Format significant events
        let significantEventsText = "None";
        if (memory.significantEvents.length > 0) {
            const events = memory.significantEvents.slice(0, 3); // Last 3 events
            significantEventsText = events.map(e => {
                switch (e.type) {
                    case "TOOK_DAMAGE":
                        return `Took ${e.amount} damage`;
                    case "COLLECTED_RESOURCE":
                        return `Collected ${e.amount} ${e.resourceType}`;
                    case "DELIVERED_RESOURCE":
                        return `Delivered ${e.amount} ${e.resourceType} to base`;
                    case "SPOTTED_ENEMY":
                        return `Spotted ${e.count} enemies`;
                    case "GOAL_COMPLETED":
                        return `Completed goal: ${e.goal.type}`;
                    default:
                        return `${e.type}`;
                }
            }).join(', ');
        }
        
        // Current goal info
        let goalText = "None";
        if (memory.currentGoal) {
            goalText = `${memory.currentGoal.type} ${memory.currentGoal.target || ''} (Progress: ${Math.round(memory.goalProgress * 100)}%)`;
        }
        
        // Return the formatted memory strings
        return {
            recentDecisions: recentDecisionsText,
            significantEvents: significantEventsText,
            currentGoal: goalText
        };
    }
    
    // Get previous decision for prompt
    getPreviousDecision(agent) {
        const memory = this.getMemory(agent);
        if (memory.recentDecisions.length > 0) {
            const lastDecision = memory.recentDecisions[0];
            return `${lastDecision.action} ${lastDecision.target || ''}`;
        }
        return "None";
    }
    
    // Get summary of recent observations for prompt
    getRecentObservationsDescription(agent) {
        const memory = this.getMemory(agent);
        
        if (memory.significantEvents.length === 0) {
            return "No significant observations";
        }
        
        // Get the 3 most recent events
        return memory.significantEvents
            .slice(0, 3)
            .map(e => {
                switch (e.type) {
                    case "TOOK_DAMAGE":
                        return `Took damage (${e.amount} HP)`;
                    case "COLLECTED_RESOURCE":
                        return `Collected ${e.resourceType}`;
                    case "DELIVERED_RESOURCE":
                        return `Delivered ${e.resourceType} to base`;
                    case "SPOTTED_ENEMY":
                        return `Spotted ${e.count} enemies`;
                    case "GOAL_COMPLETED":
                        return `Completed ${e.goal.type.toLowerCase()} goal`;
                    default:
                        return e.type;
                }
            })
            .join(', ');
    }
    
    // Get summary of recent actions for prompt
    getRecentActionsDescription(agent) {
        const memory = this.getMemory(agent);
        
        if (memory.recentDecisions.length === 0) {
            return "No previous actions";
        }
        
        // Get the 3 most recent decisions
        return memory.recentDecisions
            .slice(0, 3)
            .map(d => `${d.action.toLowerCase()}${d.target ? ' to ' + d.target : ''}`)
            .join(' → ');
    }
}