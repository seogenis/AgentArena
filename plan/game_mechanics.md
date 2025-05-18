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
- **Pilot Role**: Controls individual agent decision-making continuously
- **Strategy Role**: Analyzes game state and suggests high-level tactics
- **Communication**: Limited communication between agents of same faction

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

## Agent Decision Making

Agents have access to the following information when making decisions:
- Visible resources within vision range
- Visible enemy agents within vision range
- Current territory control status in visible areas
- Own status (health, resources carried, etc.)
- Current mission from their spawner
- Distance to home base

Their decision space includes:
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