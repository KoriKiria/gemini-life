import React, { useEffect, useState } from 'react';
import { SimulationStats } from '../types';
import { analyzeAgent } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Cpu, FileCode } from 'lucide-react';

interface Props {
  stats: SimulationStats;
  isRunning: boolean;
}

export const TerminalDashboard: React.FC<Props> = ({ stats, isRunning }) => {
  const [logs, setLogs] = useState<string[]>(['> System initialized...', '> Waiting for simulation data...']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<{gen: number, fit: number, pop: number}[]>([]);

  // Update chart history slowly
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
       setHistory(prev => {
         const newPoint = {
           gen: stats.generation,
           fit: stats.maxFitness,
           pop: stats.population
         };
         const newHist = [...prev, newPoint];
         if (newHist.length > 20) newHist.shift();
         return newHist;
       });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, stats]);

  const handleAnalyze = async () => {
    if (!stats.bestAgent) {
        setLogs(prev => [...prev, `> ERROR: No agent target found.`]);
        return;
    }
    setIsAnalyzing(true);
    setLogs(prev => [...prev, `> UPLOADING AGENT_${stats.bestAgent?.id} DATA TO NEURAL CLOUD...`]);
    
    const analysis = await analyzeAgent(stats.bestAgent);
    
    setLogs(prev => [
        ...prev, 
        `> ANALYSIS_RECEIVED:`, 
        `> "${analysis}"`,
        `> -------------------`
    ]);
    setIsAnalyzing(false);
  };

  // Auto-scroll logs
  const logsEndRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full gap-4">
      
      {/* Chart Section */}
      <div className="h-32 border border-emerald-900/50 bg-slate-950/50 p-2 relative">
         <div className="absolute top-1 right-2 text-[10px] text-emerald-700 uppercase">Fitness_Monitor_v1</div>
         <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
               <XAxis dataKey="gen" hide />
               <YAxis hide domain={[0, 'auto']} />
               <Tooltip 
                 contentStyle={{ backgroundColor: '#000', border: '1px solid #065f46', fontSize: '12px' }}
                 itemStyle={{ color: '#34d399' }}
               />
               <Line type="monotone" dataKey="fit" stroke="#10b981" strokeWidth={1} dot={false} />
               <Line type="monotone" dataKey="pop" stroke="#065f46" strokeWidth={1} dot={false} />
            </LineChart>
         </ResponsiveContainer>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
         <div className="bg-emerald-900/10 p-2 border-l-2 border-emerald-600">
            <div className="text-emerald-600">BEST_FITNESS</div>
            <div className="text-xl">{stats.maxFitness.toFixed(1)}</div>
         </div>
         <div className="bg-emerald-900/10 p-2 border-l-2 border-emerald-600">
            <div className="text-emerald-600">AVG_ENERGY</div>
            <div className="text-xl">{stats.avgEnergy.toFixed(1)}J</div>
         </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 bg-black border border-emerald-900/50 p-2 font-mono text-xs overflow-hidden flex flex-col">
         <div className="flex items-center justify-between border-b border-emerald-900/50 pb-1 mb-2">
            <span className="flex items-center gap-2 text-emerald-600">
                <FileCode className="w-3 h-3" />
                CONSOLE_OUTPUT
            </span>
            <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !stats.bestAgent}
                className="flex items-center gap-1 px-2 py-0.5 bg-emerald-900/30 hover:bg-emerald-800 text-emerald-300 text-[10px] border border-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Cpu className="w-3 h-3" />
                {isAnalyzing ? 'COMPUTING...' : 'ANALYZE_BEST_AGENT'}
            </button>
         </div>
         
         <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 text-emerald-400/80">
             {logs.map((log, i) => (
                 <div key={i} className="break-words">{log}</div>
             ))}
             <div ref={logsEndRef} />
         </div>
      </div>
    </div>
  );
};