/**
 * LLMSystem.js
 * 
 * Core system for managing LLM integration in the game.
 * Coordinates between TeamStrategySystem and SpawnerSystem.
 * Handles backend connection status and UI updates.
 * Optional WebSocket support for real-time updates.
 */

import { LLMService } from './index.js';
import WebSocketClient from './WebSocketClient.js';
import SpawnerSystem from './SpawnerSystem.js';
import TeamStrategySystem from './TeamStrategySystem.js';
import serviceInitializer from './ServiceInitializer.js';

class LLMSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.enabled = true;
        this.llmService = new LLMService();
        
        // Create and register subsystems
        this.teamStrategySystem = new TeamStrategySystem(gameEngine);
        this.spawnerSystem = new SpawnerSystem(gameEngine);
        
        // Register this system for reinitialization
        serviceInitializer.registerService('LLMSystem', this);
        
        // Initialize timers for periodic checks
        this.statusUpdateTimer = 0;
        this.websocketUpdateTimer = 0;
        
        // Initialize backend status UI
        this.initBackendStatusUI();
        
        // Initialize WebSocket client (optional)
        this.websocketEnabled = false;
        this.websocketClient = new WebSocketClient();
        
        // Add key bindings
        window.addEventListener('keydown', (e) => {
            if (e.key === 'b') {
                this.toggleBackendUsage();
            } else if (e.key === 'w') {
                this.toggleWebSocket();
            }
        });
        
        console.log('LLM System initialized');
    }
    
    /**
     * Initialize the LLM system
     */
    initialize() {
        // Register subsystems with game engine
        this.gameEngine.registerSystem('teamStrategy', this.teamStrategySystem);
        this.gameEngine.registerSystem('spawner', this.spawnerSystem);
        
        console.log('LLM subsystems registered with game engine');
    }
    
    /**
     * Update the LLM system
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        if (!this.enabled) return;
        
        // Update subsystems
        this.teamStrategySystem.update(deltaTime);
        this.spawnerSystem.update(deltaTime);
        
        // Periodically update backend status
        this.statusUpdateTimer += deltaTime;
        if (this.statusUpdateTimer > 5) { // Check every 5 seconds
            this.updateBackendStatus();
            this.statusUpdateTimer = 0;
        }
        
        // Send game state via WebSocket if enabled
        if (this.websocketEnabled && this.websocketClient.isConnected) {
            this.websocketUpdateTimer += deltaTime;
            if (this.websocketUpdateTimer > 1) { // Send every second
                const gameState = this.getGameState();
                this.websocketClient.sendGameState(gameState);
                this.websocketUpdateTimer = 0;
            }
        }
    }
    
    /**
     * Enable or disable the LLM system
     * @param {boolean} enabled - Whether the system should be enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`LLM System ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Get the current status of the LLM system
     * @returns {Object} Status information
     */
    getStatus() {
        const apiConfig = window.getAPIConfig ? window.getAPIConfig() : { useMockResponses: true };
        
        return {
            enabled: this.enabled,
            useMockResponses: apiConfig.useMockResponses,
            apiConfigured: this.llmService.isConfigured(),
            requestsInProgress: this.llmService.hasRequestsInProgress(),
            useBackend: this.llmService.useBackend,
            backendConnected: this.llmService.backendClient.isConnected,
            websocketEnabled: this.websocketEnabled,
            websocketConnected: this.websocketClient.isConnected
        };
    }
    
    /**
     * Initialize backend connection status UI
     */
    initBackendStatusUI() {
        // Create status indicator in the debug overlay
        const debugOverlay = document.getElementById('debug-overlay');
        if (!debugOverlay) return;
        
        // Backend status element
        const statusElement = document.createElement('div');
        statusElement.id = 'backend-status';
        statusElement.className = 'status-indicator';
        statusElement.innerHTML = 'Backend: <span class="status-unknown">Unknown</span>';
        debugOverlay.appendChild(statusElement);
        
        // WebSocket status element
        const wsStatusElement = document.createElement('div');
        wsStatusElement.id = 'websocket-status';
        wsStatusElement.className = 'status-indicator';
        wsStatusElement.innerHTML = 'WebSocket: <span class="status-unknown">Disabled</span>';
        debugOverlay.appendChild(wsStatusElement);
        
        // Controls hint
        const controlsElement = document.createElement('div');
        controlsElement.className = 'controls-hint';
        controlsElement.innerHTML = 'Press <b>B</b> to toggle backend, <b>W</b> to toggle WebSocket';
        debugOverlay.appendChild(controlsElement);
        
        // Update status based on LLMService
        this.updateBackendStatus();
    }
    
    /**
     * Update backend connection status UI
     */
    async updateBackendStatus() {
        const statusElement = document.getElementById('backend-status');
        if (!statusElement) return;
        
        const isConnected = await this.llmService.checkBackendConnection();
        const statusSpan = statusElement.querySelector('span');
        
        if (isConnected && this.llmService.useBackend) {
            statusSpan.className = 'status-connected';
            statusSpan.textContent = 'Connected (AIQToolkit)';
        } else if (this.llmService.useBackend) {
            statusSpan.className = 'status-disconnected';
            statusSpan.textContent = 'Disconnected (Fallback)';
        } else if (this.llmService.apiKey) {
            statusSpan.className = 'status-fallback';
            statusSpan.textContent = 'Disabled (Direct LLM)';
        } else {
            statusSpan.className = 'status-mock';
            statusSpan.textContent = 'Mock Mode';
        }
        
        // If WebSocket status element exists, update it
        const wsStatusElement = document.getElementById('websocket-status');
        if (wsStatusElement) {
            const wsStatusSpan = wsStatusElement.querySelector('span');
            if (this.websocketEnabled && this.websocketClient.isConnected) {
                wsStatusSpan.className = 'status-connected';
                wsStatusSpan.textContent = 'Connected';
            } else if (this.websocketEnabled) {
                wsStatusSpan.className = 'status-disconnected';
                wsStatusSpan.textContent = 'Connecting...';
            } else {
                wsStatusSpan.className = 'status-unknown';
                wsStatusSpan.textContent = 'Disabled';
            }
        }
    }
    
    /**
     * Toggle backend usage
     */
    toggleBackendUsage() {
        this.llmService.useBackend = !this.llmService.useBackend;
        console.log(`Backend usage: ${this.llmService.useBackend ? 'Enabled' : 'Disabled'}`);
        this.updateBackendStatus();
    }
    
    /**
     * Toggle WebSocket connection
     */
    toggleWebSocket() {
        this.websocketEnabled = !this.websocketEnabled;
        
        if (this.websocketEnabled) {
            this.websocketClient.connect();
            
            // Register handlers for strategic directives
            this.websocketClient.registerHandler('directive', (data) => {
                console.log('Received strategic directive:', data);
                if (data.team === 'red' || data.team === 'team1') {
                    this.teamStrategySystem.setTeamStrategy('red', data.strategy);
                } else if (data.team === 'blue' || data.team === 'team2') {
                    this.teamStrategySystem.setTeamStrategy('blue', data.strategy);
                }
            });
            
            // Register handlers for agent recommendations
            this.websocketClient.registerHandler('agent_recommendation', (data) => {
                console.log('Received agent recommendation:', data);
                if (data.team === 'red' || data.team === 'team1') {
                    this.spawnerSystem.requestAgentSpecification('red', data.specification);
                } else if (data.team === 'blue' || data.team === 'team2') {
                    this.spawnerSystem.requestAgentSpecification('blue', data.specification);
                }
            });
        } else {
            this.websocketClient.disconnect();
        }
        
        console.log(`WebSocket: ${this.websocketEnabled ? 'Enabled' : 'Disabled'}`);
        this.updateBackendStatus();
    }
    
    /**
     * Get current game state for WebSocket communication
     * @returns {Object} Simplified game state for WebSocket
     */
    getGameState() {
        // Reuse the TeamStrategySystem's game state function
        return this.teamStrategySystem.getGameState();
    }
    
    /**
     * Request a new team strategy for a specific team
     * @param {string} teamId - ID of the team
     */
    requestTeamStrategy(teamId) {
        if (!this.enabled) return;
        this.teamStrategySystem.requestTeamStrategy(teamId);
    }
    
    /**
     * Request a new agent for a specific team
     * @param {string} teamId - ID of the team
     */
    requestAgent(teamId) {
        if (!this.enabled) return;
        this.spawnerSystem.requestAgentSpecification(teamId);
    }
}

export default LLMSystem;