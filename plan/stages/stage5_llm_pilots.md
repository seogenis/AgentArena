# Stage 5: LLM Agent Piloting

## Goal
Replace hardcoded behaviors with LLM-controlled agent actions and implement a unified observability system for agent perception.

## Implementation Requirements
- Integrate LLM API for agent decision-making
- Design agent prompt templates with personality traits and backstory generation
- Implement [Unified Observability System](/plan/unified_observability_system.md) with:
  - Vision range and limitations (fog of war)
  - Environmental sensing (terrain, resources, dangers)
  - Agent state awareness (health, inventory, abilities)
  - Team knowledge sharing mechanism
- Create decision parsing and execution system
- Build agent memory/context management for persistent personalities
- Implement agent specialization emergence (allow agents to develop roles organically)
- Add agent-to-agent communication system

## Expected Results
- Agents making decisions based on LLM responses
- Natural and strategic-seeming behavior
- Agent personalities that persist and evolve
- Knowledge sharing between allied agents
- Emergent specialization based on experience
- Appropriate responses to game situations
- Reasonably performant decision cycles
- Visible indications of agent awareness

## Testing Methods
- **Console**: Logs of LLM prompts and responses
- **Visual**: Verify agent behavior matches expected strategies
- **Visualization**: Agent vision cones/perception visualization toggle
- **JS Tests**: Unit tests with mock LLM responses
- **Performance**: Measure decision cycle times
- **Coherence**: Test agent memory persistence

## Completion Criteria
- Agents consistently make reasonable decisions
- Decision latency remains below acceptable threshold
- No hanging/freezing due to LLM calls
- Agent personalities remain consistent across decision cycles
- Knowledge sharing functions correctly between team members
- Observability system accurately limits and provides information
- Behavior appears intelligent and purposeful
- Demo shows agents with unique personalities making strategic decisions

## CLAUDE.md Template for This Stage

```markdown
# Current Implementation Stage: Stage 5 - LLM Agent Piloting
Status: In Progress

## Todo List:
- [ ] Set up LLM API integration
- [ ] Design agent prompt templates with personality generation
- [ ] Implement unified observability system
  - [ ] Create vision/perception mechanics
  - [ ] Build environmental awareness system
  - [ ] Implement agent state tracking
  - [ ] Add team knowledge sharing
- [ ] Create decision parsing system
- [ ] Build agent memory/context management
- [ ] Implement agent specialization emergence
- [ ] Create agent-to-agent communication
- [ ] Implement response execution system
- [ ] Create fallback behaviors for API failures
- [ ] Add visualization for agent perception (debug mode)

## Completed:
- [x] [Add completed tasks here]

## Testing Results:
- LLM response quality: [Pass/Fail]
- Decision appropriateness: [Pass/Fail]
- Agent personality consistency: [Pass/Fail]
- Knowledge sharing functionality: [Pass/Fail]
- Vision system accuracy: [Pass/Fail]
- Performance metrics: [Pass/Fail]
- Agent behavior coherence: [Pass/Fail]

## Issues and Solutions:
- [Document any issues encountered]

## Next Stage Preparation:
- [ ] Design team-level LLM strategy system
- [ ] Plan agent generation mechanics
```

## Implementation Notes

This stage will implement the first major version of the [Unified Observability System](/plan/unified_observability_system.md) which serves as the foundation for all LLM-based decision making. Refer to the full specification for implementation details.

Key focus areas for this stage:

1. **Individual Agent Perception**
   - Implementing the core perception framework
   - Building the agent memory system
   - Creating the initial knowledge sharing mechanisms

2. **Decision Context Formation**
   - Transforming raw perceptions into structured decision contexts
   - Formatting perception data for LLM consumption
   - Maintaining appropriate context length for efficient prompting

3. **Personality Integration**
   - Developing a system where agent personalities affect perception
   - Creating persistent traits that evolve based on experience
   - Allowing specialization to emerge from repeated actions

This foundational work will be expanded in Stage 6 to include team-level strategic awareness and coordination.