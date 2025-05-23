from pydantic import BaseModel
from typing import List, Optional

class TeamStrategy(BaseModel):
    """Team strategy model returned to the frontend"""
    strategy: str  # e.g., "aggressive", "defensive", "balanced", "economic"
    focus: str     # e.g., "territory", "resources", "combat"
    priorities: List[str]  # e.g., ["expand_territory", "collect_energy", "attack_enemies"]
    description: str  # Human-readable description of the strategy