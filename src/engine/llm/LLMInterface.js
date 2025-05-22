// This file handles the integration with LLM APIs
// For demonstration purposes, we'll simulate LLM responses to avoid API costs

export class LLMInterface {
    constructor() {
        this.apiKey = null;
        this.apiEndpoint = null;
        this.isDebugMode = true; // Set to false to use real API
        this.responseCache = new Map(); // Cache for simulated responses
        this.responseDelay = 200; // Simulated response delay in ms
    }

    async configure(apiKey, apiEndpoint) {
        this.apiKey = apiKey;
        this.apiEndpoint = apiEndpoint;
    }

    // Main method to get LLM responses
    async getResponse(prompt, options = {}) {
        if (this.isDebugMode) {
            return this.getDebugResponse(prompt, options);
        } else {
            return this.getRealLLMResponse(prompt, options);
        }
    }

    // Method to get a real LLM response from an API
    async getRealLLMResponse(prompt, options = {}) {
        try {
            // This would be replaced with actual API call
            // For now, we'll just simulate a response
            console.warn('Real LLM API not implemented yet, using simulated response');
            return this.getDebugResponse(prompt, options);
        } catch (error) {
            console.error('Error getting LLM response:', error);
            return this.getFallbackResponse(prompt);
        }
    }

    // Generate a simulated response for debug/testing
    async getDebugResponse(prompt, options = {}) {
        // Check if we have a cached response
        const cacheKey = JSON.stringify({ prompt, options });
        if (this.responseCache.has(cacheKey)) {
            return Promise.resolve(this.responseCache.get(cacheKey));
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, this.responseDelay));

        // Generate a response based on the prompt content
        let response;
        
        // Check for agent decision making prompt
        if (prompt.includes('AGENT_DECISION')) {
            response = this.generateAgentDecisionResponse(prompt, options);
        } 
        // Check for agent personality generation
        else if (prompt.includes('GENERATE_PERSONALITY')) {
            response = this.generatePersonalityResponse(prompt, options);
        } 
        // Default fallback
        else {
            response = this.getFallbackResponse(prompt);
        }

        // Cache the response
        this.responseCache.set(cacheKey, response);
        
        return response;
    }

    // Fallback response when API fails or in unexpected situations
    getFallbackResponse(prompt) {
        return {
            action: 'EXPLORE',
            target: 'RANDOM',
            reasoning: 'Fallback response due to error or unexpected prompt format.'
        };
    }

    // Generate a simulated response for agent decisions
    generateAgentDecisionResponse(prompt, options) {
        const { teamId, type, resourcesCarried, nearbyResources, nearbyEnemies, nearbyAllies } = options;
        
        // Generate different behavior based on agent type and situation
        if (type === 'collector') {
            // If carrying resources, return to base
            if (resourcesCarried > 0) {
                return {
                    action: 'RETURN_TO_BASE',
                    target: 'BASE',
                    reasoning: `Carrying ${resourcesCarried} resources, returning to base for deposit.`
                };
            }
            
            // If enemies are nearby and no resources, flee
            if (nearbyEnemies && nearbyEnemies.length > 0 && (!nearbyResources || nearbyResources.length === 0)) {
                return {
                    action: 'FLEE',
                    target: 'BASE',
                    reasoning: `Detected ${nearbyEnemies.length} enemies nearby, fleeing to safety.`
                };
            }
            
            // If resources nearby, collect them
            if (nearbyResources && nearbyResources.length > 0) {
                return {
                    action: 'COLLECT',
                    target: 'NEAREST_RESOURCE',
                    reasoning: `Found ${nearbyResources.length} resources nearby, collecting the nearest one.`
                };
            }
            
            // Otherwise explore
            return {
                action: 'EXPLORE',
                target: 'RESOURCE_RICH',
                reasoning: 'No immediate tasks, exploring for resources.'
            };
        } 
        else if (type === 'explorer') {
            // If carrying resources, return to base
            if (resourcesCarried > 0) {
                return {
                    action: 'RETURN_TO_BASE',
                    target: 'BASE',
                    reasoning: `Carrying ${resourcesCarried} resources, returning to base for deposit.`
                };
            }
            
            // If enemies nearby and we have allies, attack
            if (nearbyEnemies && nearbyEnemies.length > 0 && nearbyAllies && nearbyAllies.length >= 1) {
                return {
                    action: 'ATTACK',
                    target: 'NEAREST_ENEMY',
                    reasoning: `Detected ${nearbyEnemies.length} enemies nearby, attacking with support.`
                };
            }
            
            // If unclaimed territory nearby, claim it
            if (options.unclaimedTerritory && options.unclaimedTerritory > 0.3) {
                return {
                    action: 'CLAIM_TERRITORY',
                    target: 'UNCLAIMED',
                    reasoning: 'Found unclaimed territory, expanding team control.'
                };
            }
            
            // Otherwise explore, sometimes scouting enemy territory
            const shouldScoutEnemy = Math.random() > 0.7;
            return {
                action: shouldScoutEnemy ? 'SCOUT_ENEMY' : 'EXPLORE',
                target: shouldScoutEnemy ? 'ENEMY_TERRITORY' : 'UNEXPLORED',
                reasoning: shouldScoutEnemy ? 
                    'Scouting enemy territory for strategic information.' : 
                    'Exploring unexplored areas to expand knowledge.'
            };
        }

        // Default behavior
        return {
            action: 'EXPLORE',
            target: 'RANDOM',
            reasoning: 'Default exploration behavior.'
        };
    }

    // Generate a simulated personality for an agent
    generatePersonalityResponse(prompt, options) {
        const { teamId, type, agentId } = options;
        
        // Potential personality traits
        const traits = [
            'cautious', 'aggressive', 'methodical', 'opportunistic', 
            'protective', 'curious', 'efficient', 'brave', 'loyal',
            'strategic', 'analytical', 'impulsive', 'patient'
        ];
        
        // Select random traits
        const numTraits = 2 + Math.floor(Math.random() * 2); // 2-3 traits
        const agentTraits = [];
        
        for (let i = 0; i < numTraits; i++) {
            const trait = traits[Math.floor(Math.random() * traits.length)];
            if (!agentTraits.includes(trait)) {
                agentTraits.push(trait);
            }
        }
        
        // Generate background based on type
        let background = '';
        if (type === 'collector') {
            background = [
                'Former logistics drone repurposed for resource operations',
                'Specialized harvesting unit with enhanced capacity',
                'Converted mining assistant with resource identification protocols',
                'Utility droid updated with the latest collection software'
            ][Math.floor(Math.random() * 4)];
        } else if (type === 'explorer') {
            background = [
                'Scout unit upgraded with advanced threat detection',
                'Recon specialist with enhanced sensor arrays',
                'Surveillance drone retrofitted for combat capabilities',
                'Pathfinder with superior terrain analysis systems'
            ][Math.floor(Math.random() * 4)];
        }
        
        // Generate objective focus
        const objectives = [
            'resource accumulation', 'territory expansion', 'enemy deterrence',
            'team support', 'rapid exploration', 'efficient transport',
            'perimeter security', 'adaptive strategies'
        ];
        
        const focus = objectives[Math.floor(Math.random() * objectives.length)];
        
        // Generate a unique designation
        const designation = `${teamId === 1 ? 'Red' : 'Blue'}-${type.charAt(0).toUpperCase()}${agentId % 1000}`;
        
        return {
            designation: designation,
            traits: agentTraits,
            background: background,
            focus: focus,
            quirk: Math.random() > 0.7 ? 'Occasionally sends unnecessary status reports' : 
                  Math.random() > 0.5 ? 'Calculates efficiency metrics during idle moments' :
                  'Records observations about the environment',
            preferences: {
                resourcePreference: ['energy', 'materials', 'data'][Math.floor(Math.random() * 3)],
                territoryPreference: Math.random() > 0.5 ? 'frontier' : 'consolidation',
                combatStance: Math.random() > 0.7 ? 'aggressive' : Math.random() > 0.5 ? 'defensive' : 'evasive'
            }
        };
    }
}