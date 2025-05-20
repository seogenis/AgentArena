/**
 * Manages obstacles in the game world
 */
export class ObstacleSystem {
    constructor(hexGrid) {
        this.hexGrid = hexGrid;
    }

    /**
     * Generate obstacles randomly on the map
     */
    generateObstacles(count = 15, pattern = 'random') {
        // Clear any existing obstacles
        this.clearObstacles();
        
        switch (pattern) {
            case 'random':
                this.generateRandomObstacles(count);
                break;
            case 'cluster':
                this.generateClusteredObstacles(count);
                break;
            case 'line':
                this.generateLineObstacles();
                break;
            default:
                this.generateRandomObstacles(count);
        }
    }

    /**
     * Generate random obstacles
     */
    generateRandomObstacles(count) {
        const availableCells = this.hexGrid.getAllCells().filter(
            cell => !cell.resourceType && !cell.hasObstacle
        );
        
        // Shuffle and pick the first 'count' cells
        const shuffledCells = this.shuffleArray([...availableCells]);
        const obstacleCells = shuffledCells.slice(0, Math.min(count, shuffledCells.length));
        
        // Set obstacles
        for (const cell of obstacleCells) {
            this.hexGrid.setCellObstacle(cell.row, cell.col, true);
        }
    }

    /**
     * Generate clustered obstacles
     */
    generateClusteredObstacles(count) {
        // Choose random cluster centers
        const clusterCount = Math.ceil(count / 5); // Approximately 5 obstacles per cluster
        const availableCells = this.hexGrid.getAllCells();
        const shuffledCells = this.shuffleArray([...availableCells]);
        const clusterCenters = shuffledCells.slice(0, clusterCount);
        
        let obstaclesPlaced = 0;
        
        // For each cluster center, place obstacles around it
        for (const center of clusterCenters) {
            if (obstaclesPlaced >= count) break;
            
            // Place an obstacle at the center
            this.hexGrid.setCellObstacle(center.row, center.col, true);
            obstaclesPlaced++;
            
            // Find neighboring cells
            const neighbors = this.findNeighborCells(center);
            
            for (const neighbor of neighbors) {
                if (obstaclesPlaced >= count) break;
                
                // 70% chance to place obstacle in adjacent cell
                if (Math.random() < 0.7 && !neighbor.hasObstacle && !neighbor.resourceType) {
                    this.hexGrid.setCellObstacle(neighbor.row, neighbor.col, true);
                    obstaclesPlaced++;
                }
            }
        }
    }

    /**
     * Generate line of obstacles (e.g., a wall in the middle)
     */
    generateLineObstacles() {
        const middleRow = Math.floor(this.hexGrid.rows / 2);
        
        // Create a line of obstacles with some gaps
        for (let col = 0; col < this.hexGrid.columns; col++) {
            const cell = this.hexGrid.getCell(middleRow, col);
            
            if (cell && Math.random() < 0.7) { // 70% chance to place obstacle (creates gaps)
                this.hexGrid.setCellObstacle(cell.row, cell.col, true);
            }
        }
    }

    /**
     * Find neighboring cells for a given cell
     */
    findNeighborCells(cell) {
        const neighbors = [];
        const { row, col } = cell;
        
        // The neighbors depend on whether the row is even or odd
        const isEvenRow = row % 2 === 0;
        
        // Neighbor directions for even and odd rows
        const directions = isEvenRow
            ? [
                [-1, -1], [-1, 0], [0, 1],
                [1, -1], [1, 0], [0, -1]
              ]
            : [
                [-1, 0], [-1, 1], [0, 1],
                [1, 0], [1, 1], [0, -1]
              ];
        
        for (const [rowOffset, colOffset] of directions) {
            const neighborRow = row + rowOffset;
            const neighborCol = col + colOffset;
            
            if (neighborRow >= 0 && neighborRow < this.hexGrid.rows &&
                neighborCol >= 0 && neighborCol < this.hexGrid.columns) {
                const neighborCell = this.hexGrid.getCell(neighborRow, neighborCol);
                if (neighborCell) {
                    neighbors.push(neighborCell);
                }
            }
        }
        
        return neighbors;
    }

    /**
     * Clear all obstacles
     */
    clearObstacles() {
        for (const cell of this.hexGrid.getAllCells()) {
            cell.hasObstacle = false;
        }
    }

    /**
     * Helper to shuffle an array
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}