import { HexGrid } from '../grid/HexGrid.js';
import { ResourceSystem } from '../resources/ResourceSystem.js';
import { ObstacleSystem } from '../obstacles/ObstacleSystem.js';
import { BaseSystem } from '../bases/BaseSystem.js';
import { AgentSystem } from '../agents/AgentSystem.js';
import { CollisionSystem } from '../utils/CollisionSystem.js';
import { CombatSystem } from '../utils/CombatSystem.js';
import { LLMAgentPilot } from '../llm/LLMAgentPilot.js';

export class WorldSystem {
    constructor(width, height, hexSize = 40, renderSystem) {
        // Create the hex grid
        this.hexGrid = new HexGrid(width, height, hexSize);
        
        // Store reference to render system
        this.renderSystem = renderSystem;
        
        // Create subsystems
        this.resourceSystem = new ResourceSystem(this.hexGrid);
        this.obstacleSystem = new ObstacleSystem(this.hexGrid);
        this.baseSystem = new BaseSystem(this.hexGrid, this.renderSystem);
        this.collisionSystem = new CollisionSystem(this.hexGrid);
        this.combatSystem = new CombatSystem(this.renderSystem);
        
        // Initialize the world
        this.initialize();
        
        // Agent system must be initialized after baseSystem
        this.agentSystem = new AgentSystem(
            this.hexGrid, 
            this.renderSystem, 
            this.baseSystem,
            this.collisionSystem
        );
        this.agentSystem.initialize();
        
        // Initialize LLM agent pilot system
        this.llmAgentPilot = new LLMAgentPilot(this, {
            llm: {
                mockMode: true // Use mock mode for testing
            },
            decisionInterval: 3000 // 3 seconds between decisions
        });
        
        // Connect the agent system to the LLM pilot
        this.agentSystem.setLLMPilot(this.llmAgentPilot);
        
        // Victory conditions
        this.gameOver = false;
        this.winner = null;
        this.victoryThreshold = 0.75; // 75% territory control for victory
        this.victoryTimer = 0;
        this.victoryTimerThreshold = 15; // 15 seconds of maintaining control
        
        // LLM control flags
        this.llmControlEnabled = false;
    }
    
    initialize() {
        // Generate obstacles
        this.obstacleSystem.generateObstacles(15);
        
        // Create bases instead of random territory control
        this.baseSystem.initialize();
        
        // Spawn initial resources
        this.resourceSystem.initialResourceSpawn(20);
    }
    
    update(deltaTime, timestamp) {
        // Skip updates if game is over
        if (this.gameOver) return;
        
        // Update resources (handle spawning)
        this.resourceSystem.update(deltaTime, timestamp);
        
        // Update bases
        this.baseSystem.update(deltaTime);
        
        // Update combat system
        this.combatSystem.update(deltaTime);
        
        // Update agents
        this.agentSystem.update(deltaTime);
        
        // Update LLM agent pilot system
        if (this.llmControlEnabled && this.llmAgentPilot) {
            this.llmAgentPilot.update(deltaTime, timestamp);
        }
        
        // Update territory control from agent positions
        this.agentSystem.updateTerritoryControl(deltaTime);
        
        // Check victory conditions
        this.checkVictoryConditions(deltaTime);
    }
    
    // Toggle LLM control for agents
    toggleLLMControl() {
        this.llmControlEnabled = !this.llmControlEnabled;
        this.agentSystem.setLLMControlEnabled(this.llmControlEnabled);
        
        return this.llmControlEnabled;
    }
    
    // Create an LLM-controlled agent
    createLLMAgent(teamId, type = 'collector') {
        return this.agentSystem.createLLMAgent(teamId, type);
    }
    
    // Convert existing agents to LLM control
    convertAgentsToLLM(count = 1, teamId = null) {
        return this.agentSystem.convertAgentsToLLM(count, teamId);
    }
    
    // Get LLM performance statistics
    getLLMPerformanceStats() {
        if (this.llmAgentPilot) {
            return this.llmAgentPilot.getPerformanceStats();
        }
        return null;
    }
    
    checkVictoryConditions(deltaTime) {
        // Get current territory control
        const info = this.getDebugInfo();
        const totalCells = info.totalCells;
        const team1Control = info.territory.team1 / totalCells;
        const team2Control = info.territory.team2 / totalCells;
        
        // Check if any team exceeds the threshold
        let potentialWinner = null;
        if (team1Control >= this.victoryThreshold) {
            potentialWinner = 1;
        } else if (team2Control >= this.victoryThreshold) {
            potentialWinner = 2;
        }
        
        // If there's a potential winner, increment the timer
        if (potentialWinner !== null) {
            if (this.winner === potentialWinner) {
                this.victoryTimer += deltaTime;
                
                if (this.victoryTimer >= this.victoryTimerThreshold) {
                    this.gameOver = true;
                    console.log(`Team ${potentialWinner} has won the game!`);
                    
                    // Could trigger victory effects or endgame screen here
                }
            } else {
                this.winner = potentialWinner;
                this.victoryTimer = 0;
            }
        } else {
            this.winner = null;
            this.victoryTimer = 0;
        }
        
        // Also check agent elimination victory
        const team1Agents = this.agentSystem.getAgentsByTeam(1).length;
        const team2Agents = this.agentSystem.getAgentsByTeam(2).length;
        
        if (team1Agents === 0 && team2Agents > 0) {
            this.gameOver = true;
            this.winner = 2;
            console.log("Team 2 has won by eliminating all enemies!");
        } else if (team2Agents === 0 && team1Agents > 0) {
            this.gameOver = true;
            this.winner = 1;
            console.log("Team 1 has won by eliminating all enemies!");
        }
        
        // Check resource domination victory
        const team1Resources = this.getTotalResources(1);
        const team2Resources = this.getTotalResources(2);
        
        if (team1Resources >= team2Resources * 10 && team1Resources > 50) {
            this.gameOver = true;
            this.winner = 1;
            console.log("Team 1 has won by resource domination!");
        } else if (team2Resources >= team1Resources * 10 && team2Resources > 50) {
            this.gameOver = true;
            this.winner = 2;
            console.log("Team 2 has won by resource domination!");
        }
    }
    
    getTotalResources(teamId) {
        const resources = this.baseSystem.getResources(teamId);
        return resources.energy + resources.materials + resources.data;
    }
    
    render(ctx) {
        // Render the hex grid (will include territory, obstacles, and resources)
        this.hexGrid.render(ctx);
        
        // Additional rendering for components not handled by the render system
        // (Agents and bases are already in the render system)
        
        // Render victory message if game is over
        if (this.gameOver && this.winner) {
            // Set up text style
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw semi-transparent background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.hexGrid.width, this.hexGrid.height);
            
            // Draw victory message
            const winnerColor = this.winner === 1 ? '#ff5555' : '#5555ff';
            const teamName = this.winner === 1 ? 'Red Team' : 'Blue Team';
            
            ctx.fillStyle = winnerColor;
            ctx.fillText(
                `${teamName} Victory!`, 
                this.hexGrid.width / 2, 
                this.hexGrid.height / 2 - 20
            );
            
            ctx.font = '24px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(
                'Press R to restart the game', 
                this.hexGrid.width / 2, 
                this.hexGrid.height / 2 + 30
            );
        }
    }
    
    resetGame() {
        // Reset game state
        this.gameOver = false;
        this.winner = null;
        this.victoryTimer = 0;
        
        // Clear existing entities
        this.clearEntities();
        
        // Reinitialize the world
        this.initialize();
        
        // Reinitialize agent system
        this.agentSystem.initialize();
    }
    
    clearEntities() {
        // Remove all agents
        for (const agent of [...this.agentSystem.agents]) {
            this.agentSystem.removeAgent(agent);
        }
        
        // Clear hex grid cells
        for (const cell of this.hexGrid.cells) {
            cell.resourceType = null;
            cell.resourceAmount = 0;
            cell.hasObstacle = false;
            cell.controlLevel = 0;
        }
        
        // Reset base resources
        for (let i = 1; i <= 2; i++) {
            const resources = this.baseSystem.getResources(i);
            resources.energy = 0;
            resources.materials = 0;
            resources.data = 0;
        }
    }
    
    // Add some interaction capabilities
    addControlToCell(x, y, team, amount = 0.1) {
        const cell = this.hexGrid.getCellAtPosition(x, y);
        if (cell && !cell.hasObstacle) {
            // Team 1 is negative values, Team 2 is positive
            const modifier = team === 1 ? -amount : amount;
            
            // Update control level, keeping it within -1 to 1 range
            cell.controlLevel = Math.max(-1, Math.min(1, cell.controlLevel + modifier));
            return true;
        }
        return false;
    }
    
    addObstacleAt(x, y) {
        const cell = this.hexGrid.getCellAtPosition(x, y);
        if (cell && !cell.hasObstacle && !cell.resourceType) {
            cell.hasObstacle = true;
            return true;
        }
        return false;
    }
    
    addResourceAt(x, y, type, amount = 3) {
        const cell = this.hexGrid.getCellAtPosition(x, y);
        if (cell && !cell.hasObstacle && !cell.resourceType) {
            cell.resourceType = type;
            cell.resourceAmount = amount;
            return true;
        }
        return false;
    }
    
    collectResourceAt(x, y) {
        const cell = this.hexGrid.getCellAtPosition(x, y);
        if (cell) {
            return this.resourceSystem.removeResource(cell);
        }
        return false;
    }
    
    createAgent(teamId, type = 'collector') {
        return this.agentSystem.createAgent(teamId, type);
    }
    
    // Interface to the combat system for adding effects
    createHitEffect(x, y, teamId) {
        return this.combatSystem.createHitEffect(x, y, teamId);
    }
    
    createDeathEffect(x, y, teamId) {
        return this.combatSystem.createDeathEffect(x, y, teamId);
    }
    
    // Toggle combat system
    toggleCombat() {
        this.agentSystem.combatEnabled = !this.agentSystem.combatEnabled;
        return this.agentSystem.combatEnabled;
    }
    
    // Add debug information for overlay
    getDebugInfo() {
        const resourceCounts = {
            energy: 0,
            materials: 0,
            data: 0
        };
        
        let controlledByTeam1 = 0;
        let controlledByTeam2 = 0;
        let obstacleCount = 0;
        
        for (const cell of this.hexGrid.cells) {
            if (cell.resourceType) {
                resourceCounts[cell.resourceType]++;
            }
            
            if (cell.controlLevel < -0.2) {
                controlledByTeam1++;
            } else if (cell.controlLevel > 0.2) {
                controlledByTeam2++;
            }
            
            if (cell.hasObstacle) {
                obstacleCount++;
            }
        }
        
        // Get base resources
        const team1Resources = this.baseSystem.getResources(1);
        const team2Resources = this.baseSystem.getResources(2);
        
        // Get agent counts
        const allTeam1Agents = this.agentSystem.getAgentsByTeam(1);
        const allTeam2Agents = this.agentSystem.getAgentsByTeam(2);
        
        const team1Agents = allTeam1Agents.length;
        const team2Agents = allTeam2Agents.length;
        
        // Count LLM-controlled agents
        const llmTeam1Agents = allTeam1Agents.filter(a => a.controlMode === Agent.CONTROL_MODE.LLM).length;
        const llmTeam2Agents = allTeam2Agents.filter(a => a.controlMode === Agent.CONTROL_MODE.LLM).length;
        
        // Get LLM stats if available
        const llmStats = this.llmAgentPilot ? this.llmAgentPilot.getPerformanceStats() : null;
        
        return {
            resources: resourceCounts,
            territory: {
                team1: controlledByTeam1,
                team2: controlledByTeam2
            },
            teamResources: {
                team1: team1Resources,
                team2: team2Resources
            },
            agents: {
                team1: team1Agents,
                team2: team2Agents,
                llmTeam1: llmTeam1Agents,
                llmTeam2: llmTeam2Agents
            },
            obstacles: obstacleCount,
            totalCells: this.hexGrid.cells.length,
            llmEnabled: this.llmControlEnabled,
            llmStats: llmStats
        };
    }
}