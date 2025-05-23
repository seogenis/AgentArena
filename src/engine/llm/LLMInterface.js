// This file handles the integration with LLM APIs
// For demonstration purposes, we'll simulate LLM responses to avoid API costs

export class LLMInterface {
    constructor() {
        this.apiKey = null;
        this.apiEndpoint = null;
        this.isDebugMode = true; // Set to false to use real API
        this.responseCache = new Map(); // Cache for simulated responses
        this.responseDelay = 200; // Simulated response delay in ms
        this.model = "gpt-4.1-mini"; // Default model
    }

    async configure(apiKey, apiEndpoint, model = "gpt-4.1-mini") {
        this.apiKey = apiKey;
        this.apiEndpoint = apiEndpoint;
        this.model = model;
        console.log(`Configured LLM interface with model: ${this.model}`);
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
            if (!this.apiKey) {
                console.warn('API key not configured, using simulated response');
                return this.getDebugResponse(prompt, options);
            }

            // Prepare the request to OpenAI API
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            };

            const requestBody = {
                model: this.model,
                messages: [
                    { role: "system", content: "You are an AI agent in a strategic game. Your responses should be focused on making decisions that benefit your team." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 250
            };

            // Log request for debugging
            console.log(`Sending request to ${this.apiEndpoint || 'OpenAI API'} with model ${this.model}`);

            // Make the API request
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error from OpenAI API:', errorData);
                return this.getFallbackResponse(prompt);
            }

            const data = await response.json();
            const responseText = data.choices[0].message.content;
            
            // Parse the response
            try {
                // Handle different prompt types
                if (prompt.includes('AGENT_DECISION')) {
                    return this.parseDecisionResponse(responseText);
                } else if (prompt.includes('GENERATE_PERSONALITY')) {
                    return this.parsePersonalityResponse(responseText);
                } else {
                    return this.getFallbackResponse(prompt);
                }
            } catch (parseError) {
                console.error('Error parsing LLM response:', parseError);
                return this.getFallbackResponse(prompt);
            }
        } catch (error) {
            console.error('Error getting LLM response:', error);
            return this.getFallbackResponse(prompt);
        }
    }

    // Parse an LLM response for a decision
    parseDecisionResponse(responseText) {
        // First try to parse as JSON
        try {
            const jsonResponse = JSON.parse(responseText);
            if (jsonResponse.action && jsonResponse.target) {
                return jsonResponse;
            }
        } catch (e) {
            // Not valid JSON, continue with text parsing
        }

        // Try to extract action and target from text response
        const actionMatch = responseText.match(/action:?\s*([A-Z_]+)/i);
        const targetMatch = responseText.match(/target:?\s*([A-Z_]+)/i);
        const reasoningMatch = responseText.match(/reasoning:?\s*(.+?)(?:\n|$)/i);

        const action = actionMatch ? actionMatch[1].toUpperCase() : 'EXPLORE';
        const target = targetMatch ? targetMatch[1].toUpperCase() : 'RANDOM';
        const reasoning = reasoningMatch ? reasoningMatch[1] : 'No reasoning provided.';

        return {
            action: action,
            target: target,
            reasoning: reasoning
        };
    }

    // Parse an LLM response for personality generation
    parsePersonalityResponse(responseText) {
        // First try to parse as JSON
        try {
            const jsonResponse = JSON.parse(responseText);
            if (jsonResponse.designation || jsonResponse.traits) {
                return jsonResponse;
            }
        } catch (e) {
            // Not valid JSON, continue with text parsing
        }

        // Try to extract personality elements from text response
        const designationMatch = responseText.match(/designation:?\s*([^\n]+)/i);
        const traitsMatch = responseText.match(/traits:?\s*([^\n]+)/i);
        const backgroundMatch = responseText.match(/background:?\s*([^\n]+)/i);
        const focusMatch = responseText.match(/focus:?\s*([^\n]+)/i);

        const traits = traitsMatch ? 
            traitsMatch[1].split(/,\s*/).map(t => t.trim().toLowerCase()) : 
            ['adaptive'];

        return {
            designation: designationMatch ? designationMatch[1] : 'Agent',
            traits: traits,
            background: backgroundMatch ? backgroundMatch[1] : 'Standard issue unit',
            focus: focusMatch ? focusMatch[1] : 'Mission completion',
            preferences: {
                resourcePreference: Math.random() > 0.5 ? 'energy' : 'materials',
                territoryPreference: Math.random() > 0.5 ? 'frontier' : 'consolidation',
                combatStance: Math.random() > 0.7 ? 'aggressive' : Math.random() > 0.5 ? 'defensive' : 'evasive'
            }
        };
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