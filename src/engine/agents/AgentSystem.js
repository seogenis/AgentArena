import { Agent } from './Agent.js';

export class AgentSystem {
    constructor(hexGrid, renderSystem, baseSystem, collisionSystem) {
        this.hexGrid = hexGrid;
        this.renderSystem = renderSystem;
        this.baseSystem = baseSystem;
        this.collisionSystem = collisionSystem;
        this.agents = [];
        this.agentIdCounter = 0;
        this.combatRange = 120; // How far agents can detect enemies
        this.combatEnabled = true; // Allow toggling combat for testing
        this.healingRange = 60; // How close to base for healing
    }

    initialize() {
        // Create initial agents for each team
        this.createInitialAgents();
    }

    createInitialAgents() {
        // Create agents for team 1
        this.createAgent(1, 'collector'); // Collector
        this.createAgent(1, 'collector'); // Collector
        this.createAgent(1, 'explorer');  // Explorer
        
        // Create agents for team 2
        this.createAgent(2, 'collector'); // Collector
        this.createAgent(2, 'collector'); // Collector
        this.createAgent(2, 'explorer');  // Explorer
    }

    createAgent(teamId, type = 'collector') {
        // Get base position for the team
        const basePos = this.baseSystem.getBasePosition(teamId);
        if (!basePos) return null;
        
        // Create agent close to the base with some randomization
        const offsetX = (Math.random() * 60) - 30;
        const offsetY = (Math.random() * 60) - 30;
        
        const agent = new Agent(
            this.agentIdCounter++,
            basePos.x + offsetX,
            basePos.y + offsetY,
            teamId,
            type
        );
        
        // Add to agent list
        this.agents.push(agent);
        
        // Add to render system
        this.renderSystem.addRenderable(agent);
        
        return agent;
    }

    removeAgent(agent) {
        // Remove from render system
        this.renderSystem.removeRenderable(agent);
        
        // Remove from agents list
        const index = this.agents.indexOf(agent);
        if (index !== -1) {
            this.agents.splice(index, 1);
        }
    }

    getAgentById(id) {
        return this.agents.find(agent => agent.id === id);
    }
    
    getAgentsByTeam(teamId) {
        return this.agents.filter(agent => agent.teamId === teamId);
    }

    update(deltaTime) {
        // Update all agents and process dead agents
        for (let i = this.agents.length - 1; i >= 0; i--) {
            const agent = this.agents[i];
            
            // Check for dead agents
            if (agent.isDead()) {
                // Drop resources if carrying any
                this.dropResources(agent);
                
                // Remove the agent
                this.removeAgent(agent);
                continue;
            }
            
            // Update agent
            agent.update(deltaTime, this.hexGrid);
            
            // Handle resource collection
            this.processResourceCollection(agent);
            
            // Handle base visits
            this.processBaseVisit(agent);
            
            // Handle combat if enabled
            if (this.combatEnabled) {
                this.processCombat(agent, deltaTime);
            }
        }
    }
    
    processCombat(agent, deltaTime) {
        // Skip if agent is already attacking
        if (agent.isAttacking && agent.target) {
            // Check if target is still alive
            if (agent.target.isDead() || !this.agents.includes(agent.target)) {
                agent.stopAttacking();
            } 
            // Check if target is in range
            else {
                const dx = agent.target.x - agent.x;
                const dy = agent.target.y - agent.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // If in attack range, attack the target
                if (distance <= agent.radius + agent.target.radius + 10) {
                    const damage = agent.attack(agent.target);
                    
                    // Create hit effect if damage was dealt
                    if (damage > 0) {
                        // We need to access the combat system through the parent worldSystem
                        // This is handled in the WorldSystem via proxy methods
                        const midpointX = (agent.x + agent.target.x) / 2;
                        const midpointY = (agent.y + agent.target.y) / 2;
                        
                        // Create hit effect
                        if (typeof this.createHitEffect === 'function') {
                            this.createHitEffect(midpointX, midpointY, agent.teamId);
                        }
                        
                        // Check if target is dead
                        if (agent.target.isDead()) {
                            // Create death effect
                            if (typeof this.createDeathEffect === 'function') {
                                this.createDeathEffect(agent.target.x, agent.target.y, agent.target.teamId);
                            }
                            
                            // Stop attacking and clear target
                            agent.stopAttacking();
                        }
                    }
                }
            }
            
            return; // Skip rest of combat processing
        }
        
        // Look for enemies in range
        for (const otherAgent of this.agents) {
            // Skip self and same team
            if (otherAgent === agent || otherAgent.teamId === agent.teamId) continue;
            
            // Calculate distance
            const dx = otherAgent.x - agent.x;
            const dy = otherAgent.y - agent.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If enemy is in combat range
            if (distance <= this.combatRange) {
                // Collectors are less likely to engage if carrying resources
                const shouldEngage = agent.type === 'explorer' || 
                                    agent.resourceAmount === 0 || 
                                    Math.random() < 0.3;
                
                if (shouldEngage) {
                    agent.startAttacking(otherAgent);
                    break; // Only attack one enemy at a time
                }
            }
        }
    }
    
    dropResources(agent) {
        // If agent was carrying resources, drop them on the current cell
        if (agent.resourceAmount > 0 && agent.resourceType) {
            const cell = this.hexGrid.getCellAtPosition(agent.x, agent.y);
            
            if (cell) {
                // Add dropped resources to the cell
                cell.resourceType = agent.resourceType;
                cell.resourceAmount = agent.resourceAmount;
            }
        }
    }

    processResourceCollection(agent) {
        // Check if agent is on a cell with resources
        const cell = this.hexGrid.getCellAtPosition(agent.x, agent.y);
        if (!cell || !cell.resourceType || cell.resourceAmount <= 0) return;
        
        // Only collect if agent has capacity and is not already carrying resources
        if (agent.resourceType === null && agent.resourceAmount === 0) {
            // Start collecting (would normally take time, but we'll make it instant for now)
            agent.resourceType = cell.resourceType;
            
            // Take one unit of resource
            const amountToTake = Math.min(cell.resourceAmount, agent.capacity);
            agent.resourceAmount = amountToTake;
            
            // Remove from cell
            cell.resourceAmount -= amountToTake;
            if (cell.resourceAmount <= 0) {
                cell.resourceType = null;
                cell.resourceAmount = 0;
            }
            
            // Update agent's visual state
            agent.updateVisuals();
        }
    }

    processBaseVisit(agent) {
        // Check if agent is near its team's base
        const basePos = this.baseSystem.getBasePosition(agent.teamId);
        if (!basePos) return;
        
        const distToBase = Math.sqrt(
            Math.pow(agent.x - basePos.x, 2) + 
            Math.pow(agent.y - basePos.y, 2)
        );
        
        // If agent is carrying resources and close to base, deposit them
        if (agent.resourceType && agent.resourceAmount > 0 && distToBase < 35) {
            // Add resources to base storage
            this.baseSystem.addResource(agent.teamId, agent.resourceType, agent.resourceAmount);
            
            // Reset agent's carried resources
            agent.resourceType = null;
            agent.resourceAmount = 0;
            
            // Update agent's visual state
            agent.updateVisuals();
        }
        
        // Start healing if close to base and not at full health
        if (distToBase < this.healingRange && agent.health < agent.maxHealth) {
            agent.startHealing();
        } else {
            agent.stopHealing();
        }
    }

    // Called when a cell's control level changes (e.g., from agent presence)
    updateTerritoryControl(deltaTime) {
        // For each agent, slightly increase their team's control on the current cell
        for (const agent of this.agents) {
            const cell = this.hexGrid.getCellAtPosition(agent.x, agent.y);
            if (cell && !cell.hasObstacle) {
                const controlChange = 0.02 * deltaTime; // Small incremental change
                
                if (agent.teamId === 1) {
                    // Team 1 (Red) - negative control values
                    cell.controlLevel = Math.max(-1, cell.controlLevel - controlChange);
                } else {
                    // Team 2 (Blue) - positive control values
                    cell.controlLevel = Math.min(1, cell.controlLevel + controlChange);
                }
            }
        }
    }
}