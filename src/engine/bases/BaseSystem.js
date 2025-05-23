import { Rectangle } from '../shapes/Rectangle.js';
import { Circle } from '../shapes/Circle.js';

export class BaseSystem {
    constructor(hexGrid, renderSystem) {
        this.hexGrid = hexGrid;
        this.renderSystem = renderSystem;
        this.bases = {
            team1: null, // Red team
            team2: null  // Blue team
        };
        this.baseStructures = {
            team1: [],
            team2: []
        };
        this.resourceStorage = {
            team1: { energy: 0, materials: 0, data: 0 },
            team2: { energy: 0, materials: 0, data: 0 }
        };
    }

    initialize() {
        // Place bases at opposite corners of the map
        this.createTeam1Base();
        this.createTeam2Base();
    }

    createTeam1Base() {
        // Find a good cell in the top-left corner area for Team 1 (Red)
        const cornerCell = this.findCornerCell('topLeft');
        if (!cornerCell) return false;

        // Create base and add to the system
        this.bases.team1 = {
            x: cornerCell.x,
            y: cornerCell.y,
            teamId: 1,
            cell: cornerCell
        };

        // Create visual components of the base
        this.createBaseVisuals(this.bases.team1, '#cc0000');

        // Set nearby cells to team's control
        this.establishTerritory(cornerCell, 1);

        return true;
    }

    createTeam2Base() {
        // Find a good cell in the bottom-right corner for Team 2 (Blue)
        const cornerCell = this.findCornerCell('bottomRight');
        if (!cornerCell) return false;

        // Create base and add to the system
        this.bases.team2 = {
            x: cornerCell.x,
            y: cornerCell.y,
            teamId: 2,
            cell: cornerCell
        };

        // Create visual components of the base
        this.createBaseVisuals(this.bases.team2, '#0000cc');

        // Set nearby cells to team's control
        this.establishTerritory(cornerCell, 2);

        return true;
    }

    findCornerCell(corner) {
        // Get all cells, sorted by their position
        const cells = [...this.hexGrid.cells];
        
        let cornerCells;
        switch (corner) {
            case 'topLeft':
                // Sort by distance from origin (0,0) - closest first
                cells.sort((a, b) => {
                    const distA = Math.sqrt(a.x * a.x + a.y * a.y);
                    const distB = Math.sqrt(b.x * b.x + b.y * b.y);
                    return distA - distB;
                });
                cornerCells = cells.slice(0, 30); // Take first 30 cells
                break;
            case 'bottomRight':
                // Sort by distance from max coordinates - closest first
                const maxX = Math.max(...cells.map(c => c.x));
                const maxY = Math.max(...cells.map(c => c.y));
                cells.sort((a, b) => {
                    const distA = Math.sqrt((maxX - a.x) ** 2 + (maxY - a.y) ** 2);
                    const distB = Math.sqrt((maxX - b.x) ** 2 + (maxY - b.y) ** 2);
                    return distA - distB;
                });
                cornerCells = cells.slice(0, 30); // Take first 30 cells
                break;
            default:
                return null;
        }

        // Find first empty cell (no obstacles) from the candidates
        return cornerCells.find(cell => !cell.hasObstacle);
    }

    createBaseVisuals(base, color) {
        // Main base structure (larger circle)
        const mainBase = new Circle(base.x, base.y, 25, color);
        mainBase.zIndex = 10; // Ensure it's drawn on top of other elements
        this.renderSystem.addRenderable(mainBase);
        
        // Create additional visual elements
        const innerCircle = new Circle(base.x, base.y, 15, '#ffffff');
        innerCircle.zIndex = 11;
        this.renderSystem.addRenderable(innerCircle);

        // Team indicator in center
        const teamIndicator = new Circle(base.x, base.y, 10, color);
        teamIndicator.zIndex = 12;
        this.renderSystem.addRenderable(teamIndicator);

        // Save references to all visual components
        const teamKey = base.teamId === 1 ? 'team1' : 'team2';
        this.baseStructures[teamKey] = [mainBase, innerCircle, teamIndicator];
    }

    establishTerritory(centerCell, teamId) {
        // Set the center cell to full control
        centerCell.controlLevel = teamId === 1 ? -1 : 1;

        // Get neighboring cells up to 2 rings out
        const immediateNeighbors = this.hexGrid.getNeighbors(centerCell);
        
        // Set immediate neighbors to strong control
        for (const cell of immediateNeighbors) {
            if (!cell.hasObstacle) {
                cell.controlLevel = teamId === 1 ? -0.8 : 0.8;
            }
        }

        // Get second ring of neighbors and set to moderate control
        const secondRingNeighbors = [];
        for (const cell of immediateNeighbors) {
            const neighbors = this.hexGrid.getNeighbors(cell);
            for (const neighbor of neighbors) {
                // Only add cells not already processed
                if (neighbor !== centerCell && 
                    !immediateNeighbors.includes(neighbor) && 
                    !secondRingNeighbors.includes(neighbor)) {
                    secondRingNeighbors.push(neighbor);
                }
            }
        }

        for (const cell of secondRingNeighbors) {
            if (!cell.hasObstacle) {
                cell.controlLevel = teamId === 1 ? -0.6 : 0.6;
            }
        }
    }

    addResource(teamId, resourceType, amount) {
        const team = teamId === 1 ? 'team1' : 'team2';
        this.resourceStorage[team][resourceType] += amount;
    }

    getResources(teamId) {
        const team = teamId === 1 ? 'team1' : 'team2';
        return this.resourceStorage[team];
    }
    
    /**
     * Get resources for a team in the format expected by LLM systems
     * @param {number|string} teamId - Team ID (1/2 or 'red'/'blue')
     * @returns {Object} Resources in the format {energy, materials, data}
     */
    getTeamResources(teamId) {
        // Convert string teamId to number if needed
        const numericTeamId = teamId === 'red' ? 1 : (teamId === 'blue' ? 2 : teamId);
        return this.getResources(numericTeamId);
    }
    
    /**
     * Check if a team has enough resources for a cost
     * @param {number|string} teamId - Team ID (1/2 or 'red'/'blue')
     * @param {Object} cost - Resource cost {energy, materials, data}
     * @returns {boolean} Whether team has enough resources
     */
    hasResources(teamId, cost) {
        const numericTeamId = teamId === 'red' ? 1 : (teamId === 'blue' ? 2 : teamId);
        const resources = this.getResources(numericTeamId);
        
        return resources.energy >= cost.energy &&
               resources.materials >= cost.materials &&
               resources.data >= cost.data;
    }
    
    /**
     * Use (deduct) resources from a team
     * @param {number|string} teamId - Team ID (1/2 or 'red'/'blue')
     * @param {Object} cost - Resource cost {energy, materials, data}
     * @returns {boolean} Whether the resources were successfully used
     */
    useResources(teamId, cost) {
        const numericTeamId = teamId === 'red' ? 1 : (teamId === 'blue' ? 2 : teamId);
        
        if (!this.hasResources(numericTeamId, cost)) {
            return false;
        }
        
        const team = numericTeamId === 1 ? 'team1' : 'team2';
        
        this.resourceStorage[team].energy -= cost.energy;
        this.resourceStorage[team].materials -= cost.materials;
        this.resourceStorage[team].data -= cost.data;
        
        return true;
    }

    getBasePosition(teamId) {
        const base = teamId === 1 ? this.bases.team1 : this.bases.team2;
        return base ? { x: base.x, y: base.y } : null;
    }

    update(deltaTime) {
        // Animation or pulsing effect for bases could be added here
    }

    render(ctx) {
        // Additional custom rendering could be added here
        // Base visuals are already part of the renderSystem
    }
}