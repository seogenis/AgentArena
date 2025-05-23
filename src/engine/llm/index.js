/**
 * llm/index.js
 * 
 * Exports all LLM-related systems and services.
 */

import LLMService from './LLMService.js';
import TeamStrategySystem from './TeamStrategySystem.js';
import SpawnerSystem from './SpawnerSystem.js';
import SpawnScheduler from './SpawnScheduler.js';
import PromptTemplates from './PromptTemplates.js';
import APIInitializer from './APIInitializer.js';
import ServiceInitializer from './ServiceInitializer.js';
import LLMSystem from './LLMSystem.js';

export {
    LLMService,
    TeamStrategySystem,
    SpawnerSystem,
    SpawnScheduler,
    PromptTemplates,
    APIInitializer,
    ServiceInitializer,
    LLMSystem
};

// Initialize environment variables
const initializeEnv = () => {
    try {
        // For browser environments, we can't use actual .env files
        // So we set default values for development
        if (typeof process === 'undefined') {
            window.process = window.process || {};
            window.process.env = window.process.env || {};
        } else if (!process.env) {
            process.env = {};
        }
        
        // Use a consistent reference
        const env = typeof window !== 'undefined' ? (window.process.env) : process.env;
        
        // Set default values if not already set
        env.USE_MOCK_RESPONSES = env.USE_MOCK_RESPONSES || 'true';
        env.LLM_API_ENDPOINT = env.LLM_API_ENDPOINT || '';
        env.LLM_API_KEY = env.LLM_API_KEY || '';
        env.LLM_MODEL_NAME = env.LLM_MODEL_NAME || 'gpt-4.1-mini';
        
        // Log environment setup for diagnostic purposes
        console.log('LLM environment initialized. Mock responses: ' + 
            (env.USE_MOCK_RESPONSES === 'true' ? 'Enabled ✓' : 'Disabled ✗'));
        
    } catch (e) {
        console.error('Error initializing environment:', e);
        // Fallback to ensure mock responses are used if environment setup fails
        if (typeof window !== 'undefined') {
            window.process = window.process || {};
            window.process.env = window.process.env || {};
            window.process.env.USE_MOCK_RESPONSES = 'true';
        }
    }
};

// Run initialization
initializeEnv();
