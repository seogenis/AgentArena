# AI Territory Control Game - Game Mechanics Document

## Game Concept
A strategic game where competing LLM "spawners" create AI agents that compete for resources and territory. Each agent is controlled by its own LLM "pilot" that makes continuous decisions about actions, abilities, and strategies.

## Core Systems

### 1. World & Map
- **Size**: 800x600 pixels game area (expandable based on performance)
- **Territory Control**: Map divided into regions that can be claimed
- **Visualization**: Heat map overlay showing territory control percentages
- **Obstacles**: Procedurally generated obstacles that affect movement and visibility

### 2. Base Camps
- Two main spawning locations (one at each corner of the map)
- Each camp represents a different LLM "faction" or "spawner"
- Camps generate new agents periodically based on resources
- Camps are indestructible but can be captured
- Visual distinction between camps (colors, design elements)

### 3. Agent System (Building on Existing)
- **Creation**: LLM spawners generate agents with unique attributes
- **Attributes**: HP, Speed, Attack, Defense, Vision, Resource Capacity
- **Appearances**: Procedurally generated with team colorization
- **Abilities**: Combat abilities + new resource/territory abilities
- **Death**: Agents drop collected resources when killed

### 4. Resource System
- **Resource Types**:
  - Energy: Used for agent creation and ability fuel
  - Materials: Used for agent enhancements and base upgrades
  - Data: Used for LLM-based decision making and strategy
- **Spawn Mechanics**: Resources spawn randomly with higher concentrations in contested areas
- **Collection**: Agents must move to resources and spend time gathering
- **Storage**: Agents have limited capacity and must return to base

### 5. Territory Control
- **Zone System**: Map divided into control zones (hexagonal grid)
- **Capture Mechanics**: Agent presence contributes to zone control percentage
- **Benefits**: Controlling territory provides resource generation advantages
- **Visualization**: Color gradients showing zone control status
- **Strategic Value**: Different zones have different resource generation potential

### 6. LLM Integration
- **Spawner Role**: Creates agents with unique attributes, abilities, and strategies
- **Strategy Role**: Analyzes game state and determines team-level tactics
- **Resource Allocation**: Decides how to invest resources in new agents
- **Agent Specialization**: Designs agents with optimized attributes for specific roles
- **Deployment Planning**: Determines when and where to create new agents

## Gameplay Flow

1. **Initialization Phase**
   - Map and obstacle generation
   - Base camp placement
   - Initial resource spawning

2. **Agent Creation Phase**
   - Each LLM spawner creates initial agents
   - Agents are given initial missions and resource allocations

3. **Main Game Loop**
   - Resources spawn periodically
   - Agents collect resources and return to base
   - Territory control shifts based on agent presence
   - LLMs make continuous decisions for their agents
   - New agents spawn based on resource accumulation
   - Combat occurs when opposing agents meet

4. **Victory Conditions**
   - Control over 75% of the map for a sustained period
   - Elimination of all enemy agents
   - Resource domination (accumulating 10x the resources of opponent)

## Team Strategy & Agent Generation

The LLM spawner has access to the following information when making decisions:
- Overall territory control status
- Resource distribution and availability
- Enemy agent types and behaviors observed
- Team resource storage levels
- Current team composition and performance
- Game stage and time elapsed

Its decision space includes:
- Team strategy selection (aggressive, defensive, resource-focused)
- Agent type and role allocation (collectors, explorers, defenders, attackers)
- Agent attribute distribution (speed, health, attack, defense, vision, capacity)
- Resource investment priorities
- Deployment locations and timing
- Adaptation to enemy strategies

## Agent Decision Making (Hardcoded)

Individual agents continue to use hardcoded behavior patterns with the following information:
- Visible resources within vision range
- Visible enemy agents within vision range
- Current territory control status in visible areas
- Own status (health, resources carried, etc.)
- Current mission from their spawner
- Distance to home base

Their decision space remains:
- Movement (where to go)
- Resource collection (what to gather)
- Combat (when to engage)
- Ability usage (which to use and when)
- Territory capture (where to establish presence)
- Return to base (when to deposit resources)

## Technical Implementation

The existing codebase provides:
- Agent system with physics and movement
- Ability system for combat
- Procedural graphics for appearances
- LLM integration for decision making

New components needed:
- Territory control system with visualization
- Resource system (spawning, collection, storage)
- Base camp implementation
- Enhanced LLM prompts for strategic decision making
- Team/faction identification and interaction rules