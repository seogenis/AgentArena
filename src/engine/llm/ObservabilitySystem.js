// Unified Observability System implementation
// Responsible for agent perception, information processing, and memory

export class ObservabilitySystem {
    constructor(worldSystem) {
        this.worldSystem = worldSystem;
        
        // Team-level knowledge storage (shared between agents of the same team)
        this.teamKnowledge = {
            1: { // Red team
                knownCells: new Map(),
                enemyBase: null,
                resourceHotspots: [],
                dangerZones: [],
                lastUpdated: Date.now()
            },
            2: { // Blue team
                knownCells: new Map(),
                enemyBase: null,
                resourceHotspots: [],
                dangerZones: [],
                lastUpdated: Date.now()
            }
        };
        
        // Configure memory decay
        this.memoryDecayRate = 0.01; // How quickly memory fades
        this.confidenceThreshold = 0.2; // Minimum confidence to consider memory reliable
        
        // Debug visualization
        this.showVisionCones = false; // Toggle for rendering vision cones
        
        // Communication settings
        this.communicationRange = 150; // How far agents can directly communicate
        this.communicationInterval = 2000; // How often agents share knowledge (ms)
        this.lastCommunicationTime = Date.now();
    }
    
    // Main method to gather observations for an agent
    observeEnvironment(agent, timestamp) {
        if (!agent || !this.worldSystem) return null;
        
        // Generate perception object
        const perception = {
            // Agent's personal state
            self: {
                id: agent.id,
                teamId: agent.teamId,
                type: agent.type,
                health: agent.health / agent.maxHealth,
                position: { x: agent.x, y: agent.y },
                resourceType: agent.resourceType,
                resourceAmount: agent.resourceAmount,
                capacity: agent.capacity,
                inCombat: agent.isAttacking,
                isHealing: agent.isHealing,
                timestamp: timestamp
            },
            
            // What the agent can see directly
            visibleEntities: this.getVisibleEntities(agent),
            
            // Environmental information
            environment: this.getEnvironmentalInfo(agent),
            
            // Team knowledge (shared through communications)
            teamKnowledge: this.getFilteredTeamKnowledge(agent)
        };
        
        // Update agent's personal memory and team knowledge
        this.updateAgentMemory(agent, perception, timestamp);
        
        return perception;
    }
    
    // Get entities visible to the agent based on vision range
    getVisibleEntities(agent) {
        const visibleEntities = {
            agents: {
                allies: [],
                enemies: []
            },
            resources: [],
            bases: [],
            obstacles: []
        };
        
        // Get all agents
        for (const otherAgent of this.worldSystem.agentSystem.agents) {
            // Skip self
            if (otherAgent.id === agent.id) continue;
            
            // Check if in vision range
            const distance = this.getDistance(agent, otherAgent);
            
            if (distance <= agent.visionRange) {
                // Check if line of sight is blocked by obstacles
                if (this.hasLineOfSight(agent, otherAgent)) {
                    const agentInfo = {
                        id: otherAgent.id,
                        teamId: otherAgent.teamId,
                        type: otherAgent.type,
                        position: { x: otherAgent.x, y: otherAgent.y },
                        health: otherAgent.health / otherAgent.maxHealth,
                        isCarryingResources: otherAgent.resourceAmount > 0,
                        resourceType: otherAgent.resourceType,
                        distance: distance
                    };
                    
                    // Add to appropriate list
                    if (otherAgent.teamId === agent.teamId) {
                        visibleEntities.agents.allies.push(agentInfo);
                    } else {
                        visibleEntities.agents.enemies.push(agentInfo);
                    }
                }
            }
        }
        
        // Get visible resources in cells
        for (const cell of this.worldSystem.hexGrid.cells) {
            if (!cell.resourceType || cell.resourceAmount <= 0) continue;
            
            // Get center of the cell
            const cellCenter = {
                x: cell.centerX,
                y: cell.centerY
            };
            
            // Calculate distance to the cell
            const distance = this.getDistance(agent, cellCenter);
            
            // Check if in vision range
            if (distance <= agent.visionRange) {
                // Check if line of sight is blocked
                if (this.hasLineOfSight(agent, cellCenter)) {
                    visibleEntities.resources.push({
                        type: cell.resourceType,
                        amount: cell.resourceAmount,
                        position: { x: cell.centerX, y: cell.centerY },
                        distance: distance
                    });
                }
            }
        }
        
        // Get visible obstacles
        for (const cell of this.worldSystem.hexGrid.cells) {
            if (!cell.hasObstacle) continue;
            
            const cellCenter = {
                x: cell.centerX,
                y: cell.centerY
            };
            
            const distance = this.getDistance(agent, cellCenter);
            
            if (distance <= agent.visionRange) {
                visibleEntities.obstacles.push({
                    position: { x: cell.centerX, y: cell.centerY },
                    distance: distance
                });
            }
        }
        
        // Get visible bases
        for (let teamId = 1; teamId <= 2; teamId++) {
            const basePos = this.worldSystem.baseSystem.getBasePosition(teamId);
            if (!basePos) continue;
            
            const distance = this.getDistance(agent, basePos);
            
            if (distance <= agent.visionRange) {
                if (this.hasLineOfSight(agent, basePos)) {
                    visibleEntities.bases.push({
                        teamId: teamId,
                        position: { x: basePos.x, y: basePos.y },
                        isOwnBase: teamId === agent.teamId,
                        distance: distance
                    });
                    
                    // If this is an enemy base, update team knowledge
                    if (teamId !== agent.teamId) {
                        this.teamKnowledge[agent.teamId].enemyBase = {
                            position: { x: basePos.x, y: basePos.y },
                            lastSeen: Date.now(),
                            confidence: 1.0
                        };
                    }
                }
            }
        }
        
        // Sort all entities by distance
        visibleEntities.agents.allies.sort((a, b) => a.distance - b.distance);
        visibleEntities.agents.enemies.sort((a, b) => a.distance - b.distance);
        visibleEntities.resources.sort((a, b) => a.distance - b.distance);
        visibleEntities.bases.sort((a, b) => a.distance - b.distance);
        
        return visibleEntities;
    }
    
    // Get information about the surrounding environment
    getEnvironmentalInfo(agent) {
        const environment = {
            territoryControl: {
                team1: 0,  // Red team
                team2: 0,  // Blue team
                neutral: 0 // Neither team
            },
            nearestBase: {
                own: null,
                enemy: null
            },
            dangerLevel: 0,
            terrain: {
                obstacleCount: 0,
                resourceDensity: 0
            }
        };
        
        // Count cells in vision range by control
        let cellCount = 0;
        let resourceCount = 0;
        
        for (const cell of this.worldSystem.hexGrid.cells) {
            const distance = this.getDistance(
                agent, 
                { x: cell.centerX, y: cell.centerY }
            );
            
            if (distance <= agent.visionRange) {
                cellCount++;
                
                if (cell.controlLevel < -0.2) {
                    environment.territoryControl.team1++;
                } else if (cell.controlLevel > 0.2) {
                    environment.territoryControl.team2++;
                } else {
                    environment.territoryControl.neutral++;
                }
                
                if (cell.hasObstacle) {
                    environment.terrain.obstacleCount++;
                }
                
                if (cell.resourceType && cell.resourceAmount > 0) {
                    resourceCount++;
                }
            }
        }
        
        // Calculate territory percentages
        if (cellCount > 0) {
            environment.territoryControl.team1 = environment.territoryControl.team1 / cellCount;
            environment.territoryControl.team2 = environment.territoryControl.team2 / cellCount;
            environment.territoryControl.neutral = environment.territoryControl.neutral / cellCount;
            environment.terrain.resourceDensity = resourceCount / cellCount;
        }
        
        // Get nearest base info
        const ownBasePos = this.worldSystem.baseSystem.getBasePosition(agent.teamId);
        const enemyTeamId = agent.teamId === 1 ? 2 : 1;
        const enemyBasePos = this.worldSystem.baseSystem.getBasePosition(enemyTeamId);
        
        if (ownBasePos) {
            const distance = this.getDistance(agent, ownBasePos);
            environment.nearestBase.own = {
                position: { x: ownBasePos.x, y: ownBasePos.y },
                distance: distance
            };
        }
        
        if (enemyBasePos) {
            const distance = this.getDistance(agent, enemyBasePos);
            environment.nearestBase.enemy = {
                position: { x: enemyBasePos.x, y: enemyBasePos.y },
                distance: distance
            };
        }
        
        // Calculate danger level based on enemy agents and territory control
        const enemyCount = environment.visibleEntities?.agents?.enemies?.length || 0;
        const enemyControlRatio = agent.teamId === 1 ? 
            environment.territoryControl.team2 : 
            environment.territoryControl.team1;
        
        environment.dangerLevel = Math.min(
            1.0,
            (enemyCount * 0.2) + (enemyControlRatio * 0.5)
        );
        
        return environment;
    }
    
    // Update agent's memory and team knowledge based on observations
    updateAgentMemory(agent, perception, timestamp) {
        if (!agent || !perception) return;
        
        const teamId = agent.teamId;
        const teamData = this.teamKnowledge[teamId];
        if (!teamData) return;
        
        // Update observed cells in team knowledge
        const visibleCells = this.getCellsInVisionRange(agent);
        for (const cell of visibleCells) {
            const cellKey = `${cell.row},${cell.col}`;
            teamData.knownCells.set(cellKey, {
                position: { x: cell.centerX, y: cell.centerY },
                controlLevel: cell.controlLevel,
                hasObstacle: cell.hasObstacle,
                resourceType: cell.resourceType,
                resourceAmount: cell.resourceAmount,
                lastSeen: timestamp,
                confidence: 1.0 // Full confidence for directly observed cells
            });
        }
        
        // Update resource hotspots if multiple resources are seen in an area
        if (perception.visibleEntities.resources.length >= 3) {
            // Find center of resource cluster
            let centerX = 0;
            let centerY = 0;
            for (const resource of perception.visibleEntities.resources) {
                centerX += resource.position.x;
                centerY += resource.position.y;
            }
            centerX /= perception.visibleEntities.resources.length;
            centerY /= perception.visibleEntities.resources.length;
            
            // Check if we already have this hotspot
            const isNewHotspot = !teamData.resourceHotspots.some(hotspot => 
                this.getDistance(
                    { x: centerX, y: centerY },
                    { x: hotspot.position.x, y: hotspot.position.y }
                ) < 100
            );
            
            if (isNewHotspot) {
                teamData.resourceHotspots.push({
                    position: { x: centerX, y: centerY },
                    count: perception.visibleEntities.resources.length,
                    types: perception.visibleEntities.resources.map(r => r.type),
                    lastSeen: timestamp,
                    confidence: 0.9
                });
                
                // Limit to 10 hotspots
                if (teamData.resourceHotspots.length > 10) {
                    teamData.resourceHotspots.sort((a, b) => 
                        (b.confidence * b.count) - (a.confidence * a.count)
                    );
                    teamData.resourceHotspots = teamData.resourceHotspots.slice(0, 10);
                }
            }
        }
        
        // Update danger zones if multiple enemies are seen in an area
        if (perception.visibleEntities.agents.enemies.length >= 2) {
            // Find center of enemy cluster
            let centerX = 0;
            let centerY = 0;
            for (const enemy of perception.visibleEntities.agents.enemies) {
                centerX += enemy.position.x;
                centerY += enemy.position.y;
            }
            centerX /= perception.visibleEntities.agents.enemies.length;
            centerY /= perception.visibleEntities.agents.enemies.length;
            
            // Check if we already have this danger zone
            const existingZoneIndex = teamData.dangerZones.findIndex(zone => 
                this.getDistance(
                    { x: centerX, y: centerY },
                    { x: zone.position.x, y: zone.position.y }
                ) < 120
            );
            
            if (existingZoneIndex >= 0) {
                // Update existing zone
                teamData.dangerZones[existingZoneIndex].enemyCount = 
                    perception.visibleEntities.agents.enemies.length;
                teamData.dangerZones[existingZoneIndex].lastSeen = timestamp;
                teamData.dangerZones[existingZoneIndex].confidence = 1.0;
            } else {
                // Add new danger zone
                teamData.dangerZones.push({
                    position: { x: centerX, y: centerY },
                    enemyCount: perception.visibleEntities.agents.enemies.length,
                    lastSeen: timestamp,
                    confidence: 1.0
                });
                
                // Limit to 5 danger zones
                if (teamData.dangerZones.length > 5) {
                    teamData.dangerZones.sort((a, b) => 
                        (b.confidence * b.enemyCount) - (a.confidence * a.enemyCount)
                    );
                    teamData.dangerZones = teamData.dangerZones.slice(0, 5);
                }
            }
        }
        
        // Update team knowledge last updated timestamp
        teamData.lastUpdated = timestamp;
    }
    
    // Get filtered team knowledge for an agent
    getFilteredTeamKnowledge(agent) {
        if (!agent) return null;
        
        const teamId = agent.teamId;
        const teamData = this.teamKnowledge[teamId];
        if (!teamData) return null;
        
        // Create a filtered version of team knowledge
        const filteredKnowledge = {
            knownTerritoryControl: {
                team1: 0,
                team2: 0,
                neutral: 0,
                total: 0
            },
            enemyBase: teamData.enemyBase,
            resourceHotspots: [],
            dangerZones: []
        };
        
        // Filter knowledge by confidence
        for (const [key, cellData] of teamData.knownCells.entries()) {
            if (cellData.confidence >= this.confidenceThreshold) {
                filteredKnowledge.knownTerritoryControl.total++;
                
                if (cellData.controlLevel < -0.2) {
                    filteredKnowledge.knownTerritoryControl.team1++;
                } else if (cellData.controlLevel > 0.2) {
                    filteredKnowledge.knownTerritoryControl.team2++;
                } else {
                    filteredKnowledge.knownTerritoryControl.neutral++;
                }
            }
        }
        
        // Convert to percentages
        if (filteredKnowledge.knownTerritoryControl.total > 0) {
            filteredKnowledge.knownTerritoryControl.team1 /= filteredKnowledge.knownTerritoryControl.total;
            filteredKnowledge.knownTerritoryControl.team2 /= filteredKnowledge.knownTerritoryControl.total;
            filteredKnowledge.knownTerritoryControl.neutral /= filteredKnowledge.knownTerritoryControl.total;
        }
        
        // Filter resource hotspots by confidence
        filteredKnowledge.resourceHotspots = teamData.resourceHotspots
            .filter(hotspot => hotspot.confidence >= this.confidenceThreshold)
            .sort((a, b) => b.confidence - a.confidence);
            
        // Filter danger zones by confidence
        filteredKnowledge.dangerZones = teamData.dangerZones
            .filter(zone => zone.confidence >= this.confidenceThreshold)
            .sort((a, b) => b.confidence - a.confidence);
            
        return filteredKnowledge;
    }
    
    // Share information between agents on the same team
    shareInformation(timestamp) {
        // Only share information periodically
        if (timestamp - this.lastCommunicationTime < this.communicationInterval) {
            return;
        }
        
        this.lastCommunicationTime = timestamp;
        
        // For each team, share information between nearby agents
        for (let teamId = 1; teamId <= 2; teamId++) {
            const teamAgents = this.worldSystem.agentSystem.getAgentsByTeam(teamId);
            
            // For each agent pair, share information if they're close enough
            for (let i = 0; i < teamAgents.length; i++) {
                for (let j = i + 1; j < teamAgents.length; j++) {
                    const agent1 = teamAgents[i];
                    const agent2 = teamAgents[j];
                    
                    // Check if agents are in communication range
                    const distance = this.getDistance(agent1, agent2);
                    if (distance <= this.communicationRange) {
                        // For now, information is already shared through teamKnowledge
                        // In the future, we could implement more selective sharing
                        
                        // Update visuals to indicate communication
                        if (typeof this.worldSystem.createCommunicationEffect === 'function') {
                            // Midpoint between agents
                            const midX = (agent1.x + agent2.x) / 2;
                            const midY = (agent1.y + agent2.y) / 2;
                            
                            this.worldSystem.createCommunicationEffect(midX, midY, teamId);
                        }
                    }
                }
            }
        }
    }
    
    // Apply memory decay to reduce confidence over time
    applyMemoryDecay(timestamp) {
        // Apply decay to team knowledge
        for (let teamId = 1; teamId <= 2; teamId++) {
            const teamData = this.teamKnowledge[teamId];
            if (!teamData) continue;
            
            // Calculate time factor (seconds since last update)
            const timeSinceUpdate = (timestamp - teamData.lastUpdated) / 1000;
            const decayFactor = this.memoryDecayRate * timeSinceUpdate;
            
            // Decay cell knowledge
            for (const [key, cellData] of teamData.knownCells.entries()) {
                const timeSinceObserved = (timestamp - cellData.lastSeen) / 1000;
                const cellDecay = this.memoryDecayRate * timeSinceObserved;
                
                // Apply decay to confidence
                cellData.confidence = Math.max(0, cellData.confidence - cellDecay);
                
                // Remove if confidence is too low
                if (cellData.confidence < this.confidenceThreshold / 2) {
                    teamData.knownCells.delete(key);
                }
            }
            
            // Decay resource hotspots
            teamData.resourceHotspots.forEach(hotspot => {
                const timeSinceObserved = (timestamp - hotspot.lastSeen) / 1000;
                const hotspotDecay = this.memoryDecayRate * timeSinceObserved * 0.5; // Slower decay
                
                hotspot.confidence = Math.max(0, hotspot.confidence - hotspotDecay);
            });
            
            // Filter out low confidence hotspots
            teamData.resourceHotspots = teamData.resourceHotspots
                .filter(hotspot => hotspot.confidence >= this.confidenceThreshold);
                
            // Decay danger zones (faster decay since enemies move)
            teamData.dangerZones.forEach(zone => {
                const timeSinceObserved = (timestamp - zone.lastSeen) / 1000;
                const zoneDecay = this.memoryDecayRate * timeSinceObserved * 2.0; // Faster decay
                
                zone.confidence = Math.max(0, zone.confidence - zoneDecay);
            });
            
            // Filter out low confidence danger zones
            teamData.dangerZones = teamData.dangerZones
                .filter(zone => zone.confidence >= this.confidenceThreshold);
                
            // Update enemy base confidence if it exists
            if (teamData.enemyBase) {
                const timeSinceObserved = (timestamp - teamData.enemyBase.lastSeen) / 1000;
                const baseDecay = this.memoryDecayRate * timeSinceObserved * 0.1; // Very slow decay
                
                teamData.enemyBase.confidence = Math.max(0, teamData.enemyBase.confidence - baseDecay);
            }
        }
    }
    
    // Get cells within an agent's vision range
    getCellsInVisionRange(agent) {
        if (!agent || !this.worldSystem || !this.worldSystem.hexGrid) return [];
        
        const visibleCells = [];
        
        for (const cell of this.worldSystem.hexGrid.cells) {
            const distance = this.getDistance(
                agent, 
                { x: cell.centerX, y: cell.centerY }
            );
            
            if (distance <= agent.visionRange) {
                if (this.hasLineOfSight(agent, { x: cell.centerX, y: cell.centerY })) {
                    visibleCells.push(cell);
                }
            }
        }
        
        return visibleCells;
    }
    
    // Check if there's a clear line of sight between two points
    hasLineOfSight(from, to) {
        if (!this.worldSystem || !this.worldSystem.hexGrid) return true;
        
        // Get the line between the points
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If distance is very small, return true
        if (distance < 10) return true;
        
        // Number of points to check along the line
        const steps = Math.max(5, Math.ceil(distance / 20));
        
        // Check for obstacles along the line
        for (let i = 1; i < steps; i++) {
            const ratio = i / steps;
            const x = from.x + dx * ratio;
            const y = from.y + dy * ratio;
            
            // Get the cell at this point
            const cell = this.worldSystem.hexGrid.getCellAtPosition(x, y);
            
            // If the cell has an obstacle, line of sight is blocked
            if (cell && cell.hasObstacle) {
                return false;
            }
        }
        
        // No obstacles found, line of sight is clear
        return true;
    }
    
    // Calculate distance between two points
    getDistance(point1, point2) {
        return Math.sqrt(
            Math.pow(point2.x - point1.x, 2) + 
            Math.pow(point2.y - point1.y, 2)
        );
    }
    
    // Render debug visualization
    renderDebugVisualization(ctx) {
        if (!this.showVisionCones) return;
        
        // Render vision cones for each agent
        for (const agent of this.worldSystem.agentSystem.agents) {
            this.renderAgentVision(ctx, agent);
        }
    }
    
    // Render an agent's vision cone
    renderAgentVision(ctx, agent) {
        // Draw vision range circle
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, agent.visionRange, 0, Math.PI * 2);
        ctx.strokeStyle = agent.teamId === 1 ? 
            'rgba(255, 100, 100, 0.3)' : 
            'rgba(100, 100, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = agent.teamId === 1 ? 
            'rgba(255, 100, 100, 0.05)' : 
            'rgba(100, 100, 255, 0.05)';
        ctx.fill();
    }
    
    // Toggle vision cone visualization
    toggleVisionCones() {
        this.showVisionCones = !this.showVisionCones;
        return this.showVisionCones;
    }
}