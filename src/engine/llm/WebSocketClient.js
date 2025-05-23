/**
 * WebSocketClient.js
 * 
 * Client for WebSocket communication with the Python backend
 * Handles real-time updates and directives
 */

class WebSocketClient {
    constructor(url = 'ws://localhost:8000/ws') {
        this.url = url;
        this.socket = null;
        this.isConnected = false;
        this.clientId = this.generateClientId();
        this.messageHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        // Adjust URL for Docker environments at initialization
        if (window.location.hostname !== 'localhost' && this.url.includes('localhost')) {
            const newHost = window.location.hostname;
            this.url = this.url.replace('localhost', newHost);
            console.log('Adjusted WebSocket URL for Docker during initialization:', this.url);
        }
    }

    /**
     * Generate a unique client ID
     * @returns {string} Unique client ID
     */
    generateClientId() {
        return 'client_' + Math.random().toString(36).substring(2, 9);
    }

    /**
     * Connect to the WebSocket server
     */
    connect() {
        if (this.socket) {
            this.disconnect();
        }

        try {
            // Check for Docker-compatible URL when running in containers
            let wsUrl = this.url;
            if (window.location.hostname === 'localhost' && wsUrl.includes('localhost')) {
                // We're in local development, URL is fine
                console.log('Using localhost WebSocket URL:', wsUrl);
            } else if (window.location.hostname !== 'localhost' && wsUrl.includes('localhost')) {
                // We might be in Docker - adjust WebSocket URL to match current hostname
                const newHost = window.location.hostname;
                wsUrl = wsUrl.replace('localhost', newHost);
                console.log('Adjusted WebSocket URL for Docker:', wsUrl);
            }
            
            this.socket = new WebSocket(`${wsUrl}/${this.clientId}`);
            console.log(`WebSocket connecting to: ${wsUrl}/${this.clientId}`);
            
            this.socket.onopen = () => {
                console.log('WebSocket connected successfully');
                this.isConnected = true;
                this.reconnectAttempts = 0;
            };
            
            this.socket.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                this.attemptReconnect();
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnected = false;
            };
            
            this.socket.onmessage = (event) => {
                this.handleMessage(event.data);
            };
        } catch (error) {
            console.error('WebSocket connection error:', error);
        }
    }

    /**
     * Attempt to reconnect to the WebSocket server
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn('Max reconnect attempts reached, giving up');
            return;
        }
        
        this.reconnectAttempts++;
        const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
        
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
        setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * Disconnect from the WebSocket server
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
        }
    }

    /**
     * Send game state to the server
     * @param {object} gameState - The current game state
     */
    sendGameState(gameState) {
        if (!this.isConnected) {
            return;
        }
        
        try {
            const message = {
                type: 'gameState',
                data: gameState
            };
            
            this.socket.send(JSON.stringify(message));
        } catch (error) {
            console.error('Error sending game state:', error);
        }
    }

    /**
     * Register a message handler
     * @param {string} type - Message type to handle
     * @param {function} handler - Handler function
     */
    registerHandler(type, handler) {
        this.messageHandlers.set(type, handler);
    }

    /**
     * Handle incoming messages
     * @param {string} data - Message data
     */
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            const handler = this.messageHandlers.get(message.type);
            
            if (handler) {
                handler(message.data);
            } else {
                console.warn('No handler for message type:', message.type);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }
}

export default WebSocketClient;