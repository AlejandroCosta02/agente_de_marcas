import React, { useRef, useEffect } from 'react';

interface WavyBackgroundProps {
  className?: string;
  containerClass?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: 'slow' | 'fast';
  waveOpacity?: number;
  children?: React.ReactNode;
}

const defaultColors = ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"];

export default function WavyBackground({
  className = '',
  containerClass = '',
  colors = defaultColors,
  waveWidth = 50,
  backgroundFill = 'black',
  blur = 10,
  speed = 'fast',
  waveOpacity = 0.5,
  children,
}: WavyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    if (canvas) {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
    let t = 0;
    const waves = colors.length;
    const speedVal = speed === 'fast' ? 0.02 : 0.008;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.filter = `blur(${blur}px)`;
      ctx.globalAlpha = waveOpacity;
      ctx.fillStyle = backgroundFill;
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < waves; i++) {
        ctx.beginPath();
        for (let x = 0; x <= width; x++) {
          const y =
            Math.sin((x / waveWidth) + t + i) * 20 +
            Math.cos((x / (waveWidth * 1.5)) + t + i) * 10 +
            height / 2 + (i - waves / 2) * 30;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 8;
        ctx.stroke();
      }
      ctx.restore();
      t += speedVal;
      animationRef.current = requestAnimationFrame(draw);
    }
    draw();
    function handleResize() {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [colors, waveWidth, backgroundFill, blur, speed, waveOpacity]);

  return (
    <div className={`relative w-full ${className}`} style={{ minHeight: 400 }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block', zIndex: 0 }}
      />
      <div className={`relative z-10 ${containerClass}`}>{children}</div>
    </div>
  );
} 