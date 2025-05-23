export class ResourceSystem {
    constructor(hexGrid) {
        this.hexGrid = hexGrid;
        this.resourceTypes = ['energy', 'materials', 'data'];
        this.spawnInterval = 5000; // milliseconds between spawn waves
        this.lastSpawnTime = 0;
        this.resourcesPerSpawn = 5; // Number of resources to spawn each interval
        this.maxResourceAmount = 5; // Maximum resource amount per cell
    }
    
    update(deltaTime, timestamp) {
        // Check if it's time to spawn new resources
        if (timestamp - this.lastSpawnTime >= this.spawnInterval) {
            this.spawnResources();
            this.lastSpawnTime = timestamp;
        }
    }
    
    spawnResources() {
        // Spawn a random selection of resources
        for (let i = 0; i < this.resourcesPerSpawn; i++) {
            this.spawnSingleResource();
        }
    }
    
    spawnSingleResource() {
        // Choose a random empty cell (no obstacle, no existing resource)
        const emptyCells = this.hexGrid.cells.filter(cell => 
            !cell.hasObstacle && !cell.resourceType);
            
        if (emptyCells.length === 0) return; // No empty cells available
        
        const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        // Choose a random resource type
        const resourceType = this.resourceTypes[
            Math.floor(Math.random() * this.resourceTypes.length)
        ];
        
        // Random resource amount (1-5)
        const resourceAmount = 1 + Math.floor(Math.random() * this.maxResourceAmount);
        
        // Assign to cell
        cell.resourceType = resourceType;
        cell.resourceAmount = resourceAmount;
    }
    
    // Spawn resources specifically in contested areas (more likely near borders)
    spawnResourcesNearBorders() {
        // Find cells that are near territory borders (mixed control in neighborhood)
        const borderCells = this.hexGrid.cells.filter(cell => {
            if (cell.hasObstacle || cell.resourceType) return false;
            
            const neighbors = this.hexGrid.getNeighbors(cell);
            const hasRedControl = neighbors.some(n => n.controlLevel < -0.2);
            const hasBlueControl = neighbors.some(n => n.controlLevel > 0.2);
            
            return hasRedControl && hasBlueControl;
        });
        
        if (borderCells.length === 0) {
            // If no border cells, use regular spawn
            this.spawnSingleResource();
            return;
        }
        
        // Choose random border cell with 70% probability, or any cell with 30% probability
        const useRandomCell = Math.random() < 0.3;
        let cell;
        
        if (useRandomCell || borderCells.length === 0) {
            const emptyCells = this.hexGrid.cells.filter(cell => 
                !cell.hasObstacle && !cell.resourceType);
            if (emptyCells.length === 0) return;
            cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        } else {
            cell = borderCells[Math.floor(Math.random() * borderCells.length)];
        }
        
        // Choose a random resource type
        const resourceType = this.resourceTypes[
            Math.floor(Math.random() * this.resourceTypes.length)
        ];
        
        // Higher resource amount for contested areas (2-5)
        const resourceAmount = 2 + Math.floor(Math.random() * (this.maxResourceAmount - 1));
        
        // Assign to cell
        cell.resourceType = resourceType;
        cell.resourceAmount = resourceAmount;
    }
    
    // Initial resource spawning for game start
    initialResourceSpawn(count = 20) {
        for (let i = 0; i < count; i++) {
            this.spawnSingleResource();
        }
    }
    
    // Remove a resource (when collected)
    removeResource(cell) {
        if (cell.resourceType && cell.resourceAmount > 0) {
            cell.resourceAmount--;
            
            // If depleted, remove resource type
            if (cell.resourceAmount <= 0) {
                cell.resourceType = null;
                cell.resourceAmount = 0;
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * Get counts of all resource types on the map
     * @returns {Object} Counts of each resource type
     */
    getResourceCounts() {
        const counts = {
            energy: 0,
            materials: 0,
            data: 0,
            total: 0
        };
        
        // Count resources in all cells
        for (const cell of this.hexGrid.cells) {
            if (cell.resourceType && cell.resourceAmount > 0) {
                counts[cell.resourceType] += cell.resourceAmount;
                counts.total += cell.resourceAmount;
            }
        }
        
        return counts;
    }
    
    /**
     * Get locations of resource hotspots for strategic planning
     * @param {number} minResourceAmount - Minimum amount to consider a hotspot
     * @returns {Array} Array of resource hotspot locations and types
     */
    getResourceHotspots(minResourceAmount = 3) {
        const hotspots = [];
        
        for (const cell of this.hexGrid.cells) {
            if (cell.resourceType && cell.resourceAmount >= minResourceAmount) {
                hotspots.push({
                    x: cell.x,
                    y: cell.y,
                    type: cell.resourceType,
                    amount: cell.resourceAmount
                });
            }
        }
        
        return hotspots;
    }
}