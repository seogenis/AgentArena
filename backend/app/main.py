from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket, WebSocketDisconnect
import json
import os
from typing import Dict, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Territory Game Backend")

# Configure CORS
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "AI Territory Game Backend is running", "mock_mode": os.getenv("USE_MOCK_RESPONSES", "true").lower() == "true"}

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Process game state and generate directives
            game_state = json.loads(data)
            # Using fallback directives since AIQToolkit is not available
            directives = {"message": "Received game state", "status": "mock_mode"}
            await manager.send_personal_message(json.dumps(directives), client_id)
    except WebSocketDisconnect:
        manager.disconnect(client_id)

# Import and include API routers
from app.api import strategy, agent

# Include API routers
app.include_router(strategy.router)
app.include_router(agent.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)