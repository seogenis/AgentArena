/**
 * LLMService.js
 * 
 * Handles API communication with the LLM provider and the AIQToolkit Python backend.
 * Sends prompts and receives responses for team strategy and agent generation.
 */

import { parseLLMResponse, parseTeamStrategy, parseAgentSpecification } from './LLMSchemas.js';
import serviceInitializer from './ServiceInitializer.js';
import BackendAPIClient from './BackendAPIClient.js';

class LLMService {
    constructor() {
        const env = typeof window !== 'undefined' ? (window.process?.env || {}) : (process?.env || {});
        this.apiEndpoint = env.LLM_API_ENDPOINT || "https://api.openai.com/v1/chat/completions";
        this.apiKey = env.LLM_API_KEY || window.OPENAI_API_KEY || localStorage.getItem('OPENAI_API_KEY') || "";
        this.modelName = env.LLM_MODEL_NAME || "gpt-4.1-mini";
        this.requestsInProgress = 0;
        this.useMockResponses = env.USE_MOCK_RESPONSES !== "false";
        
        // Initialize backend client
        this.useBackend = true;
        this.backendClient = new BackendAPIClient();
        this.backendClient.startConnectionChecks();
        
        // Register with service initializer
        if (typeof serviceInitializer !== 'undefined') {
            serviceInitializer.registerService('LLMService', this);
        }
        
        console.log(`LLM Service initialized with: ${this.useMockResponses ? 'MOCK MODE' : 'API MODE'}`);
    }

    /**
     * Check if API is configured properly
     * @returns {boolean} Whether the API is properly configured
     */
    isConfigured() {
        return this.apiKey && this.apiEndpoint;
    }

    /**
     * Enable mock responses for testing without API
     */
    enableMockResponses() {
        this.useMockResponses = true;
    }

    /**
     * Check if backend is connected
     * @returns {Promise<boolean>} Whether the backend is connected
     */
    async checkBackendConnection() {
        const isConnected = await this.backendClient.checkConnection();
        console.log(`Backend connection: ${isConnected ? 'Connected' : 'Disconnected'}`);
        return isConnected;
    }

    /**
     * Generate team strategy
     * @param {string} teamId - The team ID
     * @param {object} gameState - The current game state
     * @returns {Promise<object>} - The team strategy
     */
    async generateTeamStrategy(teamId, gameState) {
        try {
            // Try to use backend if available
            if (this.useBackend) {
                try {
                    if (await this.backendClient.checkConnection()) {
                        console.log(`Requesting team strategy from backend for ${teamId} team`);
                        return await this.backendClient.requestTeamStrategy(teamId, gameState);
                    } else {
                        console.warn('Backend disconnected, falling back to direct LLM');
                    }
                } catch (error) {
                    console.warn('Backend strategy generation failed, falling back to direct LLM:', error);
                }
            }
            
            // Fallback to direct LLM call
            if (this.apiKey) {
                const prompt = `Generate team strategy for ${teamId} team`;
                return await this.getCompletion(prompt, { 
                    timeout: 5000,
                    promptType: 'strategy'
                });
            } else {
                // Fallback to mock response if no API key
                return this.getMockResponse(`Generate team strategy for ${teamId} team`, { promptType: 'strategy' });
            }
        } catch (error) {
            console.error('Strategy generation error:', error);
            return this.mockTeamStrategy(teamId, gameState);
        }
    }

    /**
     * Generate agent specification
     * @param {string} teamId - The team ID
     * @param {object} strategy - The team strategy
     * @param {object} resources - Available resources
     * @param {object} teamComposition - Current team composition
     * @returns {Promise<object>} - The agent specification
     */
    async generateAgentSpecification(teamId, strategy, resources, teamComposition) {
        try {
            // Try to use backend if available
            if (this.useBackend) {
                try {
                    if (await this.backendClient.checkConnection()) {
                        console.log(`Requesting agent specification from backend for ${teamId} team`);
                        
                        // Convert team composition to format expected by backend
                        const currentAgents = [];
                        const agentsByType = {};
                        
                        // Count agents by type from the teamComposition object
                        for (const agent of teamComposition) {
                            const role = agent.role || 'unknown';
                            agentsByType[role] = (agentsByType[role] || 0) + 1;
                        }
                        
                        // Convert to array of {type, count} objects for backend
                        for (const [type, count] of Object.entries(agentsByType)) {
                            currentAgents.push({ type, count });
                        }
                        
                        return await this.backendClient.requestAgentSpecification(
                            teamId, strategy, resources, currentAgents
                        );
                    } else {
                        console.warn('Backend disconnected, falling back to direct LLM');
                    }
                } catch (error) {
                    console.warn('Backend agent generation failed, falling back to direct LLM:', error);
                }
            }
            
            // Fallback to direct LLM call
            if (this.apiKey) {
                const prompt = `Generate agent specification for ${teamId} team`;
                return await this.getCompletion(prompt, { 
                    timeout: 5000,
                    promptType: 'agent'
                });
            } else {
                // Fallback to mock response if no API key
                return this.getMockResponse(`Generate agent specification for ${teamId} team`, { promptType: 'agent' });
            }
        } catch (error) {
            console.error('Agent generation error:', error);
            return this.mockAgentSpecification(teamId, strategy);
        }
    }

    /**
     * Send a prompt to the LLM API and get a response
     * @param {string} prompt - The prompt to send to the LLM
     * @param {Object} options - Additional options
     * @returns {Promise<string>} The LLM response
     */
    async getCompletion(prompt, options = {}) {
        if (this.useMockResponses) {
            return this.getMockResponse(prompt, options);
        }

        if (!this.isConfigured()) {
            console.warn("LLM API not configured. Using fallback behavior.");
            return this.getFallbackResponse(prompt, options);
        }

        try {
            this.requestsInProgress++;
            
            // Set a timeout to prevent hanging requests
            const timeoutMs = options.timeout || 5000;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            
            // Simple fetch implementation - replace with specific API client as needed
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.modelName,
                    messages: [{role: "user", content: prompt}],
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 500
                }),
                signal: controller.signal
            });
            
            // Clear timeout since we got a response
            clearTimeout(timeoutId);
            
            // Check if response was successful
            if (!response.ok) {
                throw new Error(`API returned ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Validate response structure
            if (!data || !data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
                throw new Error('Invalid API response structure');
            }
            
            const responseText = data.choices[0].message.content;
            
            // Parse response using schema validation
            const parsedResponse = parseLLMResponse(prompt, responseText, options);
            
            if (parsedResponse) {
                console.log('✅ Successfully parsed LLM response with schema validation');
                return JSON.stringify(parsedResponse);
            } else {
                console.warn('⚠️ Failed to parse LLM response, returning raw response');
                return responseText;
            }
        } catch (error) {
            console.error("Error calling LLM API:", error);
            return this.getFallbackResponse(prompt, options);
        } finally {
            this.requestsInProgress--;
        }
    }

    /**
     * Get a mock response for testing without API calls
     * @param {string} prompt - The prompt sent
     * @param {Object} options - Options for the mock response
     * @returns {Promise<string>} A mock response
     */
    async getMockResponse(prompt, options) {
        // Wait a short time to simulate API latency
        await new Promise(resolve => setTimeout(resolve, 300));

        // Log that we're using a mock response
        console.log('📝 Using mock LLM response (API not configured)');
        
        try {
            // Improved prompt type detection
            const promptType = this.detectPromptType(prompt, options);
                
            if (promptType === 'strategy' || prompt.includes('team strategy')) {
                // Provide varied strategies to make gameplay more interesting
                const strategies = [
                    {
                        strategy: "balanced",
                        focus: "resources",
                        priorities: ["collect_energy", "expand_territory", "defend_base"],
                        description: "Focus on gathering energy resources while maintaining a defensive posture."
                    },
                    {
                        strategy: "aggressive",
                        focus: "combat",
                        priorities: ["attack_enemies", "collect_energy", "expand_territory"],
                        description: "Aggressively target enemy agents while securing territory."
                    },
                    {
                        strategy: "economic",
                        focus: "resources",
                        priorities: ["collect_materials", "collect_data", "collect_energy"],
                        description: "Focus on resource collection and efficiency."
                    },
                    {
                        strategy: "defensive",
                        focus: "territory",
                        priorities: ["defend_territory", "defend_base", "collect_materials"],
                        description: "Protect existing territory while building up resources."
                    }
                ];
                
                // Log successful mock strategy response
                console.log('📊 Generated mock team strategy response');
                return JSON.stringify(strategies[Math.floor(Math.random() * strategies.length)]);
            } else if (promptType === 'agent' || prompt.includes('agent specification')) {
                // More varied agent types
                const agentTypes = [
                    {
                        role: "collector",
                        attributes: {
                            speed: 0.8,
                            health: 0.6,
                            attack: 0.3,
                            defense: 0.5,
                            carryCapacity: 0.9
                        },
                        priority: "energy",
                        description: "Fast energy collector with decent survivability"
                    },
                    {
                        role: "explorer",
                        attributes: {
                            speed: 0.9,
                            health: 0.5,
                            attack: 0.4,
                            defense: 0.3,
                            carryCapacity: 0.3
                        },
                        priority: "data",
                        description: "Fast-moving scout prioritizing data collection"
                    },
                    {
                        role: "defender",
                        attributes: {
                            speed: 0.4,
                            health: 0.9,
                            attack: 0.6,
                            defense: 0.9,
                            carryCapacity: 0.2
                        },
                        priority: "materials",
                        description: "Sturdy defender that guards territory and bases"
                    },
                    {
                        role: "attacker",
                        attributes: {
                            speed: 0.7,
                            health: 0.6,
                            attack: 0.9,
                            defense: 0.4,
                            carryCapacity: 0.1
                        },
                        priority: "energy",
                        description: "Specialized combat unit for engaging enemy agents"
                    }
                ];
                
                // Log successful mock agent response
                console.log('🤖 Generated mock agent specification response');
                return JSON.stringify(agentTypes[Math.floor(Math.random() * agentTypes.length)]);
            } else {
                // Log the prompt for debugging
                console.log('❌ Unknown prompt type, defaulting to team strategy. First 100 chars:', prompt.substring(0, 100) + '...');
                
                // Default to balanced strategy if we can't identify the prompt type
                return JSON.stringify({
                    strategy: "balanced",
                    focus: "resources",
                    priorities: ["collect_energy", "expand_territory", "defend_base"],
                    description: "Default balanced strategy (fallback)."
                });
            }
            
        } catch (error) {
            console.error("Error generating mock response:", error);
            return JSON.stringify({
                error: "Mock response generation failed",
                fallback: true
            });
        }
    }

    /**
     * Get a fallback response when API is unavailable
     * @param {string} prompt - The prompt sent
     * @param {Object} options - Options for the fallback
     * @returns {string} A fallback response
     */
    getFallbackResponse(prompt, options) {
        // Use improved prompt type detection
        const promptType = this.detectPromptType(prompt, options);
        
        if (promptType === 'strategy' || prompt.includes('team strategy')) {
            console.log('📊 Using fallback team strategy response');
            return JSON.stringify({
                strategy: "balanced",
                focus: "resources",
                priorities: ["collect_energy", "expand_territory", "defend_base"],
                description: "Balanced approach focusing on resource collection."
            });
        } else if (promptType === 'agent' || prompt.includes('agent specification')) {
            const roles = ["collector", "explorer", "defender", "attacker"];
            const role = roles[Math.floor(Math.random() * roles.length)];
            
            console.log('🤖 Using fallback agent specification response');
            return JSON.stringify({
                role: role,
                attributes: {
                    speed: Math.random() * 0.5 + 0.5,
                    health: Math.random() * 0.5 + 0.5,
                    attack: Math.random() * 0.5 + 0.5,
                    defense: Math.random() * 0.5 + 0.5,
                    carryCapacity: Math.random() * 0.5 + 0.5
                },
                priority: ["energy", "materials", "data"][Math.floor(Math.random() * 3)],
                description: `Standard ${role} with balanced attributes`
            });
        } else {
            console.log('❓ Unknown prompt type in fallback, defaulting to team strategy');
            return JSON.stringify({
                strategy: "balanced",
                focus: "resources",
                priorities: ["collect_energy", "expand_territory", "defend_base"],
                description: "Default balanced strategy (fallback)."
            });
        }
    }

    /**
     * Check if there are requests currently in progress
     * @returns {boolean} Whether requests are in progress
     */
    hasRequestsInProgress() {
        return this.requestsInProgress > 0;
    }


    /**
     * Detect the type of prompt being sent
     * @param {string} prompt - The prompt to analyze
     * @param {Object} options - Additional options
     * @returns {string} The detected prompt type ('strategy', 'agent', or 'unknown')
     */
    detectPromptType(prompt, options = {}) {
        // If explicitly provided in options, use that
        if (options.promptType) {
            return options.promptType;
        }
        
        // Check for explicit indicators in the prompt
        if (prompt.includes('agent specification') || 
            prompt.includes('create an agent') || 
            prompt.includes('design an agent') ||
            prompt.includes('generate agent')) {
            return 'agent';
        }
        
        if (prompt.includes('team strategy') || 
            prompt.includes('develop a strategy') || 
            prompt.includes('create a strategy') ||
            prompt.includes('generate strategy')) {
            return 'strategy';
        }
        
        // More generic checks as fallback
        if (prompt.includes('agent') && 
            (prompt.includes('attributes') || prompt.includes('role') || prompt.includes('specification'))) {
            return 'agent';
        }
        
        if (prompt.includes('strategy') && 
            (prompt.includes('focus') || prompt.includes('priorities') || prompt.includes('team'))) {
            return 'strategy';
        }
        
        // Final fallback - check for common keywords
        if (prompt.includes('role') && prompt.includes('attributes')) {
            return 'agent';
        }
        
        if (prompt.includes('priorities') && prompt.includes('focus')) {
            return 'strategy';
        }
        
        console.warn('⚠️ Could not confidently determine prompt type:', prompt.substring(0, 100) + '...');
        return 'unknown';
    }
}

export default LLMService;