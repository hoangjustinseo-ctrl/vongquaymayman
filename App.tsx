
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Prize, SpinStatus, WinnerRecord, WheelPrize, Gender } from './types';
import { INITIAL_PRIZES, HORSE_ICON, DEFAULT_BG_MUSIC, DEFAULT_WIN_SOUND, BG_PRESETS, MUSIC_PLAYLIST, WIN_SOUNDS } from './constants';
import Wheel from './components/Wheel';
import { getRaceCommentary } from './services/geminiService';
import { soundService } from './services/soundService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'game' | 'settings'>('game');
  const [status, setStatus] = useState<SpinStatus>('idle');
  const [rotation, setRotation] = useState(0);
  const [userName, setUserName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [userPhoto, setUserPhoto] = useState<string>(HORSE_ICON);
  const [prizeZoom, setPrizeZoom] = useState<number>(1);
  
  const [prizes, setPrizes] = useState<Prize[]>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const data = params.get('data');
      if (data) {
        const decoded = JSON.parse(atob(data));
        if (Array.isArray(decoded) && decoded.length > 0) return decoded;
      }
    } catch (e) {}
    return INITIAL_PRIZES;
  });

  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentWin, setCurrentWin] = useState<WinnerRecord | null>(null);
  const [commentary, setCommentary] = useState('');
  
  const [bgMusicUrl, setBgMusicUrl] = useState(DEFAULT_BG_MUSIC);
  const [winSoundUrl, setWinSoundUrl] = useState(DEFAULT_WIN_SOUND);
  const [masterVol, setMasterVol] = useState(70);
  const [musicVol, setMusicVol] = useState(50);
  const [bgImageUrl, setBgImageUrl] = useState(BG_PRESETS[0].url);

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

  useEffect(() => {
    soundService.setVolumes(masterVol / 100, musicVol / 100);
  }, [masterVol, musicVol]);

  const availablePrizes = useMemo(() => prizes.filter(p => p.count > 0), [prizes]);
  const wheelPrizes: WheelPrize[] = useMemo(() => 
    availablePrizes.map(p => ({ name: p.name, color: p.color, image: p.image })),
    [availablePrizes]
  );

  const handleImageUpload = (setter: (url: string) => void, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setter(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (setter: (url: string) => void, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setter(url);
    }
  };

  const startSpin = () => {
    if (status === 'spinning' || availablePrizes.length === 0) return;
    if (!userName.trim()) {
      alert("Hãy nhập tên của bạn trước khi quay nhé!");
      return;
    }
    
    soundService.initContext();
    soundService.playBackgroundMusic(bgMusicUrl);
    setStatus('spinning');
    setShowPopup(false);
    
    const extraSpins = 10 + Math.random() * 5;
    const finalRotation = rotationRef.current + (extraSpins * 360) + Math.random() * 360;
    const duration = 7500;
    const startTime = performance.now();
    const startRotation = rotationRef.current;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentRotation = startRotation + (finalRotation - startRotation) * ease;
      
      rotationRef.current = currentRotation;
      setRotation(currentRotation);

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
    soundService.playWin(winSoundUrl);
    
    const normalizedRotation = (finalRotation % 360 + 360) % 360;
    const pointerAngle = (270 - normalizedRotation + 360) % 360;
    const winIndex = Math.floor(pointerAngle / (360 / (availablePrizes.length || 1)));
    const winPrize = availablePrizes[winIndex];

    const winRecord: WinnerRecord = { 
      userName, gender, userPhoto,
      prizeName: winPrize.name, 
      time: new Date().toLocaleTimeString() 
    };

    setCurrentWin(winRecord);
    setWinners(prev => [winRecord, ...prev]);
    setTimeout(() => {
      setShowPopup(true);
    }, 400);
    handleAICommentary(userName, winPrize.name, gender);

    setPrizes(prev => prev.map(p => p.id === winPrize.id ? { ...p, count: p.count - 1 } : p));
  };

  const handleAICommentary = async (user: string, prize: string, g: Gender) => {
    setCommentary('Đang nhận lời chúc may mắn...');
    const res = await getRaceCommentary(prize, user, g);
    setCommentary(res);
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-white font-sans overflow-x-hidden">
      <div 
        className="fixed inset-0 bg-cover bg-center transition-opacity duration-1000 z-0" 
        style={{ backgroundImage: `url(${bgImageUrl})` }}
      />
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[1]"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="px-4 py-3 md:px-8 md:py-4 flex justify-between items-center bg-slate-900/60 border-b border-white/10 backdrop-blur-xl sticky top-0 shadow-2xl z-50">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-400 rounded-lg flex items-center justify-center shadow-lg">
              <i className="fas fa-gift text-lg md:text-xl text-slate-900"></i>
            </div>
            <h1 className="text-sm md:text-xl font-black uppercase italic tracking-tighter text-white">VÒNG QUAY <span className="text-yellow-400">MAY MẮN</span></h1>
          </div>
          <div className="flex gap-1 md:gap-2">
            <button onClick={() => setActiveTab('game')} className={`px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-bold text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${activeTab === 'game' ? 'bg-white text-slate-950' : 'bg-white/5 hover:bg-white/10'}`}>CHƠI</button>
            <button onClick={() => setActiveTab('settings')} className={`px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-bold text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-yellow-400 text-slate-950' : 'bg-white/5 hover:bg-white/10'}`}>CÀI ĐẶT</button>
          </div>
        </header>

        {activeTab === 'game' ? (
          <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center max-w-[1400px] mx-auto w-full gap-4 md:gap-8">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-16 w-full animate-in fade-in duration-500">
              
              <div className="flex-1 flex flex-col items-center w-full">
                <div className="w-full max-w-[320px] sm:max-w-[450px] md:max-w-[550px] aspect-square relative drop-shadow-[0_0_60px_rgba(251,191,36,0.15)]">
                  <Wheel prizes={wheelPrizes} rotation={rotation} />
                </div>
              </div>

              <div className="w-full lg:w-[420px] flex flex-col gap-4 md:gap-6">
                <div className="bg-white/10 p-5 md:p-8 rounded-[30px] md:rounded-[40px] border border-white/10 backdrop-blur-3xl shadow-2xl">
                  <div className="flex flex-col gap-4 md:gap-6 items-center mb-4 md:mb-6">
                      <div className="relative group">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-yellow-400 shadow-xl bg-slate-800">
                            <img src={userPhoto} className="w-full h-full object-cover" alt="User" />
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-all">
                            <i className="fas fa-camera text-white text-xs md:text-base"></i>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(setUserPhoto, e)} />
                        </label>
                      </div>

                      <div className="w-full space-y-2 md:space-y-3">
                        <input 
                          type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
                          placeholder="NHẬP TÊN BẠN"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 md:px-5 md:py-3.5 text-center font-black focus:outline-none focus:border-yellow-400 uppercase tracking-widest text-[10px] md:text-xs"
                        />
                        <div className="flex justify-center gap-1 md:gap-2">
                            {(['male', 'female', 'other'] as Gender[]).map((g) => (
                              <button 
                                key={g} onClick={() => setGender(g)}
                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase transition-all border ${gender === g ? 'bg-yellow-400 text-slate-950 border-yellow-400' : 'bg-white/5 border-white/10 text-white/30'}`}
                              >
                                {g === 'male' ? 'ANH' : g === 'female' ? 'CHỊ' : 'BẠN'}
                              </button>
                            ))}
                        </div>
                      </div>
                  </div>

                  <button 
                    onClick={startSpin} disabled={status === 'spinning' || availablePrizes.length === 0}
                    className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-lg md:text-xl uppercase tracking-tighter transition-all ${status === 'spinning' ? 'bg-white/5 text-white/10' : 'bg-yellow-400 text-slate-950 hover:bg-yellow-300 shadow-lg active:scale-95'}`}
                  >
                    {status === 'spinning' ? 'ĐANG QUAY...' : 'QUAY NGAY'}
                  </button>
                </div>

                <div className="bg-slate-900/80 border border-white/10 rounded-[30px] md:rounded-[40px] p-5 md:p-8 flex flex-col backdrop-blur-3xl h-[250px] md:h-[320px] shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h2 className="text-[8px] md:text-[9px] font-black text-yellow-400 uppercase tracking-[0.3em] flex items-center gap-2">
                      <i className="fas fa-boxes"></i> KHO GIẢI THƯỞNG
                    </h2>
                    <div className="flex items-center gap-1 md:gap-2 bg-white/5 rounded-lg px-2 py-1">
                       <button onClick={() => setPrizeZoom(1)} className={`w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center text-[8px] md:text-[9px] ${prizeZoom === 1 ? 'bg-yellow-400 text-slate-900' : 'hover:bg-white/10'}`}><i className="fas fa-minus"></i></button>
                       <button onClick={() => setPrizeZoom(1.5)} className={`w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center text-[8px] md:text-[9px] ${prizeZoom === 1.5 ? 'bg-yellow-400 text-slate-900' : 'hover:bg-white/10'}`}><i className="fas fa-plus"></i></button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                      {prizes.map((p) => (
                        <div key={p.id} className={`flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl md:rounded-2xl border transition-all ${p.count > 0 ? 'bg-white/5 border-white/5' : 'bg-red-500/5 opacity-20'}`} style={{ transform: `scale(${prizeZoom === 1.5 ? 1.05 : 1})`, transformOrigin: 'left center' }}>
                          <img src={p.image} className="object-contain shrink-0" style={{ width: prizeZoom === 1.5 ? '36px' : '28px', height: prizeZoom === 1.5 ? '36px' : '28px' }} />
                          <div className="flex-1 min-w-0">
                              <p className={`font-black uppercase truncate ${prizeZoom === 1.5 ? 'text-xs md:text-sm' : 'text-[10px] md:text-[11px]'}`}>{p.name}</p>
                              <p className={`font-bold text-yellow-400/60 uppercase ${prizeZoom === 1.5 ? 'text-[9px]' : 'text-[7px] md:text-[8px]'}`}>CÒN: {p.count}</p>
                          </div>
                          <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full" style={{ backgroundColor: p.color }}></div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        ) : (
          <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-4 md:gap-8">
             <div className="space-y-4 md:space-y-8">
                <div className="bg-slate-900/80 p-5 md:p-8 rounded-[30px] md:rounded-[40px] border border-white/10 space-y-4 md:space-y-6 backdrop-blur-3xl">
                  <div className="flex justify-between items-center">
                    <h2 className="text-[9px] md:text-[10px] font-black text-yellow-400 uppercase tracking-widest">HÌNH NỀN</h2>
                    <label className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 hover:bg-white text-white hover:text-slate-950 rounded-lg text-[8px] md:text-[9px] font-bold uppercase cursor-pointer transition-all">
                      TẢI ẢNH
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(setBgImageUrl, e)} />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {BG_PRESETS.map((bg) => (
                      <button key={bg.name} onClick={() => setBgImageUrl(bg.url)} className={`group relative h-16 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${bgImageUrl === bg.url ? 'border-yellow-400' : 'border-white/5'}`}>
                        <img src={bg.url} className="w-full h-full object-cover opacity-60" />
                        <span className="absolute inset-0 flex items-center justify-center text-[7px] md:text-[8px] font-black uppercase">{bg.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/80 p-5 md:p-8 rounded-[30px] md:rounded-[40px] border border-white/10 space-y-4 md:space-y-6 backdrop-blur-3xl">
                  <h2 className="text-[9px] md:text-[10px] font-black text-yellow-400 uppercase tracking-widest">ÂM THANH</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[7px] md:text-[8px] font-bold text-white/40 uppercase"><span>NHẠC NỀN</span> <label className="cursor-pointer text-yellow-400">TẢI LÊN <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleAudioUpload(setBgMusicUrl, e)} /></label></div>
                      <select value={bgMusicUrl} onChange={(e) => setBgMusicUrl(e.target.value)} className="w-full bg-white/5 rounded-xl px-3 py-2 text-[10px] md:text-xs outline-none border border-white/5">{MUSIC_PLAYLIST.map(m => <option key={m.url} value={m.url} className="bg-slate-900">{m.name}</option>)}</select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[7px] md:text-[8px] font-bold text-white/40 uppercase"><span>HIỆU ỨNG THẮNG</span> <label className="cursor-pointer text-yellow-400">TẢI LÊN <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleAudioUpload(setWinSoundUrl, e)} /></label></div>
                      <select value={winSoundUrl} onChange={(e) => setWinSoundUrl(e.target.value)} className="w-full bg-white/5 rounded-xl px-3 py-2 text-[10px] md:text-xs outline-none border border-white/5">{WIN_SOUNDS.map(s => <option key={s.url} value={s.url} className="bg-slate-900">{s.name}</option>)}</select>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1"><label className="text-[7px] md:text-[8px] font-bold text-white/40 uppercase">TỔNG ({masterVol}%)</label><input type="range" value={masterVol} onChange={(e) => setMasterVol(parseInt(e.target.value))} className="w-full accent-yellow-400" /></div>
                      <div className="space-y-1"><label className="text-[7px] md:text-[8px] font-bold text-white/40 uppercase">NHẠC ({musicVol}%)</label><input type="range" value={musicVol} onChange={(e) => setMusicVol(parseInt(e.target.value))} className="w-full accent-blue-400" /></div>
                    </div>
                  </div>
                </div>
             </div>

             <div className="bg-slate-900/80 p-5 md:p-8 rounded-[30px] md:rounded-[40px] border border-white/10 backdrop-blur-3xl flex flex-col h-full max-h-[600px] md:max-h-[700px]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-[9px] md:text-[10px] font-black text-yellow-400 uppercase tracking-widest">GIẢI THƯỞNG</h2>
                  <button onClick={() => setPrizes([...prizes, { id: Math.random().toString(36).substr(2, 9), name: 'QUÀ MỚI', count: 1, color: '#facc15', image: HORSE_ICON }])} className="px-3 py-1.5 md:px-4 md:py-2 bg-white text-slate-950 rounded-lg text-[8px] md:text-[9px] font-black uppercase transition-transform hover:scale-105">+ THÊM</button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 md:space-y-3 custom-scrollbar pr-1">
                  {prizes.map((p) => (
                    <div key={p.id} className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 group hover:bg-white/10 transition-all">
                       <label className="w-8 h-8 md:w-10 md:h-10 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center p-1 cursor-pointer hover:border-yellow-400/50 border border-transparent shrink-0">
                          <img src={p.image} className="max-w-full max-h-full object-contain" />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload((url) => setPrizes(prev => prev.map(item => item.id === p.id ? {...item, image: url} : item)), e)} />
                       </label>
                       <input type="text" value={p.name} onChange={(e) => setPrizes(prev => prev.map(item => item.id === p.id ? {...item, name: e.target.value} : item))} className="flex-1 bg-transparent border-none text-[10px] md:text-xs font-bold uppercase outline-none focus:text-yellow-400 min-w-0" />
                       <input type="number" value={p.count} onChange={(e) => setPrizes(prev => prev.map(item => item.id === p.id ? {...item, count: parseInt(e.target.value) || 0} : item))} className="w-8 md:w-10 bg-white/10 text-center font-bold py-1 md:py-1.5 rounded-lg text-[9px] md:text-[10px]" />
                       <input type="color" value={p.color} onChange={(e) => setPrizes(prev => prev.map(item => item.id === p.id ? {...item, color: e.target.value} : item))} className="w-5 h-5 md:w-6 md:h-6 rounded-full border-none cursor-pointer p-0" />
                       <button onClick={() => setPrizes(prizes.filter(pr => pr.id !== p.id))} className="text-red-500/20 group-hover:text-red-500 transition-colors shrink-0"><i className="fas fa-trash"></i></button>
                    </div>
                  ))}
                </div>
             </div>
          </main>
        )}
      </div>

      {showPopup && currentWin && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 md:p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-3xl bg-white rounded-[35px] md:rounded-[50px] shadow-[0_0_100px_rgba(251,191,36,0.3)] animate-scale-up border-[6px] md:border-[10px] border-yellow-400/20 relative overflow-hidden flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
              
              <div className="w-full md:w-[220px] lg:w-[240px] bg-gradient-to-br from-yellow-300 to-yellow-500 p-6 md:p-8 flex flex-col items-center justify-center text-center gap-3 md:gap-4 border-b md:border-b-0 md:border-r border-yellow-400/30 shrink-0">
                 <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 md:border-8 border-white shadow-2xl overflow-hidden bg-slate-900 relative z-10">
                    <img src={currentWin.userPhoto} className="w-full h-full object-cover" alt="Winner" />
                 </div>
                 <div className="space-y-1 relative z-10">
                    <span className="text-[7px] md:text-[9px] font-black text-slate-900/40 uppercase tracking-[0.3em]">CHÚC MỪNG</span>
                    <h3 className="text-xl md:text-3xl font-black text-slate-900 uppercase italic leading-tight px-1 md:px-2">{currentWin.userName}</h3>
                 </div>
                 <i className="fas fa-crown absolute top-2 right-2 md:top-4 md:right-4 text-slate-900/10 text-4xl md:text-6xl transform rotate-12"></i>
              </div>

              <div className="flex-1 p-6 md:p-10 flex flex-col justify-between gap-4 md:gap-6 relative min-w-0">
                 <div className="flex items-center gap-4 md:gap-8">
                    <div className="w-16 h-16 md:w-24 md:h-24 shrink-0 bg-slate-50 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-md border border-slate-100 p-2 md:p-4 animate-float">
                       <img src={prizes.find(p => p.name === currentWin.prizeName)?.image} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="space-y-0 md:space-y-1 min-w-0">
                       <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">BẠN ĐÃ TRÚNG</span>
                       <h4 className="text-lg md:text-3xl font-black uppercase italic text-slate-950 tracking-tighter leading-tight truncate">{currentWin.prizeName}</h4>
                    </div>
                 </div>

                 <div className="bg-slate-50/80 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 relative overflow-hidden flex items-center gap-3 md:gap-5">
                    <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-yellow-400"></div>
                    <div className="shrink-0 text-yellow-400 opacity-20"><i className="fas fa-quote-left text-2xl md:text-4xl"></i></div>
                    <p className="text-[13px] md:text-[16px] font-bold text-slate-700 leading-snug italic line-clamp-3">"{commentary}"</p>
                 </div>

                 <button onClick={() => setShowPopup(false)} className="w-full py-3.5 md:py-4 bg-slate-950 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-[0.4em] hover:bg-yellow-400 hover:text-slate-950 transition-all shadow-xl active:scale-95 transform">
                    TIẾP TỤC
                 </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes scale-up { from { transform: scale(0.95) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-scale-up { animation: scale-up 0.3s ease-out forwards; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
