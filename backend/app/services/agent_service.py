import aiq
from ..schemas.agent_spec import AgentSpecification, AgentAttributes
from ..schemas.strategy import TeamStrategy
import json
import os
import logging
from typing import Dict, List

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentRequest:
    """Request structure for agent creation"""
    def __init__(self, team_id: str, strategy: TeamStrategy, resources: Dict, current_agents: List[Dict]):
        self.team_id = team_id
        self.strategy = strategy
        self.resources = resources
        self.current_agents = current_agents

async def generate_agent_specification(request_data: dict) -> AgentSpecification:
    """Generate specialized agent specification based on team needs using AIQToolkit"""
    try:
        # Extract and validate request data
        team_id = request_data.get("team_id")
        strategy = request_data.get("strategy")
        resources = request_data.get("resources")
        current_agents = request_data.get("current_agents", [])
        
        # Convert team_id to match format expected in workflow
        team_id_map = {"team1": "red", "team2": "blue", "1": "red", "2": "blue"}
        normalized_team_id = team_id_map.get(team_id, team_id)
        
        logger.info(f"Generating agent specification for team {normalized_team_id}")
        
        # Prepare input for workflow
        workflow_input = {
            "team_id": normalized_team_id,
            "strategy": strategy,
            "resources": resources,
            "current_agents": current_agents
        }
        
        # Load and run workflow
        workflow_path = os.path.join(os.path.dirname(__file__), 
                                   "../workflows/agent_creation.yaml")
        workflow = aiq.workflows.get_workflow(workflow_path)
        result = workflow.run(input=workflow_input)
        
        # Parse result and return AgentSpecification
        agent_data = json.loads(result.agent)
        
        # Validate that the sum of attributes doesn't exceed 3.0
        attributes = agent_data.get("attributes", {})
        attr_sum = sum(attributes.values())
        if attr_sum > 3.0:
            # Scale down attributes if they exceed the limit
            scale_factor = 3.0 / attr_sum
            for key in attributes:
                attributes[key] = round(attributes[key] * scale_factor, 2)
        
        return AgentSpecification(**agent_data)
    
    except Exception as e:
        logger.error(f"Error generating agent specification: {e}")
        # Provide a fallback agent if AIQToolkit fails
        return generate_fallback_agent(request_data)

def generate_fallback_agent(request_data: dict) -> AgentSpecification:
    """Generate a fallback agent when AIQToolkit fails"""
    # Extract basic information from request
    team_id = request_data.get("team_id")
    strategy = request_data.get("strategy", {})
    strategy_type = strategy.get("strategy", "balanced")
    focus = strategy.get("focus", "resources")
    
    # Create a different agent type based on the strategy
    if strategy_type == "aggressive":
        role = "attacker"
        attributes = AgentAttributes(
            speed=0.7,
            health=0.6,
            attack=0.8,
            defense=0.4,
            carryCapacity=0.3
        )
        priority = "territory"
        description = "Fast attacker focused on territory control."
    
    elif strategy_type == "defensive":
        role = "defender"
        attributes = AgentAttributes(
            speed=0.4,
            health=0.9,
            attack=0.5,
            defense=0.9,
            carryCapacity=0.2
        )
        priority = "territory"
        description = "Sturdy defender with high health and defense."
    
    elif strategy_type == "economic" or focus == "resources":
        role = "collector"
        attributes = AgentAttributes(
            speed=0.6,
            health=0.5,
            attack=0.3,
            defense=0.5,
            carryCapacity=0.9
        )
        priority = "energy"  # Default to energy as a safe choice
        description = "Efficient collector with high carry capacity."
    
    else:  # balanced or any other
        role = "explorer"
        attributes = AgentAttributes(
            speed=0.8,
            health=0.6,
            attack=0.5,
            defense=0.5,
            carryCapacity=0.6
        )
        priority = "data"
        description = "Fast explorer balancing combat and collection abilities."
    
    return AgentSpecification(
        role=role,
        attributes=attributes,
        priority=priority,
        description=description
    )