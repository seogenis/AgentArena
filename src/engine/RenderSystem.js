export class RenderSystem {
    constructor() {
        this.renderables = [];
    }
    
    addRenderable(renderable) {
        this.renderables.push(renderable);
    }
    
    removeRenderable(renderable) {
        const index = this.renderables.indexOf(renderable);
        if (index !== -1) {
            this.renderables.splice(index, 1);
        }
    }
    
    render(ctx, deltaTime) {
        // Sort renderables by z-index (if applicable)
        this.renderables.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        
        // Render each object
        for (const renderable of this.renderables) {
            if (renderable.isVisible !== false) {
                ctx.save();
                if (renderable.render) {
                    renderable.render(ctx, deltaTime);
                }
                ctx.restore();
            }
        }
    }
}