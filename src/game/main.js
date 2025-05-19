import { GameEngine } from '../engine/GameEngine.js';
import { RenderSystem } from '../engine/RenderSystem.js';
import { CameraSystem } from '../engine/CameraSystem.js';
import { Rectangle } from '../engine/shapes/Rectangle.js';
import { Circle } from '../engine/shapes/Circle.js';

// Initialize the game engine
const engine = new GameEngine('game-canvas');

// Initialize rendering system
const renderSystem = new RenderSystem();
engine.setRenderSystem(renderSystem);

// Initialize camera system
const cameraSystem = new CameraSystem(engine.width, engine.height);
engine.setCameraSystem(cameraSystem);

// Add some test shapes to verify rendering
const testRectangle = new Rectangle(100, 100, 100, 100, '#ff0000');
renderSystem.addRenderable(testRectangle);

const testCircle = new Circle(300, 300, 50, '#00ff00');
renderSystem.addRenderable(testCircle);

// Add some background shapes to verify camera movement
for (let i = 0; i < 20; i++) {
    const x = Math.random() * engine.width * 2 - engine.width / 2;
    const y = Math.random() * engine.height * 2 - engine.height / 2;
    const size = 10 + Math.random() * 40;
    const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    
    if (Math.random() > 0.5) {
        renderSystem.addRenderable(new Rectangle(x, y, size, size, color));
    } else {
        renderSystem.addRenderable(new Circle(x, y, size / 2, color));
    }
}

// Add a moving target for the camera to follow
const cameraTarget = new Circle(400, 300, 20, '#ffffff');
renderSystem.addRenderable(cameraTarget);
cameraSystem.setTarget(cameraTarget);

// Animation function for the target
let targetTime = 0;
cameraTarget.update = function(deltaTime) {
    targetTime += deltaTime;
    this.x = 400 + Math.sin(targetTime * 0.5) * 200;
    this.y = 300 + Math.cos(targetTime * 0.3) * 150;
};

// Add update method to test objects
renderSystem.update = function(deltaTime) {
    for (const renderable of this.renderables) {
        if (renderable.update) {
            renderable.update(deltaTime);
        }
    }
};

// Add update to game loop
const originalGameLoop = engine.gameLoop;
engine.gameLoop = function(timestamp) {
    if (!this.isRunning) return;
    
    // Calculate delta time
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
    
    // Update game objects
    if (this.renderSystem && this.renderSystem.update) {
        this.renderSystem.update(this.deltaTime);
    }
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Apply camera transformations
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
    
    // Render debug grid
    this.renderDebugGrid();
    
    // Continue the game loop
    requestAnimationFrame(this.gameLoop);
};

// Add debug grid
engine.renderDebugGrid = function() {
    const gridSize = 50;
    const gridColor = 'rgba(255, 255, 255, 0.1)';
    
    this.ctx.save();
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;
    
    // Apply camera transform for the grid
    if (this.cameraSystem) {
        this.cameraSystem.applyTransform(this.ctx);
    }
    
    // Draw vertical lines
    for (let x = 0; x < this.width * 2; x += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x - this.width / 2, -this.height / 2);
        this.ctx.lineTo(x - this.width / 2, this.height * 1.5);
        this.ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y < this.height * 2; y += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(-this.width / 2, y - this.height / 2);
        this.ctx.lineTo(this.width * 1.5, y - this.height / 2);
        this.ctx.stroke();
    }
    
    this.ctx.restore();
};

// Add keyboard controls for camera
const keys = {};
window.addEventListener('keydown', e => {
    keys[e.key] = true;
});
window.addEventListener('keyup', e => {
    keys[e.key] = false;
});

engine.handleCameraControls = function(deltaTime) {
    const moveSpeed = 200; // pixels per second
    const zoomSpeed = 1;
    
    // Toggle camera following target
    if (keys['t'] && !this.lastToggle) {
        if (this.cameraSystem.target) {
            this.cameraSystem.target = null;
        } else {
            this.cameraSystem.target = cameraTarget;
        }
        this.lastToggle = true;
    } else if (!keys['t']) {
        this.lastToggle = false;
    }
    
    // If not following target, allow manual camera movement
    if (!this.cameraSystem.target) {
        if (keys['ArrowUp'] || keys['w']) {
            this.cameraSystem.y -= moveSpeed * deltaTime / this.cameraSystem.scale;
        }
        if (keys['ArrowDown'] || keys['s']) {
            this.cameraSystem.y += moveSpeed * deltaTime / this.cameraSystem.scale;
        }
        if (keys['ArrowLeft'] || keys['a']) {
            this.cameraSystem.x -= moveSpeed * deltaTime / this.cameraSystem.scale;
        }
        if (keys['ArrowRight'] || keys['d']) {
            this.cameraSystem.x += moveSpeed * deltaTime / this.cameraSystem.scale;
        }
    }
    
    // Zoom controls
    if (keys['q']) {
        this.cameraSystem.scale = Math.max(0.1, this.cameraSystem.scale - zoomSpeed * deltaTime);
    }
    if (keys['e']) {
        this.cameraSystem.scale = Math.min(5, this.cameraSystem.scale + zoomSpeed * deltaTime);
    }
};

// Add camera controls to the game loop
const originalUpdate = engine.gameLoop;
engine.gameLoop = function(timestamp) {
    if (!this.isRunning) return;
    
    // Calculate delta time
    this.deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    
    // Handle camera controls
    this.handleCameraControls(this.deltaTime);
    
    // Update FPS counter
    this.frameCount++;
    if (timestamp - this.lastFpsUpdate >= this.fpsUpdateInterval) {
        this.fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
        this.lastFpsUpdate = timestamp;
        this.frameCount = 0;
        this.updateFps();
    }
    
    // Update game objects
    if (this.renderSystem && this.renderSystem.update) {
        this.renderSystem.update(this.deltaTime);
    }
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Apply camera transformations
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
    
    // Render debug grid
    this.renderDebugGrid();
    
    // Continue the game loop
    requestAnimationFrame(this.gameLoop);
};

// Update the debug overlay with more information
const originalUpdateFps = engine.updateFps;
engine.updateFps = function() {
    const fpsElement = document.getElementById('fps-counter');
    if (fpsElement) {
        const cameraInfo = this.cameraSystem ? 
            `Camera: (${this.cameraSystem.x.toFixed(0)}, ${this.cameraSystem.y.toFixed(0)}) Scale: ${this.cameraSystem.scale.toFixed(2)}` : '';
        
        fpsElement.textContent = `FPS: ${this.fps} | ${cameraInfo}`;
    }
};

// Initialize the engine
engine.init();

// Add instructions to the debug overlay
const debugOverlay = document.getElementById('debug-overlay');
const instructionsElement = document.createElement('div');
instructionsElement.innerHTML = `
    <div style="margin-top: 10px;">
        Controls:<br>
        WASD/Arrows: Move camera<br>
        Q/E: Zoom in/out<br>
        T: Toggle target following
    </div>
`;
debugOverlay.appendChild(instructionsElement);

// Start the game
engine.start();