from fastapi import APIRouter, HTTPException
from ..schemas.game_state import GameState
from ..schemas.strategy import TeamStrategy
from ..services.strategy_service import generate_team_strategy
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["strategy"])

@router.post("/team-strategy", response_model=TeamStrategy)
async def team_strategy(game_state: GameState):
    """
    Generate team strategy based on current game state
    
    This endpoint takes the current game state and generates a strategic
    plan for the specified team using AIQToolkit workflows.
    """
    try:
        logger.info(f"Received team strategy request for team {game_state.team_id}")
        strategy = await generate_team_strategy(game_state)
        logger.info(f"Generated strategy: {strategy.strategy} with focus on {strategy.focus}")
        return strategy
    except Exception as e:
        logger.error(f"Error in team strategy endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))