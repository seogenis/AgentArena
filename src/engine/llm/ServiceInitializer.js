/**
 * ServiceInitializer.js
 * 
 * Utility to manually reinitialize LLM services
 * after API configuration is changed
 */

import { LLMService } from './index.js';

class ServiceInitializer {
    constructor() {
        this.services = new Map();
    }
    
    /**
     * Register an LLM service for reinitialization
     * @param {string} name - Service name/identifier
     * @param {Object} service - LLM service instance
     */
    registerService(name, service) {
        if (service && typeof service === 'object') {
            this.services.set(name, service);
            console.log(`Registered LLM service: ${name}`);
        }
    }
    
    /**
     * Reinitialize all registered services with current environment settings
     */
    reinitializeServices() {
        if (this.services.size === 0) {
            console.warn('No LLM services registered for reinitialization');
            return;
        }
        
        const env = typeof window !== 'undefined' ? window.process?.env : process?.env;
        if (!env) {
            console.error('Environment not initialized');
            return;
        }
        
        const apiKey = env.LLM_API_KEY || '';
        const apiEndpoint = env.LLM_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
        const modelName = env.LLM_MODEL_NAME || 'gpt-4.1-mini';
        const useMockResponses = env.USE_MOCK_RESPONSES === 'true';
        
        console.log(`Reinitializing ${this.services.size} LLM service(s) with:`);
        console.log(`- API Key: ${apiKey ? 'Provided ✓' : 'Not provided ✗'}`);
        console.log(`- Mock Responses: ${useMockResponses ? 'Enabled' : 'Disabled'}`);
        
        // Update all registered services
        for (const [name, service] of this.services.entries()) {
            try {
                // Update service properties based on its type
                if (service instanceof LLMService) {
                    service.apiKey = apiKey;
                    service.apiEndpoint = apiEndpoint;
                    service.modelName = modelName;
                    service.useMockResponses = useMockResponses;
                } else if (service.llmService || service.llmInterface) {
                    // Handle systems that contain an LLM service
                    const llmService = service.llmService || service.llmInterface;
                    llmService.apiKey = apiKey;
                    llmService.apiEndpoint = apiEndpoint;
                    llmService.modelName = modelName;
                    llmService.useMockResponses = useMockResponses;
                    
                    // Also reset any fallback flags
                    if (service.fallbackMode !== undefined) {
                        service.fallbackMode = false;
                    }
                }
                
                console.log(`✅ Reinitialized service: ${name}`);
            } catch (error) {
                console.error(`Error reinitializing service ${name}:`, error);
            }
        }
        
        return true;
    }
    
    /**
     * Get count of registered services
     * @returns {number} Number of registered services
     */
    getServiceCount() {
        return this.services.size;
    }
    
    /**
     * Clear all registered services
     */
    clearServices() {
        this.services.clear();
    }
}

// Export singleton instance
const serviceInitializer = new ServiceInitializer();
export default serviceInitializer;

// Create global helper function
window.reinitializeLLMServices = function() {
    return serviceInitializer.reinitializeServices();
};