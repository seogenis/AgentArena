export class ObservationSystem {
    constructor(hexGrid, agentSystem, resourceSystem, baseSystem) {
        this.hexGrid = hexGrid;
        this.agentSystem = agentSystem;
        this.resourceSystem = resourceSystem;
        this.baseSystem = baseSystem;
    }

    // Get all observations for an agent
    getAgentObservations(agent) {
        return {
            agent: this.getAgentStatus(agent),
            environment: this.getEnvironmentObservations(agent),
            resources: this.getResourceObservations(agent),
            enemies: this.getEnemyObservations(agent),
            allies: this.getAllyObservations(agent),
            territory: this.getTerritoryObservations(agent),
            base: this.getBaseObservations(agent)
        };
    }

    // Get agent's own status
    getAgentStatus(agent) {
        return {
            id: agent.id,
            teamId: agent.teamId,
            type: agent.type,
            position: { x: agent.x, y: agent.y },
            health: agent.health,
            maxHealth: agent.maxHealth,
            attackPower: agent.attackPower,
            defense: agent.defense,
            speed: agent.speed,
            visionRange: agent.visionRange,
            resourceType: agent.resourceType,
            resourceAmount: agent.resourceAmount,
            capacity: agent.capacity,
            isAttacking: agent.isAttacking,
            isHealing: agent.isHealing
        };
    }

    // Get information about the environment around the agent
    getEnvironmentObservations(agent) {
        const visibleCells = this.getVisibleCells(agent);
        
        return {
            visibleCells: visibleCells.length,
            obstacles: this.countObstacles(visibleCells),
            avgControlLevel: this.averageControlLevel(visibleCells)
        };
    }

    // Get information about resources in vision range
    getResourceObservations(agent) {
        const visibleCells = this.getVisibleCells(agent);
        const resourceCells = visibleCells.filter(cell => cell.resourceType && cell.resourceAmount > 0);
        
        return {
            totalResourceCells: resourceCells.length,
            nearestResource: this.findNearestResource(agent, resourceCells),
            resourceTypes: this.countResourceTypes(resourceCells)
        };
    }

    // Get information about enemies in vision range
    getEnemyObservations(agent) {
        const visibleEnemies = this.getVisibleEnemies(agent);
        
        return {
            count: visibleEnemies.length,
            nearestEnemy: this.getNearestEntity(agent, visibleEnemies),
            threateningEnemies: this.getThreateningEnemies(agent, visibleEnemies)
        };
    }

    // Get information about allies in vision range
    getAllyObservations(agent) {
        const visibleAllies = this.getVisibleAllies(agent);
        
        return {
            count: visibleAllies.length,
            nearestAlly: this.getNearestEntity(agent, visibleAllies),
            allyTypes: {
                collectors: visibleAllies.filter(a => a.type === 'collector').length,
                explorers: visibleAllies.filter(a => a.type === 'explorer').length
            }
        };
    }

    // Get information about territory control in vision range
    getTerritoryObservations(agent) {
        const visibleCells = this.getVisibleCells(agent);
        
        let teamControl = 0;
        let enemyControl = 0;
        
        for (const cell of visibleCells) {
            if ((agent.teamId === 1 && cell.controlLevel < -0.2) || 
                (agent.teamId === 2 && cell.controlLevel > 0.2)) {
                teamControl++;
            } else if ((agent.teamId === 1 && cell.controlLevel > 0.2) || 
                       (agent.teamId === 2 && cell.controlLevel < -0.2)) {
                enemyControl++;
            }
        }
        
        return {
            teamControl,
            enemyControl,
            contested: visibleCells.length - teamControl - enemyControl,
            controlRatio: visibleCells.length > 0 ? 
                teamControl / visibleCells.length : 0
        };
    }

    // Get information about the agent's base
    getBaseObservations(agent) {
        const basePos = this.baseSystem.getBasePosition(agent.teamId);
        if (!basePos) return null;
        
        const distanceToBase = Math.sqrt(
            Math.pow(agent.x - basePos.x, 2) + 
            Math.pow(agent.y - basePos.y, 2)
        );
        
        return {
            position: basePos,
            distanceToBase,
            resources: this.baseSystem.getResources(agent.teamId)
        };
    }

    // Helper methods
    
    getVisibleCells(agent) {
        const visibleCells = [];
        
        for (const cell of this.hexGrid.cells) {
            const distanceToCell = Math.sqrt(
                Math.pow(agent.x - cell.centerX, 2) + 
                Math.pow(agent.y - cell.centerY, 2)
            );
            
            if (distanceToCell <= agent.visionRange) {
                visibleCells.push(cell);
            }
        }
        
        return visibleCells;
    }
    
    countObstacles(cells) {
        return cells.filter(cell => cell.hasObstacle).length;
    }
    
    averageControlLevel(cells) {
        if (cells.length === 0) return 0;
        
        const sum = cells.reduce((total, cell) => total + cell.controlLevel, 0);
        return sum / cells.length;
    }
    
    findNearestResource(agent, resourceCells) {
        if (resourceCells.length === 0) return null;
        
        let nearest = null;
        let nearestDistance = Infinity;
        
        for (const cell of resourceCells) {
            const distance = Math.sqrt(
                Math.pow(agent.x - cell.centerX, 2) + 
                Math.pow(agent.y - cell.centerY, 2)
            );
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = {
                    position: { x: cell.centerX, y: cell.centerY },
                    type: cell.resourceType,
                    amount: cell.resourceAmount,
                    distance: nearestDistance
                };
            }
        }
        
        return nearest;
    }
    
    countResourceTypes(resourceCells) {
        return {
            energy: resourceCells.filter(cell => cell.resourceType === 'energy').length,
            materials: resourceCells.filter(cell => cell.resourceType === 'materials').length,
            data: resourceCells.filter(cell => cell.resourceType === 'data').length
        };
    }
    
    getVisibleEnemies(agent) {
        return this.agentSystem.agents.filter(other => {
            if (other.teamId === agent.teamId) return false;
            
            const distance = Math.sqrt(
                Math.pow(agent.x - other.x, 2) + 
                Math.pow(agent.y - other.y, 2)
            );
            
            return distance <= agent.visionRange;
        });
    }
    
    getVisibleAllies(agent) {
        return this.agentSystem.agents.filter(other => {
            if (other.id === agent.id || other.teamId !== agent.teamId) return false;
            
            const distance = Math.sqrt(
                Math.pow(agent.x - other.x, 2) + 
                Math.pow(agent.y - other.y, 2)
            );
            
            return distance <= agent.visionRange;
        });
    }
    
    getNearestEntity(agent, entities) {
        if (entities.length === 0) return null;
        
        let nearest = null;
        let nearestDistance = Infinity;
        
        for (const entity of entities) {
            const distance = Math.sqrt(
                Math.pow(agent.x - entity.x, 2) + 
                Math.pow(agent.y - entity.y, 2)
            );
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = {
                    id: entity.id,
                    type: entity.type,
                    position: { x: entity.x, y: entity.y },
                    health: entity.health,
                    resourceType: entity.resourceType,
                    resourceAmount: entity.resourceAmount,
                    distance: nearestDistance
                };
            }
        }
        
        return nearest;
    }
    
    getThreateningEnemies(agent, enemies) {
        const combatRange = this.agentSystem.combatRange;
        
        return enemies.filter(enemy => {
            const distance = Math.sqrt(
                Math.pow(agent.x - enemy.x, 2) + 
                Math.pow(agent.y - enemy.y, 2)
            );
            
            return distance <= combatRange;
        }).map(enemy => ({
            id: enemy.id,
            type: enemy.type,
            position: { x: enemy.x, y: enemy.y },
            health: enemy.health,
            attackPower: enemy.attackPower,
            distance: Math.sqrt(
                Math.pow(agent.x - enemy.x, 2) + 
                Math.pow(agent.y - enemy.y, 2)
            )
        }));
    }
}