import { SimulationConfig } from "./types";

export const DEFAULT_CONFIG: SimulationConfig = {
  initialPopulation: 40,
  foodSpawnRate: 0.08,
  mutationRate: 0.1,
  energyDecay: 0.3,
  sensorRange: 80,
  speedMultiplier: 2,
};

export const INPUT_NEURONS = 6; 
// 1. Bias
// 2. Nearest Food Distance
// 3. Nearest Food Angle
// 4. Current Energy
// 5. Nearest Agent Distance
// 6. Random Noise

export const HIDDEN_NEURONS = 8;

export const OUTPUT_NEURONS = 2; 
// 1. Linear Velocity (Speed)
// 2. Angular Velocity (Turn)
