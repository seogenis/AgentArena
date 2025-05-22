// System to execute decisions made by the LLM

export class ActionExecutor {
    constructor(worldSystem) {
        this.worldSystem = worldSystem;
        
        // Initialize action handler functions
        this.actionHandlers = {
            'EXPLORE': this.handleExplore.bind(this),
            'COLLECT': this.handleCollect.bind(this),
            'RETURN_TO_BASE': this.handleReturnToBase.bind(this),
            'ATTACK': this.handleAttack.bind(this),
            'FLEE': this.handleFlee.bind(this),
            'CLAIM_TERRITORY': this.handleClaimTerritory.bind(this),
            'SCOUT_ENEMY': this.handleScoutEnemy.bind(this),
            'DEFEND': this.handleDefend.bind(this),
            'HEAL': this.handleHeal.bind(this)
        };
    }
    
    // Main method to execute a decision for an agent
    executeDecision(agent, decision, perception) {
        if (!agent || !decision || !perception) return false;
        
        // Get the appropriate action handler
        const handler = this.actionHandlers[decision.action];
        if (!handler) {
            console.warn(`No handler found for action: ${decision.action}`);
            return false;
        }
        
        // Execute the action
        return handler(agent, decision, perception);
    }
    
    // EXPLORE: Move to unexplored or interesting areas
    handleExplore(agent, decision, perception) {
        const target = decision.target;
        let targetX, targetY;
        
        switch (target) {
            case 'RANDOM':
                // Choose a random direction and distance
                const angle = Math.random() * Math.PI * 2;
                const distance = 100 + Math.random() * 100;
                targetX = agent.x + Math.cos(angle) * distance;
                targetY = agent.y + Math.sin(angle) * distance;
                break;
                
            case 'RESOURCE_RICH':
                // Check team knowledge for resource hotspots
                const resourceHotspots = perception.teamKnowledge.resourceHotspots;
                if (resourceHotspots && resourceHotspots.length > 0) {
                    // Pick a hotspot, favoring closer ones
                    const hotspot = resourceHotspots[Math.floor(Math.random() * Math.min(3, resourceHotspots.length))];
                    targetX = hotspot.position.x;
                    targetY = hotspot.position.y;
                } else {
                    // No hotspots known, use random exploration
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 150 + Math.random() * 100;
                    targetX = agent.x + Math.cos(angle) * distance;
                    targetY = agent.y + Math.sin(angle) * distance;
                }
                break;
                
            case 'UNEXPLORED':
                // This would ideally use knowledge about unexplored areas
                // For now, just move in a random direction away from current position
                const directionAngle = Math.random() * Math.PI * 2;
                const explorationDistance = 200 + Math.random() * 100;
                targetX = agent.x + Math.cos(directionAngle) * explorationDistance;
                targetY = agent.y + Math.sin(directionAngle) * explorationDistance;
                break;
                
            default:
                // Default to random movement
                const defaultAngle = Math.random() * Math.PI * 2;
                const defaultDistance = 100 + Math.random() * 100;
                targetX = agent.x + Math.cos(defaultAngle) * defaultDistance;
                targetY = agent.y + Math.sin(defaultAngle) * defaultDistance;
        }
        
        // Ensure targets are within world bounds
        targetX = Math.max(0, Math.min(this.worldSystem.hexGrid.width, targetX));
        targetY = Math.max(0, Math.min(this.worldSystem.hexGrid.height, targetY));
        
        // Set agent target
        agent.setTarget(targetX, targetY);
        return true;
    }
    
    // COLLECT: Move to and collect resources
    handleCollect(agent, decision, perception) {
        const target = decision.target;
        
        // If already carrying resources at capacity, switch to return to base
        if (agent.resourceAmount >= agent.capacity) {
            return this.handleReturnToBase(agent, { target: 'BASE' }, perception);
        }
        
        // Get visible resources
        const resources = perception.visibleEntities.resources;
        if (resources.length === 0) {
            // No resources visible, try to explore resource-rich areas
            return this.handleExplore(agent, { target: 'RESOURCE_RICH' }, perception);
        }
        
        // Determine which resource to collect
        let resourceToCollect;
        
        switch (target) {
            case 'NEAREST_RESOURCE':
                // Already sorted by distance
                resourceToCollect = resources[0];
                break;
                
            case 'MOST_VALUABLE':
                // In a more complex implementation, we would consider resource value
                // For now, just pick the resource with the most amount
                resourceToCollect = resources.reduce((best, current) => 
                    (current.amount > best.amount) ? current : best, resources[0]);
                break;
                
            case 'ENERGY':
            case 'MATERIALS':
            case 'DATA':
                // Look for specific type
                const typeToFind = target.toLowerCase();
                const matchingResources = resources.filter(r => r.type === typeToFind);
                resourceToCollect = matchingResources.length > 0 ? matchingResources[0] : resources[0];
                break;
                
            default:
                // Default to nearest
                resourceToCollect = resources[0];
        }
        
        // Set target to the resource
        agent.setTarget(resourceToCollect.position.x, resourceToCollect.position.y);
        return true;
    }
    
    // RETURN_TO_BASE: Return to the agent's team base
    handleReturnToBase(agent, decision, perception) {
        const basePosition = this.worldSystem.baseSystem.getBasePosition(agent.teamId);
        if (!basePosition) return false;
        
        // Set target to base
        agent.setTarget(basePosition.x, basePosition.y);
        return true;
    }
    
    // ATTACK: Move to and engage enemy
    handleAttack(agent, decision, perception) {
        const target = decision.target;
        
        // Get visible enemies
        const enemies = perception.visibleEntities.agents.enemies;
        if (enemies.length === 0) {
            // No enemies visible, switch to exploration
            return this.handleScoutEnemy(agent, { target: 'ENEMY_TERRITORY' }, perception);
        }
        
        let enemyToAttack;
        
        switch (target) {
            case 'NEAREST_ENEMY':
                // Already sorted by distance
                enemyToAttack = enemies[0];
                break;
                
            case 'WEAKEST_ENEMY':
                // Find enemy with lowest health
                enemyToAttack = enemies.reduce((weakest, current) => 
                    (current.health < weakest.health) ? current : weakest, enemies[0]);
                break;
                
            case 'RESOURCE_CARRIER':
                // Find enemy carrying resources
                const resourceCarriers = enemies.filter(e => e.isCarryingResources);
                enemyToAttack = resourceCarriers.length > 0 ? resourceCarriers[0] : enemies[0];
                break;
                
            default:
                // Default to nearest
                enemyToAttack = enemies[0];
        }
        
        // Find the actual agent object
        const enemyAgent = this.worldSystem.agentSystem.getAgentById(enemyToAttack.id);
        if (!enemyAgent) return false;
        
        // Start attacking
        agent.startAttacking(enemyAgent);
        
        // Set target position
        agent.setTarget(enemyToAttack.position.x, enemyToAttack.position.y);
        return true;
    }
    
    // FLEE: Move away from danger
    handleFlee(agent, decision, perception) {
        const target = decision.target;
        let targetX, targetY;
        
        switch (target) {
            case 'BASE':
                // Flee to base
                return this.handleReturnToBase(agent, decision, perception);
                
            case 'FROM_ENEMIES':
                // Calculate average position of enemies
                const enemies = perception.visibleEntities.agents.enemies;
                if (enemies.length === 0) {
                    return this.handleExplore(agent, { target: 'RANDOM' }, perception);
                }
                
                let avgX = 0, avgY = 0;
                for (const enemy of enemies) {
                    avgX += enemy.position.x;
                    avgY += enemy.position.y;
                }
                avgX /= enemies.length;
                avgY /= enemies.length;
                
                // Move in opposite direction
                const dirX = agent.x - avgX;
                const dirY = agent.y - avgY;
                const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
                
                // Calculate flee target (200 units away in opposite direction)
                targetX = agent.x + (dirX / magnitude) * 200;
                targetY = agent.y + (dirY / magnitude) * 200;
                break;
                
            case 'ALLY':
                // Find nearest ally
                const allies = perception.visibleEntities.agents.allies;
                if (allies.length === 0) {
                    return this.handleReturnToBase(agent, decision, perception);
                }
                
                // Already sorted by distance
                const nearestAlly = allies[0];
                targetX = nearestAlly.position.x;
                targetY = nearestAlly.position.y;
                break;
                
            default:
                // Default to fleeing to base
                return this.handleReturnToBase(agent, decision, perception);
        }
        
        // Ensure targets are within world bounds
        targetX = Math.max(0, Math.min(this.worldSystem.hexGrid.width, targetX));
        targetY = Math.max(0, Math.min(this.worldSystem.hexGrid.height, targetY));
        
        // Set agent target
        agent.setTarget(targetX, targetY);
        return true;
    }
    
    // CLAIM_TERRITORY: Move to unclaimed or enemy territory to claim it
    handleClaimTerritory(agent, decision, perception) {
        const target = decision.target;
        
        // We need to find cells that are unclaimed or enemy-controlled
        let targetX, targetY;
        
        // Naive implementation: move in a direction away from own territory
        // In a real implementation, we would analyze the grid cells more carefully
        
        // Get own base position
        const basePosition = this.worldSystem.baseSystem.getBasePosition(agent.teamId);
        
        if (target === 'UNCLAIMED') {
            // Move away from base in a random direction (to find unclaimed territory)
            const angle = Math.random() * Math.PI * 2;
            const distance = 150 + Math.random() * 150;
            
            targetX = basePosition.x + Math.cos(angle) * distance;
            targetY = basePosition.y + Math.sin(angle) * distance;
        }
        else if (target === 'ENEMY') {
            // Move toward enemy base if known, otherwise opposite from own base
            const enemyBase = perception.teamKnowledge.enemyBase;
            
            if (enemyBase) {
                targetX = enemyBase.position.x;
                targetY = enemyBase.position.y;
            } else {
                // Move in direction opposite to own base (toward likely enemy base)
                const centerX = this.worldSystem.hexGrid.width / 2;
                const centerY = this.worldSystem.hexGrid.height / 2;
                
                const dirX = centerX - basePosition.x;
                const dirY = centerY - basePosition.y;
                
                targetX = centerX + dirX;
                targetY = centerY + dirY;
            }
        }
        else if (target === 'FRONTIER') {
            // Find the frontier of own territory
            // Simplified implementation - just move to a middle distance
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 50;
            
            targetX = basePosition.x + Math.cos(angle) * distance;
            targetY = basePosition.y + Math.sin(angle) * distance;
        }
        else {
            // Default - move to a random area
            const angle = Math.random() * Math.PI * 2;
            const distance = 150 + Math.random() * 150;
            
            targetX = agent.x + Math.cos(angle) * distance;
            targetY = agent.y + Math.sin(angle) * distance;
        }
        
        // Ensure targets are within world bounds
        targetX = Math.max(0, Math.min(this.worldSystem.hexGrid.width, targetX));
        targetY = Math.max(0, Math.min(this.worldSystem.hexGrid.height, targetY));
        
        // Set agent target
        agent.setTarget(targetX, targetY);
        return true;
    }
    
    // SCOUT_ENEMY: Move toward enemy territory or last known enemy positions
    handleScoutEnemy(agent, decision, perception) {
        const target = decision.target;
        let targetX, targetY;
        
        switch (target) {
            case 'ENEMY_TERRITORY':
                // Move toward enemy base if known
                if (perception.teamKnowledge.enemyBase) {
                    targetX = perception.teamKnowledge.enemyBase.position.x;
                    targetY = perception.teamKnowledge.enemyBase.position.y;
                } 
                // Otherwise move toward area with enemy control
                else {
                    // Calculate opposite direction from own base
                    const basePosition = this.worldSystem.baseSystem.getBasePosition(agent.teamId);
                    const centerX = this.worldSystem.hexGrid.width / 2;
                    const centerY = this.worldSystem.hexGrid.height / 2;
                    
                    const dirX = centerX - basePosition.x;
                    const dirY = centerY - basePosition.y;
                    
                    // Move toward likely enemy territory
                    targetX = centerX + dirX * 0.8;
                    targetY = centerY + dirY * 0.8;
                }
                break;
                
            case 'DANGER_ZONE':
                // Move toward a known danger zone
                const dangerZones = perception.teamKnowledge.dangerZones;
                if (dangerZones && dangerZones.length > 0) {
                    const zone = dangerZones[Math.floor(Math.random() * dangerZones.length)];
                    targetX = zone.position.x;
                    targetY = zone.position.y;
                } else {
                    // No known danger zones, use default exploration
                    return this.handleExplore(agent, { target: 'RANDOM' }, perception);
                }
                break;
                
            default:
                // Default to moving in direction of enemy base
                const defaultBasePosition = this.worldSystem.baseSystem.getBasePosition(agent.teamId === 1 ? 2 : 1);
                if (defaultBasePosition) {
                    targetX = defaultBasePosition.x;
                    targetY = defaultBasePosition.y;
                } else {
                    // Fallback to random exploration
                    return this.handleExplore(agent, { target: 'RANDOM' }, perception);
                }
        }
        
        // Ensure targets are within world bounds
        targetX = Math.max(0, Math.min(this.worldSystem.hexGrid.width, targetX));
        targetY = Math.max(0, Math.min(this.worldSystem.hexGrid.height, targetY));
        
        // Set agent target
        agent.setTarget(targetX, targetY);
        return true;
    }
    
    // DEFEND: Guard an area or ally
    handleDefend(agent, decision, perception) {
        const target = decision.target;
        let targetX, targetY;
        
        switch (target) {
            case 'BASE':
                // Defend own base
                const basePosition = this.worldSystem.baseSystem.getBasePosition(agent.teamId);
                
                // Move to a position near the base
                const angle = Math.random() * Math.PI * 2;
                const distance = 30 + Math.random() * 20;
                
                targetX = basePosition.x + Math.cos(angle) * distance;
                targetY = basePosition.y + Math.sin(angle) * distance;
                break;
                
            case 'ALLY':
                // Defend an ally - find the ally that's most under threat
                const allies = perception.visibleEntities.agents.allies;
                if (allies.length === 0) {
                    // No allies to defend, defend base instead
                    return this.handleDefend(agent, { target: 'BASE' }, perception);
                }
                
                // Simple heuristic: ally with lowest health needs most defense
                const allyToDefend = allies.reduce((weakest, current) => 
                    (current.health < weakest.health) ? current : weakest, allies[0]);
                
                targetX = allyToDefend.position.x;
                targetY = allyToDefend.position.y;
                break;
                
            case 'TERRITORY':
                // Defend contested territory
                // Simplified: move toward an area with own team control but near enemy control
                // This would ideally use more sophisticated territory analysis
                const ownBasePos = this.worldSystem.baseSystem.getBasePosition(agent.teamId);
                
                // Move to a medium distance from base in a random direction
                const territoryAngle = Math.random() * Math.PI * 2;
                const territoryDistance = 80 + Math.random() * 40;
                
                targetX = ownBasePos.x + Math.cos(territoryAngle) * territoryDistance;
                targetY = ownBasePos.y + Math.sin(territoryAngle) * territoryDistance;
                break;
                
            default:
                // Default to defending base
                return this.handleDefend(agent, { target: 'BASE' }, perception);
        }
        
        // Ensure targets are within world bounds
        targetX = Math.max(0, Math.min(this.worldSystem.hexGrid.width, targetX));
        targetY = Math.max(0, Math.min(this.worldSystem.hexGrid.height, targetY));
        
        // Set agent target
        agent.setTarget(targetX, targetY);
        return true;
    }
    
    // HEAL: Move to a location to heal (usually base)
    handleHeal(agent, decision, perception) {
        // For now, healing is only available at base
        return this.handleReturnToBase(agent, decision, perception);
    }
}