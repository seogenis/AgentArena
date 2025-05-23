/**
 * LLMSchemas.js
 * 
 * Defines schemas for validating and parsing LLM responses
 * to ensure they match the expected structure
 */

// Simple schema validation helpers (no external dependencies)
class Schema {
    static validate(obj, schema) {
        if (!obj || typeof obj !== 'object') return false;
        
        for (const key in schema) {
            if (!schema.hasOwnProperty(key)) continue;
            
            const rule = schema[key];
            const value = obj[key];
            
            // Check required fields
            if (rule.required && (value === undefined || value === null)) {
                console.error(`Missing required field: ${key}`);
                return false;
            }
            
            // Skip validation for undefined optional fields
            if (value === undefined || value === null) {
                if (!rule.required) continue;
                return false;
            }
            
            // Validate by type
            switch (rule.type) {
                case 'string':
                    if (typeof value !== 'string') {
                        console.error(`Field ${key} should be a string`);
                        return false;
                    }
                    if (rule.minLength && value.length < rule.minLength) {
                        console.error(`Field ${key} is too short`);
                        return false;
                    }
                    if (rule.maxLength && value.length > rule.maxLength) {
                        console.error(`Field ${key} is too long`);
                        return false;
                    }
                    break;
                    
                case 'number':
                    if (typeof value !== 'number') {
                        console.error(`Field ${key} should be a number`);
                        return false;
                    }
                    if (rule.min !== undefined && value < rule.min) {
                        console.error(`Field ${key} is less than minimum ${rule.min}`);
                        return false;
                    }
                    if (rule.max !== undefined && value > rule.max) {
                        console.error(`Field ${key} is greater than maximum ${rule.max}`);
                        return false;
                    }
                    break;
                    
                case 'enum':
                    if (!rule.values.includes(value)) {
                        console.error(`Field ${key} should be one of: ${rule.values.join(', ')}`);
                        return false;
                    }
                    break;
                    
                case 'array':
                    if (!Array.isArray(value)) {
                        console.error(`Field ${key} should be an array`);
                        return false;
                    }
                    if (rule.minItems && value.length < rule.minItems) {
                        console.error(`Field ${key} has too few items`);
                        return false;
                    }
                    if (rule.maxItems && value.length > rule.maxItems) {
                        console.error(`Field ${key} has too many items`);
                        return false;
                    }
                    if (rule.items) {
                        for (const item of value) {
                            if (rule.items.type === 'enum' && !rule.items.values.includes(item)) {
                                console.error(`Array item in ${key} should be one of: ${rule.items.values.join(', ')}`);
                                return false;
                            }
                        }
                    }
                    break;
                    
                case 'object':
                    if (typeof value !== 'object' || value === null) {
                        console.error(`Field ${key} should be an object`);
                        return false;
                    }
                    if (rule.schema && !Schema.validate(value, rule.schema)) {
                        console.error(`Object ${key} failed validation`);
                        return false;
                    }
                    break;
            }
        }
        
        return true;
    }
}

// Team strategy schema definition
const TeamStrategySchema = {
    strategy: {
        type: 'enum',
        values: ['balanced', 'aggressive', 'economic', 'defensive'],
        required: true
    },
    focus: {
        type: 'enum',
        values: ['resources', 'territory', 'combat'],
        required: true
    },
    priorities: {
        type: 'array',
        items: {
            type: 'enum',
            values: [
                'collect_energy', 
                'collect_materials', 
                'collect_data', 
                'expand_territory', 
                'attack_enemies', 
                'defend_territory', 
                'defend_base'
            ]
        },
        minItems: 1,
        maxItems: 7,
        required: true
    },
    description: {
        type: 'string',
        minLength: 5,
        maxLength: 200,
        required: true
    }
};

// Agent attributes schema definition
const AgentAttributesSchema = {
    speed: { type: 'number', min: 0, max: 1, required: true },
    health: { type: 'number', min: 0, max: 1, required: true },
    attack: { type: 'number', min: 0, max: 1, required: true },
    defense: { type: 'number', min: 0, max: 1, required: true },
    carryCapacity: { type: 'number', min: 0, max: 1, required: true }
};

// Agent specification schema definition
const AgentSpecificationSchema = {
    role: {
        type: 'enum',
        values: ['collector', 'explorer', 'defender', 'attacker'],
        required: true
    },
    attributes: {
        type: 'object',
        schema: AgentAttributesSchema,
        required: true
    },
    priority: {
        type: 'enum',
        values: ['energy', 'materials', 'data'],
        required: true
    },
    description: {
        type: 'string',
        minLength: 5,
        maxLength: 200,
        required: true
    }
};

/**
 * Detect the type of prompt from the LLM response text
 * @param {string} promptText - The prompt sent to the LLM
 * @param {Object} options - Additional options
 * @returns {string} The detected prompt type ('strategy', 'agent', or 'unknown')
 */
function detectPromptType(promptText, options = {}) {
    if (!promptText) return 'unknown';
    
    // If explicitly provided in options, use that
    if (options.promptType) {
        console.log(`Using explicitly specified prompt type: ${options.promptType}`);
        return options.promptType;
    }
    
    // Check for explicit agent indicators (these should be in updated prompt templates)
    if (promptText.includes('AGENT CREATION REQUEST') || 
        promptText.includes('designing an AI AGENT (not a team strategy)') ||
        promptText.includes('role": "collector') ||  // Sample in JSON
        promptText.includes('attributes": {')) {     // Sample in JSON
        console.log('Detected agent specification prompt (strong indicators)');
        return 'agent';
    }
    
    // Check for team strategy prompt
    if (promptText.includes('strategic AI for the') || 
        promptText.includes('CURRENT GAME STATE') || 
        promptText.includes('strategy": "balanced') ||  // Sample in JSON
        (promptText.includes('strategy') && promptText.includes('territory control game'))) {
        console.log('Detected team strategy prompt');
        return 'strategy';
    }
    
    // Check for additional agent specification indicators
    if (promptText.includes('designing an AI agent') || 
        promptText.includes('CURRENT TEAM STATUS') || 
        promptText.includes('carryCapacity') ||
        (promptText.includes('agent') && promptText.includes('role') && promptText.includes('attributes'))) {
        console.log('Detected agent specification prompt (weak indicators)');
        return 'agent';
    }
    
    console.log('Unable to confidently determine prompt type');
    return 'unknown';
}

/**
 * Parse and validate a team strategy response from LLM
 * @param {string} responseText - Text response from LLM
 * @returns {Object} Validated strategy object or null if invalid
 */
function parseTeamStrategy(responseText) {
    try {
        // First try to parse as JSON directly
        let strategy;
        try {
            strategy = JSON.parse(responseText);
        } catch (e) {
            // If not valid JSON, try to extract JSON from text
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                strategy = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON object found in response');
            }
        }
        
        // Validate with schema
        if (Schema.validate(strategy, TeamStrategySchema)) {
            return strategy;
        } else {
            throw new Error('Strategy validation failed');
        }
    } catch (error) {
        console.error('Error parsing team strategy:', error);
        
        // Try to extract key fields from text if JSON parsing failed
        try {
            const strategyMatch = responseText.match(/strategy:?\s*([a-z]+)/i);
            const focusMatch = responseText.match(/focus:?\s*([a-z]+)/i);
            const prioritiesMatch = responseText.match(/priorities:?\s*\[(.*?)\]/i) || 
                                   responseText.match(/priorities:?\s*([\w\s,_]+)/i);
            const descriptionMatch = responseText.match(/description:?\s*"?(.*?)"?(?:,|\n|$)/i);
            
            if (strategyMatch && focusMatch) {
                const strategy = strategyMatch[1].toLowerCase();
                const focus = focusMatch[1].toLowerCase();
                
                // Parse priorities array
                let priorities = [];
                if (prioritiesMatch) {
                    priorities = prioritiesMatch[1]
                        .split(/,\s*/)
                        .map(p => p.trim().toLowerCase().replace(/"/g, ''))
                        .filter(p => p.length > 0);
                }
                
                // Extract description
                const description = descriptionMatch ? 
                    descriptionMatch[1].trim() : 
                    `${strategy} strategy focusing on ${focus}`;
                
                // Create object and validate
                const extractedStrategy = {
                    strategy: strategy,
                    focus: focus,
                    priorities: priorities.length > 0 ? priorities : ['collect_energy', 'expand_territory'],
                    description: description
                };
                
                // Validate with more lenient schema for text extraction
                if (Schema.validate(extractedStrategy, TeamStrategySchema)) {
                    return extractedStrategy;
                }
            }
        } catch (fallbackError) {
            console.error('Fallback parsing also failed:', fallbackError);
        }
        
        return null;
    }
}

/**
 * Parse and validate an agent specification response from LLM
 * @param {string} responseText - Text response from LLM
 * @returns {Object} Validated agent specification or null if invalid
 */
function parseAgentSpecification(responseText) {
    try {
        // First try to parse as JSON directly
        let agentSpec;
        try {
            agentSpec = JSON.parse(responseText);
        } catch (e) {
            // If not valid JSON, try to extract JSON from text
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                agentSpec = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON object found in response');
            }
        }
        
        // Validate with schema
        if (Schema.validate(agentSpec, AgentSpecificationSchema)) {
            return agentSpec;
        } else {
            throw new Error('Agent specification validation failed');
        }
    } catch (error) {
        console.error('Error parsing agent specification:', error);
        
        // Fallback: return null for agent specs since they're more complex
        return null;
    }
}

/**
 * Parse LLM response based on prompt type
 * @param {string} promptText - The prompt sent to the LLM
 * @param {string} responseText - The response from the LLM
 * @param {Object} options - Additional options
 * @returns {Object} Parsed and validated response object
 */
function parseLLMResponse(promptText, responseText, options = {}) {
    const promptType = detectPromptType(promptText, options);
    
    console.log(`Parsing LLM response as ${promptType} type`);
    
    switch (promptType) {
        case 'strategy':
            return parseTeamStrategy(responseText);
        case 'agent':
            return parseAgentSpecification(responseText);
        default:
            // First try to detect the type from the response itself
            if (responseText.includes('role') && responseText.includes('attributes') && 
                !responseText.includes('strategy') && !responseText.includes('priorities')) {
                console.log('Response appears to be an agent specification based on content');
                return parseAgentSpecification(responseText);
            }
            
            if (responseText.includes('strategy') && responseText.includes('focus') && 
                responseText.includes('priorities')) {
                console.log('Response appears to be a team strategy based on content');
                return parseTeamStrategy(responseText);
            }
            
            // If still can't determine, try both
            console.warn('Unknown prompt type, attempting to parse as strategy');
            const strategy = parseTeamStrategy(responseText);
            if (strategy) return strategy;
            
            console.warn('Attempting to parse as agent specification');
            const agent = parseAgentSpecification(responseText);
            if (agent) return agent;
            
            console.error('Failed to parse response for unknown prompt type');
            return null;
    }
}

// Provide a function for generating structured JSON format instructions
// Similar to OpenAI's zodTextFormat helper
function generateJSONFormatInstructions(schema, name) {
    const formatDescription = {
        strategy: 'a team strategy with specific priorities and focus areas',
        agent: 'an agent specification with attributes and role'
    };
    
    const schemaType = name || 'object';
    const description = formatDescription[schemaType] || 'a structured object';
    
    return `Your response must be a properly formatted JSON ${description} with the following structure:

\`\`\`json
${JSON.stringify(getSchemaExample(schema), null, 2)}
\`\`\`

Ensure your response follows this exact format. Always return a valid JSON object.`;
}

// Helper to generate example object based on schema
function getSchemaExample(schema) {
    if (schema === TeamStrategySchema) {
        return {
            strategy: 'balanced',
            focus: 'resources',
            priorities: ['collect_energy', 'expand_territory', 'defend_base'],
            description: 'A balanced approach focusing on resource collection.'
        };
    } else if (schema === AgentSpecificationSchema) {
        return {
            role: 'collector',
            attributes: {
                speed: 0.7,
                health: 0.6,
                attack: 0.3,
                defense: 0.5,
                carryCapacity: 0.8
            },
            priority: 'energy',
            description: 'Specialized resource collector focusing on energy.'
        };
    }
    
    return {};
}

// Export all utilities
export {
    Schema,
    TeamStrategySchema,
    AgentSpecificationSchema,
    parseTeamStrategy,
    parseAgentSpecification,
    detectPromptType,
    parseLLMResponse,
    generateJSONFormatInstructions
};