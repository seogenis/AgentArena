import { HexGrid } from './HexGrid.js';
import { ResourceSystem } from './ResourceSystem.js';
import { ObstacleSystem } from './ObstacleSystem.js';

/**
 * Manages the game world, combining grid, resources, and obstacles
 */
export class GameWorld {
    constructor(width, height, hexSize) {
        this.width = width;
        this.height = height;
        this.hexSize = hexSize || 40; // Default hex size
        
        // Initialize the systems
        this.hexGrid = new HexGrid(width, height, this.hexSize);
        this.resourceSystem = new ResourceSystem(this.hexGrid);
        this.obstacleSystem = new ObstacleSystem(this.hexGrid);
        
        // Initialize world
        this.initialize();
    }

    /**
     * Initialize the game world
     */
    initialize() {
        // Generate obstacles
        this.obstacleSystem.generateObstacles(20, 'cluster');
        
        // Initialize resources
        this.resourceSystem.initialize(15);
    }

    /**
     * Update the game world
     */
    update(deltaTime) {
        // Update resources (e.g., for spawning new ones)
        this.resourceSystem.update(deltaTime);
    }

    /**
     * Render the game world
     */
    render(ctx) {
        // Render the hex grid (which will also render resources and obstacles)
        this.hexGrid.render(ctx);
    }

    /**
     * Get a cell at the specified world position
     */
    getCellAtPosition(x, y) {
        return this.hexGrid.getCellAtPosition(x, y);
    }

    /**
     * Collect a resource at the specified position
     */
    collectResource(x, y) {
        return this.resourceSystem.collectResource(x, y);
    }

    /**
     * Update control state of a cell
     */
    updateCellControl(row, col, controlValue) {
        this.hexGrid.updateCellControl(row, col, controlValue);
    }

    /**
     * Reset the world (for debugging or restarts)
     */
    reset() {
        this.resourceSystem.clearResources();
        this.obstacleSystem.clearObstacles();
        
        // Re-initialize
        this.initialize();
    }

    /**
     * Test different obstacle patterns (for debugging)
     */
    testObstaclePattern(pattern) {
        this.obstacleSystem.generateObstacles(20, pattern);
    }
}