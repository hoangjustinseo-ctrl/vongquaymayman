
import React from 'react';
import { Horse } from '../types';

interface RaceTrackProps {
  horses: Horse[];
}

const RaceTrack: React.FC<RaceTrackProps> = ({ horses }) => {
  return (
    <div className="w-full bg-emerald-900/40 backdrop-blur-md border-4 border-emerald-500/30 rounded-[40px] p-6 shadow-inner relative overflow-hidden">
      {/* Cỏ và đường đua */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/grass.png')]"></div>
      
      {/* Vạch đích */}
      <div className="absolute right-20 top-0 bottom-0 w-2 bg-white/20 border-x border-white/10 z-0"></div>
      <div className="absolute right-20 top-0 bottom-0 w-12 bg-repeating-conic-gradient(from 45deg, #fff 0 25%, #000 0 50%) bg-[length:20px_20px] opacity-20 z-0"></div>

      <div className="space-y-6 relative z-10">
        {horses.map((horse, index) => (
          <div key={horse.id} className="relative h-20 flex items-center">
            {/* Làn chạy */}
            <div className="absolute inset-0 bg-black/20 rounded-full border-b border-white/5"></div>
            
            {/* Số thứ tự làn */}
            <div className="absolute left-4 text-white/20 font-black italic text-4xl -z-10">{index + 1}</div>

            {/* Con ngựa */}
            <div 
              className="absolute transition-all duration-100 ease-linear flex flex-col items-center"
              style={{ left: `${horse.progress}%`, transform: 'translateX(-50%)' }}
            >
              {/* Tên người chơi */}
              <div className="mb-2 px-3 py-1 bg-white rounded-lg shadow-xl border-2 border-emerald-500 animate-bounce">
                 <span className="text-[10px] font-black text-slate-900 uppercase whitespace-nowrap">{horse.name}</span>
              </div>
              
              {/* Hình ảnh ngựa */}
              <div className="relative">
                <img 
                  src={horse.image} 
                  className={`w-16 h-16 drop-shadow-2xl ${horse.progress < 100 ? 'animate-horse-gallop' : ''}`} 
                  alt={horse.name} 
                />
                {horse.progress >= 95 && (
                  <div className="absolute -top-4 -right-4 text-yellow-400 text-2xl animate-pulse">
                    <i className="fas fa-crown"></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes horse-gallop {
          0% { transform: translateY(0) rotate(0); }
          25% { transform: translateY(-5px) rotate(-5deg); }
          50% { transform: translateY(0) rotate(0); }
          75% { transform: translateY(-5px) rotate(5deg); }
          100% { transform: translateY(0) rotate(0); }
        }
        .animate-horse-gallop {
          animation: horse-gallop 0.4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default RaceTrack;
