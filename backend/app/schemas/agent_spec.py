from pydantic import BaseModel, Field
from typing import Dict, Optional

class AgentAttributes(BaseModel):
    """Agent attributes with constraints"""
    speed: float = Field(..., ge=0.0, le=1.0)
    health: float = Field(..., ge=0.0, le=1.0)
    attack: float = Field(..., ge=0.0, le=1.0)
    defense: float = Field(..., ge=0.0, le=1.0)
    carryCapacity: float = Field(..., ge=0.0, le=1.0)

class AgentSpecification(BaseModel):
    """Agent specification model returned to the frontend"""
    role: str  # e.g., "collector", "explorer", "defender", "attacker"
    attributes: AgentAttributes
    priority: str  # e.g., "energy", "materials", "data", "territory"
    description: str  # Human-readable description of the agent