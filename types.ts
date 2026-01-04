
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
  quote: string; // Thêm trường lưu lời chúc lúc thắng
}

export interface Quote {
  id: string;
  category: string; // Tên giải thưởng tương ứng (VD: "500 TRIỆU")
  content: string;
}
