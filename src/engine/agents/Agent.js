import { Circle } from '../shapes/Circle.js';
import { Rectangle } from '../shapes/Rectangle.js';

export class Agent {
    constructor(id, x, y, teamId, type = 'collector', attributes = null) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.teamId = teamId;
        this.type = type; // 'collector', 'explorer', 'defender', or 'attacker'
        this.role = type; // Alias for type to match LLM terminology
        
        // Resource priority
        this.resourcePriority = null; // Set by the LLM spawner
        
        // Description (set by LLM)
        this.description = '';
        
        // Get attribute values from LLM or use defaults
        const attrValues = this.calculateAttributes(attributes, type);
        
        // Movement parameters
        this.speed = 60 + (attrValues.speed * 100); // 60-160 range based on speed attribute
        this.targetX = null;
        this.targetY = null;
        this.waypoints = [];
        this.waypointIndex = 0;
        
        // Agent stats
        this.health = 50 + (attrValues.health * 100); // 50-150 range based on health attribute
        this.maxHealth = this.health;
        this.attackPower = 5 + (attrValues.attack * 20); // 5-25 range based on attack attribute
        this.defense = 2 + (attrValues.defense * 15); // 2-17 range based on defense attribute
        this.visionRange = 100 + (attrValues.speed * 100); // 100-200 range based on speed
        
        // Combat state
        this.isAttacking = false;
        this.target = null;
        this.attackCooldown = 0;
        this.attackCooldownMax = 1.5 - (attrValues.speed * 0.7); // 0.8-1.5s based on speed
        this.damageFlashTime = 0;
        this.isHealing = false;
        this.healCooldown = 0;
        
        // Resource carrying
        this.capacity = 2 + (attrValues.carryCapacity * 8); // 2-10 range based on carry capacity
        this.resourceType = null;
        this.resourceAmount = 0;
        
        // Visual properties
        this.baseRadius = 10 + (type === 'collector' ? 4 : 0) + (type === 'defender' ? 2 : 0);
        this.radius = this.baseRadius;
        this.color = this.teamId === 1 ? '#ff3333' : '#3333ff'; // Base team color
        this.outlineColor = '#ffffff';
        
        // Shape varies by type
        this.shape = type; 
        
        this.zIndex = 5;
        this.isVisible = true;
        
        // Movement patterns - different for each type
        this.setupMovementPatterns();
        
        this.currentPattern = Math.floor(Math.random() * this.movementPatterns.length);
        this.patternUpdateTime = 0;
        
        // Pattern duration varies by type
        this.patternDuration = this.getPatternDuration();
        
        // Set up initial waypoints based on pattern
        this.setupPattern();
    }
    
    calculateAttributes(attributes, type) {
        // If attributes provided by LLM, use those
        if (attributes) {
            return {
                speed: Math.min(1.0, Math.max(0.1, attributes.speed)),
                health: Math.min(1.0, Math.max(0.1, attributes.health)),
                attack: Math.min(1.0, Math.max(0.1, attributes.attack)),
                defense: Math.min(1.0, Math.max(0.1, attributes.defense)),
                carryCapacity: Math.min(1.0, Math.max(0.1, attributes.carryCapacity))
            };
        }
        
        // Otherwise use defaults based on type
        const defaults = {
            collector: {
                speed: 0.4,
                health: 0.5,
                attack: 0.2,
                defense: 0.5,
                carryCapacity: 0.8
            },
            explorer: {
                speed: 0.8,
                health: 0.4,
                attack: 0.4,
                defense: 0.3,
                carryCapacity: 0.3
            },
            defender: {
                speed: 0.3,
                health: 0.9,
                attack: 0.6,
                defense: 0.9,
                carryCapacity: 0.2
            },
            attacker: {
                speed: 0.7,
                health: 0.6,
                attack: 0.9,
                defense: 0.5,
                carryCapacity: 0.1
            }
        };
        
        return defaults[type] || defaults.collector;
    }
    
    setupMovementPatterns() {
        // Base patterns available to all types
        this.movementPatterns = [
            this.patrolPattern.bind(this),
            this.resourcePattern.bind(this)
        ];
        
        // Add type-specific patterns
        switch(this.type) {
            case 'collector':
                // Collectors already have the base patterns
                break;
            case 'explorer':
                this.movementPatterns.push(this.circlePattern.bind(this));
                this.movementPatterns.push(this.explorationPattern.bind(this));
                break;
            case 'defender':
                this.movementPatterns.push(this.defensePattern.bind(this));
                break;
            case 'attacker':
                this.movementPatterns.push(this.attackPattern.bind(this));
                break;
            default:
                break;
        }
    }
    
    getPatternDuration() {
        switch(this.type) {
            case 'collector':
                return 15 + Math.random() * 10; // Collectors stay on task longer
            case 'explorer':
                return 8 + Math.random() * 7; // Explorers change more frequently
            case 'defender':
                return 20 + Math.random() * 10; // Defenders stay in position longer
            case 'attacker':
                return 10 + Math.random() * 5; // Attackers change targets frequently
            default:
                return 12 + Math.random() * 8; // Default duration
        }
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
        // Update combat cooldowns
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        if (this.damageFlashTime > 0) {
            this.damageFlashTime -= deltaTime;
        }
        
        // Handle healing when at base
        if (this.isHealing) {
            this.healCooldown -= deltaTime;
            if (this.healCooldown <= 0) {
                this.health = Math.min(this.maxHealth, this.health + 5);
                this.healCooldown = 0.5; // Heal every half second
            }
        }
        
        // Update visuals based on current state
        this.updateVisuals();
        
        // Only move if not engaged in combat
        if (!this.isAttacking || !this.target) {
            // Update agent movement and behavior
            this.updateMovement(deltaTime, hexGrid);
            
            // Update pattern if needed
            this.patternUpdateTime += deltaTime;
            if (this.patternUpdateTime >= this.patternDuration) {
                this.patternUpdateTime = 0;
                this.currentPattern = (this.currentPattern + 1) % this.movementPatterns.length;
                this.setupPattern();
            }
        } else if (this.target) {
            // Move toward target if engaged in combat
            this.moveTowardTarget(deltaTime, hexGrid);
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
        // Make sure hexGrid exists before calling getCellAtPosition
        if (!hexGrid) return true;
        
        const cell = hexGrid.getCellAtPosition(x, y);
        return cell && !cell.hasObstacle;
    }
    
    updateVisuals() {
        // Update visual representation based on carrying resources and health
        if (this.resourceAmount > 0) {
            this.radius = this.baseRadius * 1.3; // Bigger when carrying resources
        } else {
            this.radius = this.baseRadius;
        }
        
        // Set color based on health
        if (this.teamId === 1) { // Red team
            const healthPercent = this.health / this.maxHealth;
            this.color = healthPercent > 0.5 ? '#ff3333' : '#aa2222';
        } else { // Blue team
            const healthPercent = this.health / this.maxHealth;
            this.color = healthPercent > 0.5 ? '#3333ff' : '#2222aa';
        }
    }
    
    render(ctx) {
        switch(this.type) {
            case 'collector':
                this.renderCollector(ctx);
                break;
            case 'explorer':
                this.renderExplorer(ctx);
                break;
            case 'defender':
                this.renderDefender(ctx);
                break;
            case 'attacker':
                this.renderAttacker(ctx);
                break;
            default:
                this.renderCollector(ctx);
                break;
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
        
        // Draw outline - flash white when taking damage
        if (this.damageFlashTime > 0) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = this.outlineColor;
            ctx.lineWidth = 2;
        }
        ctx.stroke();
        
        // Draw team indicator (inner circle)
        ctx.fillStyle = this.teamId === 1 ? '#cc0000' : '#0000cc';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw health bar
        this.renderHealthBar(ctx);
        
        // Draw attack line if attacking
        if (this.isAttacking && this.target && this.attackCooldown <= 0.2) {
            this.renderAttackLine(ctx);
        }
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
        
        // Draw outline - flash white when taking damage
        if (this.damageFlashTime > 0) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = this.outlineColor;
            ctx.lineWidth = 2;
        }
        ctx.stroke();
        
        // Draw team indicator (inner shape)
        const centerX = (p1.x + p2.x + p3.x) / 3;
        const centerY = (p1.y + p2.y + p3.y) / 3;
        
        ctx.fillStyle = this.teamId === 1 ? '#cc0000' : '#0000cc';
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw health bar
        this.renderHealthBar(ctx);
        
        // Draw attack line if attacking
        if (this.isAttacking && this.target && this.attackCooldown <= 0.2) {
            this.renderAttackLine(ctx);
        }
    }
    
    // Add new methods for combat
    
    renderHealthBar(ctx) {
        // Draw health bar above agent
        const healthBarWidth = this.radius * 2;
        const healthBarHeight = 3;
        const healthPercentage = this.health / this.maxHealth;
        
        // Background (gray)
        ctx.fillStyle = '#444444';
        ctx.fillRect(
            this.x - healthBarWidth / 2,
            this.y - this.radius - 8,
            healthBarWidth,
            healthBarHeight
        );
        
        // Health (gradient from red to green based on health)
        const healthColor = this.teamId === 1 ? 
            `rgba(255, ${Math.floor(healthPercentage * 255)}, 0, 0.9)` : 
            `rgba(0, ${Math.floor(healthPercentage * 255)}, 255, 0.9)`;
            
        ctx.fillStyle = healthColor;
        ctx.fillRect(
            this.x - healthBarWidth / 2,
            this.y - this.radius - 8,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );
    }
    
    renderAttackLine(ctx) {
        if (!this.target) return;
        
        // Draw attack line to target
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.target.x, this.target.y);
        
        // Set color based on team
        ctx.strokeStyle = this.teamId === 1 ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 0, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    takeDamage(amount) {
        // Calculate actual damage based on defense
        const actualDamage = Math.max(1, amount - this.defense/5);
        this.health -= actualDamage;
        
        // Visual effect for damage
        this.damageFlashTime = 0.2; // Flash for 0.2 seconds
        
        // Update visuals
        this.updateVisuals();
        
        // Log critical health for demo
        if (this.health <= 20 && this.health > 0) {
            console.log(`⚠️ ${this.teamId === 1 ? 'RED' : 'BLUE'} team ${this.role} at critical health (${Math.floor(this.health)}/${Math.floor(this.maxHealth)})`);
        }
        
        return actualDamage;
    }
    
    attack(target) {
        if (!target || this.attackCooldown > 0) return 0;
        
        // Reset cooldown
        this.attackCooldown = this.attackCooldownMax;
        
        // Calculate damage
        const damageDealt = target.takeDamage(this.attackPower);
        
        return damageDealt;
    }
    
    moveTowardTarget(deltaTime, hexGrid) {
        if (!this.target) return;
        
        // Calculate direction to target
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
        
        // If within attack range, stop moving
        const attackRange = this.radius + this.target.radius + 5;
        if (distanceToTarget <= attackRange) {
            return; // Close enough to attack
        }
        
        // Move toward target
        const moveDistance = this.speed * deltaTime;
        const moveRatio = Math.min(moveDistance / distanceToTarget, 1.0);
        
        const newX = this.x + dx * moveRatio;
        const newY = this.y + dy * moveRatio;
        
        // Check for collisions
        if (this.canMoveTo(newX, newY, hexGrid)) {
            this.x = newX;
            this.y = newY;
        }
    }
    
    startAttacking(target) {
        if (target && target.teamId !== this.teamId) {
            this.isAttacking = true;
            this.target = target;
        }
    }
    
    stopAttacking() {
        this.isAttacking = false;
        this.target = null;
    }
    
    startHealing() {
        this.isHealing = true;
        this.healCooldown = 0;
    }
    
    stopHealing() {
        this.isHealing = false;
    }
    
    renderDefender(ctx) {
        // Draw the defender agent (square shape)
        const size = this.radius * 1.5;
        
        // Draw the square body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - size/2, this.y - size/2, size, size);
        
        // Draw outline - flash white when taking damage
        if (this.damageFlashTime > 0) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = this.outlineColor;
            ctx.lineWidth = 2;
        }
        ctx.strokeRect(this.x - size/2, this.y - size/2, size, size);
        
        // Draw team indicator (inner circle)
        ctx.fillStyle = this.teamId === 1 ? '#cc0000' : '#0000cc';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw health bar
        this.renderHealthBar(ctx);
        
        // Draw attack line if attacking
        if (this.isAttacking && this.target && this.attackCooldown <= 0.2) {
            this.renderAttackLine(ctx);
        }
    }
    
    renderAttacker(ctx) {
        // Draw the attacker agent (diamond shape)
        const size = this.radius * 1.2;
        
        // Calculate points for diamond
        const points = [
            { x: this.x, y: this.y - size },        // top
            { x: this.x + size, y: this.y },        // right
            { x: this.x, y: this.y + size },        // bottom
            { x: this.x - size, y: this.y }         // left
        ];
        
        // Draw the diamond body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Draw outline - flash white when taking damage
        if (this.damageFlashTime > 0) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = this.outlineColor;
            ctx.lineWidth = 2;
        }
        ctx.stroke();
        
        // Draw team indicator (inner circle)
        ctx.fillStyle = this.teamId === 1 ? '#cc0000' : '#0000cc';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw health bar
        this.renderHealthBar(ctx);
        
        // Draw attack line if attacking
        if (this.isAttacking && this.target && this.attackCooldown <= 0.2) {
            this.renderAttackLine(ctx);
        }
    }
    
    defensePattern() {
        // Create a pattern that stays near the team base
        let basePos = { x: this.x, y: this.y }; // Default fallback
        
        // Try to get actual base position if game engine is available
        try {
            if (window.gameEngine) {
                const baseSystem = window.gameEngine.getSystem('base');
                if (baseSystem) {
                    const pos = baseSystem.getBasePosition(this.teamId);
                    if (pos) {
                        basePos = pos;
                    }
                }
            }
        } catch (error) {
            // Could not access base system
        }
        
        // Create a patrol radius around the base
        const patrolRadius = 50 + Math.random() * 50; // 50-100 units from base
        const segments = 6; // Number of points in the patrol
        
        // Create waypoints in a circle around the base
        this.waypoints = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            this.waypoints.push({
                x: basePos.x + Math.cos(angle) * patrolRadius,
                y: basePos.y + Math.sin(angle) * patrolRadius
            });
        }
    }
    
    attackPattern() {
        // Create a pattern that moves toward enemy territory
        let enemyBasePos = null;
        
        // Try to get enemy base position if game engine is available
        try {
            if (window.gameEngine) {
                const baseSystem = window.gameEngine.getSystem('base');
                if (baseSystem) {
                    const enemyTeamId = this.teamId === 1 ? 2 : 1;
                    enemyBasePos = baseSystem.getBasePosition(enemyTeamId);
                }
            }
        } catch (error) {
            // Could not access base system
        }
        
        // If we couldn't get enemy base, use exploration pattern
        if (!enemyBasePos) {
            return this.explorationPattern();
        }
        
        // Create a path that approaches enemy base through random waypoints
        const waypoints = [{ x: this.x, y: this.y }];
        let lastX = this.x;
        let lastY = this.y;
        
        // Calculate direction to enemy base
        const dx = enemyBasePos.x - lastX;
        const dy = enemyBasePos.y - lastY;
        const baseDistance = Math.sqrt(dx * dx + dy * dy);
        const baseAngle = Math.atan2(dy, dx);
        
        // Create 3-5 waypoints leading toward enemy base
        const numPoints = 3 + Math.floor(Math.random() * 3);
        const stepDistance = baseDistance / (numPoints + 1);
        
        for (let i = 1; i <= numPoints; i++) {
            // Move generally toward enemy base with some randomness
            const angleVariation = (Math.random() - 0.5) * Math.PI / 2; // +/- 45 degrees
            const angle = baseAngle + angleVariation;
            const distance = stepDistance * 0.8 + Math.random() * stepDistance * 0.4;
            
            lastX += Math.cos(angle) * distance;
            lastY += Math.sin(angle) * distance;
            
            waypoints.push({ x: lastX, y: lastY });
        }
        
        // Final waypoint is near enemy base
        const finalDistance = 100 + Math.random() * 50; // Stay 100-150 units away from enemy base
        const finalX = enemyBasePos.x - Math.cos(baseAngle) * finalDistance;
        const finalY = enemyBasePos.y - Math.sin(baseAngle) * finalDistance;
        waypoints.push({ x: finalX, y: finalY });
        
        this.waypoints = waypoints;
    }
    
    isDead() {
        const dead = this.health <= 0;
        
        // Log agent death for demo
        if (dead) {
            console.log(`💀 ${this.teamId === 1 ? 'RED' : 'BLUE'} team ${this.role.toUpperCase()} agent defeated!`);
            
            // Log resource drop if carrying
            if (this.resourceAmount > 0) {
                console.log(`💎 Dropped ${this.resourceAmount} ${this.resourceType} resources`);
            }
        }
        
        return dead;
    }
}