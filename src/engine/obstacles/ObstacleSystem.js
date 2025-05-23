export class ObstacleSystem {
    constructor(hexGrid) {
        this.hexGrid = hexGrid;
    }
    
    generateObstacles(count = 25) {
        // Create random obstacle patterns
        this.createRandomObstacles(count);
        this.createObstacleFormations(3);
    }
    
    createRandomObstacles(count) {
        // Place individual obstacles randomly
        for (let i = 0; i < count; i++) {
            const validCells = this.hexGrid.cells.filter(cell => 
                !cell.hasObstacle && 
                !cell.resourceType && 
                Math.abs(cell.controlLevel) < 0.1);
                
            if (validCells.length === 0) return;
            
            const cell = validCells[Math.floor(Math.random() * validCells.length)];
            cell.hasObstacle = true;
        }
    }
    
    createObstacleFormations(formationCount) {
        // Create a few larger obstacle formations (like walls or clusters)
        for (let f = 0; f < formationCount; f++) {
            const formationType = Math.random() < 0.5 ? 'wall' : 'cluster';
            
            if (formationType === 'wall') {
                this.createWallFormation();
            } else {
                this.createClusterFormation();
            }
        }
    }
    
    createWallFormation() {
        // Create a linear wall of obstacles
        const wallLength = 5 + Math.floor(Math.random() * 5); // 5-9 obstacles
        
        // Find a valid starting cell
        const validCells = this.hexGrid.cells.filter(cell => 
            !cell.hasObstacle && 
            !cell.resourceType && 
            Math.abs(cell.controlLevel) < 0.1);
            
        if (validCells.length === 0) return;
        
        const startCell = validCells[Math.floor(Math.random() * validCells.length)];
        
        // Choose a random direction (0-5 for the 6 hex directions)
        const direction = Math.floor(Math.random() * 6);
        
        // Create the wall
        let currentCell = startCell;
        currentCell.hasObstacle = true;
        
        for (let i = 1; i < wallLength; i++) {
            const neighbors = this.hexGrid.getNeighbors(currentCell);
            
            // Choose the neighbor in the selected direction if possible
            if (neighbors.length > direction) {
                const nextCell = neighbors[direction];
                
                // Only place obstacle if cell is valid
                if (!nextCell.hasObstacle && !nextCell.resourceType) {
                    nextCell.hasObstacle = true;
                    currentCell = nextCell;
                } else {
                    break; // Stop if we hit an existing obstacle
                }
            } else {
                break; // Stop if we're at the edge
            }
        }
    }
    
    createClusterFormation() {
        // Create a cluster of obstacles
        const clusterSize = 4 + Math.floor(Math.random() * 4); // 4-7 obstacles
        
        // Find a valid starting cell
        const validCells = this.hexGrid.cells.filter(cell => 
            !cell.hasObstacle && 
            !cell.resourceType && 
            Math.abs(cell.controlLevel) < 0.1);
            
        if (validCells.length === 0) return;
        
        const startCell = validCells[Math.floor(Math.random() * validCells.length)];
        startCell.hasObstacle = true;
        
        // Keep track of cluster cells and potential expansion cells
        const clusterCells = [startCell];
        let expansionCandidates = this.hexGrid.getNeighbors(startCell)
            .filter(cell => !cell.hasObstacle && !cell.resourceType);
        
        // Grow the cluster
        for (let i = 1; i < clusterSize && expansionCandidates.length > 0; i++) {
            // Choose a random expansion cell
            const index = Math.floor(Math.random() * expansionCandidates.length);
            const newCell = expansionCandidates[index];
            
            // Add to cluster
            newCell.hasObstacle = true;
            clusterCells.push(newCell);
            
            // Update expansion candidates
            expansionCandidates = [];
            for (const cell of clusterCells) {
                const neighbors = this.hexGrid.getNeighbors(cell);
                for (const neighbor of neighbors) {
                    // Only include cells that aren't already obstacles or in candidates
                    if (!neighbor.hasObstacle && 
                        !neighbor.resourceType && 
                        !clusterCells.includes(neighbor) && 
                        !expansionCandidates.includes(neighbor)) {
                        expansionCandidates.push(neighbor);
                    }
                }
            }
        }
    }
}