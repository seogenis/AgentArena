/**
 * PromptTemplates.js
 * 
 * Contains prompt templates for LLM interactions.
 * These templates are used to generate prompts for team strategy and agent creation.
 */

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

Your task is to determine the optimal strategy for your team. Respond with a JSON object containing:
- strategy: Overall strategy type (aggressive, defensive, balanced, economic)
- focus: Main focus (resources, territory, combat)
- priorities: Array of priority actions in order (collect_energy, collect_materials, collect_data, expand_territory, attack_enemies, defend_territory, defend_base)
- description: Brief description of your strategy

Respond in valid JSON format without explanation or additional text.`;
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
        
        return `You are designing an AI agent for the ${team} team in a resource-based territory control game.

CURRENT TEAM STATUS:
- Team strategy: ${teamStrategy.strategy}
- Strategic focus: ${teamStrategy.focus}
- Resource availability: Energy: ${availableResources.energy}, Materials: ${availableResources.materials}, Data: ${availableResources.data}
- Current agents: ${gameState.agents[teamId].map(a => a.role).join(', ') || 'None'}

Your task is to specify the attributes and role for a new agent to create. Attributes must be values between 0.0 and 1.0. Higher values require more resources to create.

Respond with a JSON object containing:
- role: The agent's role (collector, explorer, defender, attacker)
- attributes: Object containing attributes (speed, health, attack, defense, carryCapacity) with values 0.0-1.0
- priority: Preferred resource type to target (energy, materials, data)
- description: Brief description of this agent's purpose

Based on the team strategy and current game state, design an agent that will be most beneficial.

Respond in valid JSON format without explanation or additional text.`;
    }
};

export default PromptTemplates;