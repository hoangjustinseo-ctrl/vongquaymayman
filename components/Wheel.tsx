
import React, { useEffect, useRef, useState } from 'react';
import { WheelPrize } from '../types';
import { HORSE_ICON } from '../constants';

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

      const displaySize = Math.min(container.clientWidth, 600);
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = displaySize * dpr;
      canvas.height = displaySize * dpr;
      canvas.style.width = `${displaySize}px`;
      canvas.style.height = `${displaySize}px`;
      ctx.scale(dpr, dpr);

      const center = displaySize / 2;
      const radius = displaySize / 2 - 10;
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
        
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.save();
        ctx.rotate(angle + sliceAngle / 2);
        
        // 1. VẼ HÌNH ẢNH Ở NGOÀI CÙNG (GẦN VIỀN)
        const img = loadedImages[p.image];
        if (img) {
          const imgSize = radius * 0.22;
          const imgX = radius * 0.78; // Đẩy hình ra ngoài
          ctx.drawImage(img, imgX - (imgSize/2), -imgSize / 2, imgSize, imgSize);
        }

        // 2. VẼ CHỮ Ở PHÍA TRONG (GẦN TÂM HƠN)
        ctx.textAlign = 'right'; // Căn lề phải để chữ kết thúc trước hình
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        
        const fontSize = Math.max(8, Math.min(13, (displaySize * 0.025)));
        ctx.font = `900 ${fontSize}px "Inter", sans-serif`;
        
        // Chữ kết thúc tại 60% bán kính, bắt đầu từ gần tâm
        const textEndPos = radius * 0.62;
        ctx.fillText(p.name.toUpperCase(), textEndPos, fontSize / 3);

        ctx.restore();
      });

      ctx.restore();

      // Viền vàng ngoài cùng
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = Math.max(4, displaySize * 0.02);
      ctx.stroke();

      // Nút trung tâm
      ctx.beginPath();
      ctx.arc(center, center, displaySize * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.fill();
      
      // Mũi tên chỉ hướng (màu đỏ)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      const pointerSize = displaySize * 0.06;
      ctx.moveTo(center - pointerSize, 0);
      ctx.lineTo(center + pointerSize, 0);
      ctx.lineTo(center, pointerSize * 2.2);
      ctx.closePath();
      ctx.fill();
    };

    updateCanvas();
    window.addEventListener('resize', updateCanvas);
    return () => window.removeEventListener('resize', updateCanvas);
  }, [prizes, rotation, loadedImages]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="rounded-full shadow-[0_0_80px_rgba(0,0,0,0.5)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 md:border-4 border-yellow-400 overflow-hidden p-2">
         <img src={HORSE_ICON} className="w-full h-full object-contain animate-pulse" />
      </div>
    </div>
  );
};

export default Wheel;
