export class LLMSystem {
    constructor(options = {}) {
        // Configuration options
        this.apiEndpoint = options.apiEndpoint || 'https://api.openai.com/v1/chat/completions';
        
        // Get API key from options, environment variable, or window.OPENAI_API_KEY
        this.apiKey = options.apiKey || 
                     (typeof process !== 'undefined' && process.env ? process.env.OPENAI_API_KEY : null) || 
                     (typeof window !== 'undefined' ? window.OPENAI_API_KEY : null) || 
                     '';
                     
        this.model = options.model || 'gpt-4.1-mini'; // Set default model to gpt-4.1-mini
        
        // Rate limiting and performance management
        this.maxRequestsPerMinute = options.maxRequestsPerMinute || 2000; // Limit to 500 requests per minute
        this.requestCount = 0;
        this.requestResetTime = Date.now() + 60000;
        
        // Request queue for managing concurrent requests
        this.requestQueue = [];
        this.isProcessingQueue = false;
        
        // Cache for results to reduce API calls
        this.responseCache = new Map();
        this.cacheTTL = options.cacheTTL || 5000; // 5 seconds
        
        // Error handling
        this.maxRetries = options.maxRetries || 2;
        this.fallbackEnabled = options.fallbackEnabled !== false;
        
        // Mock mode for testing without actual API calls
        this.mockMode = options.mockMode || false;
        this.mockResponses = options.mockResponses || {};
    }
    
    async generateResponse(prompt, options = {}) {
        // Check cache first
        const cacheKey = JSON.stringify({ prompt, options });
        const cachedResponse = this.checkCache(cacheKey);
        if (cachedResponse) return cachedResponse;
        
        // If API key is not set and we're not in mock mode, switch to mock mode
        if (!this.apiKey && !this.mockMode) {
            console.warn("API key not set, switching to mock mode");
            this.setMockMode(true);
        }
        
        // Check if we're over rate limit
        if (this.isRateLimited() && !this.mockMode) {
            console.warn("Rate limit reached, queuing request");
            return new Promise((resolve, reject) => {
                this.requestQueue.push({ prompt, options, resolve, reject });
                this.processQueue();
            });
        }
        
        // Process the request
        return this.processRequest(prompt, options, cacheKey);
    }
    
    async processRequest(prompt, options, cacheKey) {
        try {
            let response;
            
            // If in mock mode, use mock responses
            if (this.mockMode) {
                response = this.getMockResponse(prompt, options);
            } else {
                // Increment request counter
                this.requestCount++;
                // For debugging rate limiting
                // console.log("API Request count:", this.requestCount);
                
                // Make the actual API request
                response = await this.makeAPIRequest(prompt, options);
            }
            
            // Cache the response
            this.cacheResponse(cacheKey, response);
            return response;
            
        } catch (error) {
            console.error("Error generating LLM response:", error);
            
            // Use fallback if enabled
            if (this.fallbackEnabled) {
                return this.getFallbackResponse(prompt, options);
            }
            throw error;
        }
    }
    
    async makeAPIRequest(prompt, options) {
        // Make an API request to the OpenAI Chat Completions API
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: "system",
                            content: "You are a game agent AI that makes decisions for an agent in a territory control game. Your responses should follow the format: ACTION: [action type] TARGET: [target] REASONING: [brief explanation]"
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: options.maxTokens || 100,
                    temperature: options.temperature || 0.7,
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API request failed: ${response.statusText} - ${errorText}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content.trim();
            
        } catch (error) {
            console.error("API request failed:", error);
            throw error;
        }
    }
    
    isRateLimited() {
        // Reset counter if time period has passed
        if (Date.now() > this.requestResetTime) {
            this.requestCount = 0;
            this.requestResetTime = Date.now() + 60000; // Reset every minute
        }
        
        return this.requestCount >= this.maxRequestsPerMinute;
    }
    
    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) return;
        
        this.isProcessingQueue = true;
        
        // Wait until we're no longer rate limited
        while (this.isRateLimited() && !this.mockMode) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Process the next request
        const { prompt, options, resolve, reject } = this.requestQueue.shift();
        try {
            const cacheKey = JSON.stringify({ prompt, options });
            const result = await this.processRequest(prompt, options, cacheKey);
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.isProcessingQueue = false;
            // Continue processing queue
            this.processQueue();
        }
    }
    
    checkCache(cacheKey) {
        const cached = this.responseCache.get(cacheKey);
        if (cached && Date.now() < cached.expiry) {
            return cached.response;
        }
        return null;
    }
    
    cacheResponse(cacheKey, response) {
        this.responseCache.set(cacheKey, {
            response,
            expiry: Date.now() + this.cacheTTL
        });
    }
    
    getMockResponse(prompt, options) {
        // Simple pattern matching for mock responses
        for (const pattern in this.mockResponses) {
            if (prompt.includes(pattern)) {
                return this.mockResponses[pattern];
            }
        }
        
        // Default mock response
        return "This is a mock response from the LLM system.";
    }
    
    getFallbackResponse(prompt, options) {
        // Implement basic fallback logic for when API calls fail
        // This could be rule-based responses or simply random choices
        
        // Simple fallback for agent decisions
        if (prompt.includes("decide next action")) {
            const actions = ["move", "collect", "return", "explore", "attack"];
            return actions[Math.floor(Math.random() * actions.length)];
        }
        
        return "Fallback response: continue current behavior";
    }
    
    // Set mock mode (for testing)
    setMockMode(enabled, mockResponses = null) {
        this.mockMode = enabled;
        if (mockResponses) {
            this.mockResponses = mockResponses;
        }
    }
    
    // Set API key (for runtime configuration)
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }
}