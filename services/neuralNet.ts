import { NeuralNetwork, Vector } from '../types';
import { INPUT_NEURONS, HIDDEN_NEURONS, OUTPUT_NEURONS } from '../constants';

// Helper: Random weight between -1 and 1
const randomWeight = () => Math.random() * 2 - 1;

export const createBrain = (): NeuralNetwork => {
  const weightsInputHidden = new Array(INPUT_NEURONS * HIDDEN_NEURONS).fill(0).map(randomWeight);
  const weightsHiddenOutput = new Array(HIDDEN_NEURONS * OUTPUT_NEURONS).fill(0).map(randomWeight);
  const biasesHidden = new Array(HIDDEN_NEURONS).fill(0).map(randomWeight);
  const biasesOutput = new Array(OUTPUT_NEURONS).fill(0).map(randomWeight);

  return {
    inputSize: INPUT_NEURONS,
    hiddenSize: HIDDEN_NEURONS,
    outputSize: OUTPUT_NEURONS,
    weightsInputHidden,
    weightsHiddenOutput,
    biasesHidden,
    biasesOutput
  };
};

export const mutateBrain = (brain: NeuralNetwork, rate: number): NeuralNetwork => {
  const mutate = (w: number) => {
    if (Math.random() < rate) {
      return w + (Math.random() * 0.4 - 0.2); // Small nudge
    }
    return w;
  };

  return {
    ...brain,
    weightsInputHidden: brain.weightsInputHidden.map(mutate),
    weightsHiddenOutput: brain.weightsHiddenOutput.map(mutate),
    biasesHidden: brain.biasesHidden.map(mutate),
    biasesOutput: brain.biasesOutput.map(mutate)
  };
};

// Activation function: Tanh for -1 to 1 output
const activate = (x: number) => Math.tanh(x);

export const predict = (brain: NeuralNetwork, inputs: number[]): number[] => {
  if (inputs.length !== INPUT_NEURONS) {
    console.error(`Expected ${INPUT_NEURONS} inputs, got ${inputs.length}`);
    return [0, 0];
  }

  // Hidden Layer Pass
  const hiddenOutputs = new Array(HIDDEN_NEURONS).fill(0);
  for (let i = 0; i < HIDDEN_NEURONS; i++) {
    let sum = brain.biasesHidden[i];
    for (let j = 0; j < INPUT_NEURONS; j++) {
      sum += inputs[j] * brain.weightsInputHidden[j * HIDDEN_NEURONS + i];
    }
    hiddenOutputs[i] = activate(sum);
  }

  // Output Layer Pass
  const finalOutputs = new Array(OUTPUT_NEURONS).fill(0);
  for (let i = 0; i < OUTPUT_NEURONS; i++) {
    let sum = brain.biasesOutput[i];
    for (let j = 0; j < HIDDEN_NEURONS; j++) {
      sum += hiddenOutputs[j] * brain.weightsHiddenOutput[j * OUTPUT_NEURONS + i];
    }
    finalOutputs[i] = activate(sum);
  }

  return finalOutputs;
};