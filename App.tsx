
import React, { useState, useRef, useEffect } from 'react';
import { Prize, SpinStatus, WheelPrize } from './types';
import { PRIZES as INITIAL_PRIZES } from './constants';
import Wheel from './components/Wheel';
import { getRaceCommentary } from './services/geminiService';
import { soundService } from './services/soundService';

const VIBRANT_COLORS = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316'];

const App: React.FC = () => {
  const [status, setStatus] = useState<SpinStatus>('idle');
  const [rotation, setRotation] = useState(0);
  const [userName, setUserName] = useState('');
  const [winner, setWinner] = useState<Prize | null>(null);
  const [commentary, setCommentary] = useState<string>('');
  const [loadingCommentary, setLoadingCommentary] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<'game' | 'settings'>('game');
  
  const [prizes, setPrizes] = useState<Prize[]>(INITIAL_PRIZES);
  const [wallpaper, setWallpaper] = useState('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2000');
  const [masterVol, setMasterVol] = useState(70);
  const [musicVol, setMusicVol] = useState(50);

  const rotationRef = useRef(0);
  const lastTickAngle = useRef(0);

  const availablePrizes = prizes.filter(p => p.count > 0);
  
  const wheelPrizes: WheelPrize[] = (() => {
    if (availablePrizes.length === 0) return [];
    let list = [...availablePrizes];
    while (list.length < 8 && list.length > 0) {
      list = [...list, ...availablePrizes];
    }
    return list.slice(0, 16).map((p, i) => ({
      ...p,
      wheelId: `w-${i}-${p.id}`,
      color: VIBRANT_COLORS[i % VIBRANT_COLORS.length]
    }));
  })();

  useEffect(() => {
    soundService.setVolumes(masterVol / 100, musicVol / 100);
  }, [masterVol, musicVol]);

  const startSpin = () => {
    if (status === 'spinning' || !userName.trim() || wheelPrizes.length === 0) {
      if (wheelPrizes.length === 0) alert("Tất cả giải thưởng đã hết sạch!");
      return;
    }
    
    soundService.initContext();
    soundService.playBackgroundMusic();
    setStatus('spinning');
    setWinner(null);
    setShowPopup(false);
    
    const extraSpins = 12 + Math.random() * 5;
    const finalRotation = rotationRef.current + (extraSpins * 360) + Math.random() * 360;
    const duration = 8000;
    const startTime = performance.now();
    const startRotation = rotationRef.current;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4); 
      const currentRotation = startRotation + (finalRotation - startRotation) * ease;
      
      rotationRef.current = currentRotation;
      setRotation(currentRotation);

      const sliceSize = 360 / wheelPrizes.length;
      if (Math.floor(currentRotation / sliceSize) > Math.floor(lastTickAngle.current / sliceSize)) {
        soundService.playGallop();
        lastTickAngle.current = currentRotation;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        finishSpin(currentRotation);
      }
    };
    requestAnimationFrame(animate);
  };

  const finishSpin = (finalRotation: number) => {
    setStatus('finished');
    soundService.playWin();
    
    const pointerAngle = (270 - (finalRotation % 360) + 360) % 360;
    const winnerIndex = Math.floor(pointerAngle / (360 / wheelPrizes.length));
    const winPrize = wheelPrizes[winnerIndex];
    
    setPrizes(prev => prev.map(p => 
      p.id === winPrize.id ? { ...p, count: Math.max(0, p.count - 1) } : p
    ));

    setWinner(winPrize);
    setCommentary(`Chúc mừng ${userName}!`);
    setShowPopup(true);
    handleCommentaryAI(userName, winPrize.name);
  };

  const handleCommentaryAI = async (uName: string, pName: string) => {
    setLoadingCommentary(true);
    const comm = await getRaceCommentary(pName, [], uName);
    if (comm) setCommentary(comm);
    setLoadingCommentary(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'bg' | 'win' | 'prize' | 'wallpaper', prizeId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);

    if (type === 'bg' || type === 'win') {
      soundService.loadCustomSound(url, type);
    } else if (type === 'prize' && prizeId) {
      setPrizes(prev => prev.map(p => p.id === prizeId ? { ...p, image: url } : p));
    } else if (type === 'wallpaper') {
      setWallpaper(url);
    }
  };

  const addPrize = () => {
    const newPrize: Prize = {
      id: Date.now().toString(),
      name: 'QUÀ MỚI',
      count: 1,
      color: VIBRANT_COLORS[prizes.length % VIBRANT_COLORS.length],
      image: 'https://img.freepik.com/free-vector/gift-box-with-red-ribbon_1308-41071.jpg'
    };
    setPrizes([...prizes, newPrize]);
  };

  const updatePrize = (id: string, field: keyof Prize, value: any) => {
    setPrizes(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const deletePrize = (id: string) => {
    if (prizes.length <= 1) return alert("Cần tối thiểu 1 giải thưởng!");
    setPrizes(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="relative min-h-screen text-slate-900 overflow-hidden font-sans bg-slate-950">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 brightness-[0.6] blur-[2px] scale-105"
        style={{ backgroundImage: `url(${wallpaper})` }}
      ></div>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="p-4 md:p-6 flex justify-between items-center bg-white/5 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
              <i className="fas fa-horse text-2xl text-slate-900"></i>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
                VÒNG QUAY <span className="text-yellow-400">LUCKY</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase mt-1">CƠ HỘI TRÚNG QUÀ LỚN</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('game')} className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'game' ? 'bg-white text-slate-900 shadow-xl' : 'bg-white/10 text-white'}`}>CHƠI</button>
            <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-yellow-400 text-slate-900 shadow-xl' : 'bg-white/10 text-white'}`}>CÀI ĐẶT</button>
          </div>
        </header>

        {activeTab === 'game' ? (
          <main className="flex-1 flex flex-col lg:flex-row p-6 gap-8 items-center justify-center">
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <div className="w-full max-w-[550px] aspect-square relative drop-shadow-[0_0_80px_rgba(251,191,36,0.3)]">
                {wheelPrizes.length > 0 ? (
                  <Wheel prizes={wheelPrizes} rotation={rotation} />
                ) : (
                  <div className="w-full h-full bg-white/5 backdrop-blur-3xl rounded-full flex items-center justify-center border-4 border-dashed border-white/20">
                    <p className="text-xl font-black text-white/40 uppercase italic">KHO QUÀ ĐÃ TRỐNG</p>
                  </div>
                )}
              </div>
              <div className="w-full max-w-sm mt-8 bg-white/5 backdrop-blur-3xl p-6 rounded-[35px] border border-white/10 shadow-3xl space-y-4">
                <input type="text" placeholder="NHẬP TÊN BẠN..." value={userName} onChange={(e) => setUserName(e.target.value.toUpperCase())} disabled={status === 'spinning' || wheelPrizes.length === 0} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-lg font-black text-white placeholder:text-white/20 outline-none focus:border-yellow-400 transition-all" />
                <button onClick={startSpin} disabled={status === 'spinning' || !userName.trim() || wheelPrizes.length === 0} className={`w-full py-5 rounded-2xl font-black text-2xl uppercase tracking-tighter transition-all shadow-xl relative overflow-hidden group ${status === 'spinning' || !userName.trim() || wheelPrizes.length === 0 ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-yellow-400 text-slate-950 active:scale-95 hover:bg-yellow-300'}`}>
                  {status === 'spinning' ? 'ĐANG QUAY...' : 'QUAY NGAY'}
                </button>
              </div>
            </div>
            <div className="w-full lg:w-[350px] bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[35px] p-6 shadow-2xl self-stretch overflow-y-auto max-h-[70vh] custom-scrollbar">
              <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest text-yellow-400">Danh sách quà tặng</h2>
              <div className="grid gap-3">
                {prizes.map((p) => (
                  <div key={p.id} className={`bg-white/5 rounded-2xl p-3 flex items-center gap-4 border border-white/5 transition-all ${p.count === 0 ? 'opacity-20 grayscale' : 'hover:bg-white/10'}`}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                      <img src={p.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase text-white truncate">{p.name}</p>
                      <div className="flex items-center justify-between mt-1">
                         <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${p.count > 0 ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-500 bg-white/5'}`}>{p.count > 0 ? `SỐ LƯỢNG: ${p.count}` : 'HẾT HÀNG'}</span>
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        ) : (
          <main className="flex-1 p-6 max-w-5xl mx-auto w-full animate-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar">
             <div className="grid md:grid-cols-2 gap-6 pb-12">
                <section className="bg-white/5 backdrop-blur-xl p-6 rounded-[30px] border border-white/10 space-y-6">
                   <h3 className="text-sm font-black uppercase text-yellow-400 tracking-widest border-b border-white/10 pb-4">Giao diện & Nhạc</h3>
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400">Hình nền (URL)</label>
                        <input type="text" value={wallpaper} onChange={(e) => setWallpaper(e.target.value)} className="w-full p-3 bg-white/5 rounded-xl border border-white/10 outline-none text-xs text-white" />
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-dashed border-white/20">
                           <span className="text-[10px] text-slate-300 font-bold">Hoặc tải file ảnh</span>
                           <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'wallpaper')} className="hidden" id="bg-file" />
                           <label htmlFor="bg-file" className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-[9px] font-black cursor-pointer">CHỌN FILE</label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 block">Tổng ({masterVol}%)</label>
                           <input type="range" value={masterVol} onChange={(e) => setMasterVol(parseInt(e.target.value))} className="w-full accent-yellow-400" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 block">Nhạc nền ({musicVol}%)</label>
                           <input type="range" value={musicVol} onChange={(e) => setMusicVol(parseInt(e.target.value))} className="w-full accent-yellow-400" />
                        </div>
                      </div>
                   </div>
                </section>
                <section className="bg-white/5 backdrop-blur-xl p-6 rounded-[30px] border border-white/10 flex flex-col h-full">
                   <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                      <h3 className="text-sm font-black uppercase text-yellow-400 tracking-widest">Quản lý kho quà</h3>
                      <button onClick={addPrize} className="bg-white text-slate-900 px-3 py-1.5 rounded-lg font-black text-[9px]">+ THÊM QUÀ</button>
                   </div>
                   <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar max-h-[400px]">
                      {prizes.map((p) => (
                        <div key={p.id} className="bg-white/5 p-3 rounded-2xl border border-white/5 space-y-2">
                           <div className="flex items-center gap-3">
                              <div className="relative group w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                 <img src={p.image} className="w-full h-full object-cover" alt="" />
                                 <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'prize', p.id)} className="hidden" id={`img-${p.id}`} />
                                 <label htmlFor={`img-${p.id}`} className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px] font-black cursor-pointer">SỬA</label>
                              </div>
                              <div className="flex-1 space-y-1">
                                 <input type="text" value={p.name} onChange={(e) => updatePrize(p.id, 'name', e.target.value)} className="w-full text-[10px] font-black uppercase bg-transparent outline-none text-white focus:text-yellow-400" />
                                 <div className="flex items-center gap-2">
                                    <input type="number" value={p.count} onChange={(e) => updatePrize(p.id, 'count', Math.max(0, parseInt(e.target.value) || 0))} className="w-12 bg-white/5 border border-white/10 rounded-md p-1 text-[10px] font-bold text-center text-white" />
                                    <input type="color" value={p.color} onChange={(e) => updatePrize(p.id, 'color', e.target.value)} className="w-5 h-5 rounded-full border-none cursor-pointer bg-transparent" />
                                    <button onClick={() => deletePrize(p.id)} className="text-white/20 hover:text-red-400 ml-auto transition-colors"><i className="fas fa-trash-alt text-[10px]"></i></button>
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </section>
             </div>
          </main>
        )}
      </div>

      {showPopup && winner && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="w-full max-w-sm bg-white rounded-[45px] overflow-hidden shadow-2xl animate-scale-up">
            <div className="bg-yellow-400 p-8 text-center relative">
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900/40">WOW! XIN CHÚC MỪNG</span>
               <h3 className="text-2xl font-black text-slate-900 uppercase italic mt-2 leading-tight">{winner.name}</h3>
            </div>
            <div className="p-8 text-center">
               <div className="w-40 h-40 mx-auto rounded-3xl overflow-hidden mb-6 shadow-2xl border-4 border-white relative -mt-20 z-20">
                  <img src={winner.image} className="w-full h-full object-cover" alt="" />
               </div>
               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 shadow-inner">
                 <p className="text-slate-700 text-sm font-bold italic leading-relaxed">"{commentary}"</p>
                 {loadingCommentary && <div className="mt-4 flex justify-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.2s]"></div></div>}
               </div>
               <button onClick={() => setShowPopup(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">TIẾP TỤC QUAY</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-up { from { transform: scale(0.8) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
