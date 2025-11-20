import { GoogleGenAI } from "@google/genai";
import { Agent } from "../types";

export const analyzeAgent = async (agent: Agent): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Error: No API_KEY in environment. Please configure key.";
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Abstract the genome for the LLM to avoid token overload
  const genomeSummary = {
    inputs: agent.genome.inputSize,
    hidden: agent.genome.hiddenSize,
    outputs: agent.genome.outputSize,
    // Calculate some stats about weights to give the LLM something to "read"
    avgWeight: agent.genome.weightsInputHidden.reduce((a,b) => a+b, 0) / agent.genome.weightsInputHidden.length,
    biasTrend: agent.genome.biasesHidden.reduce((a,b) => a+b, 0) 
  };

  const prompt = `
    You are a bio-digital scientist analyzing a simulation entity in a terminal interface.
    Analyze this agent's data:
    - ID: ${agent.id}
    - Generation: ${agent.generation}
    - Age (Ticks): ${agent.age}
    - Energy: ${agent.energy.toFixed(1)}
    - Neural Net Config: ${JSON.stringify(genomeSummary)}
    
    Based on these stats, write a short, cryptic, sci-fi "Terminal Log" entry (max 3 sentences). 
    Speculate on its survival strategy (e.g., "Aggressive hunter-seeker", "Passive grazer", "Erratic scavenger"). 
    Use technical jargon. Do not use markdown formatting like **bold**, just plain text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "CONNECTION_ERROR: Neural Link Failed. Retrying handshake...";
  }
};