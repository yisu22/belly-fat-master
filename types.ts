export type LocationMode = 'gym' | 'home';
export type StageKey = 'stage1' | 'stage2' | 'stage3';
export type Gender = 'male' | 'female';
export type ModeKey = LocationMode | 'single';

export type Task = {
  name: string;
  sets: string;
  desc: string;
};

export type DayData = {
  gym?: Task[];
  home?: Task[];
  single?: Task[];
};

export type RoutineData = Record<StageKey, Record<number, DayData>>;

export type ProgressState = Record<string, Record<string, Record<string, boolean>>>;

export type WeightEntry = {
  date: string;
  weight: number;
};

export type ProfileState = {
  gender: Gender;
  heightCm: string;
  startWeightKg: string;
  waistCm: string;
};
