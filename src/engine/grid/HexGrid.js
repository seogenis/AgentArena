export class HexGrid {
    constructor(width, height, hexSize = 40) {
        this.width = width;
        this.height = height;
        this.hexSize = hexSize;
        this.hexHeight = Math.sqrt(3) * hexSize;
        this.hexWidth = 2 * hexSize;
        this.horizontalSpacing = this.hexWidth * 0.75;
        this.verticalSpacing = this.hexHeight;
        
        this.cells = [];
        this.generateGrid();
    }
    
    generateGrid() {
        // Calculate how many hexes fit in the game area with some overflow
        const cols = Math.ceil(this.width / this.horizontalSpacing) + 2;
        const rows = Math.ceil(this.height / this.verticalSpacing) + 2;
        
        // Generate the grid
        for (let row = -1; row < rows + 1; row++) {
            for (let col = -1; col < cols + 1; col++) {
                // Calculate hex center position (with offset for even rows)
                const x = col * this.horizontalSpacing + (row % 2 === 0 ? 0 : this.horizontalSpacing / 2);
                const y = row * this.verticalSpacing;
                
                // Create hex cell with default properties
                const cell = {
                    col,
                    row,
                    x,
                    y,
                    controlLevel: 0, // -1.0 to 1.0 (negative is team 1, positive is team 2)
                    resourceType: null,
                    resourceAmount: 0,
                    hasObstacle: false,
                    vertices: this.calculateHexVertices(x, y)
                };
                
                this.cells.push(cell);
            }
        }
    }
    
    calculateHexVertices(centerX, centerY) {
        const vertices = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = centerX + this.hexSize * Math.cos(angle);
            const y = centerY + this.hexSize * Math.sin(angle);
            vertices.push({ x, y });
        }
        return vertices;
    }
    
    render(ctx) {
        // Render each hex cell
        for (const cell of this.cells) {
            this.renderCell(ctx, cell);
        }
    }
    
    renderCell(ctx, cell) {
        // Draw territory control indicator (if any)
        if (cell.controlLevel !== 0) {
            this.renderControlOverlay(ctx, cell);
        }
        
        // Draw hex outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        // Move to the first vertex
        ctx.moveTo(cell.vertices[0].x, cell.vertices[0].y);
        // Connect to each vertex
        for (let i = 1; i < 6; i++) {
            ctx.lineTo(cell.vertices[i].x, cell.vertices[i].y);
        }
        // Close the path
        ctx.closePath();
        ctx.stroke();
        
        // Draw obstacle if exists
        if (cell.hasObstacle) {
            this.renderObstacle(ctx, cell);
        }
        
        // Draw resource if exists
        if (cell.resourceType && cell.resourceAmount > 0) {
            this.renderResource(ctx, cell);
        }
    }
    
    renderControlOverlay(ctx, cell) {
        const control = cell.controlLevel;
        const absControl = Math.abs(control);
        
        // Determine color based on control level
        let color, borderColor;
        if (control < 0) {
            // Team 1 (Red)
            const alpha = Math.min(absControl * 0.7, 0.7); // Max 70% opacity
            color = `rgba(255, 0, 0, ${alpha})`;
            borderColor = `rgba(200, 0, 0, ${alpha + 0.1})`;
        } else {
            // Team 2 (Blue)
            const alpha = Math.min(absControl * 0.7, 0.7); // Max 70% opacity
            color = `rgba(0, 0, 255, ${alpha})`;
            borderColor = `rgba(0, 0, 200, ${alpha + 0.1})`;
        }
        
        // Draw filled hex with team color
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(cell.vertices[0].x, cell.vertices[0].y);
        for (let i = 1; i < 6; i++) {
            ctx.lineTo(cell.vertices[i].x, cell.vertices[i].y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Add stronger border for highly controlled territories
        if (absControl > 0.7) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Add pulsing effect for recently captured territories (simulated by random)
            if (Math.random() < 0.05) {
                ctx.strokeStyle = control < 0 ? 'rgba(255, 100, 100, 0.6)' : 'rgba(100, 100, 255, 0.6)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
        
        // Add territory pattern for strong control (> 0.8)
        if (absControl > 0.8) {
            const pattern = control < 0 ? '×' : '⬢';
            ctx.fillStyle = control < 0 ? 'rgba(255, 200, 200, 0.4)' : 'rgba(200, 200, 255, 0.4)';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pattern, cell.x, cell.y);
        }
    }
    
    renderObstacle(ctx, cell) {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
        ctx.beginPath();
        ctx.moveTo(cell.vertices[0].x, cell.vertices[0].y);
        for (let i = 1; i < 6; i++) {
            ctx.lineTo(cell.vertices[i].x, cell.vertices[i].y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Add some texture to the obstacle
        ctx.strokeStyle = 'rgba(50, 50, 50, 0.6)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 3; i++) {
            const startX = cell.x - this.hexSize * 0.5 + Math.random() * this.hexSize;
            const startY = cell.y - this.hexSize * 0.5 + Math.random() * this.hexSize;
            const length = 5 + Math.random() * 10;
            const angle = Math.random() * Math.PI * 2;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(
                startX + Math.cos(angle) * length,
                startY + Math.sin(angle) * length
            );
            ctx.stroke();
        }
    }
    
    renderResource(ctx, cell) {
        const resourceColors = {
            energy: '#ffcc00', // Yellow
            materials: '#00cc66', // Green
            data: '#cc66ff' // Purple
        };
        
        const resourceColor = resourceColors[cell.resourceType] || '#ffffff';
        const size = Math.min(10, cell.resourceAmount * 2); // Scale size with amount, max 10px
        
        ctx.fillStyle = resourceColor;
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect for resources
        ctx.shadowColor = resourceColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
    }
    
    getCellAtPosition(x, y) {
        // Find the cell that contains the given position
        for (const cell of this.cells) {
            if (this.pointInHex(x, y, cell)) {
                return cell;
            }
        }
        return null;
    }
    
    pointInHex(x, y, cell) {
        // Check if a point is inside a hexagon
        // Implementation of ray casting algorithm
        let inside = false;
        const vertices = cell.vertices;
        
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x, yi = vertices[i].y;
            const xj = vertices[j].x, yj = vertices[j].y;
            
            const intersect = ((yi > y) !== (yj > y)) && 
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                
            if (intersect) inside = !inside;
        }
        
        return inside;
    }
    
    getNeighbors(cell) {
        // Get the 6 neighboring cells
        const neighbors = [];
        const directions = [
            { col: 1, row: 0 },  // right
            { col: 0, row: 1 },  // bottom right for even rows, bottom left for odd
            { col: -1, row: 0 }, // left
            { col: -1, row: -1 },// top left for even rows, top right for odd
            { col: 0, row: -1 }, // top right for even rows, top left for odd
            { col: 1, row: -1 }  // top right for odd rows, top left for even
        ];
        
        for (const dir of directions) {
            let neighborCol = cell.col + dir.col;
            let neighborRow = cell.row + dir.row;
            
            // Adjust for hex grid offset (even vs odd rows)
            if (cell.row % 2 === 1 && (dir.col === -1 && dir.row !== 0)) {
                neighborCol += 1;
            } else if (cell.row % 2 === 0 && (dir.col === 1 && dir.row !== 0)) {
                neighborCol -= 1;
            }
            
            // Find the matching cell
            const neighbor = this.cells.find(c => 
                c.col === neighborCol && c.row === neighborRow);
                
            if (neighbor) {
                neighbors.push(neighbor);
            }
        }
        
        return neighbors;
    }
    
    // Add some initial territory control for testing
    addInitialTerritoryControl() {
        // Set some random cells to be controlled by each team
        const cellCount = this.cells.length;
        const controlCellCount = Math.floor(cellCount * 0.1); // Control 10% of cells
        
        for (let i = 0; i < controlCellCount; i++) {
            const cell = this.cells[Math.floor(Math.random() * cellCount)];
            cell.controlLevel = Math.random() * 2 - 1; // Random value between -1 and 1
        }
    }
    
    // Add some initial obstacles for testing
    addRandomObstacles(count = 10) {
        // Set random cells to have obstacles
        for (let i = 0; i < count; i++) {
            const cell = this.cells[Math.floor(Math.random() * this.cells.length)];
            if (!cell.hasObstacle && !cell.resourceType) {
                cell.hasObstacle = true;
            } else {
                i--; // Try again if cell already has something
            }
        }
    }
}