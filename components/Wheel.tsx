
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

  // Preload images
  useEffect(() => {
    prizes.forEach(p => {
      if (!loadedImages[p.image]) {
        const img = new Image();
        img.src = p.image;
        img.onload = () => {
          setLoadedImages(prev => ({ ...prev, [p.image]: img }));
        };
      }
    });
  }, [prizes]);

  useEffect(() => {
    const updateCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container || prizes.length === 0) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      const rect = container.getBoundingClientRect();
      const displaySize = Math.min(rect.width, 1000);
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = displaySize * dpr;
      canvas.height = displaySize * dpr;
      canvas.style.width = `${displaySize}px`;
      canvas.style.height = `${displaySize}px`;
      ctx.scale(dpr, dpr);

      const center = displaySize / 2;
      const radius = displaySize / 2 - 40;
      const sliceAngle = (2 * Math.PI) / prizes.length;

      ctx.clearRect(0, 0, displaySize, displaySize);
      
      // Shadow layer
      ctx.shadowBlur = 30;
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(rotation * Math.PI / 180);

      prizes.forEach((p, i) => {
        const angle = i * sliceAngle;
        
        // Slice Background
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, angle, angle + sliceAngle);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Border for slice
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Image & Text
        ctx.save();
        ctx.rotate(angle + sliceAngle / 2);
        
        // 1. Text
        ctx.textAlign = 'right';
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        const fontSize = Math.max(10, Math.min(13, 600 / prizes.length));
        ctx.font = `900 ${fontSize}px "Inter", sans-serif`;
        ctx.fillText(p.name.substring(0, 20), radius - 30, fontSize / 3);

        // 2. Image in Slice
        const img = loadedImages[p.image];
        if (img) {
          const imgSize = radius * 0.25;
          const imgX = radius * 0.6;
          const imgY = -imgSize / 2;
          
          ctx.save();
          // Clip to make image round or fit slice
          ctx.beginPath();
          ctx.arc(imgX + imgSize/2, 0, imgSize/2, 0, Math.PI*2);
          ctx.clip();
          ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
          ctx.restore();
          
          // Image Border
          ctx.beginPath();
          ctx.arc(imgX + imgSize/2, 0, imgSize/2, 0, Math.PI*2);
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.restore();
      });

      ctx.restore();

      // Golden outer ring with lights
      ctx.beginPath();
      ctx.arc(center, center, radius + 15, 0, Math.PI * 2);
      const borderGrad = ctx.createLinearGradient(0, 0, displaySize, displaySize);
      borderGrad.addColorStop(0, '#fbbf24');
      borderGrad.addColorStop(0.5, '#fff7ed');
      borderGrad.addColorStop(1, '#d97706');
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 15;
      ctx.stroke();

      // Pointer (Top)
      ctx.fillStyle = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
      ctx.beginPath();
      ctx.moveTo(center - 25, center - radius - 60);
      ctx.lineTo(center + 25, center - radius - 60);
      ctx.lineTo(center, center - radius + 30);
      ctx.closePath();
      ctx.fill();
    };

    updateCanvas();
    window.addEventListener('resize', updateCanvas);
    return () => window.removeEventListener('resize', updateCanvas);
  }, [prizes, rotation, loadedImages]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full border-[6px] border-yellow-500 flex items-center justify-center shadow-2xl z-10">
         <i className="fas fa-horse text-yellow-500 text-5xl animate-bounce"></i>
      </div>
    </div>
  );
};

export default Wheel;
