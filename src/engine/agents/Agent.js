import { Circle } from '../shapes/Circle.js';

export class Agent {
    constructor(id, x, y, teamId, type = 'collector') {
        this.id = id;
        this.x = x;
        this.y = y;
        this.teamId = teamId;
        this.type = type; // 'collector' or 'explorer'
        
        // Movement parameters
        this.speed = type === 'collector' ? 
            60 + Math.random() * 30 : // Collector: slower
            100 + Math.random() * 50; // Explorer: faster
        this.targetX = null;
        this.targetY = null;
        this.waypoints = [];
        this.waypointIndex = 0;
        
        // Agent stats
        this.health = 100;
        this.attackPower = type === 'collector' ? 5 : 15;
        this.defense = type === 'collector' ? 10 : 5;
        this.visionRange = type === 'collector' ? 120 : 180;
        
        // Resource carrying
        this.capacity = type === 'collector' ? 5 : 2;
        this.resourceType = null;
        this.resourceAmount = 0;
        
        // Visual properties
        this.baseRadius = type === 'collector' ? 14 : 10;
        this.radius = this.baseRadius;
        this.color = this.teamId === 1 ? '#ff3333' : '#3333ff'; // Base team color
        this.outlineColor = '#ffffff';
        
        // Shape varies by type
        this.shape = type; // 'collector' (circle) or 'explorer' (triangle-like)
        
        this.zIndex = 5;
        this.isVisible = true;
        
        // Movement patterns - different for each type
        if (type === 'collector') {
            this.movementPatterns = [
                this.patrolPattern.bind(this),
                this.resourcePattern.bind(this)
            ];
        } else { // explorer
            this.movementPatterns = [
                this.circlePattern.bind(this),
                this.resourcePattern.bind(this),
                this.explorationPattern.bind(this)
            ];
        }
        
        this.currentPattern = Math.floor(Math.random() * this.movementPatterns.length);
        this.patternUpdateTime = 0;
        this.patternDuration = type === 'collector' ? 
            15 + Math.random() * 10 : // Collectors stay on task longer
            8 + Math.random() * 7;    // Explorers change more frequently
        
        // Set up initial waypoints based on pattern
        this.setupPattern();
    }
    
    setupPattern() {
        // Clear current waypoints
        this.waypoints = [];
        this.waypointIndex = 0;
        
        // Select and initialize a movement pattern
        this.movementPatterns[this.currentPattern]();
    }
    
    patrolPattern() {
        // Create a back-and-forth patrol pattern
        const baseX = this.x;
        const baseY = this.y;
        const patrolDistance = 100 + Math.random() * 100;
        
        // Random patrol angle
        const angle = Math.random() * Math.PI * 2;
        const endX = baseX + Math.cos(angle) * patrolDistance;
        const endY = baseY + Math.sin(angle) * patrolDistance;
        
        // Add waypoints
        this.waypoints = [
            { x: baseX, y: baseY },
            { x: endX, y: endY }
        ];
    }
    
    circlePattern() {
        // Create a circular pattern around a point
        const centerX = this.x + (Math.random() * 100 - 50);
        const centerY = this.y + (Math.random() * 100 - 50);
        const radius = 50 + Math.random() * 50;
        const segments = 8; // Number of points in the circle
        
        // Create waypoints in a circle
        this.waypoints = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            this.waypoints.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }
    }
    
    resourcePattern() {
        // Empty pattern - will be replaced with actual resource seeking behavior
        // For now, just move randomly
        const directions = 5; // Number of random movements
        
        this.waypoints = [{ x: this.x, y: this.y }];
        let lastX = this.x;
        let lastY = this.y;
        
        for (let i = 0; i < directions; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 70 + Math.random() * 80;
            
            lastX += Math.cos(angle) * distance;
            lastY += Math.sin(angle) * distance;
            
            this.waypoints.push({ x: lastX, y: lastY });
        }
    }
    
    explorationPattern() {
        // Explorer-specific pattern that covers more territory
        // Creates a longer, more wide-ranging path
        const directions = 8; // More waypoints for explorers
        const range = 200; // Longer range
        
        this.waypoints = [{ x: this.x, y: this.y }];
        let lastX = this.x;
        let lastY = this.y;
        
        // Create a more directed exploration path
        const mainDirection = Math.random() * Math.PI * 2;
        
        for (let i = 0; i < directions; i++) {
            // Bias movement towards the main direction with some randomness
            const angleVariation = (Math.random() - 0.5) * Math.PI / 2; // +/- 45 degrees
            const angle = mainDirection + angleVariation;
            const distance = 100 + Math.random() * 150;
            
            lastX += Math.cos(angle) * distance;
            lastY += Math.sin(angle) * distance;
            
            this.waypoints.push({ x: lastX, y: lastY });
        }
    }
    
    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        
        // Clear waypoints - direct targeting overrides patterns
        this.waypoints = [];
        this.waypoints.push({ x, y });
        this.waypointIndex = 0;
    }
    
    clearTarget() {
        this.targetX = null;
        this.targetY = null;
    }
    
    update(deltaTime, hexGrid) {
        // Update agent movement and behavior
        this.updateMovement(deltaTime, hexGrid);
        
        // Update pattern if needed
        this.patternUpdateTime += deltaTime;
        if (this.patternUpdateTime >= this.patternDuration) {
            this.patternUpdateTime = 0;
            this.currentPattern = (this.currentPattern + 1) % this.movementPatterns.length;
            this.setupPattern();
        }
    }
    
    updateMovement(deltaTime, hexGrid) {
        // If no waypoints, stay still
        if (this.waypoints.length === 0) return;
        
        // Get current waypoint
        const waypoint = this.waypoints[this.waypointIndex];
        if (!waypoint) return;
        
        // Calculate distance to waypoint
        const dx = waypoint.x - this.x;
        const dy = waypoint.y - this.y;
        const distanceToWaypoint = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate movement for this frame
        const moveDistance = this.speed * deltaTime;
        
        // Check if we've reached the waypoint
        if (distanceToWaypoint <= moveDistance) {
            // Arrive at waypoint
            this.x = waypoint.x;
            this.y = waypoint.y;
            
            // Move to next waypoint or loop back
            this.waypointIndex++;
            if (this.waypointIndex >= this.waypoints.length) {
                // For patrol, reverse the waypoints
                if (this.currentPattern === 0) {
                    this.waypoints.reverse();
                    this.waypointIndex = 0;
                } else {
                    // For other patterns, restart from beginning
                    this.waypointIndex = 0;
                }
            }
        } else {
            // Move toward waypoint
            const moveRatio = moveDistance / distanceToWaypoint;
            const newX = this.x + dx * moveRatio;
            const newY = this.y + dy * moveRatio;
            
            // Check for collision with obstacles before moving
            if (this.canMoveTo(newX, newY, hexGrid)) {
                this.x = newX;
                this.y = newY;
            } else {
                // Obstacle detected, get a new pattern
                this.patternUpdateTime = this.patternDuration; // Force pattern update
                this.setupPattern();
            }
        }
    }
    
    canMoveTo(x, y, hexGrid) {
        // Check if the target position has an obstacle
        const cell = hexGrid.getCellAtPosition(x, y);
        return cell && !cell.hasObstacle;
    }
    
    updateVisuals() {
        // Update visual representation based on carrying resources
        if (this.resourceAmount > 0) {
            this.radius = this.baseRadius * 1.3; // Bigger when carrying resources
        } else {
            this.radius = this.baseRadius;
        }
    }
    
    render(ctx) {
        if (this.type === 'collector') {
            this.renderCollector(ctx);
        } else {
            this.renderExplorer(ctx);
        }
        
        // If carrying resources, draw resource indicator
        if (this.resourceAmount > 0) {
            const resourceColors = {
                energy: '#ffcc00', // Yellow
                materials: '#00cc66', // Green
                data: '#cc66ff' // Purple
            };
            
            const resourceColor = resourceColors[this.resourceType] || '#ffffff';
            
            // Draw resource in center
            ctx.fillStyle = resourceColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderCollector(ctx) {
        // Draw the collector agent (larger circle)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw outline
        ctx.strokeStyle = this.outlineColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw team indicator (inner circle)
        ctx.fillStyle = this.teamId === 1 ? '#cc0000' : '#0000cc';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderExplorer(ctx) {
        // Draw the explorer agent (triangle-like shape)
        const angle = Math.atan2(
            this.waypoints.length > this.waypointIndex ? 
                this.waypoints[this.waypointIndex].y - this.y : 0,
            this.waypoints.length > this.waypointIndex ? 
                this.waypoints[this.waypointIndex].x - this.x : 1
        );
        
        // Calculate triangle points (pointing in direction of movement)
        const p1 = {
            x: this.x + Math.cos(angle) * this.radius * 1.2,
            y: this.y + Math.sin(angle) * this.radius * 1.2
        };
        const p2 = {
            x: this.x + Math.cos(angle + 2.5) * this.radius,
            y: this.y + Math.sin(angle + 2.5) * this.radius
        };
        const p3 = {
            x: this.x + Math.cos(angle - 2.5) * this.radius,
            y: this.y + Math.sin(angle - 2.5) * this.radius
        };
        
        // Draw the triangle body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();
        
        // Draw outline
        ctx.strokeStyle = this.outlineColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw team indicator (inner shape)
        const centerX = (p1.x + p2.x + p3.x) / 3;
        const centerY = (p1.y + p2.y + p3.y) / 3;
        
        ctx.fillStyle = this.teamId === 1 ? '#cc0000' : '#0000cc';
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
}