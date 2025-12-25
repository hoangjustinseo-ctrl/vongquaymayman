
import React, { useEffect, useRef, useState } from 'react';
import { Prize } from '../types';

interface WheelProps {
  prizes: Prize[];
  rotation: number;
}

const Wheel: React.FC<WheelProps> = ({ prizes, rotation }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    const uniqueImages = Array.from(new Set(prizes.map(p => p.image)));
    const loadedImages: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;

    if (uniqueImages.length === 0) return;

    uniqueImages.forEach(src => {
      const img = new Image();
      img.src = src;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        loadedImages[src] = img;
        loadedCount++;
        if (loadedCount === uniqueImages.length) {
          setImages(loadedImages);
        }
      };
      img.onerror = () => { loadedCount++; };
    });
  }, [prizes]);

  useEffect(() => {
    const updateCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container || prizes.length === 0) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      // Lấy kích thước container thực tế để scale canvas
      const rect = container.getBoundingClientRect();
      const displaySize = Math.min(rect.width, 800);
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = displaySize * dpr;
      canvas.height = displaySize * dpr;
      canvas.style.width = `${displaySize}px`;
      canvas.style.height = `${displaySize}px`;
      ctx.scale(dpr, dpr);

      const center = displaySize / 2;
      const radius = displaySize / 2 - 25;
      const sliceAngle = (2 * Math.PI) / prizes.length;

      ctx.clearRect(0, 0, displaySize, displaySize);
      
      // Shadow & Border
      ctx.beginPath();
      ctx.arc(center, center, radius + 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(center, center, radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = displaySize < 400 ? 6 : 10;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(rotation * Math.PI / 180);

      prizes.forEach((p, i) => {
        const angle = i * sliceAngle;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, angle, angle + sliceAngle);
        ctx.fillStyle = i % 2 === 0 ? p.color : `${p.color}dd`;
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.save();
        ctx.rotate(angle + sliceAngle / 2);
        
        // Vẽ icon quà tặng (thu nhỏ trên mobile)
        const img = images[p.image];
        if (img) {
          const imgSize = displaySize < 400 ? 25 : (prizes.length > 20 ? 30 : 45);
          try {
            ctx.drawImage(img, radius * 0.7, -imgSize / 2, imgSize, imgSize);
          } catch (e) {}
        }

        // Vẽ chữ (Responsive Font Size)
        ctx.textAlign = 'right';
        ctx.fillStyle = 'white';
        
        let fontSize = displaySize < 400 ? 10 : 16;
        if (prizes.length > 15) fontSize = displaySize < 400 ? 8 : 12;
        if (prizes.length > 30) fontSize = displaySize < 400 ? 6 : 9;
        
        ctx.font = `900 ${fontSize}px "Inter", "Arial", sans-serif`;
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'black';
        
        const displayName = p.name.length > 12 ? p.name.substring(0, 12) + '..' : p.name;
        ctx.fillText(displayName.toUpperCase(), radius * 0.65, fontSize / 3);
        
        ctx.restore();
      });

      ctx.restore();

      // Tâm vòng quay
      const innerRadius = displaySize < 400 ? 20 : 35;
      ctx.beginPath();
      ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = displaySize < 400 ? 3 : 5;
      ctx.stroke();
      
      // Kim chỉ (Pointer)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      const ptrW = displaySize < 400 ? 15 : 20;
      ctx.moveTo(center - ptrW, center - radius - 20);
      ctx.lineTo(center + ptrW, center - radius - 20);
      ctx.lineTo(center, center - radius + 30);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    updateCanvas();
    window.addEventListener('resize', updateCanvas);
    return () => window.removeEventListener('resize', updateCanvas);
  }, [prizes, rotation, images]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        className="drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-slate-900 rounded-full border-2 md:border-4 border-yellow-500 flex items-center justify-center shadow-lg z-10">
         <i className="fas fa-bolt text-yellow-500 text-sm md:text-xl animate-pulse"></i>
      </div>
    </div>
  );
};

export default Wheel;
