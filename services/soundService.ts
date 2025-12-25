
class SoundService {
  private ctx: AudioContext | null = null;
  private bgMusicSource: AudioBufferSourceNode | null = null;
  private bgMusicGain: GainNode | null = null;
  private effectGain: GainNode | null = null;
  private masterVolume: number = 0.5;
  private musicVolume: number = 0.4;
  private effectVolume: number = 0.7;
  
  private customBgMusicBuffer: AudioBuffer | null = null;
  private customWinSoundBuffer: AudioBuffer | null = null;

  public initContext() {
    if (!this.ctx) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.bgMusicGain = this.ctx.createGain();
      this.effectGain = this.ctx.createGain();
      this.bgMusicGain.connect(this.ctx.destination);
      this.effectGain.connect(this.ctx.destination);
      this.updateGains();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private updateGains() {
    if (this.bgMusicGain) this.bgMusicGain.gain.setTargetAtTime(this.musicVolume * this.masterVolume, this.ctx!.currentTime, 0.1);
    if (this.effectGain) this.effectGain.gain.setTargetAtTime(this.effectVolume * this.masterVolume, this.ctx!.currentTime, 0.1);
  }

  public setVolumes(master: number, music: number) {
    this.masterVolume = master;
    this.musicVolume = music;
    if (this.ctx) this.updateGains();
  }

  public async loadCustomSound(url: string, type: 'bg' | 'win') {
    const ctx = this.initContext();
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      if (type === 'bg') this.customBgMusicBuffer = audioBuffer;
      else this.customWinSoundBuffer = audioBuffer;
    } catch (e) {
      console.error("Lỗi tải âm thanh:", e);
    }
  }

  async playBackgroundMusic() {
    const ctx = this.initContext();
    if (!ctx) return;
    
    if (this.bgMusicSource) {
      this.bgMusicSource.stop();
      this.bgMusicSource = null;
    }

    const source = ctx.createBufferSource();
    if (this.customBgMusicBuffer) {
      source.buffer = this.customBgMusicBuffer;
    } else {
      // Nhạc nền mặc định vui nhộn từ pixabay nếu chưa có custom
      try {
        const res = await fetch('https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3');
        const ab = await res.arrayBuffer();
        const buffer = await ctx.decodeAudioData(ab);
        source.buffer = buffer;
      } catch { return; }
    }
    
    source.loop = true;
    source.connect(this.bgMusicGain!);
    source.start(0);
    this.bgMusicSource = source;
  }

  playGallop() {
    const ctx = this.initContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(g);
    g.connect(this.effectGain!);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  async playWin() {
    const ctx = this.initContext();
    if (!ctx) return;
    
    if (this.customWinSoundBuffer) {
      const source = ctx.createBufferSource();
      source.buffer = this.customWinSoundBuffer;
      source.connect(this.effectGain!);
      source.start(0);
    } else {
      // Synthesized Fanfare hoành tráng hơn
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.15);
        g.gain.setValueAtTime(0.2, now + i * 0.15);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.8);
        osc.connect(g);
        g.connect(this.effectGain!);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 1);
      });

      // Tiếng vỗ tay giả lập (White noise)
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.1, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 2);
      noise.connect(noiseGain);
      noiseGain.connect(this.effectGain!);
      noise.start(now);
    }
  }
}

export const soundService = new SoundService();
