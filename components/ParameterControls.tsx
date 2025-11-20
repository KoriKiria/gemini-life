import React from 'react';
import { SimulationConfig } from '../types';
import { Play, Pause, RotateCcw, Sliders } from 'lucide-react';

interface Props {
  config: SimulationConfig;
  setConfig: (config: SimulationConfig) => void;
  onToggle: () => void;
  onReset: () => void;
  isRunning: boolean;
}

export const ParameterControls: React.FC<Props> = ({ config, setConfig, onToggle, onReset, isRunning }) => {
  
  const handleChange = (key: keyof SimulationConfig, value: number) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6 text-sm font-mono">
      
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button 
          onClick={onToggle}
          className={`flex items-center justify-center gap-2 p-2 border ${isRunning ? 'border-red-500 text-red-500 hover:bg-red-900/20' : 'border-emerald-500 text-emerald-500 hover:bg-emerald-900/20'} transition-colors uppercase font-bold`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'HALT' : 'EXECUTE'}
        </button>
        <button 
          onClick={onReset}
          className="flex items-center justify-center gap-2 p-2 border border-emerald-800 text-emerald-400 hover:bg-emerald-900/20 transition-colors uppercase font-bold"
        >
          <RotateCcw className="w-4 h-4" />
          RESET
        </button>
      </div>

      {/* Population */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-emerald-600">
          <span>INITIAL_POPULATION</span>
          <span>{config.initialPopulation}</span>
        </div>
        <input 
          type="range" 
          min="10" 
          max="100" 
          value={config.initialPopulation} 
          onChange={(e) => handleChange('initialPopulation', parseInt(e.target.value))}
          className="w-full h-1 bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      {/* Mutation */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-emerald-600">
          <span>MUTATION_RATE</span>
          <span>{(config.mutationRate * 100).toFixed(0)}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01"
          value={config.mutationRate} 
          onChange={(e) => handleChange('mutationRate', parseFloat(e.target.value))}
          className="w-full h-1 bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

       {/* Food Spawn */}
       <div className="space-y-1">
        <div className="flex justify-between text-xs text-emerald-600">
          <span>RESOURCE_SPAWN_RATE</span>
          <span>{(config.foodSpawnRate * 100).toFixed(0)}%</span>
        </div>
        <input 
          type="range" 
          min="0.01" 
          max="0.5" 
          step="0.01"
          value={config.foodSpawnRate} 
          onChange={(e) => handleChange('foodSpawnRate', parseFloat(e.target.value))}
          className="w-full h-1 bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      {/* Speed */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-emerald-600">
          <span>CLOCK_SPEED</span>
          <span>{config.speedMultiplier}x</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="10" 
          step="0.5"
          value={config.speedMultiplier} 
          onChange={(e) => handleChange('speedMultiplier', parseFloat(e.target.value))}
          className="w-full h-1 bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      {/* Sensor Range */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-emerald-600">
          <span>LIDAR_RANGE</span>
          <span>{config.sensorRange}px</span>
        </div>
        <input 
          type="range" 
          min="20" 
          max="200" 
          value={config.sensorRange} 
          onChange={(e) => handleChange('sensorRange', parseInt(e.target.value))}
          className="w-full h-1 bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>
      
      <div className="pt-4 border-t border-emerald-900/30">
        <div className="flex items-center gap-2 text-xs text-emerald-700">
           <Sliders className="w-3 h-3" />
           <span>Advanced parameters loaded from core/config.json</span>
        </div>
      </div>

    </div>
  );
};