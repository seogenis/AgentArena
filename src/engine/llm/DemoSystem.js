/**
 * DemoSystem.js
 * 
 * Demo system for showcasing agent capabilities without requiring backend connectivity.
 * Provides hardcoded team strategies and agent behaviors for demonstration purposes.
 * Use for hackathon presentations and testing.
 */

class DemoSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.enabled = false;
        this.demoTimer = 0;
        this.demoStage = 0;
        this.demoSequence = this.createDemoSequence();
        
        // Register keyboard shortcut
        window.addEventListener('keydown', (e) => {
            if (e.key === 'd') {
                this.toggleDemo();
            }
        });
    }
    
    /**
     * Toggle demo mode on/off
     */
    toggleDemo() {
        this.enabled = !this.enabled;
        
        if (this.enabled) {
            console.log('🎮 DEMO MODE ACTIVATED');
            console.log('💡 Demonstrating AI agent capabilities with hardcoded behaviors');
            this.demoStage = 0;
            this.demoTimer = 0;
            
            // Make sure LLM system is enabled
            const llmSystem = this.gameEngine.getSystem('llm');
            if (llmSystem && !llmSystem.enabled) {
                llmSystem.setEnabled(true);
            }
            
            // Reset world for demo if needed
            const worldSystem = this.gameEngine.getSystem('world');
            if (worldSystem) {
                if (worldSystem.gameOver) {
                    worldSystem.resetGame();
                }
                
                // Add initial resources to both teams for spawning
                const baseSystem = this.gameEngine.getSystem('base');
                if (baseSystem) {
                    baseSystem.addResources('red', { energy: 40, materials: 40, data: 40 });
                    baseSystem.addResources('blue', { energy: 40, materials: 40, data: 40 });
                }
                
                // Add some resources to the map
                this.addInitialResources();
            }
        } else {
            console.log('🎮 DEMO MODE DEACTIVATED');
        }
    }
    
    /**
     * Update the demo sequence
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        if (!this.enabled) return;
        
        this.demoTimer += deltaTime;
        
        // Check if we should advance to the next demo stage
        if (this.demoStage < this.demoSequence.length && 
            this.demoTimer >= this.demoSequence[this.demoStage].time) {
            
            const currentStage = this.demoSequence[this.demoStage];
            this.executeStage(currentStage);
            
            this.demoStage++;
        }
    }
    
    /**
     * Execute a demo stage
     * @param {Object} stage - Demo stage to execute
     */
    executeStage(stage) {
        console.log(`📊 Demo stage ${this.demoStage + 1}: ${stage.description}`);
        
        switch (stage.action) {
            case 'setRedStrategy':
                this.setTeamStrategy('red', stage.strategy);
                break;
            case 'setBlueStrategy':
                this.setTeamStrategy('blue', stage.strategy);
                break;
            case 'spawnRedAgent':
                this.spawnAgent('red', stage.agentSpec);
                break;
            case 'spawnBlueAgent':
                this.spawnAgent('blue', stage.agentSpec);
                break;
            case 'addResources':
                this.addResources(stage.resources);
                break;
            case 'addTerritory':
                this.addTerritory(stage.team, stage.territory);
                break;
        }
    }
    
    /**
     * Set team strategy
     * @param {string} teamId - Team ID (red/blue)
     * @param {Object} strategy - Strategy object
     */
    setTeamStrategy(teamId, strategy) {
        const teamStrategySystem = this.gameEngine.getSystem('teamStrategy');
        if (teamStrategySystem) {
            teamStrategySystem.setTeamStrategy(teamId, strategy);
            console.log(`🧠 ${teamId.toUpperCase()} team adopts new strategy: ${strategy.strategy.toUpperCase()} - ${strategy.description}`);
        }
    }
    
    /**
     * Spawn an agent with specified attributes
     * @param {string} teamId - Team ID (red/blue)
     * @param {Object} agentSpec - Agent specification
     */
    spawnAgent(teamId, agentSpec) {
        const spawnerSystem = this.gameEngine.getSystem('spawner');
        if (spawnerSystem) {
            // Add to spawn queue with pre-validation
            spawnerSystem.spawnQueue[teamId].push(agentSpec);
            
            console.log(`🤖 Adding ${agentSpec.role.toUpperCase()} agent to ${teamId.toUpperCase()} team's spawn queue: ${agentSpec.description}`);
            
            // Immediately try to spawn the agent
            spawnerSystem.trySpawnNextAgent(teamId);
        }
    }
    
    /**
     * Add resources to the map
     * @param {Array} resources - Array of resource objects with type, x, y
     */
    addResources(resources) {
        const worldSystem = this.gameEngine.getSystem('world');
        if (worldSystem) {
            for (const resource of resources) {
                worldSystem.addResourceAt(resource.x, resource.y, resource.type);
            }
            console.log(`💎 Added ${resources.length} resources to the map`);
        }
    }
    
    /**
     * Add territory control for a team
     * @param {string} teamId - Team ID (red/blue)
     * @param {Array} territory - Array of territory positions {x, y}
     */
    addTerritory(teamId, territory) {
        const worldSystem = this.gameEngine.getSystem('world');
        if (worldSystem) {
            const teamNumber = teamId === 'red' ? 1 : 2;
            for (const pos of territory) {
                worldSystem.addControlToCell(pos.x, pos.y, teamNumber, 0.3);
            }
            console.log(`🏁 Added ${territory.length} territory cells for ${teamId.toUpperCase()} team`);
        }
    }
    
    /**
     * Add initial resources to the map for demo
     */
    addInitialResources() {
        const worldSystem = this.gameEngine.getSystem('world');
        if (!worldSystem) return;
        
        // Calculate map center and dimensions
        const width = worldSystem.width;
        const height = worldSystem.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Add resources in strategic locations
        const resources = [
            // Energy cluster near center
            { x: centerX - 100, y: centerY - 100, type: 'energy' },
            { x: centerX - 80, y: centerY - 120, type: 'energy' },
            { x: centerX - 120, y: centerY - 80, type: 'energy' },
            
            // Materials on the right side
            { x: centerX + 200, y: centerY, type: 'materials' },
            { x: centerX + 220, y: centerY + 20, type: 'materials' },
            { x: centerX + 180, y: centerY - 20, type: 'materials' },
            
            // Data on the left side
            { x: centerX - 200, y: centerY, type: 'data' },
            { x: centerX - 220, y: centerY - 20, type: 'data' },
            { x: centerX - 180, y: centerY + 20, type: 'data' }
        ];
        
        // Add them to the map
        this.addResources(resources);
    }
    
    /**
     * Create the demo sequence
     * @returns {Array} Array of demo stages
     */
    createDemoSequence() {
        return [
            // Stage 1: Initial strategies
            {
                time: 1,
                description: "Red team adopts an aggressive strategy",
                action: "setRedStrategy",
                strategy: {
                    strategy: "aggressive",
                    focus: "combat",
                    priorities: ["expand_territory", "eliminate_enemies", "collect_energy"],
                    description: "Control territory through aggressive expansion and combat"
                }
            },
            {
                time: 2,
                description: "Blue team adopts an economic strategy",
                action: "setBlueStrategy",
                strategy: {
                    strategy: "economic",
                    focus: "resources",
                    priorities: ["collect_materials", "collect_energy", "defend_base"],
                    description: "Focus on resource collection and base development"
                }
            },
            
            // Stage 2: Initial agents
            {
                time: 4,
                description: "Red team deploys an attacker",
                action: "spawnRedAgent",
                agentSpec: {
                    role: "attacker",
                    attributes: {
                        speed: 0.8,
                        health: 0.7,
                        attack: 0.9,
                        defense: 0.5,
                        carryCapacity: 0.2
                    },
                    priority: "energy",
                    description: "Fast assault unit specialized in eliminating enemies"
                }
            },
            {
                time: 5,
                description: "Blue team deploys a collector",
                action: "spawnBlueAgent",
                agentSpec: {
                    role: "collector",
                    attributes: {
                        speed: 0.6,
                        health: 0.5,
                        attack: 0.2,
                        defense: 0.4,
                        carryCapacity: 0.9
                    },
                    priority: "materials",
                    description: "Resource specialist with high carrying capacity"
                }
            },
            
            // Stage 3: Add some resources
            {
                time: 8,
                description: "New resource deposits discovered",
                action: "addResources",
                resources: [
                    { x: 300, y: 300, type: 'energy' },
                    { x: 320, y: 320, type: 'energy' },
                    { x: 350, y: 280, type: 'materials' },
                    { x: 280, y: 350, type: 'data' }
                ]
            },
            
            // Stage 4: More agents with different roles
            {
                time: 10,
                description: "Red team deploys an explorer",
                action: "spawnRedAgent",
                agentSpec: {
                    role: "explorer",
                    attributes: {
                        speed: 0.9,
                        health: 0.4,
                        attack: 0.3,
                        defense: 0.3,
                        carryCapacity: 0.4
                    },
                    priority: "data",
                    description: "Fast scout that searches for resources and enemy weaknesses"
                }
            },
            {
                time: 12,
                description: "Blue team deploys a defender",
                action: "spawnBlueAgent",
                agentSpec: {
                    role: "defender",
                    attributes: {
                        speed: 0.3,
                        health: 0.9,
                        attack: 0.6,
                        defense: 0.9,
                        carryCapacity: 0.2
                    },
                    priority: "materials",
                    description: "Defensive unit with high health and defense to protect territory"
                }
            },
            
            // Stage 5: Strategy shift based on game state
            {
                time: 18,
                description: "Red team shifts to balanced approach",
                action: "setRedStrategy",
                strategy: {
                    strategy: "balanced",
                    focus: "territory",
                    priorities: ["expand_territory", "collect_energy", "eliminate_enemies"],
                    description: "Balance resource collection with territorial expansion"
                }
            },
            {
                time: 20,
                description: "Blue team becomes more defensive",
                action: "setBlueStrategy",
                strategy: {
                    strategy: "defensive",
                    focus: "territory",
                    priorities: ["defend_base", "collect_materials", "expand_territory"],
                    description: "Protect current territory while building resource reserves"
                }
            },
            
            // Stage 6: More specialized agents
            {
                time: 25,
                description: "Red team deploys a specialized collector",
                action: "spawnRedAgent",
                agentSpec: {
                    role: "collector",
                    attributes: {
                        speed: 0.7,
                        health: 0.6,
                        attack: 0.4,
                        defense: 0.5,
                        carryCapacity: 0.8
                    },
                    priority: "energy",
                    description: "Advanced collector with combat capabilities for contested areas"
                }
            },
            {
                time: 28,
                description: "Blue team deploys an explorer",
                action: "spawnBlueAgent",
                agentSpec: {
                    role: "explorer",
                    attributes: {
                        speed: 0.9,
                        health: 0.4,
                        attack: 0.2,
                        defense: 0.3,
                        carryCapacity: 0.5
                    },
                    priority: "data",
                    description: "Fast scout to find resources and avoid enemy contact"
                }
            },
            
            // Stage 7: Final strategy adjustments
            {
                time: 35,
                description: "Red team goes full offensive",
                action: "setRedStrategy",
                strategy: {
                    strategy: "aggressive",
                    focus: "combat",
                    priorities: ["eliminate_enemies", "expand_territory", "collect_energy"],
                    description: "All-out attack to eliminate opponents and seize territory"
                }
            },
            {
                time: 38,
                description: "Blue team adapts with counter-strategy",
                action: "setBlueStrategy",
                strategy: {
                    strategy: "balanced",
                    focus: "combat",
                    priorities: ["defend_base", "eliminate_enemies", "collect_energy"],
                    description: "Balanced approach to counter red team's aggression"
                }
            },
            
            // Stage 8: Final specialized agents
            {
                time: 42,
                description: "Red team deploys an elite attacker",
                action: "spawnRedAgent",
                agentSpec: {
                    role: "attacker",
                    attributes: {
                        speed: 0.8,
                        health: 0.8,
                        attack: 1.0,
                        defense: 0.6,
                        carryCapacity: 0.1
                    },
                    priority: "energy",
                    description: "Elite combat unit with maximum attack power"
                }
            },
            {
                time: 45,
                description: "Blue team deploys an elite defender",
                action: "spawnBlueAgent",
                agentSpec: {
                    role: "defender",
                    attributes: {
                        speed: 0.4,
                        health: 1.0,
                        attack: 0.7,
                        defense: 1.0,
                        carryCapacity: 0.2
                    },
                    priority: "materials",
                    description: "Elite defensive unit with maximum health and defense"
                }
            }
        ];
    }
}

export default DemoSystem;