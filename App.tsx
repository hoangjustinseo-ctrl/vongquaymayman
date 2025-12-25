
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Prize, SpinStatus, WinnerRecord, WheelPrize, Gender, Horse } from './types';
import { INITIAL_PRIZES, HORSE_ICON, DEFAULT_BG_MUSIC, DEFAULT_WIN_SOUND } from './constants';
import Wheel from './components/Wheel';
import RaceTrack from './components/RaceTrack';
import { getRaceCommentary } from './services/geminiService';
import { soundService } from './services/soundService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'game' | 'settings'>('game');
  const [status, setStatus] = useState<SpinStatus>('idle');
  const [rotation, setRotation] = useState(0);
  const [userName, setUserName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [userPhoto, setUserPhoto] = useState<string>(HORSE_ICON);
  
  // Horses for the "Race" feel
  const [horses, setHorses] = useState<Horse[]>([]);

  const [prizes, setPrizes] = useState<Prize[]>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const data = params.get('data');
      if (data) {
        const decoded = JSON.parse(atob(data));
        if (Array.isArray(decoded) && decoded.length > 0) return decoded;
      }
    } catch (e) {
      console.warn("Lỗi giải mã URL data:", e);
    }
    return INITIAL_PRIZES;
  });

  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentWin, setCurrentWin] = useState<WinnerRecord | null>(null);
  const [commentary, setCommentary] = useState('');
  
  const [bgMusicUrl, setBgMusicUrl] = useState(DEFAULT_BG_MUSIC);
  const [masterVol, setMasterVol] = useState(70);
  const [musicVol, setMusicVol] = useState(50);
  const [bgImageUrl, setBgImageUrl] = useState('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1920&q=80');

  const rotationRef = useRef(0);
  const lastTickAngle = useRef(0);

  useEffect(() => {
    try {
      const data = btoa(JSON.stringify(prizes));
      const url = new URL(window.location.href);
      url.searchParams.set('data', data);
      window.history.replaceState(null, '', url.toString());
    } catch (e) {}
  }, [prizes]);

  const availablePrizes = useMemo(() => prizes.filter(p => p.count > 0), [prizes]);
  const wheelPrizes: WheelPrize[] = useMemo(() => 
    availablePrizes.map(p => ({ name: p.name, color: p.color, image: p.image })),
    [availablePrizes]
  );

  useEffect(() => {
    soundService.setVolumes(masterVol / 100, musicVol / 100);
  }, [masterVol, musicVol]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setUserPhoto(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startSpin = () => {
    if (status === 'spinning' || availablePrizes.length === 0) return;
    if (!userName.trim()) {
      alert("Vui lòng nhập tên của bạn!");
      return;
    }
    
    soundService.initContext();
    soundService.playBackgroundMusic(bgMusicUrl);
    setStatus('spinning');
    setShowPopup(false);
    
    // Initialize horses for the race track
    setHorses([
      { id: 'player', name: userName, progress: 0, image: userPhoto },
      { id: 'comp1', name: 'Đối thủ 1', progress: 0, image: HORSE_ICON },
      { id: 'comp2', name: 'Đối thủ 2', progress: 0, image: HORSE_ICON }
    ]);

    const extraSpins = 12 + Math.random() * 5;
    const finalRotation = rotationRef.current + (extraSpins * 360) + Math.random() * 360;
    const duration = 10000;
    const startTime = performance.now();
    const startRotation = rotationRef.current;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 5);
      const currentRotation = startRotation + (finalRotation - startRotation) * ease;
      
      rotationRef.current = currentRotation;
      setRotation(currentRotation);

      // Update horses progress based on spin progress
      setHorses(prev => prev.map(h => ({
        ...h,
        progress: h.id === 'player' ? progress * 95 : Math.min(95, h.progress + Math.random() * 1.5)
      })));

      const sliceSize = 360 / (availablePrizes.length || 1);
      if (Math.floor(currentRotation / sliceSize) > Math.floor(lastTickAngle.current / sliceSize)) {
        soundService.playGallop();
        lastTickAngle.current = currentRotation;
      }

      if (progress < 1) requestAnimationFrame(animate);
      else finishSpin(currentRotation);
    };
    requestAnimationFrame(animate);
  };

  const finishSpin = (finalRotation: number) => {
    setStatus('finished');
    soundService.playWin(DEFAULT_WIN_SOUND);
    
    // Horse reaches finish line
    setHorses(prev => prev.map(h => h.id === 'player' ? { ...h, progress: 100 } : h));

    const normalizedRotation = (finalRotation % 360 + 360) % 360;
    const pointerAngle = (270 - normalizedRotation + 360) % 360;
    const winIndex = Math.floor(pointerAngle / (360 / availablePrizes.length));
    const winPrize = availablePrizes[winIndex];

    const winRecord: WinnerRecord = { 
      userName, 
      gender,
      userPhoto,
      prizeName: winPrize.name, 
      time: new Date().toLocaleTimeString() 
    };

    setCurrentWin(winRecord);
    setWinners(prev => [winRecord, ...prev]);
    setTimeout(() => setShowPopup(true), 500);
    handleAICommentary(userName, winPrize.name, gender);

    setPrizes(prev => prev.map(p => p.id === winPrize.id ? { ...p, count: p.count - 1 } : p));
  };

  const handleAICommentary = async (user: string, prize: string, g: Gender) => {
    setCommentary('Bình luận viên đang soạn thảo...');
    const res = await getRaceCommentary(prize, user, g);
    setCommentary(res);
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-white font-sans overflow-x-hidden">
      <div className="fixed inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url(${bgImageUrl})` }}>
        <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-[4px]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="px-10 py-5 flex justify-between items-center bg-[#0f172a]/80 border-b border-white/5 backdrop-blur-xl sticky top-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.3)] transform hover:rotate-6 transition-transform">
              <i className="fas fa-horse text-3xl text-slate-900"></i>
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                CUỘC ĐUA <span className="text-yellow-400">MAY MẮN</span>
              </h1>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.5em] mt-1">KHÔNG CHỈ LÀ VÒNG QUAY</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('game')} className={`px-8 py-3 rounded-xl font-black text-[12px] uppercase tracking-widest transition-all ${activeTab === 'game' ? 'bg-white text-slate-950 shadow-2xl' : 'bg-white/5 hover:bg-white/10'}`}>TRÒ CHƠI</button>
            <button onClick={() => setActiveTab('settings')} className={`px-8 py-3 rounded-xl font-black text-[12px] uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-yellow-400 text-slate-950 shadow-2xl' : 'bg-white/5 hover:bg-white/10'}`}>CÀI ĐẶT</button>
          </div>
        </header>

        {activeTab === 'game' ? (
          <main className="flex-1 p-6 lg:p-10 flex flex-col gap-10 max-w-[1600px] mx-auto w-full">
            {/* Race Track Section */}
            {horses.length > 0 && (
              <div className="w-full animate-in slide-in-from-top duration-700">
                <RaceTrack horses={horses} />
              </div>
            )}

            <div className="flex flex-col lg:flex-row items-start justify-center gap-12">
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full max-w-[550px] aspect-square relative drop-shadow-[0_0_100px_rgba(251,191,36,0.1)]">
                  <Wheel prizes={wheelPrizes} rotation={rotation} />
                </div>

                <div className="mt-12 w-full max-w-lg bg-white/5 p-8 rounded-[50px] border border-white/10 backdrop-blur-3xl shadow-2xl">
                  <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl bg-slate-800">
                            <img src={userPhoto} className="w-full h-full object-cover" alt="User" />
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-all">
                            <i className="fas fa-camera text-white text-xs"></i>
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </label>
                      </div>

                      <div className="flex-1 w-full space-y-4">
                        <input 
                          type="text" 
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="NHẬP TÊN CỦA BẠN..."
                          className="w-full bg-white/5 border border-white/10 rounded-[20px] px-6 py-4 text-sm font-black focus:outline-none focus:border-yellow-400 transition-all text-center placeholder:text-white/20 uppercase tracking-[0.2em]"
                        />
                        <div className="flex justify-center gap-2">
                            {(['male', 'female', 'other'] as Gender[]).map((g) => (
                              <button 
                                key={g}
                                onClick={() => setGender(g)}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${gender === g ? 'bg-yellow-400 text-slate-950 border-yellow-400 shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                              >
                                {g === 'male' ? 'ANH' : g === 'female' ? 'CHỊ' : 'BẠN'}
                              </button>
                            ))}
                        </div>
                      </div>
                  </div>

                  <button 
                    onClick={startSpin}
                    disabled={status === 'spinning' || availablePrizes.length === 0}
                    className={`w-full py-6 rounded-[25px] font-black text-2xl uppercase tracking-tighter transition-all shadow-2xl ${status === 'spinning' ? 'bg-white/5 text-white/10 cursor-not-allowed' : 'bg-yellow-400 text-slate-950 hover:bg-yellow-300 active:scale-95'}`}
                  >
                    {status === 'spinning' ? 'ĐANG CHẠY...' : 'BẮT ĐẦU ĐUA'}
                  </button>
                </div>
              </div>

              <aside className="w-full lg:w-[400px] bg-[#0f172a]/70 border border-white/10 rounded-[50px] p-10 flex flex-col shadow-2xl backdrop-blur-3xl h-fit max-h-[700px]">
                <h2 className="text-[12px] font-black text-yellow-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                  <i className="fas fa-gift text-lg"></i> KHO QUÀ
                </h2>
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                    {prizes.map((p) => (
                      <div key={p.id} className={`flex items-center gap-4 p-4 rounded-[25px] border transition-all ${p.count > 0 ? 'bg-white/5 border-white/5' : 'bg-red-500/5 border-red-500/10 opacity-30'}`}>
                        <div className="w-12 h-12 bg-[#1e293b] rounded-xl flex items-center justify-center p-2 shadow-xl">
                            <img src={p.image} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-black uppercase truncate tracking-tight">{p.name}</p>
                            <p className="text-[10px] font-bold text-yellow-400/60 mt-1 uppercase">CÒN: {p.count}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                      </div>
                    ))}
                </div>
              </aside>
            </div>
          </main>
        ) : (
          <main className="flex-1 p-10 lg:p-16 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12">
            {/* Settings content same as before but ensured to be stable */}
             <div className="bg-[#0f172a]/70 p-12 rounded-[60px] border border-white/5 shadow-2xl backdrop-blur-3xl space-y-12 h-fit">
               <h2 className="text-sm font-black text-yellow-400 uppercase tracking-[0.2em] pb-8 border-b border-white/5">HÌNH NỀN & ÂM THANH</h2>
               <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">URL HÌNH NỀN</label>
                    <input type="text" value={bgImageUrl} onChange={(e) => setBgImageUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xs font-bold" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">ÂM LƯỢNG ({masterVol}%)</label>
                    <input type="range" value={masterVol} onChange={(e) => setMasterVol(parseInt(e.target.value))} className="w-full accent-yellow-400 h-2 bg-white/5 rounded-full" />
                  </div>
               </div>
            </div>
            <div className="bg-[#0f172a]/70 p-12 rounded-[60px] border border-white/5 shadow-2xl backdrop-blur-3xl flex flex-col h-[750px]">
               <div className="flex justify-between items-center mb-10 pb-8 border-b border-white/5">
                  <h2 className="text-sm font-black text-yellow-400 uppercase tracking-[0.2em]">QUÀ TẶNG</h2>
                  <button onClick={() => setPrizes([...prizes, { id: Math.random().toString(36).substr(2, 9), name: 'QUÀ MỚI', count: 1, color: '#facc15', image: HORSE_ICON }])} className="px-6 py-3 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase shadow-2xl hover:bg-yellow-400">+ THÊM</button>
               </div>
               <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-4">
                  {prizes.map((p) => (
                    <div key={p.id} className="bg-white/5 p-5 rounded-[30px] border border-white/5 flex items-center gap-4">
                       <input 
                         type="text" 
                         value={p.name} 
                         onChange={(e) => setPrizes(prev => prev.map(item => item.id === p.id ? {...item, name: e.target.value} : item))}
                         className="flex-1 bg-transparent border-none text-[13px] font-black uppercase p-0"
                       />
                       <input type="number" value={p.count} onChange={(e) => setPrizes(prev => prev.map(item => item.id === p.id ? {...item, count: parseInt(e.target.value) || 0} : item))} className="w-16 bg-white/5 border-none rounded-lg text-center font-bold" />
                       <input type="color" value={p.color} onChange={(e) => setPrizes(prev => prev.map(item => item.id === p.id ? {...item, color: e.target.value} : item))} className="w-8 h-8 rounded-full border-none p-0 cursor-pointer" />
                       <button onClick={() => setPrizes(prizes.filter(pr => pr.id !== p.id))} className="text-red-500 hover:text-red-400"><i className="fas fa-trash"></i></button>
                    </div>
                  ))}
               </div>
            </div>
          </main>
        )}
      </div>

      {/* POPUP FIXED POSITION AND OVERLAP ISSUES */}
      {showPopup && currentWin && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="w-full max-w-md bg-white rounded-[60px] overflow-visible shadow-[0_0_150px_rgba(251,191,36,0.4)] animate-scale-up border-[12px] border-yellow-400/20 relative">
              
              {/* Header section with winner photo */}
              <div className="bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 p-12 text-center rounded-t-[48px] relative">
                 {/* Winner Photo fixed outside header */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-[8px] border-white overflow-hidden shadow-2xl bg-slate-900 z-50">
                    <img src={currentWin.userPhoto} className="w-full h-full object-cover" alt="Winner" />
                 </div>
                 
                 <div className="mt-14">
                   <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900/40 block mb-2">CHIẾN THẮNG THUỘC VỀ</span>
                   <h3 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter drop-shadow-sm truncate px-4">
                     {currentWin.userName}
                   </h3>
                 </div>
              </div>

              <div className="p-10 text-center text-slate-900 relative">
                 {/* Prize Icon box */}
                 <div className="w-32 h-32 mx-auto bg-white rounded-[40px] flex items-center justify-center mb-6 shadow-2xl border-4 border-slate-50 relative -mt-24 z-40">
                    <i className="fas fa-trophy text-5xl text-yellow-500"></i>
                 </div>

                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">PHẦN THƯỞNG:</p>
                 <h4 className="text-2xl font-black uppercase italic text-slate-950 mb-8 px-4">{currentWin.prizeName}</h4>
                 
                 <div className="bg-slate-50 p-8 rounded-[35px] border border-slate-100 mb-10 italic text-[14px] font-bold text-slate-600 leading-relaxed shadow-inner">
                    "{commentary}"
                 </div>
                 
                 <button onClick={() => setShowPopup(false)} className="w-full py-6 bg-slate-950 text-white rounded-[30px] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl">TIẾP TỤC</button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes scale-up { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-scale-up { animation: scale-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
