
import React, { useEffect, useRef, useState } from 'react';
import { WheelPrize } from '../types';

interface WheelProps {
  prizes: WheelPrize[];
  rotation: number;
}

const Wheel: React.FC<WheelProps> = ({ prizes, rotation }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    prizes.forEach(p => {
      if (!loadedImages[p.image] && p.image) {
        const img = new Image();
        img.src = p.image;
        img.crossOrigin = "anonymous";
        img.onload = () => setLoadedImages(prev => ({ ...prev, [p.image]: img }));
        img.onerror = () => console.warn("Lỗi load ảnh quà:", p.name);
      }
    });
  }, [prizes]);

  useEffect(() => {
    const updateCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      const displaySize = Math.min(container.clientWidth, 1200);
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = displaySize * dpr;
      canvas.height = displaySize * dpr;
      canvas.style.width = `${displaySize}px`;
      canvas.style.height = `${displaySize}px`;
      ctx.scale(dpr, dpr);

      const center = displaySize / 2;
      const radius = displaySize / 2 - 25;
      const numPrizes = prizes.length || 1;
      const sliceAngle = (2 * Math.PI) / numPrizes;

      ctx.clearRect(0, 0, displaySize, displaySize);
      
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(rotation * Math.PI / 180);

      prizes.forEach((p, i) => {
        const angle = i * sliceAngle;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, angle, angle + sliceAngle);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.save();
        ctx.rotate(angle + sliceAngle / 2);
        
        // Text configuration
        ctx.textAlign = 'right';
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        const fontSize = Math.max(8, Math.min(15, 450 / numPrizes));
        ctx.font = `900 ${fontSize}px "Inter", sans-serif`;
        ctx.fillText(p.name.toUpperCase(), radius - 60, fontSize / 3);

        // Image configuration
        const img = loadedImages[p.image];
        if (img) {
          const imgSize = radius * 0.24;
          const imgX = radius * 0.44;
          ctx.drawImage(img, imgX, -imgSize / 2, imgSize, imgSize);
        }

        ctx.restore();
      });

      ctx.restore();

      // Golden outer ring
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 12;
      ctx.stroke();

      // Shadow inner ring
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner Center Circle
      ctx.beginPath();
      ctx.arc(center, center, 50, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.shadowBlur = 40;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.fill();
      
      // Pointer - Red Triangle at Top Fixed
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(center - 25, 0);
      ctx.lineTo(center + 25, 0);
      ctx.lineTo(center, 50);
      ctx.closePath();
      ctx.fill();
    };

    updateCanvas();
    window.addEventListener('resize', updateCanvas);
    return () => window.removeEventListener('resize', updateCanvas);
  }, [prizes, rotation, loadedImages]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-yellow-400">
         <i className="fas fa-horse text-[#020617] text-4xl animate-bounce"></i>
      </div>
    </div>
  );
};

export default Wheel;
