from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

def test_root():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "AI Territory Game Backend is running"}

@pytest.mark.skip(reason="Requires AIQToolkit setup")
def test_team_strategy():
    """Test the team strategy endpoint"""
    # Mock game state data
    game_state = {
        "team_id": "red",
        "territory_control": {"red": 45, "blue": 55},
        "resources": {
            "red": {"energy": 50, "materials": 30, "data": 20},
            "blue": {"energy": 40, "materials": 35, "data": 25}
        },
        "agents": {
            "red": [{"id": 1, "type": "collector", "health": 100, "x": 100, "y": 100}],
            "blue": [{"id": 2, "type": "explorer", "health": 90, "x": 200, "y": 200}]
        },
        "resource_distribution": {"energy": 10, "materials": 8, "data": 12}
    }
    
    response = client.post("/api/team-strategy", json=game_state)
    assert response.status_code == 200
    
    # Validate response structure
    data = response.json()
    assert "strategy" in data
    assert "focus" in data
    assert "priorities" in data
    assert "description" in data
    
    # Validate strategy values
    assert data["strategy"] in ["aggressive", "defensive", "balanced", "economic"]
    assert data["focus"] in ["territory", "resources", "combat"]
    assert isinstance(data["priorities"], list)
    assert isinstance(data["description"], str)

@pytest.mark.skip(reason="Requires AIQToolkit setup")
def test_agent_specification():
    """Test the agent specification endpoint"""
    # Mock request data
    request_data = {
        "team_id": "blue",
        "strategy": {
            "strategy": "defensive",
            "focus": "resources",
            "priorities": ["collect_energy", "defend_territory"]
        },
        "resources": {"energy": 40, "materials": 35, "data": 25},
        "current_agents": [
            {"type": "collector", "count": 3},
            {"type": "explorer", "count": 2}
        ]
    }
    
    response = client.post("/api/agent-specification", json=request_data)
    assert response.status_code == 200
    
    # Validate response structure
    data = response.json()
    assert "role" in data
    assert "attributes" in data
    assert "priority" in data
    assert "description" in data
    
    # Validate agent values
    assert data["role"] in ["collector", "explorer", "defender", "attacker"]
    
    # Validate attributes
    attributes = data["attributes"]
    for attr in ["speed", "health", "attack", "defense", "carryCapacity"]:
        assert attr in attributes
        assert 0 <= attributes[attr] <= 1
    
    # Validate attribute sum
    attr_sum = sum(attributes.values())
    assert attr_sum <= 3.0