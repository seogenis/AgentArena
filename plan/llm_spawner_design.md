# LLM Team Spawner System Design

## Overview
The LLM Team Spawner system replaces individual agent LLM control with team-level LLM strategic decision making. Instead of controlling individual agent behaviors (which will remain hardcoded), the LLM will focus on team strategy, agent creation, resource allocation, and deployment planning.

## Core Components

### 1. LLMSpawnerSystem

This central system will manage the LLM integration for team strategy and agent creation.

```javascript
class LLMSpawnerSystem {
    constructor(hexGrid, baseSystem, agentSystem, resourceSystem) {
        this.hexGrid = hexGrid;
        this.baseSystem = baseSystem;
        this.agentSystem = agentSystem;
        this.resourceSystem = resourceSystem;
        
        // Team strategies
        this.teamStrategies = {
            team1: { strategy: 'balanced', lastUpdated: 0 },
            team2: { strategy: 'balanced', lastUpdated: 0 }
        };
        
        // Configuration
        this.strategyUpdateInterval = 30; // seconds
        this.agentCreationCooldown = { team1: 0, team2: 0 };
        this.apiEndpoint = "YOUR_LLM_API_ENDPOINT";
    }
    
    update(deltaTime) {
        // Update strategy cooldowns
        this.updateStrategyCooldowns(deltaTime);
        
        // Update agent creation cooldowns
        this.updateAgentCreationCooldowns(deltaTime);
        
        // Check if we should create new agents based on resources and strategy
        this.evaluateAgentCreation();
    }
    
    // ... other methods
}
```

### 2. TeamStrategy

This component will store and manage the current strategy for each team.

```javascript
class TeamStrategy {
    constructor(teamId) {
        this.teamId = teamId;
        this.currentStrategy = 'balanced';
        this.agentPriorities = {
            collector: 0.5,  // Default weights
            explorer: 0.3,
            defender: 0.1,
            attacker: 0.1
        };
        this.territoryFocus = 'balanced'; // expansive, defensive, resource-focused
        this.resourcePriorities = {
            energy: 0.33,
            materials: 0.33,
            data: 0.33
        };
    }
    
    updateFromLLMResponse(response) {
        // Parse LLM response and update strategy parameters
    }
    
    getStrategyPrompt(gameState) {
        // Generate prompt for the LLM to determine strategy
    }
}
```

### 3. AgentSpecification

This component will translate LLM agent designs into concrete game parameters.

```javascript
class AgentSpecification {
    constructor() {
        // Default stats ranges
        this.statRanges = {
            health: { min: 80, max: 150 },
            speed: { min: 50, max: 150 },
            attackPower: { min: 5, max: 25 },
            defense: { min: 5, max: 25 },
            visionRange: { min: 100, max: 200 },
            capacity: { min: 1, max: 8 }
        };
        
        // Role templates (starting points for LLM to modify)
        this.roleTemplates = {
            collector: {
                health: 100,
                speed: 70,
                attackPower: 5,
                defense: 10,
                visionRange: 120,
                capacity: 5
            },
            explorer: {
                health: 100,
                speed: 120,
                attackPower: 15,
                defense: 5,
                visionRange: 180,
                capacity: 2
            },
            // New roles
            defender: {
                health: 140,
                speed: 60,
                attackPower: 20,
                defense: 20,
                visionRange: 150,
                capacity: 1
            },
            attacker: {
                health: 110,
                speed: 100,
                attackPower: 25,
                defense: 8,
                visionRange: 150,
                capacity: 1
            }
        };
    }
    
    generateAgentFromLLM(llmResponse, teamId) {
        // Parse LLM response
        // Validate and balance attributes
        // Return agent specification
    }
    
    getAgentCreationPrompt(teamId, strategy, resources) {
        // Generate prompt for LLM to design an agent
    }
}
```

## LLM Integration

### API Integration

```javascript
class LLMApiClient {
    constructor(endpoint, apiKey) {
        this.endpoint = endpoint;
        this.apiKey = apiKey;
    }
    
    async generateResponse(prompt) {
        try {
            // API call implementation
            // Return formatted response
        } catch (error) {
            console.error("LLM API error:", error);
            return null; // Will trigger fallback behavior
        }
    }
}
```

### Prompt Templates

#### Team Strategy Prompt Template

```
You are the strategic AI for Team {teamId} in a territory control game.

GAME STATE:
- Territory Control: Team 1 ({team1_percentage}%), Team 2 ({team2_percentage}%)
- Resource Storage: {team_resources}
- Current Agent Count: Team 1 ({team1_agents}), Team 2 ({team2_agents})
- Game Time: {elapsed_time} seconds

YOUR TEAM:
- Current Strategy: {current_strategy}
- Current Agents: {agent_descriptions}
- Resource Storage: {energy}, {materials}, {data}

ENEMY TEAM:
- Observed Behavior: {enemy_behavior}
- Agent Composition: {enemy_agent_types}

Based on this information, determine the best strategy for your team:

1. Overall Strategy (choose one):
   - Aggressive (focus on combat)
   - Defensive (focus on territory holding)
   - Economic (focus on resource collection)
   - Balanced (mixed approach)
   - Expansive (focus on territory expansion)

2. Agent Type Priorities (assign percentages, must sum to 100%):
   - Collectors: ___%
   - Explorers: ___%
   - Defenders: ___%
   - Attackers: ___%

3. Resource Focus (assign percentages, must sum to 100%):
   - Energy: ___%
   - Materials: ___%
   - Data: ___%

4. Territory Focus (choose one):
   - Control center map
   - Expand from current territory
   - Focus on resource-rich areas
   - Harass enemy territory
   - Fortify current holdings

5. Strategic Reasoning:
   [Explain your strategic decisions in 2-3 sentences]
```

#### Agent Creation Prompt Template

```
You are designing a new agent for Team {teamId} in a territory control game.

GAME STATE:
- Current Team Strategy: {team_strategy}
- Available Resources: {available_resources}
- Current Team Composition: {team_composition}

AGENT ROLE: {role}

Design an agent with the following attributes (values must be within the specified ranges):
- Health ({min_health}-{max_health}): The agent's hit points
- Speed ({min_speed}-{max_speed}): How quickly the agent moves
- Attack ({min_attack}-{max_attack}): Damage dealt in combat
- Defense ({min_defense}-{max_defense}): Damage reduction in combat
- Vision ({min_vision}-{max_vision}): How far the agent can see
- Capacity ({min_capacity}-{max_capacity}): How many resources the agent can carry

CONSTRAINTS:
1. The sum of attribute points must not exceed {max_points}
2. Attributes must align with the agent's role
3. Values must be integers within the specified ranges

Please provide:
1. Attribute values for each stat
2. A brief tactical purpose for this agent (1-2 sentences)
3. A unique identifier or callsign for this agent (single word)
```

## Implementation Flow

1. **Strategy Determination**
   - Gather game state data
   - Generate strategy prompt
   - Send to LLM API
   - Parse response and update team strategy

2. **Agent Creation**
   - Check resource availability for new agent
   - Select agent role based on team strategy
   - Generate agent creation prompt
   - Send to LLM API
   - Parse response and validate attributes
   - Create agent with specified attributes

3. **Deployment Planning**
   - Determine optimal spawn location based on strategy
   - Ensure base has sufficient resources for creation
   - Create agent and assign initial waypoints/mission
   - Apply team strategy to initial behavior

## Resource Allocation System

Resources will directly influence agent creation and attributes:
- Energy: Affects agent speed and attack power
- Materials: Affects agent health and defense
- Data: Affects vision range and special abilities

Different agent types will require different resource compositions:
- Collectors: Higher materials cost (durability)
- Explorers: Higher energy cost (speed)
- Defenders: Higher materials and data cost (durability and awareness)
- Attackers: Higher energy and data cost (power and targeting)

## Agent Specialization

Beyond the basic collector and explorer types, the LLM can create specialized agents:

1. **Defender**
   - Higher health and defense
   - Moderate attack power
   - Lower speed and resource capacity
   - Tends to patrol strategic areas and engage enemies

2. **Attacker**
   - Higher attack power and speed
   - Lower defense and resource capacity
   - Actively seeks and engages enemy agents

3. **Scout**
   - Highest speed and vision range
   - Lowest health and attack
   - Focus on exploration and early warning

4. **Carrier**
   - Highest resource capacity
   - Moderate health and defense
   - Lowest speed and attack
   - Focus on efficient resource transport

## Fallback Mechanisms

1. **API Failure Handling**
   - Default strategy templates if API calls fail
   - Caching of previous successful responses
   - Graceful degradation to simple agent creation

2. **Balance Safeguards**
   - Attribute validation to prevent overpowered agents
   - Resource cost scaling with agent power
   - Cooldown periods between agent creation

## Performance Considerations

1. **API Call Optimization**
   - Limited frequency of strategy updates (every 30 seconds)
   - Batch processing for multiple agent creation
   - Caching of similar prompts/responses

2. **Client-Side Processing**
   - Pre-computing game state analysis
   - Efficient parsing of LLM responses
   - Fallback to client-side logic when needed

## Expected Emergent Behaviors

1. **Strategic Adaptation**
   - Teams will develop counter-strategies to opponent actions
   - Resource allocation will shift based on game state
   - Agent compositions will evolve throughout the game

2. **Team Personalities**
   - Different strategies will emerge based on early game outcomes
   - Teams may develop specialized approaches (rush, defensive, economic)
   - Interesting narrative elements from team decisions

3. **Dynamic Gameplay**
   - Unpredictable agent compositions
   - Varied strategic approaches
   - Different pathways to victory conditions