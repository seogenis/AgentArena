/**
 * Represents a hexagonal grid system for the game world
 */
export class HexGrid {
    constructor(width, height, hexSize) {
        this.width = width;
        this.height = height;
        this.hexSize = hexSize || 50; // Default size of hexagons
        this.hexHeight = this.hexSize * 2;
        this.hexWidth = Math.sqrt(3) * this.hexSize;
        this.verticalSpacing = this.hexHeight * 0.75;
        this.horizontalSpacing = this.hexWidth;
        
        // Calculate number of rows and columns that fit in the game area
        this.rows = Math.ceil(height / this.verticalSpacing) + 1;
        this.columns = Math.ceil(width / this.horizontalSpacing) + 1;

        // Initialize grid cells
        this.cells = [];
        this.initializeGrid();
    }

    /**
     * Initialize the grid cells
     */
    initializeGrid() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                // Calculate position of the hex cell
                const x = col * this.horizontalSpacing + (row % 2) * (this.horizontalSpacing / 2);
                const y = row * this.verticalSpacing;
                
                // Create a new hex cell
                const cell = {
                    row,
                    col,
                    x,
                    y,
                    controlState: 0, // 0 means neutral
                    resourceType: null,
                    hasObstacle: false
                };
                
                this.cells.push(cell);
            }
        }
    }

    /**
     * Get a specific cell by row and column
     */
    getCell(row, col) {
        return this.cells.find(cell => cell.row === row && cell.col === col);
    }

    /**
     * Get all cells
     */
    getAllCells() {
        return this.cells;
    }

    /**
     * Get cell at world coordinates
     */
    getCellAtPosition(x, y) {
        // This is an approximate algorithm to find the closest cell
        const approxRow = Math.floor(y / this.verticalSpacing);
        const isOffsetRow = approxRow % 2 === 1;
        const approxCol = Math.floor(x / this.horizontalSpacing - (isOffsetRow ? 0.5 : 0));
        
        // Get potential candidate cells
        const candidates = this.cells.filter(
            cell => Math.abs(cell.row - approxRow) <= 1 && Math.abs(cell.col - approxCol) <= 1
        );
        
        // Find the closest cell by distance
        let closestCell = null;
        let closestDistance = Infinity;
        
        for (const cell of candidates) {
            const dx = cell.x - x;
            const dy = cell.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestCell = cell;
            }
        }
        
        return closestCell;
    }

    /**
     * Update control state for a cell
     */
    updateCellControl(row, col, controlState) {
        const cell = this.getCell(row, col);
        if (cell) {
            cell.controlState = controlState;
        }
    }

    /**
     * Set resource for a cell
     */
    setCellResource(row, col, resourceType) {
        const cell = this.getCell(row, col);
        if (cell) {
            cell.resourceType = resourceType;
        }
    }

    /**
     * Set obstacle for a cell
     */
    setCellObstacle(row, col, hasObstacle) {
        const cell = this.getCell(row, col);
        if (cell) {
            cell.hasObstacle = hasObstacle;
        }
    }

    /**
     * Render the hexagonal grid
     */
    render(ctx) {
        for (const cell of this.cells) {
            this.renderHexCell(ctx, cell);
        }
    }

    /**
     * Render a single hexagonal cell
     */
    renderHexCell(ctx, cell) {
        const { x, y, controlState, resourceType, hasObstacle } = cell;
        
        // Draw hexagon outline
        ctx.beginPath();
        this.drawHexagonPath(ctx, x, y);
        
        // Fill based on control state (neutral, red team, blue team)
        if (controlState === 0) {
            ctx.fillStyle = 'rgba(100, 100, 100, 0.2)'; // Neutral
        } else if (controlState < 0) {
            // Red team with intensity based on the absolute value
            const intensity = Math.min(0.8, Math.abs(controlState) / 10);
            ctx.fillStyle = `rgba(255, 0, 0, ${intensity})`;
        } else {
            // Blue team with intensity based on the value
            const intensity = Math.min(0.8, controlState / 10);
            ctx.fillStyle = `rgba(0, 0, 255, ${intensity})`;
        }
        
        ctx.fill();
        
        // Draw hexagon border
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw resource if present
        if (resourceType) {
            this.renderResource(ctx, x, y, resourceType);
        }
        
        // Draw obstacle if present
        if (hasObstacle) {
            this.renderObstacle(ctx, x, y);
        }
    }

    /**
     * Draw hexagon path at given coordinates
     */
    drawHexagonPath(ctx, x, y) {
        const size = this.hexSize;
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = x + size * Math.cos(angle);
            const hy = y + size * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(hx, hy);
            } else {
                ctx.lineTo(hx, hy);
            }
        }
        ctx.closePath();
    }

    /**
     * Render resource at given coordinates
     */
    renderResource(ctx, x, y, resourceType) {
        const radius = this.hexSize * 0.3;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        // Different styles based on resource type
        switch(resourceType) {
            case 'energy':
                ctx.fillStyle = 'rgba(255, 255, 0, 0.7)'; // Yellow
                break;
            case 'materials':
                ctx.fillStyle = 'rgba(0, 255, 0, 0.7)'; // Green
                break;
            case 'data':
                ctx.fillStyle = 'rgba(0, 255, 255, 0.7)'; // Cyan
                break;
            default:
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // White (default)
        }
        
        ctx.fill();
        
        // Add a subtle glow effect
        const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 1.5);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Render obstacle at given coordinates
     */
    renderObstacle(ctx, x, y) {
        const size = this.hexSize * 0.6;
        
        ctx.fillStyle = 'rgba(100, 50, 50, 0.8)';
        ctx.beginPath();
        this.drawHexagonPath(ctx, x, y);
        ctx.fill();
        
        // Add cross pattern for obstacles
        ctx.strokeStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - size / 2, y - size / 2);
        ctx.lineTo(x + size / 2, y + size / 2);
        ctx.moveTo(x + size / 2, y - size / 2);
        ctx.lineTo(x - size / 2, y + size / 2);
        ctx.stroke();
    }
}