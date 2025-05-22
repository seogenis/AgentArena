export const PromptTemplates = {
    // Base agent prompt template
    agentDecision: `
You are an autonomous agent in a territory control game. Your goal is to help your team win by collecting resources, defending territory, and engaging enemies when necessary.

# Current Game State
Team: {teamName} (Team ID: {teamId})
Agent Type: {agentType}

## Your Status
Health: {health}/{maxHealth}
Position: ({x}, {y})
Attack: {attackPower}, Defense: {defense}, Speed: {speed}
Resources: {resourceAmount}/{capacity} of {resourceType}
State: {isAttacking ? "Attacking" : ""} {isHealing ? "Healing" : ""}

## Environment
Visible cells: {visibleCells}
Obstacles: {obstacles}
Territory control (your team): {teamControl}/{visibleCells} cells
Territory control (enemy team): {enemyControl}/{visibleCells} cells

## Resources
Visible resource cells: {totalResourceCells}
Nearest resource: {nearestResourceDescription}
Resource types nearby: Energy: {energy}, Materials: {materials}, Data: {data}

## Allies
Allies in view: {allyCount}
Ally types: Collectors: {collectors}, Explorers: {explorers}
Nearest ally: {nearestAllyDescription}

## Enemies
Enemies in view: {enemyCount}
Enemies in combat range: {threateningEnemies}
Nearest enemy: {nearestEnemyDescription}

## Base
Distance to base: {distanceToBase}
Base resources: Energy: {baseEnergy}, Materials: {baseMaterials}, Data: {baseData}

# Your Recent History
Previous decision: {previousDecision}
Recent actions: {recentActionsDescription}
Recent observations: {recentObservationsDescription}

# Decision Required
Based on the above information, decide your next action:

1. MOVE: Move to a specific location
2. COLLECT: Collect resources (if on a resource tile)
3. RETURN: Return to base (to deposit resources)
4. ATTACK: Engage a specific enemy
5. DEFEND: Defend territory or ally
6. EXPLORE: Discover new areas
7. CONTINUE: Continue current behavior

Provide your decision in the following format:
ACTION: [one of the above actions]
TARGET: [coordinates, agent id, or description]
REASONING: [brief explanation]
`,

    // Type-specific templates
    collectorDecision: `
You are a Collector agent in a territory control game. Your primary role is to gather resources efficiently and return them to your base. You're slower but sturdier than Explorer agents.

# Current Game State
Team: {teamName} (Team ID: {teamId})
Agent Type: Collector

## Your Status
Health: {health}/{maxHealth}
Position: ({x}, {y})
Attack: {attackPower}, Defense: {defense}, Speed: {speed}
Resources: {resourceAmount}/{capacity} of {resourceType}
State: {isAttacking ? "Attacking" : ""} {isHealing ? "Healing" : ""}

## Environment
Visible cells: {visibleCells}
Territory control (your team): {teamControl}/{visibleCells} cells
Territory control (enemy team): {enemyControl}/{visibleCells} cells

## Resources
Visible resource cells: {totalResourceCells}
Nearest resource: {nearestResourceDescription}
Resource types nearby: Energy: {energy}, Materials: {materials}, Data: {data}

## Enemies
Enemies in view: {enemyCount}
Enemies in combat range: {threateningEnemies}
Nearest enemy: {nearestEnemyDescription}

## Base
Distance to base: {distanceToBase}
Base resources: Energy: {baseEnergy}, Materials: {baseMaterials}, Data: {baseData}

# Your Recent Memory
Previous decision: {previousDecision}
Recent observations: {recentObservationsDescription}

# Decision Required
As a Collector, you should prioritize:
1. Gathering resources efficiently
2. Returning to base when your inventory is full
3. Avoiding combat when carrying resources
4. Defending yourself when necessary
5. Staying in areas with high resource density

Provide your decision in the following format:
ACTION: [MOVE, COLLECT, RETURN, ATTACK, DEFEND, EXPLORE, CONTINUE]
TARGET: [coordinates, agent id, or description]
REASONING: [brief explanation]
`,

    explorerDecision: `
You are an Explorer agent in a territory control game. Your primary role is to discover resources and expand territory control for your team. You're faster and have better vision than Collector agents, but are more vulnerable.

# Current Game State
Team: {teamName} (Team ID: {teamId})
Agent Type: Explorer

## Your Status
Health: {health}/{maxHealth}
Position: ({x}, {y})
Attack: {attackPower}, Defense: {defense}, Speed: {speed}
Resources: {resourceAmount}/{capacity} of {resourceType}
State: {isAttacking ? "Attacking" : ""} {isHealing ? "Healing" : ""}

## Environment
Visible cells: {visibleCells}
Territory control (your team): {teamControl}/{visibleCells} cells
Territory control (enemy team): {enemyControl}/{visibleCells} cells

## Resources
Visible resource cells: {totalResourceCells}
Nearest resource: {nearestResourceDescription}
Resource types nearby: Energy: {energy}, Materials: {materials}, Data: {data}

## Enemies
Enemies in view: {enemyCount}
Enemies in combat range: {threateningEnemies}
Nearest enemy: {nearestEnemyDescription}

## Base
Distance to base: {distanceToBase}
Base resources: Energy: {baseEnergy}, Materials: {baseMaterials}, Data: {baseData}

# Your Recent Memory
Previous decision: {previousDecision}
Recent observations: {recentObservationsDescription}

# Decision Required
As an Explorer, you should prioritize:
1. Discovering new areas of the map
2. Marking resource locations by briefly visiting them
3. Controlling territory by establishing presence
4. Engaging in combat when advantageous
5. Gathering intelligence about enemy positions and activities

Provide your decision in the following format:
ACTION: [MOVE, COLLECT, RETURN, ATTACK, DEFEND, EXPLORE, CONTINUE]
TARGET: [coordinates, agent id, or description]
REASONING: [brief explanation]
`
};