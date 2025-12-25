
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
        if (!p.image.startsWith('data:') && !p.image.startsWith('blob:')) {
          img.crossOrigin = "anonymous";
        }
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

      const displaySize = Math.min(container.clientWidth, 600); // Giới hạn kích thước tối đa cho mobile tốt hơn
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = displaySize * dpr;
      canvas.height = displaySize * dpr;
      canvas.style.width = `${displaySize}px`;
      canvas.style.height = `${displaySize}px`;
      ctx.scale(dpr, dpr);

      const center = displaySize / 2;
      const radius = displaySize / 2 - 15; // Giảm lề để vòng quay to hơn trên mobile
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
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.save();
        ctx.rotate(angle + sliceAngle / 2);
        
        ctx.textAlign = 'right';
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        
        // Font size thích ứng với kích thước màn hình
        const fontSize = Math.max(7, Math.min(14, (displaySize * 0.03)));
        ctx.font = `900 ${fontSize}px "Inter", sans-serif`;
        ctx.fillText(p.name.toUpperCase(), radius - (radius * 0.12), fontSize / 3);

        const img = loadedImages[p.image];
        if (img) {
          const imgSize = radius * 0.22;
          const imgX = radius * 0.45;
          ctx.drawImage(img, imgX, -imgSize / 2, imgSize, imgSize);
        }

        ctx.restore();
      });

      ctx.restore();

      // Viền vàng ngoài cùng
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = Math.max(4, displaySize * 0.02);
      ctx.stroke();

      // Nút đỏ ở giữa
      ctx.beginPath();
      ctx.arc(center, center, displaySize * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.fill();
      
      // Mũi tên chỉ hướng
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      const pointerSize = displaySize * 0.05;
      ctx.moveTo(center - pointerSize, 0);
      ctx.lineTo(center + pointerSize, 0);
      ctx.lineTo(center, pointerSize * 2);
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-10 h-10 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 md:border-4 border-yellow-400">
         <i className="fas fa-horse text-[#020617] text-xl md:text-3xl animate-bounce"></i>
      </div>
    </div>
  );
};

export default Wheel;
