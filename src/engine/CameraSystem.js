export class CameraSystem {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
        this.scale = 1;
        this.rotation = 0; // in radians
        this.target = null;
        this.smoothing = 0.1; // Camera follow smoothing factor (0-1)
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    setScale(scale) {
        this.scale = scale;
    }
    
    setRotation(rotation) {
        this.rotation = rotation;
    }
    
    setTarget(target) {
        this.target = target;
    }
    
    update(deltaTime) {
        // Follow target if one is set
        if (this.target && this.target.x !== undefined && this.target.y !== undefined) {
            // Calculate target position (center of screen)
            const targetX = this.target.x - this.width / (2 * this.scale);
            const targetY = this.target.y - this.height / (2 * this.scale);
            
            // Smoothly move towards target
            this.x += (targetX - this.x) * this.smoothing;
            this.y += (targetY - this.y) * this.smoothing;
        }
    }
    
    applyTransform(ctx) {
        // Save the current transformation state
        ctx.save();
        
        // Apply camera transformations in reverse order (scale, rotate, translate)
        ctx.translate(this.width / 2, this.height / 2); // Move to center
        ctx.scale(this.scale, this.scale);
        ctx.rotate(this.rotation);
        ctx.translate(-this.width / 2 - this.x, -this.height / 2 - this.y); // Move back and apply position
    }
    
    resetTransform(ctx) {
        // Restore the transformation state
        ctx.restore();
    }
    
    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        // Calculate the center offset
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Adjust for the camera position and scale
        const worldX = (screenX - centerX) / this.scale + centerX + this.x;
        const worldY = (screenY - centerY) / this.scale + centerY + this.y;
        
        return { x: worldX, y: worldY };
    }
    
    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        // Calculate the center offset
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Adjust for the camera position and scale
        const screenX = (worldX - this.x - centerX) * this.scale + centerX;
        const screenY = (worldY - this.y - centerY) * this.scale + centerY;
        
        return { x: screenX, y: screenY };
    }
}