export interface SimulationConfig {
  initialPopulation: number;
  foodSpawnRate: number;
  mutationRate: number;
  energyDecay: number;
  sensorRange: number;
  speedMultiplier: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface NeuralNetwork {
  inputSize: number;
  hiddenSize: number;
  outputSize: number;
  weightsInputHidden: number[]; // Flat array
  weightsHiddenOutput: number[]; // Flat array
  biasesHidden: number[];
  biasesOutput: number[];
}

export interface Agent {
  id: string;
  position: Vector;
  velocity: Vector;
  angle: number;
  energy: number;
  age: number;
  genome: NeuralNetwork; // The brain
  fitness: number;
  generation: number;
  isDead: boolean;
  color: string;
}

export interface Food {
  id: string;
  position: Vector;
  energyValue: number;
}

export interface SimulationStats {
  generation: number;
  population: number;
  maxFitness: number;
  avgEnergy: number;
  bestAgent: Agent | null;
}

export const WORLD_WIDTH = 800;
export const WORLD_HEIGHT = 600;