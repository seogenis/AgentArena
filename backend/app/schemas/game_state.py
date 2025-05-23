from pydantic import BaseModel
from typing import Dict, List, Optional

class Resource(BaseModel):
    """Resource model for team resources"""
    energy: int
    materials: int
    data: int

class Agent(BaseModel):
    """Agent model for representing individual agents"""
    id: int
    type: str
    health: float
    x: float
    y: float
    # Add other relevant attributes as needed

class GameState(BaseModel):
    """Game state model sent from the frontend"""
    team_id: str
    territory_control: Dict[str, float]
    resources: Dict[str, Resource]
    agents: Dict[str, List[Agent]]
    resource_distribution: Dict[str, int]