import aiq
from ..schemas.game_state import GameState
from ..schemas.strategy import TeamStrategy
import json
import os
import logging
from typing import Dict

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def generate_team_strategy(game_state: GameState) -> TeamStrategy:
    """Generate team strategy based on current game state using AIQToolkit"""
    try:
        # Prepare data for the workflow
        opponent_id = "blue" if game_state.team_id == "red" else "red"
        
        # Convert team_id to match format expected in workflow
        # Handle both numeric (1/2) and string ('red'/'blue') formats
        team_id_map = {"team1": "red", "team2": "blue", "1": "red", "2": "blue"}
        normalized_team_id = team_id_map.get(game_state.team_id, game_state.team_id)
        normalized_opponent_id = "blue" if normalized_team_id == "red" else "red"
        
        workflow_input = {
            "team_id": normalized_team_id,
            "opponent_id": normalized_opponent_id,
            "territory_control": game_state.territory_control,
            "agents": game_state.agents,
            "resources": game_state.resources,
            "resource_distribution": game_state.resource_distribution
        }
        
        logger.info(f"Generating strategy for team {normalized_team_id}")
        
        # Load and run workflow
        workflow_path = os.path.join(os.path.dirname(__file__), 
                                   "../workflows/team_strategy.yaml")
        workflow = aiq.workflows.get_workflow(workflow_path)
        result = workflow.run(input=workflow_input)
        
        # Parse result and return TeamStrategy
        strategy_data = json.loads(result.strategy)
        return TeamStrategy(**strategy_data)
    
    except Exception as e:
        logger.error(f"Error generating team strategy: {e}")
        # Provide a fallback strategy if AIQToolkit fails
        return generate_fallback_strategy(game_state)

def generate_fallback_strategy(game_state: GameState) -> TeamStrategy:
    """Generate a fallback strategy when AIQToolkit fails"""
    # Simple logic to create a balanced fallback strategy
    territory_control = game_state.territory_control
    team_id = game_state.team_id
    normalized_team_id = {"team1": "red", "team2": "blue", "1": "red", "2": "blue"}.get(team_id, team_id)
    opponent_id = "blue" if normalized_team_id == "red" else "red"
    
    team_territory = territory_control.get(normalized_team_id, 0)
    opponent_territory = territory_control.get(opponent_id, 0)
    
    # Determine strategy based on territory control
    if team_territory < opponent_territory - 10:
        # Behind in territory control
        strategy = "aggressive"
        focus = "territory"
        priorities = ["expand_territory", "attack_enemies", "collect_energy"]
        description = "Aggressive expansion to catch up in territory control."
    elif team_territory > opponent_territory + 10:
        # Ahead in territory control
        strategy = "defensive"
        focus = "resources"
        priorities = ["defend_territory", "collect_materials", "collect_energy"]
        description = "Defend current territory while building resource advantage."
    else:
        # Close game
        strategy = "balanced"
        focus = "resources"
        priorities = ["collect_energy", "expand_territory", "collect_materials"]
        description = "Balanced approach focusing on resource collection and gradual expansion."
    
    return TeamStrategy(
        strategy=strategy,
        focus=focus,
        priorities=priorities,
        description=description
    )