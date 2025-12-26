
export type SpinStatus = 'idle' | 'spinning' | 'finished';
export type Gender = 'male' | 'female' | 'other' | 'teacher_male' | 'teacher_female';

export interface Prize {
  id: string;
  name: string;
  count: number;
  color: string;
  image: string;
}

export interface WheelPrize {
  name: string;
  color: string;
  image: string;
}

export interface WinnerRecord {
  userName: string;
  gender: Gender;
  userPhoto: string;
  prizeName: string;
  time: string;
}

export interface Horse {
  id: string;
  name: string;
  progress: number;
  image: string;
}
