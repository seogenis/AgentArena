import pytest
from app.schemas.game_state import GameState, Resource, Agent
from app.services.strategy_service import generate_fallback_strategy
from app.services.agent_service import generate_fallback_agent
from typing import Dict, List

@pytest.mark.asyncio
async def test_fallback_strategy():
    """Test the fallback strategy generation"""
    # Create a mock game state
    game_state = GameState(
        team_id="red",
        territory_control={"red": 45, "blue": 55},
        resources={
            "red": Resource(energy=50, materials=30, data=20), 
            "blue": Resource(energy=40, materials=35, data=25)
        },
        agents={
            "red": [Agent(id=1, type="collector", health=100, x=100, y=100)],
            "blue": [Agent(id=2, type="explorer", health=90, x=200, y=200)]
        },
        resource_distribution={"energy": 10, "materials": 8, "data": 12}
    )
    
    # Generate fallback strategy
    strategy = generate_fallback_strategy(game_state)
    
    # Validate strategy fields
    assert strategy.strategy in ["aggressive", "defensive", "balanced", "economic"]
    assert strategy.focus in ["territory", "resources", "combat"]
    assert isinstance(strategy.priorities, list)
    assert len(strategy.priorities) > 0
    assert isinstance(strategy.description, str)

def test_fallback_agent():
    """Test the fallback agent generation"""
    # Test with different strategy types
    strategies = ["aggressive", "defensive", "economic", "balanced"]
    
    for strategy_type in strategies:
        request_data = {
            "team_id": "blue",
            "strategy": {
                "strategy": strategy_type,
                "focus": "resources"
            },
            "resources": {"energy": 40, "materials": 35, "data": 25}
        }
        
        # Generate fallback agent
        agent = generate_fallback_agent(request_data)
        
        # Validate agent fields
        assert agent.role in ["collector", "explorer", "defender", "attacker"]
        assert agent.priority in ["energy", "materials", "data", "territory"]
        assert isinstance(agent.description, str)
        
        # Validate attributes
        attributes = agent.attributes.dict()
        for attr, value in attributes.items():
            assert 0 <= value <= 1
        
        # Validate attribute sum
        attr_sum = sum(attributes.values())
        assert attr_sum <= 3.0