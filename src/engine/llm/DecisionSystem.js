export class DecisionSystem {
    constructor(agentSystem, hexGrid, baseSystem) {
        this.agentSystem = agentSystem;
        this.hexGrid = hexGrid;
        this.baseSystem = baseSystem;
    }
    
    // Parse the LLM response into a structured decision object
    parseDecision(llmResponse) {
        try {
            // Extract decision components using regex
            const actionMatch = llmResponse.match(/ACTION:\s*([A-Z]+)/i);
            const targetMatch = llmResponse.match(/TARGET:\s*(.+?)(?=\n|REASONING:|$)/is);
            const reasoningMatch = llmResponse.match(/REASONING:\s*(.+?)(?=$)/is);
            
            // If we can't parse the response properly, return a continue action
            if (!actionMatch) {
                console.warn("Could not parse LLM decision, using fallback");
                return { action: "CONTINUE", target: null, reasoning: "Parsing error" };
            }
            
            // Extract the components
            const action = actionMatch[1].trim().toUpperCase();
            const target = targetMatch ? targetMatch[1].trim() : null;
            const reasoning = reasoningMatch ? reasoningMatch[1].trim() : "No reasoning provided";
            
            return { action, target, reasoning };
        } catch (error) {
            console.error("Error parsing LLM decision:", error);
            return { action: "CONTINUE", target: null, reasoning: "Parsing error" };
        }
    }
    
    // Execute a decision for an agent
    executeDecision(agent, decision) {
        // Log the decision for debugging
        console.log(`Agent ${agent.id} (${agent.teamId}) decision: ${decision.action} -> ${decision.target}`);
        console.log(`Reasoning: ${decision.reasoning}`);
        
        switch (decision.action) {
            case "MOVE":
                this.executeMove(agent, decision.target);
                break;
                
            case "COLLECT":
                this.executeCollect(agent);
                break;
                
            case "RETURN":
                this.executeReturn(agent);
                break;
                
            case "ATTACK":
                this.executeAttack(agent, decision.target);
                break;
                
            case "DEFEND":
                this.executeDefend(agent, decision.target);
                break;
                
            case "EXPLORE":
                this.executeExplore(agent);
                break;
                
            case "CONTINUE":
            default:
                // Do nothing, agent continues current behavior
                break;
        }
        
        return true;
    }
    
    // Implementation of specific decision execution
    
    executeMove(agent, targetDescription) {
        try {
            // Parse coordinates from target description
            let targetX, targetY;
            
            // Check if target is coordinates
            const coordMatch = targetDescription.match(/\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/);
            
            if (coordMatch) {
                // Direct coordinates
                targetX = parseFloat(coordMatch[1]);
                targetY = parseFloat(coordMatch[2]);
            } else if (targetDescription.toLowerCase().includes("resource")) {
                // Move to nearest resource
                const cell = this.findNearestResourceCell(agent);
                if (cell) {
                    targetX = cell.centerX;
                    targetY = cell.centerY;
                }
            } else if (targetDescription.toLowerCase().includes("base")) {
                // Move to base
                const basePos = this.baseSystem.getBasePosition(agent.teamId);
                if (basePos) {
                    targetX = basePos.x;
                    targetY = basePos.y;
                }
            } else if (targetDescription.toLowerCase().includes("enemy")) {
                // Move toward nearest enemy
                const enemy = this.findNearestEnemy(agent);
                if (enemy) {
                    targetX = enemy.x;
                    targetY = enemy.y;
                }
            } else if (targetDescription.toLowerCase().includes("ally")) {
                // Move toward nearest ally
                const ally = this.findNearestAlly(agent);
                if (ally) {
                    targetX = ally.x;
                    targetY = ally.y;
                }
            } else {
                // Try to parse a general direction
                const directionMap = {
                    'north': { x: 0, y: -1 },
                    'south': { x: 0, y: 1 },
                    'east': { x: 1, y: 0 },
                    'west': { x: -1, y: 0 },
                    'northeast': { x: 0.7, y: -0.7 },
                    'northwest': { x: -0.7, y: -0.7 },
                    'southeast': { x: 0.7, y: 0.7 },
                    'southwest': { x: -0.7, y: 0.7 }
                };
                
                for (const [direction, vector] of Object.entries(directionMap)) {
                    if (targetDescription.toLowerCase().includes(direction)) {
                        targetX = agent.x + vector.x * 200; // Move 200 pixels in that direction
                        targetY = agent.y + vector.y * 200;
                        break;
                    }
                }
            }
            
            // If we have valid coordinates, set the target
            if (targetX !== undefined && targetY !== undefined) {
                agent.setTarget(targetX, targetY);
                return true;
            }
            
        } catch (error) {
            console.error("Error executing move decision:", error);
        }
        
        return false;
    }
    
    executeCollect(agent) {
        // Check if agent is on a cell with resources
        const cell = this.hexGrid.getCellAtPosition(agent.x, agent.y);
        
        if (cell && cell.resourceType && cell.resourceAmount > 0 && 
            agent.resourceType === null && agent.resourceAmount === 0) {
            // The actual collection is handled by AgentSystem.processResourceCollection
            // We just make sure the agent stays on this cell for a moment
            agent.setTarget(cell.centerX, cell.centerY);
            return true;
        } else if (agent.resourceType === null && agent.resourceAmount === 0) {
            // If agent is not on a resource cell but wants to collect,
            // find the nearest resource cell and move there
            const nearestCell = this.findNearestResourceCell(agent);
            if (nearestCell) {
                agent.setTarget(nearestCell.centerX, nearestCell.centerY);
                return true;
            }
        }
        
        return false;
    }
    
    executeReturn(agent) {
        // Get base position for the agent's team
        const basePos = this.baseSystem.getBasePosition(agent.teamId);
        if (basePos) {
            agent.setTarget(basePos.x, basePos.y);
            return true;
        }
        
        return false;
    }
    
    executeAttack(agent, targetDescription) {
        try {
            let targetAgent;
            
            // Check if target is a specific agent ID
            const idMatch = targetDescription.match(/(?:id|agent)\s*[:#]?\s*(\d+)/i);
            if (idMatch) {
                const targetId = parseInt(idMatch[1]);
                targetAgent = this.agentSystem.getAgentById(targetId);
            } else {
                // Otherwise find the nearest enemy
                targetAgent = this.findNearestEnemy(agent);
            }
            
            if (targetAgent && targetAgent.teamId !== agent.teamId) {
                agent.startAttacking(targetAgent);
                return true;
            }
        } catch (error) {
            console.error("Error executing attack decision:", error);
        }
        
        return false;
    }
    
    executeDefend(agent, targetDescription) {
        try {
            // Defend can mean several things:
            // 1. Defend a specific location (like base)
            // 2. Defend an ally
            // 3. Defend territory by increasing control
            
            if (targetDescription.toLowerCase().includes("base")) {
                // Defend base - move back to base
                const basePos = this.baseSystem.getBasePosition(agent.teamId);
                if (basePos) {
                    agent.setTarget(basePos.x, basePos.y);
                    return true;
                }
            } else if (targetDescription.toLowerCase().includes("ally")) {
                // Find a vulnerable ally to protect
                const ally = this.findVulnerableAlly(agent);
                if (ally) {
                    agent.setTarget(ally.x, ally.y);
                    return true;
                }
            } else if (targetDescription.toLowerCase().includes("territory")) {
                // Find contested territory to defend
                const contestedCell = this.findContestedCell(agent);
                if (contestedCell) {
                    agent.setTarget(contestedCell.centerX, contestedCell.centerY);
                    return true;
                }
            } else {
                // Default: patrol around current position
                this.patrolArea(agent, 150);
                return true;
            }
        } catch (error) {
            console.error("Error executing defend decision:", error);
        }
        
        return false;
    }
    
    executeExplore(agent) {
        // Exploration is about finding new areas
        // Set up a more randomized pattern with a bias away from already-explored areas
        
        try {
            // Get a direction away from already controlled territory
            const visibleCells = this.getVisibleCells(agent);
            
            // Calculate the "center of mass" of team-controlled territory
            let controlledX = 0;
            let controlledY = 0;
            let controlledCount = 0;
            
            for (const cell of visibleCells) {
                // For team 1, controlLevel is negative
                // For team 2, controlLevel is positive
                const isControlled = (agent.teamId === 1 && cell.controlLevel < -0.2) || 
                                    (agent.teamId === 2 && cell.controlLevel > 0.2);
                                    
                if (isControlled) {
                    controlledX += cell.centerX;
                    controlledY += cell.centerY;
                    controlledCount++;
                }
            }
            
            if (controlledCount > 0) {
                // Calculate center of mass
                controlledX /= controlledCount;
                controlledY /= controlledCount;
                
                // Direction away from controlled territory
                const dx = agent.x - controlledX;
                const dy = agent.y - controlledY;
                const length = Math.sqrt(dx * dx + dy * dy);
                
                if (length > 0) {
                    // Normalize and scale
                    const nx = dx / length;
                    const ny = dy / length;
                    
                    // Target 300 pixels away in that direction
                    const targetX = agent.x + nx * 300;
                    const targetY = agent.y + ny * 300;
                    
                    agent.setTarget(targetX, targetY);
                    return true;
                }
            }
            
            // Fallback: random exploration pattern
            agent.explorationPattern();
            return true;
            
        } catch (error) {
            console.error("Error executing explore decision:", error);
        }
        
        return false;
    }
    
    // Helper methods
    
    findNearestResourceCell(agent) {
        let nearest = null;
        let nearestDistance = Infinity;
        
        for (const cell of this.hexGrid.cells) {
            if (cell.resourceType && cell.resourceAmount > 0) {
                const distance = Math.sqrt(
                    Math.pow(agent.x - cell.centerX, 2) + 
                    Math.pow(agent.y - cell.centerY, 2)
                );
                
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearest = cell;
                }
            }
        }
        
        return nearest;
    }
    
    findNearestEnemy(agent) {
        let nearest = null;
        let nearestDistance = Infinity;
        
        for (const other of this.agentSystem.agents) {
            if (other.teamId === agent.teamId) continue;
            
            const distance = Math.sqrt(
                Math.pow(agent.x - other.x, 2) + 
                Math.pow(agent.y - other.y, 2)
            );
            
            if (distance < nearestDistance && distance <= agent.visionRange) {
                nearestDistance = distance;
                nearest = other;
            }
        }
        
        return nearest;
    }
    
    findNearestAlly(agent) {
        let nearest = null;
        let nearestDistance = Infinity;
        
        for (const other of this.agentSystem.agents) {
            if (other.id === agent.id || other.teamId !== agent.teamId) continue;
            
            const distance = Math.sqrt(
                Math.pow(agent.x - other.x, 2) + 
                Math.pow(agent.y - other.y, 2)
            );
            
            if (distance < nearestDistance && distance <= agent.visionRange) {
                nearestDistance = distance;
                nearest = other;
            }
        }
        
        return nearest;
    }
    
    findVulnerableAlly(agent) {
        // Find an ally that has low health or is carrying resources
        for (const other of this.agentSystem.agents) {
            if (other.id === agent.id || other.teamId !== agent.teamId) continue;
            
            const distance = Math.sqrt(
                Math.pow(agent.x - other.x, 2) + 
                Math.pow(agent.y - other.y, 2)
            );
            
            // Check if in vision range and either low health or carrying resources
            if (distance <= agent.visionRange && 
                (other.health < other.maxHealth * 0.5 || other.resourceAmount > 0)) {
                return other;
            }
        }
        
        return null;
    }
    
    findContestedCell(agent) {
        // Find cells that are contested or under enemy control
        const visibleCells = this.getVisibleCells(agent);
        
        for (const cell of visibleCells) {
            // For team 1, controlLevel is negative
            // For team 2, controlLevel is positive
            const isEnemyControlled = (agent.teamId === 1 && cell.controlLevel > 0.2) || 
                                     (agent.teamId === 2 && cell.controlLevel < -0.2);
                                     
            if (isEnemyControlled && !cell.hasObstacle) {
                return cell;
            }
        }
        
        return null;
    }
    
    getVisibleCells(agent) {
        const visibleCells = [];
        
        for (const cell of this.hexGrid.cells) {
            const distance = Math.sqrt(
                Math.pow(agent.x - cell.centerX, 2) + 
                Math.pow(agent.y - cell.centerY, 2)
            );
            
            if (distance <= agent.visionRange) {
                visibleCells.push(cell);
            }
        }
        
        return visibleCells;
    }
    
    patrolArea(agent, radius) {
        // Create a patrol pattern around current position
        const centerX = agent.x;
        const centerY = agent.y;
        
        // Create waypoints in a circle
        const segments = 4 + Math.floor(Math.random() * 3); // 4-6 points
        agent.waypoints = [];
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            agent.waypoints.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }
        
        agent.waypointIndex = 0;
    }
}