/**
 * SpawnScheduler.js
 * 
 * Schedules agent spawning based on team resources and strategy.
 * Determines when and what type of agents to spawn.
 */

class SpawnScheduler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // Time-based spawn scheduling parameters
        this.nextScheduledSpawn = {
            red: Date.now() + 5000, // Start after 5 seconds
            blue: Date.now() + 7000  // Stagger teams slightly
        };
        
        // Base spawn interval in milliseconds
        this.baseSpawnInterval = 15000; // 15 seconds
        
        // Strategy-based interval adjustments
        this.strategyIntervalMultipliers = {
            aggressive: 0.7,  // Spawn faster with aggressive strategy
            balanced: 1.0,    // Normal spawn rate for balanced
            defensive: 1.2,   // Slower spawn rate for defensive
            economic: 1.5     // Much slower spawn rate for economic focus
        };
    }
    
    /**
     * Update spawn scheduling
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        const currentTime = Date.now();
        const spawnerSystem = this.gameEngine.getSystem('spawner');
        
        // Check if it's time to request new agents for each team
        for (const team of ['red', 'blue']) {
            if (currentTime >= this.nextScheduledSpawn[team]) {
                if (this.shouldRequestNewAgent(team)) {
                    spawnerSystem.requestAgentSpecification(team);
                }
                
                // Schedule next spawn time
                this.nextScheduledSpawn[team] = currentTime + this.calculateSpawnInterval(team);
            }
        }
    }
    
    /**
     * Calculate spawn interval based on team strategy and resources
     * @param {string} teamId - ID of the team
     * @returns {number} Time in milliseconds until next spawn request
     */
    calculateSpawnInterval(teamId) {
        const strategySystem = this.gameEngine.getSystem('teamStrategy');
        const baseSystem = this.gameEngine.getSystem('base');
        const teamStrategy = strategySystem.getTeamStrategy(teamId);
        const resources = baseSystem.getTeamResources(teamId);
        
        // Get multiplier based on strategy
        let multiplier = this.strategyIntervalMultipliers[teamStrategy.strategy] || 1.0;
        
        // Adjust based on resource availability
        const totalResources = resources.energy + resources.materials + resources.data;
        if (totalResources > 100) {
            // Resource abundance decreases spawn interval (spawn more frequently)
            multiplier *= 0.8;
        } else if (totalResources < 30) {
            // Resource scarcity increases spawn interval (spawn less frequently)
            multiplier *= 1.5;
        }
        
        // Return calculated interval
        return this.baseSpawnInterval * multiplier;
    }
    
    /**
     * Determine if a new agent should be requested
     * @param {string} teamId - ID of the team
     * @returns {boolean} Whether a new agent should be requested
     */
    shouldRequestNewAgent(teamId) {
        const agentSystem = this.gameEngine.getSystem('agent');
        const spawnerSystem = this.gameEngine.getSystem('spawner');
        const baseSystem = this.gameEngine.getSystem('base');
        
        const teamAgents = agentSystem.getAgentsByTeam(teamId);
        const spawnQueueLength = spawnerSystem.spawnQueue[teamId].length;
        const resources = baseSystem.getTeamResources(teamId);
        
        // If team already has a lot of agents, don't request more
        const maxAgents = 12;
        if (teamAgents.length + spawnQueueLength >= maxAgents) {
            return false;
        }
        
        // If queue already has pending agents, don't add more yet
        if (spawnQueueLength >= 2) {
            return false;
        }
        
        // If resources are very low, don't request agents
        const minResourceThreshold = 15;
        const totalResources = resources.energy + resources.materials + resources.data;
        if (totalResources < minResourceThreshold) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Force a spawn request for a specific team (for debugging/testing)
     * @param {string} teamId - ID of the team
     */
    forceSpawnRequest(teamId) {
        const spawnerSystem = this.gameEngine.getSystem('spawner');
        spawnerSystem.requestAgentSpecification(teamId);
        
        // Reset the scheduled spawn time to avoid immediate second spawn
        this.nextScheduledSpawn[teamId] = Date.now() + this.calculateSpawnInterval(teamId);
    }
}

export default SpawnScheduler;