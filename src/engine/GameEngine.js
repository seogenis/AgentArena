export class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateInterval = 500; // Update FPS display every 500ms
        this.lastFpsUpdate = 0;
        this.isRunning = false;
        this.renderSystem = null;
        this.cameraSystem = null;
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.updateFps = this.updateFps.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        // Set up event listeners
        window.addEventListener('resize', this.handleResize);
    }
    
    init() {
        // Initialize systems
        this.handleResize();
    }
    
    setRenderSystem(renderSystem) {
        this.renderSystem = renderSystem;
    }
    
    setCameraSystem(cameraSystem) {
        this.cameraSystem = cameraSystem;
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            this.lastFpsUpdate = this.lastTime;
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    stop() {
        this.isRunning = false;
    }
    
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        // Calculate delta time in seconds
        this.deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        // Update FPS counter
        this.frameCount++;
        if (timestamp - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
            this.lastFpsUpdate = timestamp;
            this.frameCount = 0;
            this.updateFps();
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Apply camera transformations if available
        if (this.cameraSystem) {
            this.cameraSystem.update(this.deltaTime);
            this.cameraSystem.applyTransform(this.ctx);
        }
        
        // Render game objects
        if (this.renderSystem) {
            this.renderSystem.render(this.ctx, this.deltaTime);
        }
        
        // Reset transformations
        if (this.cameraSystem) {
            this.cameraSystem.resetTransform(this.ctx);
        }
        
        // Continue the game loop
        requestAnimationFrame(this.gameLoop);
    }
    
    updateFps() {
        const fpsElement = document.getElementById('fps-counter');
        if (fpsElement) {
            fpsElement.textContent = `FPS: ${this.fps}`;
        }
    }
    
    handleResize() {
        // Maintain aspect ratio while fitting the window
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const canvasRatio = this.canvas.width / this.canvas.height;
        const containerRatio = containerWidth / containerHeight;
        
        let newWidth, newHeight;
        
        if (containerRatio > canvasRatio) {
            // Container is wider than canvas ratio
            newHeight = containerHeight;
            newWidth = newHeight * canvasRatio;
        } else {
            // Container is taller than canvas ratio
            newWidth = containerWidth;
            newHeight = newWidth / canvasRatio;
        }
        
        // Apply new size to canvas style
        this.canvas.style.width = `${newWidth}px`;
        this.canvas.style.height = `${newHeight}px`;
    }
}