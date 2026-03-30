import { routineData } from '../data/routineData';
import type { DayData, LocationMode, ModeKey, ProgressState, StageKey, Task } from '../types';

export function getStageKey(week: number): StageKey {
  if (week <= 4) return 'stage1';
  if (week <= 8) return 'stage2';
  return 'stage3';
}

export function getModeKey(dayData: DayData, mode: LocationMode): ModeKey {
  return dayData.single ? 'single' : mode;
}

export function getRoutineList(stageKey: StageKey, day: number, mode: LocationMode) {
  const dayData = routineData[stageKey][day];
  if (dayData.single) return dayData.single;
  return mode === 'gym' ? dayData.gym ?? [] : dayData.home ?? [];
}

export function getTaskStorageKey(task: Task) {
  return `${task.name}__${task.sets}__${task.desc}`;
}

function getModeProgressFromMap(tasks: Task[], completedMap: Record<string, boolean>) {
  if (tasks.length === 0) return 0;
  const completedCount = tasks.filter((task) => completedMap[getTaskStorageKey(task)]).length;
  return Math.round((completedCount / tasks.length) * 100);
}

export function getDayProgressForMode(progressState: ProgressState, week: number, day: number, mode: LocationMode) {
  const stageKey = getStageKey(week);
  const dayData = routineData[stageKey][day];
  const modeKey = getModeKey(dayData, mode);
  const tasks = getRoutineList(stageKey, day, mode);
  const weekKey = `w${week}`;
  const dayKey = `d${day}_${modeKey}`;
  return getModeProgressFromMap(tasks, progressState[weekKey]?.[dayKey] ?? {});
}

export function getDayOverallProgress(progressState: ProgressState, week: number, day: number) {
  const stageKey = getStageKey(week);
  const dayData = routineData[stageKey][day];
  if (dayData.single) {
    return getDayProgressForMode(progressState, week, day, 'gym');
  }

  return Math.max(
    getDayProgressForMode(progressState, week, day, 'gym'),
    getDayProgressForMode(progressState, week, day, 'home'),
  );
}

export function getPreferredModeForDay(progressState: ProgressState, week: number, day: number, fallback: LocationMode = 'gym') {
  const stageKey = getStageKey(week);
  const dayData = routineData[stageKey][day];
  if (dayData.single) return fallback;

  const gymProgress = getDayProgressForMode(progressState, week, day, 'gym');
  const homeProgress = getDayProgressForMode(progressState, week, day, 'home');
  if (gymProgress === homeProgress) return fallback;
  return gymProgress > homeProgress ? 'gym' : 'home';
}
