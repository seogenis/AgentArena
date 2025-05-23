/**
 * BackendAPIClient.js
 * 
 * Client for communicating with the Python backend API
 * that uses NVIDIA's AIQToolkit for enhanced agent coordination.
 */

class BackendAPIClient {
    constructor() {
        // Default to localhost during development
        this.baseUrl = 'http://localhost:8000/api';
        this.isConnected = false;
        this.connectionCheckInterval = null;
        
        // Check connection on initialization
        this.checkConnection();
    }

    /**
     * Set the base URL for the API
     * @param {string} url - The base URL for the API
     */
    setBaseUrl(url) {
        this.baseUrl = url;
    }

    /**
     * Check if the backend is available
     * @returns {Promise<boolean>} - True if connected, false otherwise
     */
    async checkConnection() {
        try {
            const response = await fetch(`${this.baseUrl.split('/api')[0]}`);
            const wasConnected = this.isConnected;
            this.isConnected = response.ok;
            
            // Log status change for the demo
            if (this.isConnected && !wasConnected) {
                console.log('🌐 Connected to AIQToolkit backend');
            } else if (!this.isConnected && wasConnected) {
                console.log('🌐 Lost connection to AIQToolkit backend, using fallbacks');
            }
            
            return this.isConnected;
        } catch (error) {
            console.warn('Backend connection check failed:', error);
            this.isConnected = false;
            return false;
        }
    }

    /**
     * Start periodic connection checks
     * @param {number} interval - Check interval in milliseconds
     */
    startConnectionChecks(interval = 30000) {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
        }
        
        this.connectionCheckInterval = setInterval(() => {
            this.checkConnection();
        }, interval);
    }

    /**
     * Stop periodic connection checks
     */
    stopConnectionChecks() {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
            this.connectionCheckInterval = null;
        }
    }

    /**
     * Request team strategy from the backend
     * @param {string} teamId - The team ID
     * @param {object} gameState - The current game state
     * @returns {Promise<object>} - The team strategy
     */
    async requestTeamStrategy(teamId, gameState) {
        if (!this.isConnected) {
            throw new Error('Backend not connected');
        }

        try {
            const response = await fetch(`${this.baseUrl}/team-strategy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    team_id: teamId,
                    territory_control: gameState.territoryControl,
                    resources: gameState.resources,
                    agents: gameState.agents,
                    resource_distribution: gameState.resourcesOnMap
                })
            });
            
            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Strategy API error:', error);
            throw error;
        }
    }

    /**
     * Request agent specification from the backend
     * @param {string} teamId - The team ID
     * @param {object} strategy - The team strategy
     * @param {object} resources - Available resources
     * @param {array} currentAgents - Current agent composition
     * @returns {Promise<object>} - The agent specification
     */
    async requestAgentSpecification(teamId, strategy, resources, currentAgents) {
        if (!this.isConnected) {
            throw new Error('Backend not connected');
        }

        try {
            const response = await fetch(`${this.baseUrl}/agent-specification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    team_id: teamId,
                    strategy: strategy,
                    resources: resources,
                    current_agents: currentAgents
                })
            });
            
            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Agent API error:', error);
            throw error;
        }
    }
}

export default BackendAPIClient;