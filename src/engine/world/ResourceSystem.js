/**
 * Manages resources in the game world
 */
export class ResourceSystem {
    constructor(hexGrid) {
        this.hexGrid = hexGrid;
        this.resourceTypes = ['energy', 'materials', 'data'];
        this.resources = [];
        
        // Resource spawning settings
        this.spawnInterval = 5; // Seconds between spawns
        this.maxResources = 30; // Maximum resources on map
        this.spawnTimer = 0;
        
        // Resource distribution weights
        this.distribution = {
            energy: 0.5,    // 50% chance for energy
            materials: 0.3, // 30% chance for materials
            data: 0.2       // 20% chance for data
        };
    }

    /**
     * Update resource system
     */
    update(deltaTime) {
        // Update spawn timer
        this.spawnTimer += deltaTime;
        
        // Check if it's time to spawn resources
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnResources();
        }
    }

    /**
     * Spawn new resources on the map
     */
    spawnResources() {
        // Only spawn if below maximum
        if (this.countActiveResources() >= this.maxResources) {
            return;
        }
        
        // Get all cells without resources or obstacles
        const availableCells = this.hexGrid.getAllCells().filter(
            cell => !cell.resourceType && !cell.hasObstacle
        );
        
        if (availableCells.length === 0) {
            return;
        }
        
        // Choose a random cell
        const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
        
        // Choose resource type based on distribution
        const resourceType = this.selectResourceType();
        
        // Set the resource in the cell
        this.hexGrid.setCellResource(randomCell.row, randomCell.col, resourceType);
    }

    /**
     * Select a resource type based on distribution
     */
    selectResourceType() {
        const roll = Math.random();
        
        if (roll < this.distribution.energy) {
            return 'energy';
        } else if (roll < this.distribution.energy + this.distribution.materials) {
            return 'materials';
        } else {
            return 'data';
        }
    }

    /**
     * Count active resources on the map
     */
    countActiveResources() {
        return this.hexGrid.getAllCells().filter(cell => cell.resourceType).length;
    }

    /**
     * Collect a resource at given position
     * Returns the resource type if collected, null otherwise
     */
    collectResource(x, y) {
        const cell = this.hexGrid.getCellAtPosition(x, y);
        
        if (cell && cell.resourceType) {
            const resourceType = cell.resourceType;
            this.hexGrid.setCellResource(cell.row, cell.col, null);
            return resourceType;
        }
        
        return null;
    }

    /**
     * Clear all resources
     */
    clearResources() {
        for (const cell of this.hexGrid.getAllCells()) {
            cell.resourceType = null;
        }
    }

    /**
     * Initialize resources - spawn initial set
     */
    initialize(initialCount = 10) {
        // Clear any existing resources
        this.clearResources();
        
        // Spawn initial resources
        for (let i = 0; i < initialCount; i++) {
            this.spawnResources();
        }
    }
}