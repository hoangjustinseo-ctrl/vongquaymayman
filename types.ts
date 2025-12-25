
export type RaceStatus = 'idle' | 'spinning' | 'finished';

export interface Prize {
  id: string;
  name: string;
  image: string;
  color: string;
  count: number;
}

export interface WheelPrize extends Prize {
  wheelId: string;
}

export interface AppSettings {
  wallpaper: string;
  masterVol: number;
  musicVol: number;
  bgMusicUrl: string;
  winSoundUrl: string;
}
