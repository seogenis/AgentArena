import { HexGrid } from '../grid/HexGrid.js';
import { ResourceSystem } from '../resources/ResourceSystem.js';
import { ObstacleSystem } from '../obstacles/ObstacleSystem.js';
import { BaseSystem } from '../bases/BaseSystem.js';
import { AgentSystem } from '../agents/AgentSystem.js';

export class WorldSystem {
    constructor(width, height, hexSize = 40) {
        // Create the hex grid
        this.hexGrid = new HexGrid(width, height, hexSize);
        
        // Create subsystems
        this.resourceSystem = new ResourceSystem(this.hexGrid);
        this.obstacleSystem = new ObstacleSystem(this.hexGrid);
        this.baseSystem = new BaseSystem(this.hexGrid);
        this.agentSystem = new AgentSystem(this.hexGrid, this.baseSystem);
        
        // Initialize the world
        this.initialize();
    }
    
    initialize() {
        // Generate obstacles
        this.obstacleSystem.generateObstacles(15);
        
        // Initialize bases (replaces initial territory control)
        this.baseSystem.initialize();
        
        // Spawn initial resources
        this.resourceSystem.initialResourceSpawn(20);
        
        // Initialize agents
        this.agentSystem.initialize();
    }
    
    update(deltaTime, timestamp) {
        // Update resources (handle spawning)
        this.resourceSystem.update(deltaTime, timestamp);
        
        // Update bases
        this.baseSystem.update(deltaTime);
        
        // Update agents
        this.agentSystem.update(deltaTime);
    }
    
    render(ctx) {
        // Render the hex grid (will include territory, obstacles, and resources)
        this.hexGrid.render(ctx);
        
        // Render bases
        this.baseSystem.render(ctx);
        
        // Render agents
        this.agentSystem.render(ctx);
    }
    
    // Add some interaction capabilities
    addControlToCell(x, y, team, amount = 0.1) {
        const cell = this.hexGrid.getCellAtPosition(x, y);
        if (cell && !cell.hasObstacle) {
            // Team 1 is negative values, Team 2 is positive
            const modifier = team === 1 ? -amount : amount;
            
            // Update control level, keeping it within -1 to 1 range
            cell.controlLevel = Math.max(-1, Math.min(1, cell.controlLevel + modifier));
            return true;
        }
        return false;
    }
    
    addObstacleAt(x, y) {
        const cell = this.hexGrid.getCellAtPosition(x, y);
        if (cell && !cell.hasObstacle && !cell.resourceType) {
            cell.hasObstacle = true;
            return true;
        }
        return false;
    }
    
    addResourceAt(x, y, type, amount = 3) {
        const cell = this.hexGrid.getCellAtPosition(x, y);
        if (cell && !cell.hasObstacle && !cell.resourceType) {
            cell.resourceType = type;
            cell.resourceAmount = amount;
            return true;
        }
        return false;
    }
    
    collectResourceAt(x, y) {
        const cell = this.hexGrid.getCellAtPosition(x, y);
        if (cell) {
            return this.resourceSystem.removeResource(cell);
        }
        return false;
    }
    
    createAgentAt(x, y, team, type) {
        return this.agentSystem.createAgent(team, type);
    }
    
    // Add debug information for overlay
    getDebugInfo() {
        const resourceCounts = {
            energy: 0,
            materials: 0,
            data: 0
        };
        
        let controlledByTeam1 = 0;
        let controlledByTeam2 = 0;
        let obstacleCount = 0;
        
        for (const cell of this.hexGrid.cells) {
            if (cell.resourceType) {
                resourceCounts[cell.resourceType]++;
            }
            
            if (cell.controlLevel < -0.2) {
                controlledByTeam1++;
            } else if (cell.controlLevel > 0.2) {
                controlledByTeam2++;
            }
            
            if (cell.hasObstacle) {
                obstacleCount++;
            }
        }
        
        // Add team resources from base system
        const team1Resources = this.baseSystem.getResourceCounts(1);
        const team2Resources = this.baseSystem.getResourceCounts(2);
        
        // Count agents by team
        const team1Agents = this.agentSystem.agents.filter(a => a.team === 1).length;
        const team2Agents = this.agentSystem.agents.filter(a => a.team === 2).length;
        
        return {
            resources: resourceCounts,
            territory: {
                team1: controlledByTeam1,
                team2: controlledByTeam2
            },
            obstacles: obstacleCount,
            totalCells: this.hexGrid.cells.length,
            baseResources: {
                team1: team1Resources,
                team2: team2Resources
            },
            agents: {
                team1: team1Agents,
                team2: team2Agents
            }
        };
    }
}