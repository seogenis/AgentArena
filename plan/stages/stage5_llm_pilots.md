# Stage 5: LLM Agent Piloting

## Goal
Replace hardcoded behaviors with LLM-controlled agent actions.

## Implementation Requirements
- Integrate LLM API for agent decision-making
- Design agent prompt templates
- Implement agent state observation system
- Create decision parsing and execution system
- Build agent memory/context management

## Expected Results
- Agents making decisions based on LLM responses
- Natural and strategic-seeming behavior
- Appropriate responses to game situations
- Reasonably performant decision cycles

## Testing Methods
- **Console**: Logs of LLM prompts and responses
- **Visual**: Verify agent behavior matches expected strategies
- **JS Tests**: Unit tests with mock LLM responses
- **Performance**: Measure decision cycle times

## Completion Criteria
- Agents consistently make reasonable decisions
- Decision latency remains below acceptable threshold
- No hanging/freezing due to LLM calls
- Behavior appears intelligent and purposeful

## CLAUDE.md Template for This Stage

```markdown
# Current Implementation Stage: Stage 5 - LLM Agent Piloting
Status: In Progress

## Todo List:
- [ ] Set up LLM API integration
- [ ] Design agent prompt templates
- [ ] Implement agent state observation system
- [ ] Create decision parsing system
- [ ] Build agent memory/context management
- [ ] Implement response execution system
- [ ] Create fallback behaviors for API failures

## Completed:
- [x] [Add completed tasks here]

## Testing Results:
- LLM response quality: [Pass/Fail]
- Decision appropriateness: [Pass/Fail]
- Performance metrics: [Pass/Fail]
- Agent behavior coherence: [Pass/Fail]

## Issues and Solutions:
- [Document any issues encountered]

## Next Stage Preparation:
- [ ] Design team-level LLM strategy system
- [ ] Plan agent generation mechanics
```