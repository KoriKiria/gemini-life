import React, { useRef, useEffect } from 'react';
import { SimulationEngine } from '../services/simulationService';

interface Props {
  engineRef: React.MutableRefObject<SimulationEngine | null>;
  width: number;
  height: number;
  isRunning: boolean;
}

export const SimulationCanvas: React.FC<Props> = ({ engineRef, width, height, isRunning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !engineRef.current) return;

      // Clear background with a trailing effect for retro feel
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines (Retro Style)
      ctx.strokeStyle = '#064e3b'; // dark emerald
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 50) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += 50) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      const { agents, food } = engineRef.current.getWorldState();

      // Draw Food
      ctx.fillStyle = '#ef4444'; // Red for food
      for (const f of food) {
        ctx.beginPath();
        ctx.arc(f.position.x, f.position.y, 3, 0, Math.PI * 2);
        ctx.fill();
        // Glow
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Agents
      for (const agent of agents) {
        ctx.save();
        ctx.translate(agent.position.x, agent.position.y);
        ctx.rotate(agent.angle);

        // Agent Body (Triangle)
        ctx.fillStyle = agent.id === engineRef.current.stats.bestAgent?.id ? '#fbbf24' : agent.color; 
        // Best agent is Gold, others Green
        
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-5, 5);
        ctx.lineTo(-5, -5);
        ctx.closePath();
        ctx.fill();

        // Energy indicator (alpha based on energy)
        ctx.strokeStyle = `rgba(255,255,255, ${Math.min(1, agent.energy / 100)})`;
        ctx.stroke();

        ctx.restore();
      }

      // Draw Best Agent ID
      const best = engineRef.current.stats.bestAgent;
      if (best) {
        ctx.strokeStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(best.position.x, best.position.y, 15, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#fbbf24';
        ctx.font = '10px monospace';
        ctx.fillText(`TARGET_${best.id}`, best.position.x + 10, best.position.y - 10);
      }

      if (isRunning) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, engineRef, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height} 
      className="w-full h-full bg-black cursor-crosshair"
    />
  );
};