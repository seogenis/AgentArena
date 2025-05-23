# LLM Response Validation with Zod

This implementation uses Zod for structured output validation from LLM responses.

## How It Works

1. LLM responses are parsed using Zod schemas to ensure they match the expected structure
2. Failed validations are handled gracefully with fallbacks
3. Parsing is resilient to both well-formed JSON and text-based responses

## Schemas

### Team Strategy Schema

```javascript
const TeamStrategySchema = z.object({
    strategy: z.enum(['balanced', 'aggressive', 'economic', 'defensive']),
    focus: z.enum(['resources', 'territory', 'combat']),
    priorities: z.array(
        z.enum([
            'collect_energy', 
            'collect_materials', 
            'collect_data', 
            'expand_territory', 
            'attack_enemies', 
            'defend_territory', 
            'defend_base'
        ])
    ).min(1).max(7),
    description: z.string().min(5).max(200)
});
```

### Agent Specification Schema

```javascript
const AgentSpecificationSchema = z.object({
    role: z.enum(['collector', 'explorer', 'defender', 'attacker']),
    attributes: z.object({
        speed: z.number().min(0).max(1),
        health: z.number().min(0).max(1),
        attack: z.number().min(0).max(1),
        defense: z.number().min(0).max(1),
        carryCapacity: z.number().min(0).max(1)
    }),
    priority: z.enum(['energy', 'materials', 'data']),
    description: z.string().min(5).max(200)
});
```

## Usage

The system will automatically use Zod schemas to validate LLM responses. When calling the LLM:

```javascript
const response = await llmService.getCompletion(prompt, options);
```

The response will be:
- Validated against the appropriate schema
- Parsed into a consistent structure
- Returned as a JSON string for use in the application

## Fallback Behavior

If validation fails:
1. The system will attempt to extract key fields from text responses
2. If extraction fails, a fallback response will be provided
3. Log messages will indicate when a fallback is used

## Implementation Details

The Zod validation system is implemented in:
- `LLMSchemas.js`: Contains schemas and parsing logic
- `LLMService.js`: Uses schemas for validation before returning responses

## Benefits

- More robust LLM integration
- Consistent output format regardless of LLM response format
- Improved error handling for API responses
- Better debugging for parsing issues