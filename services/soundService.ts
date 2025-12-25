
class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private userMusicSource: AudioBufferSourceNode | null = null;
  private musicGainNode: GainNode | null = null;
  private effectVolume: number = 0.5;
  private musicVolume: number = 0.5;

  public initContext() {
    if (!this.ctx) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx) {
      if (muted) this.ctx.suspend();
      else this.ctx.resume();
    }
  }

  setVolumes(music: number, effect: number) {
    this.musicVolume = music;
    this.effectVolume = effect;
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setTargetAtTime(music, this.ctx.currentTime, 0.1);
    }
  }

  playGallop() {
    if (this.isMuted || this.effectVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.05 * this.effectVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  async playUserMusic(base64Data: string, duration: number = 8) {
    if (this.isMuted || !base64Data) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      this.stopUserMusic();

      const response = await fetch(base64Data);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      this.userMusicSource = ctx.createBufferSource();
      this.userMusicSource.buffer = audioBuffer;
      this.userMusicSource.loop = true; // Loop để phát được lâu hơn nếu file ngắn

      this.musicGainNode = ctx.createGain();
      this.musicGainNode.gain.setValueAtTime(0, ctx.currentTime);
      this.musicGainNode.gain.linearRampToValueAtTime(this.musicVolume, ctx.currentTime + 0.5); // Fade in
      
      // Mờ dần ở cuối (Fade out)
      if (duration > 1) {
        this.musicGainNode.gain.setTargetAtTime(0, ctx.currentTime + duration - 0.8, 0.3);
      }

      this.userMusicSource.connect(this.musicGainNode);
      this.musicGainNode.connect(ctx.destination);
      
      this.userMusicSource.start(0);
      this.userMusicSource.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error("Lỗi âm thanh nhạc người dùng:", e);
    }
  }

  stopUserMusic() {
    if (this.userMusicSource) {
      try {
        this.userMusicSource.stop();
      } catch (e) {}
      this.userMusicSource = null;
    }
  }

  playWin() {
    if (this.isMuted || this.effectVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.15 * this.effectVolume, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.8);
    });
  }
}

export const soundService = new SoundService();
