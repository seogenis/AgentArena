# Unified Observability System

## Overview
The Unified Observability System (UOS) serves as the sensory and perception framework for all agents in the game, providing a consistent approach to how information is gathered, processed, shared, and acted upon. This system is critical for enabling genuinely strategic AI behavior by creating information asymmetry and the need for exploration and information sharing.

## Core Components

### 1. Perception Framework

#### Vision System
- **Vision Range**: Determined by agent attributes and team technology
- **Line of Sight**: Blocked by obstacles and terrain features
- **Fog of War**: Areas not currently visible or previously unexplored
- **Detection Probability**: Chance to spot partially hidden elements based on distance
- **Visual Memory**: Remembering previously seen but currently out-of-sight elements

#### Environmental Sensing
- **Resource Detection**: Identification of resource types and quantities
- **Terrain Analysis**: Understanding movement costs and strategic implications
- **Hazard Detection**: Awareness of dangerous areas or enemy-controlled zones
- **Weather/Time Effects**: Perception of environmental conditions affecting gameplay
- **Base Detection**: Awareness of friendly and enemy bases

### 2. Information Processing

#### Data Abstraction
- **Threat Assessment**: Converting raw observations into threat levels
- **Resource Prioritization**: Evaluating resource value based on team needs
- **Strategic Point Identification**: Recognizing key locations on the map
- **Pattern Recognition**: Identifying recurring enemy behaviors or strategies
- **Anomaly Detection**: Noting unusual observations that might indicate special strategies

#### Metadata Generation
- **Confidence Levels**: Uncertainty measures for observations
- **Timestamp Information**: When information was last updated
- **Source Attribution**: Which agent provided the information
- **Derived Insights**: Conclusions drawn from multiple observations

### 3. Knowledge Management

#### Team Memory
- **Shared Knowledge Repository**: Information accessible to all team members
- **Memory Decay**: Information becoming less reliable over time
- **Contradictory Information Handling**: Resolving conflicting reports
- **Knowledge Gaps**: Identifying what is not known and needs exploration
- **Historical Records**: Tracking significant events and their outcomes

#### Communication System
- **Agent-to-Agent**: Direct information sharing between nearby agents
- **Agent-to-Base**: Reporting to the central command
- **Base-to-Agent**: Broadcasting strategic directives
- **Priority Levels**: Urgency classification for communications
- **Bandwidth Limitations**: Constraints on information transfer

### 4. Decision Support

#### Context Provision
- **Situational Awareness**: Current state relative to goals
- **Historical Context**: Past events relevant to current decisions
- **Team Strategy Alignment**: How individual actions support team goals
- **Risk Assessment**: Potential dangers in different actions

#### Prediction Support
- **Outcome Projection**: Likely results of potential actions
- **Enemy Intention Modeling**: Predicting opponent moves
- **Resource Trend Analysis**: Forecasting resource availability
- **Territory Control Projection**: Predicting map control changes

### 5. Visualization Layer (Debug/Development)

#### Agent Perspective View
- **Vision Cones/Radii**: Visual representation of what agents can see
- **Information Confidence**: Color coding for certainty levels
- **Memory Representation**: Distinguishing direct observation from memory
- **Knowledge Sharing Visualization**: Showing information transfer between agents

#### Team Knowledge Map
- **Combined Knowledge Visualization**: What the entire team knows
- **Unknown Territory Marking**: Highlighting unexplored areas
- **Strategic Assessment Overlay**: Team's evaluation of map importance
- **Historical Event Markers**: Significant past events on the map

## Technical Implementation

### 1. Core Data Structures

```javascript
// Agent Perception Object
{
  visibleEntities: [
    { type: "Agent", team: "red", position: {x, y}, carrying: "energy", health: 0.75, ... },
    { type: "Resource", resourceType: "materials", position: {x, y}, quantity: 50, ... },
    // ...
  ],
  knownTerritory: [
    { position: {x, y}, controlStatus: 0.8, lastSeen: timestamp, confidence: 0.9 },
    // ...
  ],
  environmentalConditions: {
    localWeather: "normal",
    visibility: 1.0,
    dangerLevel: 0.2,
    // ...
  },
  teamKnowledge: {
    enemyBaseLocations: [...],
    resourceHotspots: [...],
    dangerZones: [...],
    // ...
  }
}
```

### 2. Key Methods

```javascript
// Core observation method run every frame
observeEnvironment(agent, world) -> perceptionObject

// Memory and knowledge management
updateAgentMemory(agent, perceptionObject)
shareInformation(sourceAgent, targetAgent, information)
consolidateTeamKnowledge(team, allAgentObservations)

// Decision support
generateDecisionContext(agent) -> contextObject
evaluateActionOptions(agent, contextObject, possibleActions) -> rankedActions

// Visualization helpers
renderAgentVisionCone(agent, debugCanvas)
renderTeamKnowledgeMap(team, debugCanvas)
```

### 3. Integration Points

The Unified Observability System interacts with several other game systems:

- **Agent System**: Provides perception capabilities to all agents
- **World System**: Supplies the raw environmental data to be observed
- **LLM Integration**: Feeds processed observations into prompts
- **UI System**: Visualizes knowledge and perception in debug mode
- **Combat System**: Uses perception for targeting and threat assessment
- **Resource System**: Uses perception for resource discovery and evaluation

## Implementation Phases

The UOS will be implemented incrementally across stages:

1. **Stage 4 (Current)**: Basic observation of environment without knowledge sharing
2. **Stage 5**: Full agent perception with memory and initial knowledge sharing
3. **Stage 6**: Team-level knowledge consolidation and strategic analysis
4. **Stage 7**: Advanced features including predictive capabilities and narrative integration

## Design Principles

1. **Information Asymmetry**: Create meaningful differences in what agents know
2. **Emergence**: Enable complex behaviors to emerge from simple perception rules
3. **Efficiency**: Optimize for performance with large numbers of agents
4. **Extensibility**: Design for easy addition of new perception types
5. **Debuggability**: Make the invisible visible for development and testing

## Example Usage in LLM Prompts

```
Your current perception:
- You can see 3 energy resources within your vision range
- There is 1 enemy agent approaching from the north-east
- Your team controls 60% of the territory in your vision
- The nearest friendly agent is a collector, 200 units south
- Your base is 500 units west
- You are carrying 30 units of materials
- The weather is foggy, reducing vision range by 20%

Your team's strategic knowledge:
- The enemy has been focusing on the south-eastern quadrant
- Your team needs more energy resources (current priority)
- The northern corridor has been contested for the last 5 minutes
- Your team has developed a specialization in resource efficiency
```

This structured observability information will help LLMs make informed, strategic decisions while maintaining the challenge of incomplete information that makes strategy games engaging.