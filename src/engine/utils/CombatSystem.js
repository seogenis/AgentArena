export class CombatSystem {
    constructor(renderSystem) {
        this.renderSystem = renderSystem;
        this.effects = [];
        this.effectIdCounter = 0;
    }
    
    createHitEffect(x, y, teamId) {
        // Create a visual hit effect
        const effect = {
            id: this.effectIdCounter++,
            x,
            y,
            teamId,
            radius: 20,
            maxRadius: 20,
            lifespan: 0.3, // seconds
            remainingTime: 0.3,
            zIndex: 20,
            render: function(ctx) {
                // Draw explosion effect
                const opacity = this.remainingTime / this.lifespan;
                const color = this.teamId === 1 ? 
                    `rgba(255, 50, 50, ${opacity})` : 
                    `rgba(50, 50, 255, ${opacity})`;
                
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * (1 - opacity * 0.5), 0, Math.PI * 2);
                ctx.fill();
                
                // Inner glow
                const innerColor = this.teamId === 1 ? 
                    `rgba(255, 200, 200, ${opacity})` : 
                    `rgba(200, 200, 255, ${opacity})`;
                
                ctx.fillStyle = innerColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 0.6 * (1 - opacity * 0.3), 0, Math.PI * 2);
                ctx.fill();
            },
            update: function(deltaTime) {
                this.remainingTime -= deltaTime;
                return this.remainingTime > 0;
            }
        };
        
        // Add to render system
        this.renderSystem.addRenderable(effect);
        
        // Add to effects list
        this.effects.push(effect);
        
        return effect;
    }
    
    createDeathEffect(x, y, teamId) {
        // Create a more dramatic death effect
        const effect = {
            id: this.effectIdCounter++,
            x,
            y,
            teamId,
            radius: 30,
            maxRadius: 30,
            lifespan: 0.8, // longer than hit effect
            remainingTime: 0.8,
            zIndex: 20,
            render: function(ctx) {
                // Draw explosion effect
                const opacity = this.remainingTime / this.lifespan;
                const color = this.teamId === 1 ? 
                    `rgba(255, 0, 0, ${opacity})` : 
                    `rgba(0, 0, 255, ${opacity})`;
                
                // Outer ring
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * (1 - opacity * 0.3), 0, Math.PI * 2);
                ctx.stroke();
                
                // Inner explosion
                const innerColor = this.teamId === 1 ? 
                    `rgba(255, 150, 150, ${opacity})` : 
                    `rgba(150, 150, 255, ${opacity})`;
                
                ctx.fillStyle = innerColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 0.7 * (1 - opacity * 0.5), 0, Math.PI * 2);
                ctx.fill();
                
                // Particles
                const particleCount = 8;
                for (let i = 0; i < particleCount; i++) {
                    const angle = (i / particleCount) * Math.PI * 2;
                    const distance = this.radius * (1 - opacity * 0.2);
                    const px = this.x + Math.cos(angle) * distance;
                    const py = this.y + Math.sin(angle) * distance;
                    
                    ctx.fillStyle = this.teamId === 1 ? 
                        `rgba(255, 255, 200, ${opacity})` : 
                        `rgba(200, 255, 255, ${opacity})`;
                    
                    ctx.beginPath();
                    ctx.arc(px, py, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            },
            update: function(deltaTime) {
                this.remainingTime -= deltaTime;
                return this.remainingTime > 0;
            }
        };
        
        // Add to render system
        this.renderSystem.addRenderable(effect);
        
        // Add to effects list
        this.effects.push(effect);
        
        return effect;
    }
    
    update(deltaTime) {
        // Update all combat effects
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            
            // Update effect
            const isAlive = effect.update(deltaTime);
            
            // Remove expired effects
            if (!isAlive) {
                this.renderSystem.removeRenderable(effect);
                this.effects.splice(i, 1);
            }
        }
    }
}