export class CollisionSystem {
    constructor(hexGrid) {
        this.hexGrid = hexGrid;
    }
    
    // Check if a point is inside an obstacle
    isCollidingWithObstacle(x, y) {
        const cell = this.hexGrid.getCellAtPosition(x, y);
        return cell && cell.hasObstacle;
    }
    
    // Check if a moving point would collide with an obstacle
    checkMovementCollision(startX, startY, endX, endY, radius = 0) {
        // Simple version: just check the endpoint
        return this.isCollidingWithObstacle(endX, endY);
        
        // More advanced version would check points along the path
        // This simplified version is sufficient for our current needs
    }
    
    // Check if two circles are colliding
    checkCircleCollision(x1, y1, r1, x2, y2, r2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (r1 + r2);
    }
    
    // Constrain a position to avoid obstacles
    constrainPosition(x, y, radius, hexGrid) {
        // Get the cell at current position
        const cell = hexGrid.getCellAtPosition(x, y);
        
        // If no cell or no obstacle, return original position
        if (!cell || !cell.hasObstacle) {
            return { x, y };
        }
        
        // Cell has obstacle - find nearest non-obstacle cell
        const neighbors = hexGrid.getNeighbors(cell);
        const validNeighbors = neighbors.filter(n => !n.hasObstacle);
        
        if (validNeighbors.length === 0) {
            // No valid neighbors, try to use further cells
            // This is a fallback and shouldn't happen often
            return { x, y }; // Return original for now
        }
        
        // Find the nearest valid neighbor
        let nearestNeighbor = validNeighbors[0];
        let minDistance = this.distanceSquared(x, y, nearestNeighbor.x, nearestNeighbor.y);
        
        for (let i = 1; i < validNeighbors.length; i++) {
            const neighbor = validNeighbors[i];
            const distance = this.distanceSquared(x, y, neighbor.x, neighbor.y);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestNeighbor = neighbor;
            }
        }
        
        return {
            x: nearestNeighbor.x,
            y: nearestNeighbor.y
        };
    }
    
    distanceSquared(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }
}