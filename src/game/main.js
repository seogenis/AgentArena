import { GameEngine } from '../engine/GameEngine.js';
import { RenderSystem } from '../engine/RenderSystem.js';
import { CameraSystem } from '../engine/CameraSystem.js';
import { WorldSystem } from '../engine/world/WorldSystem.js';
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

// Initialize world system with render system reference (updated for Stage 3)
const worldSystem = new WorldSystem(engine.width * 2, engine.height * 2, 30, renderSystem);
engine.worldSystem = worldSystem;

// No longer need a separate camera target as we can follow an agent
let cameraTarget = null;

// Add update method to renderables
renderSystem.update = function(deltaTime) {
    for (const renderable of this.renderables) {
        if (renderable.update) {
            renderable.update(deltaTime);
        }
    }
};

// Add debug grid
engine.renderDebugGrid = function() {
    // We don't need the debug grid anymore since we have the hex grid
    // Instead, let the world system render the hex grid
    if (this.worldSystem) {
        this.worldSystem.render(this.ctx);
    }
};

// Add mouse interaction
const mouse = { x: 0, y: 0, isDown: false, button: 0 };

window.addEventListener('mousedown', e => {
    mouse.isDown = true;
    mouse.button = e.button;
    handleMouseInteraction();
});

window.addEventListener('mouseup', e => {
    mouse.isDown = false;
});

window.addEventListener('mousemove', e => {
    // Calculate mouse position relative to canvas
    const rect = engine.canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    
    // Convert to world coordinates
    if (engine.cameraSystem) {
        const worldPos = engine.cameraSystem.screenToWorld(mouse.x, mouse.y);
        mouse.worldX = worldPos.x;
        mouse.worldY = worldPos.y;
    }
    
    // Handle mouse interaction if button is down
    if (mouse.isDown) {
        handleMouseInteraction();
    }
});

function handleMouseInteraction() {
    if (!engine.worldSystem) return;
    
    // Left click - Add Team 1 control (red)
    if (mouse.button === 0) {
        engine.worldSystem.addControlToCell(mouse.worldX, mouse.worldY, 1, 0.2);
    }
    
    // Right click - Add Team 2 control (blue)
    else if (mouse.button === 2) {
        engine.worldSystem.addControlToCell(mouse.worldX, mouse.worldY, 2, 0.2);
    }
    
    // Update debug overlay
    updateWorldInfo();
}

function updateWorldInfo() {
    if (!engine.worldSystem) return;
    
    const info = engine.worldSystem.getDebugInfo();
    const worldInfoElement = document.getElementById('world-info');
    
    if (worldInfoElement) {
        // Enhanced info display with team resources and agents
        const team1Resources = info.teamResources?.team1 || { energy: 0, materials: 0, data: 0 };
        const team2Resources = info.teamResources?.team2 || { energy: 0, materials: 0, data: 0 };
        
        worldInfoElement.innerHTML = `
            <div>Map Resources: Energy: ${info.resources.energy}, Materials: ${info.resources.materials}, Data: ${info.resources.data}</div>
            <div>Territory: Red: ${info.territory.team1}, Blue: ${info.territory.team2}</div>
            <div>Obstacles: ${info.obstacles}</div>
            <div style="margin-top: 5px; color: #ff7777;">Red Team: ${info.agents?.team1 || 0} agents</div>
            <div>Resources: E:${team1Resources.energy} M:${team1Resources.materials} D:${team1Resources.data}</div>
            <div style="margin-top: 5px; color: #7777ff;">Blue Team: ${info.agents?.team2 || 0} agents</div>
            <div>Resources: E:${team2Resources.energy} M:${team2Resources.materials} D:${team2Resources.data}</div>
        `;
    }
}

// Add keyboard controls for camera
const keys = {};
window.addEventListener('keydown', e => {
    keys[e.key] = true;
    
    // Special key handling
    if (e.key === 'o') {
        // 'o' key - Add an obstacle at cursor position
        if (engine.worldSystem) {
            engine.worldSystem.addObstacleAt(mouse.worldX, mouse.worldY);
            updateWorldInfo();
        }
    } else if (e.key === '1' || e.key === '2' || e.key === '3') {
        // 1, 2, 3 keys - Add different resource types
        if (engine.worldSystem) {
            const resourceTypes = ['energy', 'materials', 'data'];
            const typeIndex = parseInt(e.key) - 1;
            
            if (typeIndex >= 0 && typeIndex < resourceTypes.length) {
                engine.worldSystem.addResourceAt(
                    mouse.worldX, 
                    mouse.worldY, 
                    resourceTypes[typeIndex]
                );
                updateWorldInfo();
            }
        }
    } else if (e.key === 'c') {
        // 'c' key - Collect resource at cursor position
        if (engine.worldSystem) {
            engine.worldSystem.collectResourceAt(mouse.worldX, mouse.worldY);
            updateWorldInfo();
        }
    } else if (e.key === 'r') {
        // 'r' key - Reset game if game over, otherwise create red team agent
        if (engine.worldSystem) {
            if (engine.worldSystem.gameOver) {
                engine.worldSystem.resetGame();
                updateWorldInfo();
            } else {
                engine.worldSystem.createAgent(1, 'collector');
                updateWorldInfo();
            }
        }
    } else if (e.key === 'z') {
        // 'z' key - Create red team explorer agent
        if (engine.worldSystem) {
            engine.worldSystem.createAgent(1, 'explorer');
            updateWorldInfo();
        }
    } else if (e.key === 'b' || e.key === 's') {
        // 'b', 's' keys - Create blue team collector agent
        if (engine.worldSystem) {
            engine.worldSystem.createAgent(2, 'collector');
            updateWorldInfo();
        }
    } else if (e.key === 'x') {
        // 'x' key - Create blue team explorer agent
        if (engine.worldSystem) {
            engine.worldSystem.createAgent(2, 'explorer');
            updateWorldInfo();
        }
    } else if (e.key === 'f') {
        // 'f' key - Follow a random agent with camera
        if (engine.worldSystem && engine.worldSystem.agentSystem) {
            const agents = engine.worldSystem.agentSystem.agents;
            if (agents.length > 0) {
                // Pick a random agent
                cameraTarget = agents[Math.floor(Math.random() * agents.length)];
                engine.cameraSystem.setTarget(cameraTarget);
            }
        }
    } else if (e.key === 'p') {
        // 'p' key - Toggle combat system
        if (engine.worldSystem) {
            const combatEnabled = engine.worldSystem.toggleCombat();
            console.log(`Combat system ${combatEnabled ? 'enabled' : 'disabled'}`);
        }
    } else if (e.key === 'h') {
        // 'h' key - Create hit effect for testing
        if (engine.worldSystem) {
            engine.worldSystem.createHitEffect(mouse.worldX, mouse.worldY, 1);
        }
    } else if (e.key === 'k') {
        // 'k' key - Create death effect for testing
        if (engine.worldSystem) {
            engine.worldSystem.createDeathEffect(mouse.worldX, mouse.worldY, 2);
        }
    }
});

window.addEventListener('keyup', e => {
    keys[e.key] = false;
});

// Prevent context menu on right-click
window.addEventListener('contextmenu', e => {
    e.preventDefault();
});

engine.handleCameraControls = function(deltaTime) {
    const moveSpeed = 300; // pixels per second (increased for larger world)
    const zoomSpeed = 1;
    
    // Toggle camera following target
    if (keys['t'] && !this.lastToggle) {
        if (this.cameraSystem.target) {
            this.cameraSystem.target = null;
        } else if (cameraTarget) {
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
    
    // Update world system
    if (this.worldSystem) {
        this.worldSystem.update(this.deltaTime, timestamp);
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
    
    // Render world grid (replaces debug grid)
    this.renderDebugGrid();
    
    // Reset transformations
    if (this.cameraSystem) {
        this.cameraSystem.resetTransform(this.ctx);
    }
    
    // Update the world info every couple of frames
    if (this.frameCount % 10 === 0) {
        updateWorldInfo();
    }
    
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

// Add world info section
const worldInfoElement = document.createElement('div');
worldInfoElement.id = 'world-info';
worldInfoElement.style.marginTop = '10px';
debugOverlay.appendChild(worldInfoElement);

// Add interaction instructions
const instructionsElement = document.createElement('div');
instructionsElement.innerHTML = `
    <div style="margin-top: 10px;">
        Controls:<br>
        WASD/Arrows: Move camera<br>
        Q/E: Zoom in/out<br>
        T: Toggle target following<br>
        F: Follow random agent<br>
        <br>
        Interactions:<br>
        Left click: Add Red team control<br>
        Right click: Add Blue team control<br>
        O key: Add obstacle at cursor<br>
        1/2/3 keys: Add resources (Energy/Materials/Data)<br>
        C key: Collect resource at cursor<br>
        <br>
        Agents:<br>
        R key: Add Red collector agent<br>
        Z key: Add Red explorer agent<br>
        S key: Add Blue collector agent<br>
        X key: Add Blue explorer agent<br>
        <br>
        Game Mechanics:<br>
        P key: Toggle combat system<br>
        H key: Test hit effect at cursor<br>
        K key: Test death effect at cursor<br>
        R key: Reset game (when game over)
    </div>
`;
debugOverlay.appendChild(instructionsElement);

// Update world info initially
updateWorldInfo();

// Add interface methods to be used by combat system
worldSystem.agentSystem.createHitEffect = function(x, y, teamId) {
    worldSystem.createHitEffect(x, y, teamId);
};

worldSystem.agentSystem.createDeathEffect = function(x, y, teamId) {
    worldSystem.createDeathEffect(x, y, teamId);
};

// Start the game
engine.start();