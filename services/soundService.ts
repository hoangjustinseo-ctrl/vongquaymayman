
class SoundService {
  private ctx: AudioContext | null = null;
  private bgMusicSource: AudioBufferSourceNode | null = null;
  private bgMusicGain: GainNode | null = null;
  private effectGain: GainNode | null = null;
  private masterVolume: number = 0.7;
  private musicVolume: number = 0.5;
  private effectVolume: number = 0.8;
  
  private audioBuffers: Record<string, AudioBuffer> = {};

  public initContext() {
    try {
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
    } catch (e) {
      console.warn("AudioContext không khởi tạo được (cần tương tác người dùng):", e);
    }
    return this.ctx;
  }

  private updateGains() {
    if (this.bgMusicGain && this.ctx) {
      this.bgMusicGain.gain.setTargetAtTime(this.musicVolume * this.masterVolume, this.ctx.currentTime, 0.1);
    }
    if (this.effectGain && this.ctx) {
      this.effectGain.gain.setTargetAtTime(this.effectVolume * this.masterVolume, this.ctx.currentTime, 0.1);
    }
  }

  public setVolumes(master: number, music: number) {
    this.masterVolume = master;
    this.musicVolume = music;
    if (this.ctx) this.updateGains();
  }

  public async preloadSound(url: string): Promise<AudioBuffer | null> {
    if (!url) return null;
    if (this.audioBuffers[url]) return this.audioBuffers[url];
    
    // Chỉ init context khi thực sự cần nạp âm thanh
    const ctx = this.initContext();
    if (!ctx) return null;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.audioBuffers[url] = audioBuffer;
      return audioBuffer;
    } catch (e) {
      console.error("Lỗi nạp âm thanh:", url, e);
      return null;
    }
  }

  public async playBackgroundMusic(url: string) {
    const ctx = this.initContext();
    if (!ctx) return;
    
    if (this.bgMusicSource && (this.bgMusicSource as any)._url === url) return;

    if (this.bgMusicSource) {
      try { this.bgMusicSource.stop(); } catch(e) {}
      this.bgMusicSource = null;
    }

    const buffer = await this.preloadSound(url);
    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    (source as any)._url = url;
    source.connect(this.bgMusicGain!);
    source.start(0);
    this.bgMusicSource = source;
  }

  public stopBackgroundMusic() {
    if (this.bgMusicSource) {
      try { this.bgMusicSource.stop(); } catch(e) {}
      this.bgMusicSource = null;
    }
  }

  public playGallop() {
    const ctx = this.initContext();
    if (!ctx || ctx.state !== 'running') return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.06);
    g.gain.setValueAtTime(0.05, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(g);
    g.connect(this.effectGain!);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  public async playWin(url?: string) {
    const ctx = this.initContext();
    if (!ctx) return;
    
    if (url) {
      const buffer = await this.preloadSound(url);
      if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.effectGain!);
        source.start(0);
        return;
      }
    }

    const now = ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      g.gain.setValueAtTime(0.15, now + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);
      osc.connect(g);
      g.connect(this.effectGain!);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.6);
    });
  }
}

export const soundService = new SoundService();
