import { GameEngine } from '../engine/GameEngine.js';
import { RenderSystem } from '../engine/RenderSystem.js';
import { CameraSystem } from '../engine/CameraSystem.js';
import { Rectangle } from '../engine/shapes/Rectangle.js';
import { Circle } from '../engine/shapes/Circle.js';
import { GameWorld } from '../engine/world/GameWorld.js';

// Initialize the game engine
const engine = new GameEngine('game-canvas');

// Initialize rendering system
const renderSystem = new RenderSystem();
engine.setRenderSystem(renderSystem);

// Initialize camera system
const cameraSystem = new CameraSystem(engine.width, engine.height);
engine.setCameraSystem(cameraSystem);

// Initialize the game world
const gameWorld = new GameWorld(engine.width * 2, engine.height * 2, 40);

// Add the game world to renderable objects
renderSystem.addRenderable({
    zIndex: -1, // Ensure it's drawn below other objects
    render: (ctx) => {
        gameWorld.render(ctx);
    }
});

// Setup gameWorld update in render system
const originalRenderSystemUpdate = renderSystem.update;
renderSystem.update = function(deltaTime) {
    // Update all regular renderables
    if (originalRenderSystemUpdate) {
        originalRenderSystemUpdate.call(this, deltaTime);
    }
    
    // Update game world
    gameWorld.update(deltaTime);
};

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

// Add debug grid
engine.renderDebugGrid = function() {
    // Disable debug grid since we now have the hex grid
    // Or make it optional
    if (window.showDebugGrid) {
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
    }
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
    
    // Toggle debug grid
    if (keys['g'] && !this.lastGridToggle) {
        window.showDebugGrid = !window.showDebugGrid;
        this.lastGridToggle = true;
    } else if (!keys['g']) {
        this.lastGridToggle = false;
    }
    
    // Obstacle pattern testing
    if (keys['1'] && !this.lastPattern1) {
        gameWorld.testObstaclePattern('random');
        this.lastPattern1 = true;
    } else if (!keys['1']) {
        this.lastPattern1 = false;
    }
    
    if (keys['2'] && !this.lastPattern2) {
        gameWorld.testObstaclePattern('cluster');
        this.lastPattern2 = true;
    } else if (!keys['2']) {
        this.lastPattern2 = false;
    }
    
    if (keys['3'] && !this.lastPattern3) {
        gameWorld.testObstaclePattern('line');
        this.lastPattern3 = true;
    } else if (!keys['3']) {
        this.lastPattern3 = false;
    }
    
    // Reset world
    if (keys['r'] && !this.lastReset) {
        gameWorld.reset();
        this.lastReset = true;
    } else if (!keys['r']) {
        this.lastReset = false;
    }
};

// Enhanced game loop function with proper binding
const enhancedGameLoop = function(timestamp) {
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
    
    // Handle camera controls
    if (this.handleCameraControls) {
        this.handleCameraControls(this.deltaTime);
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
    requestAnimationFrame(this._boundGameLoop);
};

// Properly bind the enhanced game loop to the engine
engine._boundGameLoop = enhancedGameLoop.bind(engine);
engine.gameLoop = engine._boundGameLoop;

// Update the debug overlay with more information
engine.updateFps = function() {
    const fpsElement = document.getElementById('fps-counter');
    if (fpsElement) {
        const cameraInfo = this.cameraSystem ? 
            `Camera: (${this.cameraSystem.x.toFixed(0)}, ${this.cameraSystem.y.toFixed(0)}) Scale: ${this.cameraSystem.scale.toFixed(2)}` : '';
        
        fpsElement.textContent = `FPS: ${this.fps} | ${cameraInfo}`;
    }
};

// Override start method to use our bound game loop
engine.start = function() {
    if (!this.isRunning) {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.lastFpsUpdate = this.lastTime;
        requestAnimationFrame(this._boundGameLoop);
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
        T: Toggle target following<br>
        G: Toggle debug grid<br>
        1-3: Test obstacle patterns<br>
        R: Reset game world
    </div>
    
    <div style="margin-top: 10px;">
        Resources:<br>
        <span style="color: yellow;">⬤</span> Energy<br>
        <span style="color: lime;">⬤</span> Materials<br>
        <span style="color: cyan;">⬤</span> Data
    </div>
`;
debugOverlay.appendChild(instructionsElement);

// Start the game
engine.start();