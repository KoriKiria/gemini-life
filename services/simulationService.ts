import { Agent, Food, SimulationConfig, SimulationStats, Vector, WORLD_WIDTH, WORLD_HEIGHT } from '../types';
import { createBrain, mutateBrain, predict } from './neuralNet';
import { DEFAULT_CONFIG } from '../constants';

export class SimulationEngine {
  agents: Agent[] = [];
  food: Food[] = [];
  config: SimulationConfig;
  stats: SimulationStats;
  frameCount: number = 0;
  
  constructor(config: SimulationConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.stats = {
      generation: 1,
      population: 0,
      maxFitness: 0,
      avgEnergy: 0,
      bestAgent: null
    };
    this.initializePopulation();
  }

  updateConfig(newConfig: SimulationConfig) {
    this.config = newConfig;
  }

  initializePopulation() {
    this.agents = [];
    this.food = [];
    for (let i = 0; i < this.config.initialPopulation; i++) {
      this.agents.push(this.createAgent());
    }
    // Initial food spawn
    for (let i = 0; i < 20; i++) {
      this.spawnFood();
    }
  }

  createAgent(parent?: Agent): Agent {
    const startX = Math.random() * WORLD_WIDTH;
    const startY = Math.random() * WORLD_HEIGHT;
    
    const genome = parent 
      ? mutateBrain(parent.genome, this.config.mutationRate) 
      : createBrain();

    const generation = parent ? parent.generation + 1 : 1;

    // Color shifts slightly with mutation to visualize lineage
    let color = '#10b981'; // Emerald 500
    if (parent) {
       // Simple color logic: preserved for now, could be genome based
       color = parent.color;
    }

    return {
      id: Math.random().toString(36).substring(7),
      position: { x: startX, y: startY },
      velocity: { x: 0, y: 0 },
      angle: Math.random() * Math.PI * 2,
      energy: 100, // Starting energy
      age: 0,
      genome,
      fitness: 0,
      generation,
      isDead: false,
      color
    };
  }

  spawnFood() {
    this.food.push({
      id: Math.random().toString(36).substring(7),
      position: {
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT
      },
      energyValue: 30
    });
  }

  getNearest(position: Vector, targets: { position: Vector }[]) {
    let minDist = Infinity;
    let nearest = null;
    
    for (const target of targets) {
      const dx = target.position.x - position.x;
      const dy = target.position.y - position.y;
      const d2 = dx * dx + dy * dy; // squared dist for speed
      
      if (d2 < minDist) {
        minDist = d2;
        nearest = target;
      }
    }
    return { nearest, dist: Math.sqrt(minDist) };
  }

  update() {
    this.frameCount++;
    
    // Spawn Food Randomly
    if (Math.random() < this.config.foodSpawnRate) {
      this.spawnFood();
    }

    // Limit food to prevent lag
    if (this.food.length > 50) {
      this.food = this.food.slice(0, 50);
    }

    let maxFitness = 0;
    let totalEnergy = 0;
    let currentBestAgent = null;

    // Update Agents
    for (let i = this.agents.length - 1; i >= 0; i--) {
      const agent = this.agents[i];
      if (agent.isDead) continue;

      // 1. SENSORS (Inputs)
      const { nearest: nearestFood, dist: foodDist } = this.getNearest(agent.position, this.food);
      const { nearest: nearestAgent, dist: agentDist } = this.getNearest(agent.position, this.agents.filter(a => a !== agent));

      // Normalize inputs to 0-1 or -1 to 1 roughly
      const inputs = [
        1, // Bias
        nearestFood ? (foodDist / this.config.sensorRange) : 1, // Distance to food (inverted ideally, but simple linear here)
        nearestFood ? Math.atan2(nearestFood.position.y - agent.position.y, nearestFood.position.x - agent.position.x) - agent.angle : 0, // Angle to food
        agent.energy / 200, // Normalized energy
        nearestAgent ? (agentDist / this.config.sensorRange) : 1,
        Math.random() // Random noise
      ];

      // 2. THINK (Neural Net)
      const outputs = predict(agent.genome, inputs);
      // Output 0: Speed (-1 to 1)
      // Output 1: Turn Speed (-1 to 1)

      // 3. ACT (Physics)
      const speed = Math.max(0, outputs[0]) * this.config.speedMultiplier; // Only move forward
      const turn = outputs[1] * 0.2; // Turn rate

      agent.angle += turn;
      agent.velocity.x = Math.cos(agent.angle) * speed;
      agent.velocity.y = Math.sin(agent.angle) * speed;

      agent.position.x += agent.velocity.x;
      agent.position.y += agent.velocity.y;

      // Boundary Wrap
      if (agent.position.x < 0) agent.position.x = WORLD_WIDTH;
      if (agent.position.x > WORLD_WIDTH) agent.position.x = 0;
      if (agent.position.y < 0) agent.position.y = WORLD_HEIGHT;
      if (agent.position.y > WORLD_HEIGHT) agent.position.y = 0;

      // 4. METABOLISM
      // Moving costs energy
      const energyLoss = this.config.energyDecay + (speed * 0.1);
      agent.energy -= energyLoss;
      agent.age++;
      agent.fitness = agent.age + (agent.energy * 0.1); // Simple fitness function

      if (agent.fitness > maxFitness) {
        maxFitness = agent.fitness;
        currentBestAgent = agent;
      }
      totalEnergy += agent.energy;

      // 5. INTERACTION (Eat)
      if (nearestFood && foodDist < 15) {
         // Eat food
         agent.energy += nearestFood.energyValue;
         // Remove food
         this.food = this.food.filter(f => f !== nearestFood);
      }

      // 6. REPRODUCTION
      if (agent.energy > 150) {
        agent.energy -= 60; // Cost of birth
        const offspring = this.createAgent(agent);
        offspring.position.x = agent.position.x;
        offspring.position.y = agent.position.y;
        this.agents.push(offspring);
      }

      // 7. DEATH
      if (agent.energy <= 0 || agent.age > 2000) {
        agent.isDead = true;
        this.agents.push({
             ...this.createAgent(this.stats.bestAgent || undefined), // Respawn strategy: Sometimes respawn from best, else random
             isDead: false
        });
      }
    }

    // Cleanup dead agents
    this.agents = this.agents.filter(a => !a.isDead);

    // If population drops too low, add randoms to restart
    if (this.agents.length < 5) {
      for(let k=0; k<5; k++) this.agents.push(this.createAgent());
    }

    this.stats = {
      generation: this.stats.generation, // Simplified generation tracking
      population: this.agents.length,
      maxFitness,
      avgEnergy: this.agents.length > 0 ? totalEnergy / this.agents.length : 0,
      bestAgent: currentBestAgent || this.stats.bestAgent
    };
  }

  getStats() {
    return this.stats;
  }

  getWorldState() {
    return {
      agents: this.agents,
      food: this.food
    };
  }
}