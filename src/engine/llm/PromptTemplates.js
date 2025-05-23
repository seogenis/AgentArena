/**
 * PromptTemplates.js
 * 
 * Contains prompt templates for LLM interactions.
 * These templates are used to generate prompts for team strategy and agent creation.
 */

import { generateJSONFormatInstructions, TeamStrategySchema, AgentSpecificationSchema } from './LLMSchemas.js';

const PromptTemplates = {
    /**
     * Generate a prompt for team strategy
     * @param {Object} gameState - Current game state information
     * @param {string} teamId - ID of the team for which to generate strategy
     * @returns {string} Formatted prompt for team strategy
     */
    teamStrategy: (gameState, teamId) => {
        const team = teamId === 'red' ? 'Red' : 'Blue';
        const opponent = teamId === 'red' ? 'Blue' : 'Red';
        
        return `You are the strategic AI for the ${team} team in a resource-based territory control game.

CURRENT GAME STATE:
- Your team controls ${gameState.territoryControl[teamId]}% of the map
- The ${opponent} team controls ${gameState.territoryControl[teamId === 'red' ? 'blue' : 'red']}% of the map
- Your team has ${gameState.agents[teamId].length} agents
- The ${opponent} team has ${gameState.agents[teamId === 'red' ? 'blue' : 'red'].length} agents
- Resource counts for your team: Energy: ${gameState.resources[teamId].energy}, Materials: ${gameState.resources[teamId].materials}, Data: ${gameState.resources[teamId].data}
- Resource counts for ${opponent} team: Energy: ${gameState.resources[teamId === 'red' ? 'blue' : 'red'].energy}, Materials: ${gameState.resources[teamId === 'red' ? 'blue' : 'red'].materials}, Data: ${gameState.resources[teamId === 'red' ? 'blue' : 'red'].data}
- Resource distribution on map: Energy: ${gameState.resourcesOnMap.energy}, Materials: ${gameState.resourcesOnMap.materials}, Data: ${gameState.resourcesOnMap.data}

Your task is to determine the optimal strategy for your team. 

Respond with a properly formatted JSON object with this exact structure:
\`\`\`json
{
  "strategy": "balanced",  // Must be one of: balanced, aggressive, defensive, economic
  "focus": "resources",    // Must be one of: resources, territory, combat
  "priorities": [          // Array of priority actions in order of importance
    "collect_energy",      // Must include at least one priority
    "expand_territory",    // Valid options: collect_energy, collect_materials, collect_data,
    "defend_base"          // expand_territory, attack_enemies, defend_territory, defend_base
  ],
  "description": "A balanced approach focusing on resource collection."
}
\`\`\`

Always return a valid JSON object exactly matching this structure.`;
    },
    
    /**
     * Generate a prompt for agent creation
     * @param {Object} gameState - Current game state information
     * @param {string} teamId - ID of the team for which to create an agent
     * @param {Object} teamStrategy - Current strategy for the team
     * @returns {string} Formatted prompt for agent creation
     */
    agentSpecification: (gameState, teamId, teamStrategy) => {
        const team = teamId === 'red' ? 'Red' : 'Blue';
        const availableResources = gameState.resources[teamId];
        
        return `You are designing an AI AGENT (not a team strategy) for the ${team} team in a resource-based territory control game.

AGENT CREATION REQUEST:
This is a request to create a new AGENT with specific role and attributes, NOT a team strategy.

CURRENT TEAM STATUS:
- Team strategy: ${teamStrategy.strategy}
- Strategic focus: ${teamStrategy.focus}
- Resource availability: Energy: ${availableResources.energy}, Materials: ${availableResources.materials}, Data: ${availableResources.data}
- Current agents: ${gameState.agents[teamId].map(a => a.role).join(', ') || 'None'}

Your task is to specify the attributes and role for a new agent to create. Attributes must be values between 0.0 and 1.0. Higher values require more resources to create.

Based on the team strategy and current game state, design an agent that will be most beneficial.

=== CRITICAL FORMAT INSTRUCTIONS ===
You MUST return a valid JSON object representing a SINGLE AGENT (not a team strategy).
The JSON MUST have the EXACT following structure with all fields present:

\`\`\`json
{
  "role": "collector",     // REQUIRED: Must be one of: collector, explorer, defender, attacker
  "attributes": {          // REQUIRED: Object with 5 numeric attributes
    "speed": 0.7,          // REQUIRED: Value between 0.0 and 1.0
    "health": 0.6,         // REQUIRED: Value between 0.0 and 1.0
    "attack": 0.3,         // REQUIRED: Value between 0.0 and 1.0
    "defense": 0.5,        // REQUIRED: Value between 0.0 and 1.0
    "carryCapacity": 0.8   // REQUIRED: Value between 0.0 and 1.0
  },
  "priority": "energy",    // REQUIRED: Must be one of: energy, materials, data
  "description": "Specialized resource collector focusing on energy."  // REQUIRED: Short description
}
\`\`\`

DO NOT include "strategy", "focus", or "priorities" fields - those are for team strategy only, not agent creation.
ONLY return the JSON object, no other text.`;
    }
};

export default PromptTemplates;