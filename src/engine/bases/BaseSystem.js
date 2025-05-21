import { Rectangle } from '../shapes/Rectangle.js';

export class BaseSystem {
    constructor(hexGrid) {
        this.hexGrid = hexGrid;
        this.bases = [];
        this.resourceCounts = {
            1: { energy: 0, materials: 0, data: 0 }, // Team 1 (Red)
            2: { energy: 0, materials: 0, data: 0 }  // Team 2 (Blue)
        };
    }

    initialize() {
        // Create bases at opposite corners
        const gridWidth = this.hexGrid.width;
        const gridHeight = this.hexGrid.height;
        
        // Position bases at 10% from corners
        const margin = Math.min(gridWidth, gridHeight) * 0.1;
        
        // Create Red team base (Team 1) - bottom left
        this.createBase(
            margin,
            gridHeight - margin,
            1,
            '#FF3030',
            '#FF8080'
        );
        
        // Create Blue team base (Team 2) - top right
        this.createBase(
            gridWidth - margin,
            margin,
            2,
            '#3030FF',
            '#8080FF'
        );

        // Mark territory near bases
        this.markInitialTerritory();
    }

    createBase(x, y, team, primaryColor, secondaryColor) {
        const baseSize = this.hexGrid.hexSize * 3; // Base size relative to hex grid
        
        const base = {
            x,
            y,
            team,
            size: baseSize,
            primaryColor,
            secondaryColor,
            pulsePhase: 0,
            render: function(ctx) {
                // Draw outer circle
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.primaryColor;
                ctx.fill();
                
                // Draw inner hexagon
                const innerSize = this.size * 0.7;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = Math.PI / 3 * i;
                    const px = this.x + Math.cos(angle) * innerSize;
                    const py = this.y + Math.sin(angle) * innerSize;
                    
                    if (i === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();
                ctx.fillStyle = this.secondaryColor;
                ctx.fill();
                
                // Draw team indicator
                ctx.font = `${this.size / 2}px Arial`;
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.team === 1 ? 'R' : 'B', this.x, this.y);
                
                // Draw resource counts if available
                if (this.resourceCounts) {
                    ctx.font = `${this.size / 5}px Arial`;
                    ctx.fillText(
                        `E:${this.resourceCounts.energy} M:${this.resourceCounts.materials} D:${this.resourceCounts.data}`, 
                        this.x, 
                        this.y + this.size * 0.5
                    );
                }
            },
            update: function(deltaTime) {
                // Add pulsing effect
                this.pulsePhase += deltaTime;
                if (this.pulsePhase > Math.PI * 2) {
                    this.pulsePhase -= Math.PI * 2;
                }
            }
        };
        
        this.bases.push(base);
        return base;
    }

    markInitialTerritory() {
        // Mark territory around bases
        for (const base of this.bases) {
            const radius = this.hexGrid.hexSize * 5; // Control radius around base
            
            // Find all cells within radius of base
            for (const cell of this.hexGrid.cells) {
                const dx = cell.x - base.x;
                const dy = cell.y - base.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < radius) {
                    // Set control based on distance from base (stronger closer to base)
                    const controlStrength = 1 - (distance / radius);
                    
                    // Team 1 is negative values, Team 2 is positive
                    const controlModifier = base.team === 1 ? -controlStrength : controlStrength;
                    
                    // Stronger control closer to base
                    if (!cell.hasObstacle) {
                        cell.controlLevel = controlModifier;
                    }
                }
            }
        }
    }

    depositResources(team, resources) {
        // Add resources to team's stockpile
        for (const [resourceType, amount] of Object.entries(resources)) {
            if (this.resourceCounts[team][resourceType] !== undefined) {
                this.resourceCounts[team][resourceType] += amount;
            }
        }
        
        // Update base UI with new resource counts
        this.updateBaseResourceCounts();
    }

    updateBaseResourceCounts() {
        // Update base UI with current resource counts
        for (const base of this.bases) {
            base.resourceCounts = this.resourceCounts[base.team];
        }
    }

    getBaseForTeam(team) {
        return this.bases.find(base => base.team === team);
    }

    getResourceCounts(team) {
        return this.resourceCounts[team];
    }

    update(deltaTime) {
        // Update bases
        for (const base of this.bases) {
            if (base.update) {
                base.update(deltaTime);
            }
        }
    }

    render(ctx) {
        // Render bases
        for (const base of this.bases) {
            base.render(ctx);
        }
    }
}