export class AgentSystem {
    constructor(hexGrid, baseSystem) {
        this.hexGrid = hexGrid;
        this.baseSystem = baseSystem;
        this.agents = [];
        this.nextAgentId = 1;
    }

    initialize() {
        // Create initial agents for each team
        this.createAgent(1, 'Collector'); // Red team collector
        this.createAgent(1, 'Explorer');  // Red team explorer
        this.createAgent(2, 'Collector'); // Blue team collector
        this.createAgent(2, 'Explorer');  // Blue team explorer
    }

    createAgent(team, type = 'Collector') {
        // Get team's base for positioning
        const base = this.baseSystem.getBaseForTeam(team);
        if (!base) return null;

        // Create agent with given parameters
        const agent = {
            id: this.nextAgentId++,
            team,
            type,
            x: base.x,
            y: base.y,
            size: this.hexGrid.hexSize * 0.6,
            speed: 80, // pixels per second
            targetX: base.x,
            targetY: base.y,
            state: 'idle', // idle, moving, collecting, returning
            collectedResources: {
                energy: 0,
                materials: 0,
                data: 0
            },
            capacity: {
                energy: 3,
                materials: 3,
                data: 3
            },
            // Visual properties
            color: team === 1 ? '#FF3030' : '#3030FF',
            secondaryColor: team === 1 ? '#FFAAAA' : '#AAAAFF',
            
            render: function(ctx) {
                // Draw agent body
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                
                // Draw agent type indicator
                ctx.beginPath();
                
                if (this.type === 'Collector') {
                    // Collector has a resource bag icon
                    const bagSize = this.size * 0.5;
                    ctx.rect(this.x - bagSize/2, this.y - bagSize/2, bagSize, bagSize);
                } else if (this.type === 'Explorer') {
                    // Explorer has a triangle shape
                    const markerSize = this.size * 0.6;
                    ctx.moveTo(this.x, this.y - markerSize);
                    ctx.lineTo(this.x - markerSize/2, this.y + markerSize/2);
                    ctx.lineTo(this.x + markerSize/2, this.y + markerSize/2);
                }
                
                ctx.fillStyle = this.secondaryColor;
                ctx.fill();
                
                // Draw resource indicator if carrying resources
                const totalResources = this.collectedResources.energy + 
                    this.collectedResources.materials + 
                    this.collectedResources.data;
                
                if (totalResources > 0) {
                    // Draw resource circle
                    const resourceIndicatorSize = this.size * 0.3;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y - this.size, resourceIndicatorSize, 0, Math.PI * 2);
                    ctx.fillStyle = '#FFD700'; // Gold color for resources
                    ctx.fill();
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                
                // Draw state indicator (small dot color based on state)
                const stateColors = {
                    idle: '#AAAAAA',
                    moving: '#88FF88',
                    collecting: '#FFFF00',
                    returning: '#FFAA00',
                    avoiding: '#FF00FF'
                };
                
                if (stateColors[this.state]) {
                    const stateSize = this.size * 0.3;
                    ctx.beginPath();
                    ctx.arc(this.x + this.size, this.y, stateSize, 0, Math.PI * 2);
                    ctx.fillStyle = stateColors[this.state];
                    ctx.fill();
                }
            },
            
            update: function(deltaTime, obstacles, resources, otherAgents) {
                // Basic state machine
                switch (this.state) {
                    case 'idle':
                        this.decideNextAction(resources, obstacles);
                        break;
                    case 'moving':
                        this.moveToTarget(deltaTime, obstacles, otherAgents);
                        break;
                    case 'collecting':
                        this.collectResources(deltaTime, resources);
                        break;
                    case 'returning':
                        this.returnToBase(deltaTime, obstacles, otherAgents);
                        break;
                    case 'avoiding':
                        this.avoidObstacle(deltaTime, obstacles, otherAgents);
                        break;
                }
            },
            
            decideNextAction: function(resources, obstacles) {
                // Check if carrying resources at capacity
                const totalResources = this.collectedResources.energy + 
                    this.collectedResources.materials + 
                    this.collectedResources.data;
                    
                const maxCapacity = this.capacity.energy + 
                    this.capacity.materials + 
                    this.capacity.data;
                
                if (totalResources >= maxCapacity * 0.7) {
                    // If carrying enough resources, return to base
                    this.state = 'returning';
                    return;
                }
                
                // Different behavior based on agent type
                if (this.type === 'Collector') {
                    // Collectors look for the nearest resource
                    const nearestResource = this.findNearestResource(resources);
                    
                    if (nearestResource) {
                        this.targetX = nearestResource.x;
                        this.targetY = nearestResource.y;
                        this.targetResource = nearestResource;
                        this.state = 'moving';
                    } else {
                        // No resources found, wander
                        this.wander();
                    }
                } else if (this.type === 'Explorer') {
                    // Explorers move to random locations, preferring unexplored territory
                    this.exploreTerritory();
                }
            },
            
            findNearestResource: function(resources) {
                let nearestResource = null;
                let shortestDistance = Infinity;
                
                // Check for resources in cells
                for (const cell of resources) {
                    if (!cell.resourceType) continue;
                    
                    const dx = cell.x - this.x;
                    const dy = cell.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < shortestDistance) {
                        shortestDistance = distance;
                        nearestResource = cell;
                    }
                }
                
                return nearestResource;
            },
            
            wander: function() {
                // Pick a random point within reasonable distance
                const wanderRadius = 300;
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * wanderRadius;
                
                this.targetX = this.x + Math.cos(angle) * distance;
                this.targetY = this.y + Math.sin(angle) * distance;
                this.state = 'moving';
            },
            
            exploreTerritory: function() {
                // Explorers move toward territory that's not controlled by their team
                // For simplicity, we'll just pick a random point for now
                const mapSize = 800; // Use the approximate map size
                
                // 70% chance to move toward enemy territory, 30% chance to wander
                if (Math.random() < 0.7) {
                    // Move toward opposite corner from base
                    const baseX = this.team === 1 ? 0 : mapSize;
                    const baseY = this.team === 1 ? mapSize : 0;
                    
                    // Pick a point in the opposite quadrant
                    const oppositeX = this.team === 1 ? mapSize - Math.random() * 300 : Math.random() * 300;
                    const oppositeY = this.team === 1 ? Math.random() * 300 : mapSize - Math.random() * 300;
                    
                    this.targetX = oppositeX;
                    this.targetY = oppositeY;
                } else {
                    // Occasionally wander randomly
                    this.wander();
                }
            },
            
            moveToTarget: function(deltaTime, obstacles, otherAgents) {
                // Calculate direction to target
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // If we've reached the target, stop moving
                if (distance < this.size) {
                    if (this.targetResource) {
                        this.state = 'collecting';
                    } else {
                        this.state = 'idle';
                    }
                    return;
                }
                
                // Check for obstacles in the path
                if (this.checkForObstacles(dx, dy, obstacles, otherAgents)) {
                    this.state = 'avoiding';
                    return;
                }
                
                // Move toward target
                const dirX = dx / distance;
                const dirY = dy / distance;
                
                this.x += dirX * this.speed * deltaTime;
                this.y += dirY * this.speed * deltaTime;
                
                // Mark territory as we move
                this.markTerritory();
            },
            
            checkForObstacles: function(dx, dy, obstacles, otherAgents) {
                // Create a look-ahead point in the direction of travel
                const lookAheadDist = this.size * 3;
                const dirX = dx / Math.sqrt(dx * dx + dy * dy);
                const dirY = dy / Math.sqrt(dx * dx + dy * dy);
                
                const lookAheadX = this.x + dirX * lookAheadDist;
                const lookAheadY = this.y + dirY * lookAheadDist;
                
                // Check for obstacles
                for (const obstacle of obstacles) {
                    if (!obstacle.hasObstacle) continue;
                    
                    const obsDx = obstacle.x - lookAheadX;
                    const obsDy = obstacle.y - lookAheadY;
                    const obsDistance = Math.sqrt(obsDx * obsDx + obsDy * obsDy);
                    
                    if (obsDistance < this.size + obstacle.radius) {
                        // Calculate avoidance vector
                        this.avoidanceX = obstacle.x;
                        this.avoidanceY = obstacle.y;
                        return true;
                    }
                }
                
                // Check for other agents to avoid collisions
                for (const agent of otherAgents) {
                    if (agent === this) continue;
                    
                    const agentDx = agent.x - lookAheadX;
                    const agentDy = agent.y - lookAheadY;
                    const agentDistance = Math.sqrt(agentDx * agentDx + agentDy * agentDy);
                    
                    if (agentDistance < this.size + agent.size) {
                        // Calculate avoidance vector
                        this.avoidanceX = agent.x;
                        this.avoidanceY = agent.y;
                        return true;
                    }
                }
                
                return false;
            },
            
            avoidObstacle: function(deltaTime, obstacles, otherAgents) {
                if (!this.avoidanceX || !this.avoidanceY) {
                    this.state = 'moving';
                    return;
                }
                
                // Calculate perpendicular avoidance direction
                const avoidDx = this.avoidanceX - this.x;
                const avoidDy = this.avoidanceY - this.y;
                const avoidDist = Math.sqrt(avoidDx * avoidDx + avoidDy * avoidDy);
                
                // If we're far enough from the obstacle, go back to moving
                if (avoidDist > this.size * 5) {
                    this.state = 'moving';
                    return;
                }
                
                // Calculate perpendicular vector (90 degrees)
                const perpX = -avoidDy / avoidDist;
                const perpY = avoidDx / avoidDist;
                
                // Pick the perpendicular direction based on target
                let selectedPerpX = perpX;
                let selectedPerpY = perpY;
                
                // Determine which perpendicular direction is better (closer to target)
                const targetDx = this.targetX - this.x;
                const targetDy = this.targetY - this.y;
                
                // Dot product to determine which side is better
                const dot = targetDx * perpX + targetDy * perpY;
                if (dot < 0) {
                    selectedPerpX = -perpX;
                    selectedPerpY = -perpY;
                }
                
                // Move in the avoidance direction
                this.x += selectedPerpX * this.speed * deltaTime;
                this.y += selectedPerpY * this.speed * deltaTime;
                
                // Mark territory as we move
                this.markTerritory();
            },
            
            collectResources: function(deltaTime, resources) {
                if (!this.targetResource) {
                    this.state = 'idle';
                    return;
                }
                
                // Check if resource still exists
                if (!this.targetResource.resourceType) {
                    this.targetResource = null;
                    this.state = 'idle';
                    return;
                }
                
                // Collect the resource
                const resourceType = this.targetResource.resourceType;
                
                // Add resource to collected resources
                if (this.collectedResources[resourceType] < this.capacity[resourceType]) {
                    this.collectedResources[resourceType]++;
                    
                    // Remove from the world (updating resource amount)
                    this.targetResource.resourceAmount--;
                    if (this.targetResource.resourceAmount <= 0) {
                        this.targetResource.resourceType = null;
                        this.targetResource.resourceAmount = 0;
                    }
                }
                
                // Check if we're full
                if (this.collectedResources[resourceType] >= this.capacity[resourceType]) {
                    this.state = 'returning';
                } else if (!this.targetResource.resourceType) {
                    // Resource exhausted
                    this.targetResource = null;
                    this.state = 'idle';
                }
            },
            
            returnToBase: function(deltaTime, obstacles, otherAgents) {
                // Get base position
                const base = this.team === 1 ? 
                    { x: 80, y: 720 } :  // Red team base (approximate)
                    { x: 720, y: 80 };   // Blue team base (approximate)
                
                // Set target to base
                this.targetX = base.x;
                this.targetY = base.y;
                
                // Move toward base
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // If we've reached the base
                if (distance < base.size || distance < 40) { // Use approximate base size
                    // Deposit resources
                    const deposited = { ...this.collectedResources };
                    
                    // Reset collected resources
                    this.collectedResources.energy = 0;
                    this.collectedResources.materials = 0;
                    this.collectedResources.data = 0;
                    
                    // Signal resource deposit
                    if (this.onDepositResources) {
                        this.onDepositResources(deposited);
                    }
                    
                    // Go back to idle state
                    this.state = 'idle';
                    return;
                }
                
                // Check for obstacles in the path
                if (this.checkForObstacles(dx, dy, obstacles, otherAgents)) {
                    this.state = 'avoiding';
                    return;
                }
                
                // Move toward base
                const dirX = dx / distance;
                const dirY = dy / distance;
                
                this.x += dirX * this.speed * deltaTime;
                this.y += dirY * this.speed * deltaTime;
                
                // Mark territory as we move
                this.markTerritory();
            },
            
            markTerritory: function() {
                // Let the territory system know we're here
                if (this.onMarkTerritory) {
                    this.onMarkTerritory(this.x, this.y, this.team);
                }
            }
        };
        
        // Set up resource deposit callback
        agent.onDepositResources = (resources) => {
            this.baseSystem.depositResources(agent.team, resources);
        };
        
        // Set up territory marking callback
        agent.onMarkTerritory = (x, y, team) => {
            // Mark territory with weaker influence
            const cell = this.hexGrid.getCellAtPosition(x, y);
            if (cell && !cell.hasObstacle) {
                // Use smaller influence amount (0.01) since this happens often
                const influence = team === 1 ? -0.01 : 0.01;
                cell.controlLevel = Math.max(-1, Math.min(1, cell.controlLevel + influence));
            }
        };
        
        this.agents.push(agent);
        return agent;
    }

    update(deltaTime) {
        // Get obstacles from hex grid
        const obstacles = this.hexGrid.cells.filter(cell => cell.hasObstacle);
        
        // Update each agent
        for (const agent of this.agents) {
            agent.update(deltaTime, obstacles, this.hexGrid.cells, this.agents);
        }
    }

    render(ctx) {
        // Render each agent
        for (const agent of this.agents) {
            agent.render(ctx);
        }
    }
}