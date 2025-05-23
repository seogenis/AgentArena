/**
 * LLMService.js
 * 
 * Handles API communication with the LLM provider.
 * Sends prompts and receives responses for team strategy and agent generation.
 */

class LLMService {
    constructor() {
        this.apiEndpoint = process.env.LLM_API_ENDPOINT || "";
        this.apiKey = process.env.LLM_API_KEY || "";
        this.modelName = process.env.LLM_MODEL_NAME || "gpt-3.5-turbo";
        this.requestsInProgress = 0;
        this.useMockResponses = process.env.USE_MOCK_RESPONSES === "true" || false;
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
            
            return data.choices[0].message.content;
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
            if (prompt.includes('team strategy')) {
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
                
                return JSON.stringify(strategies[Math.floor(Math.random() * strategies.length)]);
            } else if (prompt.includes('agent specification')) {
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
                
                return JSON.stringify(agentTypes[Math.floor(Math.random() * agentTypes.length)]);
            } else {
                return JSON.stringify({
                    error: "Unknown prompt type",
                    message: "I'm not sure how to respond to that prompt."
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
        if (prompt.includes('team strategy')) {
            return JSON.stringify({
                strategy: "balanced",
                focus: "resources",
                priorities: ["collect_energy", "expand_territory", "defend_base"],
                description: "Balanced approach focusing on resource collection."
            });
        } else if (prompt.includes('agent specification')) {
            const roles = ["collector", "explorer", "defender", "attacker"];
            const role = roles[Math.floor(Math.random() * roles.length)];
            
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
            return "Fallback response: unable to process request.";
        }
    }

    /**
     * Check if there are requests currently in progress
     * @returns {boolean} Whether requests are in progress
     */
    hasRequestsInProgress() {
        return this.requestsInProgress > 0;
    }
}

export default LLMService;