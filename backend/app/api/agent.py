from fastapi import APIRouter, HTTPException
from ..schemas.agent_spec import AgentSpecification
from ..services.agent_service import generate_agent_specification
import logging
from pydantic import BaseModel

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["agent"])

@router.post("/agent-specification", response_model=AgentSpecification)
async def agent_specification(request_data: dict):
    """
    Generate specialized agent specification based on team needs
    
    This endpoint takes team strategy, resource availability, and current team
    composition to generate a specialized agent using AIQToolkit workflows.
    """
    try:
        # Validate required fields
        required_fields = ["team_id", "strategy", "resources"]
        for field in required_fields:
            if field not in request_data:
                raise HTTPException(
                    status_code=422, 
                    detail=f"Missing required field: {field}"
                )
        
        logger.info(f"Received agent specification request for team {request_data['team_id']}")
        agent_spec = await generate_agent_specification(request_data)
        logger.info(f"Generated agent: {agent_spec.role} with priority {agent_spec.priority}")
        return agent_spec
    except Exception as e:
        logger.error(f"Error in agent specification endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))