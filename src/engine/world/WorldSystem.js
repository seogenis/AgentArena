import { HexGrid } from '../grid/HexGrid.js';
import { ResourceSystem } from '../resources/ResourceSystem.js';
import { ObstacleSystem } from '../obstacles/ObstacleSystem.js';
import { BaseSystem } from '../bases/BaseSystem.js';
import { AgentSystem } from '../agents/AgentSystem.js';
import { CollisionSystem } from '../utils/CollisionSystem.js';

export class WorldSystem {
    constructor(width, height, hexSize = 40, renderSystem) {
        // Create the hex grid
        this.hexGrid = new HexGrid(width, height, hexSize);
        
        // Store reference to render system
        this.renderSystem = renderSystem;
        
        // Create subsystems
        this.resourceSystem = new ResourceSystem(this.hexGrid);
        this.obstacleSystem = new ObstacleSystem(this.hexGrid);
        this.baseSystem = new BaseSystem(this.hexGrid, this.renderSystem);
        this.collisionSystem = new CollisionSystem(this.hexGrid);
        
        // Initialize the world
        this.initialize();
        
        // Agent system must be initialized after baseSystem
        this.agentSystem = new AgentSystem(this.hexGrid, this.renderSystem, this.baseSystem);
        this.agentSystem.initialize();
    }
    
    initialize() {
        // Generate obstacles
        this.obstacleSystem.generateObstacles(15);
        
        // Create bases instead of random territory control
        this.baseSystem.initialize();
        
        // Spawn initial resources
        this.resourceSystem.initialResourceSpawn(20);
    }
    
    update(deltaTime, timestamp) {
        // Update resources (handle spawning)
        this.resourceSystem.update(deltaTime, timestamp);
        
        // Update bases
        this.baseSystem.update(deltaTime);
        
        // Update agents
        this.agentSystem.update(deltaTime);
        
        // Update territory control from agent positions
        this.agentSystem.updateTerritoryControl(deltaTime);
    }
    
    render(ctx) {
        // Render the hex grid (will include territory, obstacles, and resources)
        this.hexGrid.render(ctx);
        
        // Additional rendering for components not handled by the render system
        // (Agents and bases are already in the render system)
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
    
    createAgent(teamId) {
        return this.agentSystem.createAgent(teamId);
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
        
        // Get base resources
        const team1Resources = this.baseSystem.getResources(1);
        const team2Resources = this.baseSystem.getResources(2);
        
        // Get agent counts
        const team1Agents = this.agentSystem.getAgentsByTeam(1).length;
        const team2Agents = this.agentSystem.getAgentsByTeam(2).length;
        
        return {
            resources: resourceCounts,
            territory: {
                team1: controlledByTeam1,
                team2: controlledByTeam2
            },
            teamResources: {
                team1: team1Resources,
                team2: team2Resources
            },
            agents: {
                team1: team1Agents,
                team2: team2Agents
            },
            obstacles: obstacleCount,
            totalCells: this.hexGrid.cells.length
        };
    }
}