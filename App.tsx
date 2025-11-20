import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationCanvas } from './components/SimulationCanvas';
import { TerminalDashboard } from './components/TerminalDashboard';
import { ParameterControls } from './components/ParameterControls';
import { DEFAULT_CONFIG } from './constants';
import { SimulationConfig, Agent, SimulationStats } from './types';
import { SimulationEngine } from './services/simulationService';
import { Terminal, Activity, BrainCircuit, Settings2 } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [stats, setStats] = useState<SimulationStats>({
    generation: 0,
    population: 0,
    maxFitness: 0,
    avgEnergy: 0,
    bestAgent: null
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const engineRef = useRef<SimulationEngine | null>(null);
  const animationRef = useRef<number>();

  // Initialize Engine
  useEffect(() => {
    engineRef.current = new SimulationEngine(config);
    updateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Engine Config when React state changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateConfig(config);
    }
  }, [config]);

  const updateStats = useCallback(() => {
    if (!engineRef.current) return;
    setStats(engineRef.current.getStats());
  }, []);

  const tick = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.update();
    updateStats();
    animationRef.current = requestAnimationFrame(tick);
  }, [updateStats]);

  const toggleSimulation = () => {
    if (isRunning) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      tick();
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsRunning(false);
    engineRef.current = new SimulationEngine(config);
    updateStats();
  };

  return (
    <div className="min-h-screen flex flex-col text-emerald-400 bg-black selection:bg-emerald-900 selection:text-white overflow-hidden">
      {/* Header */}
      <header className="border-b border-emerald-900 bg-slate-950 p-4 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.1)]">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-emerald-500 animate-pulse" />
          <h1 className="text-xl font-bold tracking-wider">NEURO_LIFE_SIMULATION // v2.4.0</h1>
        </div>
        <div className="text-xs text-emerald-700 flex gap-4">
          <span>MEM_USAGE: 24MB</span>
          <span>CPU_THREADS: 1</span>
          <span className={isRunning ? "text-emerald-400" : "text-red-500"}>
            STATUS: {isRunning ? 'RUNNING' : 'HALTED'}
          </span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Simulation View */}
        <div className="flex-1 flex flex-col relative border-r border-emerald-900/50">
          <div className="absolute top-4 left-4 z-10 bg-black/80 border border-emerald-800 p-2 rounded text-xs font-mono backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-3 h-3" />
              <span>Generation: {stats.generation}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <BrainCircuit className="w-3 h-3" />
              <span>Population: {stats.population}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Best Fitness: {stats.maxFitness.toFixed(2)}</span>
            </div>
          </div>
          
          <SimulationCanvas 
            engineRef={engineRef} 
            width={800} 
            height={600}
            isRunning={isRunning}
          />
        </div>

        {/* Right: Controls & Terminal */}
        <div className="w-[450px] bg-slate-950 flex flex-col border-l border-emerald-900/50">
          
          {/* Tabs / Sections */}
          <div className="h-1/2 border-b border-emerald-900/50 overflow-y-auto p-4 custom-scrollbar">
             <div className="flex items-center gap-2 mb-4 text-emerald-200 border-b border-emerald-800 pb-2">
                <Settings2 className="w-4 h-4" />
                <h2 className="font-bold">KERNEL_PARAMETERS</h2>
             </div>
             <ParameterControls 
                config={config} 
                setConfig={setConfig} 
                onToggle={toggleSimulation}
                onReset={handleReset}
                isRunning={isRunning}
             />
          </div>

          <div className="h-1/2 flex flex-col p-4 bg-black">
             <TerminalDashboard 
               stats={stats} 
               isRunning={isRunning}
             />
          </div>
        </div>
      </div>
    </div>
  );
}